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

/**
 * Smart code transformer that strips initialization code while preserving user logic.
 * Ported from playground/lib/code-transformer.ts
 */

export interface TransformResult {
    code: string;
    config: {
        renderer?: string;
        canvasSize?: { width: number; height: number };
    };
}

/**
 * Transform code for execution by stripping initialization boilerplate
 */
export function transformCodeForExecution(code: string): string {
    let result = code;

    const { initAliases, namespaceAliases, defaultAliases } = collectWebcanvasAliases(result);

    // 1. Remove import statements (any import from any module)
    result = result.replace(/^import\s+(?:.+?\s+from\s+)?['"].*?['"];?\s*$/gm, '');

    // 2. Remove export statements
    result = result.replace(/^export\s+default\s+/gm, '');
    result = result.replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ');
    result = result.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '');
    result = result.replace(/^export\s+\*\s+from\s+['"][\s\S]*?['"]\s*;?\s*$/gm, '');

    // 3. Remove await init() calls with detected aliases
    for (const alias of initAliases) {
        const escaped = escapeRegExp(alias);
        result = result.replace(buildInitObjectRegex(escaped), '');
        result = result.replace(buildInitSimpleRegex(escaped), '');
    }

    // 4. Remove await init() calls via namespace/default imports
    const namespaceLikeAliases = new Set<string>([...namespaceAliases, ...defaultAliases]);
    for (const alias of namespaceLikeAliases) {
        const escaped = escapeRegExp(alias);
        const qualified = `${escaped}\\.init`;
        result = result.replace(buildInitObjectRegex(qualified), '');
        result = result.replace(buildInitSimpleRegex(qualified), '');
    }

    // 5. Fallback: Remove await init() calls with default name
    result = result.replace(buildInitObjectRegex('init'), '');
    result = result.replace(buildInitSimpleRegex('init'), '');

    // 6. Remove new Canvas() instantiation with any variable names
    // Matches: const/let/var VARNAME = new ANYTHING.Canvas('#canvas', {...});
    result = result.replace(
        /^(const|let|var)\s+\w+\s*=\s*new\s+\w+\.Canvas\s*\(\s*['"]#?canvas['"](?:\s*,\s*\{[\s\S]*?\})?\s*\)\s*;?\s*$/gm,
        ''
    );

    // 7. Remove single-line comments that are explanatory (not code)
    // Keep commented-out code, remove only standalone comment lines
    result = result.replace(/^\/\/(?!.*:).*$/gm, '');

    // 8. Remove multi-line comments and JSDoc
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');

    // 9. Clean up excessive blank lines (more than 2 consecutive)
    result = result.replace(/\n{3,}/g, '\n\n');

    // 10. Trim leading/trailing whitespace
    result = result.trim();

    return result;
}

/**
 * Extract the initialization config from code for reference
 */
export function extractInitConfig(code: string): {
    renderer?: string;
    canvasSize?: { width: number; height: number };
} {
    const config: {
        renderer?: string;
        canvasSize?: { width: number; height: number };
    } = {};

    // Extract renderer from init() call
    const rendererMatch = code.match(/renderer:\s*['"](\w+)['"]/);
    if (rendererMatch) {
        config.renderer = rendererMatch[1];
    }

    // Extract canvas dimensions
    const widthMatch = code.match(/width:\s*(\d+)/);
    const heightMatch = code.match(/height:\s*(\d+)/);
    if (widthMatch && heightMatch) {
        config.canvasSize = {
            width: parseInt(widthMatch[1], 10),
            height: parseInt(heightMatch[1], 10),
        };
    }

    return config;
}

/**
 * Check if code uses async/await patterns that need special handling
 */
export function needsAsyncWrapper(code: string): boolean {
    return /\bawait\b/.test(code);
}

/**
 * Transform and extract config in one call
 */
export function transformWithConfig(code: string): TransformResult {
    return {
        code: transformCodeForExecution(code),
        config: extractInitConfig(code)
    };
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildInitObjectRegex(initExpr: string): RegExp {
    return new RegExp(
        `^(const|let|var)\\s+\\w+\\s*=\\s*await\\s+(?:\\(0,\\s*)?${initExpr}\\s*\\)?\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*\\)\\s*;?\\s*$`,
        'gm'
    );
}

function buildInitSimpleRegex(initExpr: string): RegExp {
    return new RegExp(
        `^(const|let|var)\\s+\\w+\\s*=\\s*await\\s+(?:\\(0,\\s*)?${initExpr}\\s*\\)?\\s*\\(\\s*[\\w$.]*\\s*\\)\\s*;?\\s*$`,
        'gm'
    );
}

function collectWebcanvasAliases(code: string): {
    initAliases: Set<string>;
    namespaceAliases: Set<string>;
    defaultAliases: Set<string>;
} {
    const initAliases = new Set<string>();
    const namespaceAliases = new Set<string>();
    const defaultAliases = new Set<string>();

    const importRegex = /^import\s+(.+?)\s+from\s+['"]@thorvg\/webcanvas['"];?\s*$/gm;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(code)) !== null) {
        const clause = match[1].trim();
        parseImportClause(clause, initAliases, namespaceAliases, defaultAliases);
    }

    return { initAliases, namespaceAliases, defaultAliases };
}

function parseImportClause(
    clause: string,
    initAliases: Set<string>,
    namespaceAliases: Set<string>,
    defaultAliases: Set<string>
): void {
    if (!clause) {
        return;
    }

    const parts = clause.split(',').map(part => part.trim()).filter(Boolean);
    if (parts.length === 0) {
        return;
    }

    const firstPart = parts.shift();
    if (firstPart) {
        parseImportPart(firstPart, initAliases, namespaceAliases, defaultAliases);
    }

    for (const part of parts) {
        parseImportPart(part, initAliases, namespaceAliases, defaultAliases);
    }
}

function parseImportPart(
    part: string,
    initAliases: Set<string>,
    namespaceAliases: Set<string>,
    defaultAliases: Set<string>
): void {
    if (!part) {
        return;
    }

    const namespaceMatch = part.match(/^\*\s+as\s+(\w+)$/);
    if (namespaceMatch) {
        namespaceAliases.add(namespaceMatch[1]);
        return;
    }

    const namedMatch = part.match(/^\{([\s\S]*)\}$/);
    if (namedMatch) {
        const specifiers = namedMatch[1]
            .split(',')
            .map(spec => spec.trim())
            .filter(Boolean);

        for (const spec of specifiers) {
            const [imported, local] = spec.split(/\s+as\s+/).map(item => item.trim());
            const alias = local || imported;
            if (imported === 'init') {
                initAliases.add(alias);
            }
            if (imported === 'default') {
                defaultAliases.add(alias);
            }
        }
        return;
    }

    defaultAliases.add(part);
}
