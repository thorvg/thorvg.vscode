/*
 * Copyright (c) 2025 - 2026 ThorVG project. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as esbuild from 'esbuild';
import * as path from 'path';
import { transformCodeForExecution, extractInitConfig, needsAsyncWrapper } from './codeTransformer';

export interface BundleResult {
    code: string;
    errors: string[];
    warnings: string[];
    config: {
        renderer?: string;
        canvasSize?: { width: number; height: number };
    };
}

export interface BundlerOptions {
    projectRoot?: string;
}

/**
 * Bundler service for compiling multi-file JavaScript/TypeScript projects
 * Uses esbuild for fast, reliable bundling
 */
export class Bundler {
    private projectRoot: string;

    constructor(options: BundlerOptions = {}) {
        this.projectRoot = options.projectRoot || process.cwd();
    }

    /**
     * Bundle a file and its dependencies into a single executable string
     */
    async bundle(entryPoint: string): Promise<BundleResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            const result = await esbuild.build({
                entryPoints: [entryPoint],
                bundle: true,
                write: false,
                format: 'esm',
                platform: 'browser',
                target: 'esnext',
                loader: {
                    '.ts': 'ts',
                    '.js': 'js',
                    '.tsx': 'tsx',
                    '.jsx': 'jsx',
                },
                // Externalize ThorVG since it's provided by webview
                external: ['@thorvg/webcanvas'],
                // Don't include source maps for smaller output
                sourcemap: false,
                // Minify for smaller output (optional)
                minify: false,
                // Log level
                logLevel: 'silent',
            });

            // Collect warnings
            for (const warning of result.warnings) {
                warnings.push(formatMessage(warning));
            }

            // Get the bundled code
            if (result.outputFiles && result.outputFiles.length > 0) {
                const bundledCode = result.outputFiles[0].text;

                // Extract config before transformation
                const config = extractInitConfig(bundledCode);

                // Transform the bundled code
                const transformedCode = transformCodeForExecution(bundledCode);

                // Wrap in async if needed
                const finalCode = needsAsyncWrapper(transformedCode)
                    ? wrapAsync(transformedCode)
                    : transformedCode;

                return {
                    code: finalCode,
                    errors: [],
                    warnings,
                    config
                };
            }

            return {
                code: '',
                errors: ['No output generated'],
                warnings,
                config: {}
            };
        } catch (error) {
            if (isBuildError(error)) {
                for (const err of error.errors) {
                    errors.push(formatMessage(err));
                }
            } else if (error instanceof Error) {
                errors.push(error.message);
            } else {
                errors.push('Unknown build error');
            }

            return {
                code: '',
                errors,
                warnings,
                config: {}
            };
        }
    }

    /**
     * Bundle code from a string (for single-file scenarios)
     */
    async bundleFromString(code: string, filename: string = 'index.ts'): Promise<BundleResult> {
        try {
            // Use stdin option to bundle from string
            const result = await esbuild.build({
                stdin: {
                    contents: code,
                    loader: filename.endsWith('.ts') ? 'ts' : 'js',
                    resolveDir: this.projectRoot,
                    sourcefile: filename,
                },
                bundle: true,
                write: false,
                format: 'esm',
                platform: 'browser',
                target: 'esnext',
                external: ['@thorvg/webcanvas'],
                sourcemap: false,
                minify: false,
                logLevel: 'silent',
            });

            const warnings = result.warnings.map(formatMessage);

            if (result.outputFiles && result.outputFiles.length > 0) {
                const bundledCode = result.outputFiles[0].text;
                const config = extractInitConfig(code); // Extract from original code
                const transformedCode = transformCodeForExecution(bundledCode);
                const finalCode = needsAsyncWrapper(transformedCode)
                    ? wrapAsync(transformedCode)
                    : transformedCode;

                return {
                    code: finalCode,
                    errors: [],
                    warnings,
                    config
                };
            }

            return {
                code: '',
                errors: ['No output generated'],
                warnings,
                config: {}
            };
        } catch (error) {
            const errors: string[] = [];
            if (isBuildError(error)) {
                for (const err of error.errors) {
                    errors.push(formatMessage(err));
                }
            } else if (error instanceof Error) {
                errors.push(error.message);
            } else {
                errors.push('Unknown build error');
            }

            return {
                code: '',
                errors,
                warnings: [],
                config: {}
            };
        }
    }

    /**
     * Set the project root directory
     */
    setProjectRoot(root: string): void {
        this.projectRoot = root;
    }
}

/**
 * Wrap code in an async IIFE if it uses await
 */
function wrapAsync(code: string): string {
    return `(async () => {\n${code}\n})();`;
}

/**
 * Format an esbuild message to a string
 */
function formatMessage(msg: esbuild.Message): string {
    let result = msg.text;
    if (msg.location) {
        const loc = msg.location;
        result = `${loc.file}:${loc.line}:${loc.column}: ${msg.text}`;
    }
    return result;
}

/**
 * Type guard for esbuild BuildFailure
 */
function isBuildError(error: unknown): error is esbuild.BuildFailure {
    return (
        typeof error === 'object' &&
        error !== null &&
        'errors' in error &&
        Array.isArray((error as esbuild.BuildFailure).errors)
    );
}

/**
 * Create a singleton bundler instance
 */
let bundlerInstance: Bundler | null = null;

export function getBundler(options?: BundlerOptions): Bundler {
    if (!bundlerInstance) {
        bundlerInstance = new Bundler(options);
    } else if (options?.projectRoot) {
        bundlerInstance.setProjectRoot(options.projectRoot);
    }
    return bundlerInstance;
}
