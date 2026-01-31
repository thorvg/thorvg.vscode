/*
 * Copyright (c) 2025 - 2026 ThorVG project. All rights reserved.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const BASE64_CHARS_WITH_PAD = BASE64_CHARS + '=';

export function toBase64(data: Uint8Array): string {
    let output = '';

    for (let i = 0; i < data.length; i += 3) {
        const byte1 = data[i];
        const byte2 = i + 1 < data.length ? data[i + 1] : 0;
        const byte3 = i + 2 < data.length ? data[i + 2] : 0;

        const enc1 = byte1 >> 2;
        const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
        const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
        const enc4 = byte3 & 63;

        output += BASE64_CHARS.charAt(enc1);
        output += BASE64_CHARS.charAt(enc2);
        output += i + 1 < data.length ? BASE64_CHARS.charAt(enc3) : '=';
        output += i + 2 < data.length ? BASE64_CHARS.charAt(enc4) : '=';
    }

    return output;
}

export function fromBase64(base64: string): Uint8Array {
    const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    const output: number[] = [];

    for (let i = 0; i < clean.length; i += 4) {
        const enc1 = BASE64_CHARS_WITH_PAD.indexOf(clean.charAt(i));
        const enc2 = BASE64_CHARS_WITH_PAD.indexOf(clean.charAt(i + 1));
        const enc3 = BASE64_CHARS_WITH_PAD.indexOf(clean.charAt(i + 2));
        const enc4 = BASE64_CHARS_WITH_PAD.indexOf(clean.charAt(i + 3));

        const byte1 = (enc1 << 2) | (enc2 >> 4);
        const byte2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const byte3 = ((enc3 & 3) << 6) | enc4;

        output.push(byte1);
        if (enc3 !== 64) {
            output.push(byte2);
        }
        if (enc4 !== 64) {
            output.push(byte3);
        }
    }

    return new Uint8Array(output);
}
