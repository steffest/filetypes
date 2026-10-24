// Bounds-checked signature probes. Bytes may be only a prefix; size is the full file size.
const ascii = (b, offset, value) => offset + value.length <= b.length && [...value].every((c, i) => b[offset + i] === c.charCodeAt(0));
const at = (b, ...values) => values.every((value, i) => b[i] === value);
export function binaryType(bytes, size) {
    if (at(bytes, 137, 80, 78, 71, 13, 10, 26, 10)) return 'PNG';
    if (at(bytes, 255, 216, 255)) return 'JPG';
    if (ascii(bytes, 0, 'GIF87a') || ascii(bytes, 0, 'GIF89a')) return 'GIF';
    if (ascii(bytes, 0, '%PDF-')) return 'PDF';
    if (ascii(bytes, 0, '8BPS') && at(bytes.subarray(4), 0, 1)) return 'PSD';
    if (ascii(bytes, 0, 'RIFF') && ascii(bytes, 8, 'WEBP')) return 'WEBP';
    if (ascii(bytes, 0, 'FORM') && bytes.length >= 12) {
        const declared = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, false) + 8;
        if (declared < 12 || (size != null && declared > size)) return null;
        if (ascii(bytes, 8, 'ILBM') || ascii(bytes, 8, 'PBM ')) return 'ILBM';
        return ascii(bytes, 8, 'ANIM') ? 'ANIM' : 'IFF';
    }
    if (at(bytes, 227, 16)) return 'ICON';
    if (size === 901120 && ascii(bytes, 0, 'DOS')) return 'ADFDOS';
    if (ascii(bytes, 0, 'Extended Module: ')) return 'XM';
    if (ascii(bytes, 0, 'IMPM')) return 'IMPULSETRACKER';
    if (ascii(bytes, 44, 'SCRM')) return 'SCREAMTRACKER';
    for (const marker of ['M.K.', 'M!K!', 'M&K!', 'FLT4', '2CHN', '6CHN', '8CHN', '10CH', '12CH', '14CH', '16CH', '18CH', '20CH', '22CH', '24CH', '26CH', '28CH', '30CH', '32CH'])
        if (ascii(bytes, 1080, marker)) return 'MOD';
    if (at(bytes, 80, 75, 3, 4) || at(bytes, 80, 75, 5, 6) || at(bytes, 80, 75, 7, 8)) return 'ZIP';
    if (ascii(bytes, 0, 'Rar!\x1a\x07')) return 'RAR';
    if (ascii(bytes, 0, 'MThd')) return 'MIDI';
    return null;
}

// Read only root-level JSON properties, including incomplete prefixes of large documents.
// JSON strings and nested objects are skipped, so markers in payloads are not mistaken for headers.
export function dpaintHeader(text) {
    let i = 0, type, version, image = false;
    const whitespace = () => { while (/\s/.test(text[i] || '') && i < text.length) i++; };
    function string() {
        const start = i++;
        while (i < text.length) {
            if (text[i] === '\\') { i += 2; continue; }
            if (text[i++] === '"') { try { return JSON.parse(text.slice(start, i)); } catch { return undefined; } }
        }
    }
    whitespace(); if (text[i++] !== '{') return null;
    while (i < text.length) {
        whitespace(); if (text[i] !== '"') break;
        const key = string(); whitespace(); if (text[i++] !== ':') break; whitespace();
        if (key === 'image' && text[i] === '{') image = true;
        if (key === 'type' || key === 'version') {
            let value;
            if (text[i] === '"') value = string();
            else { const start = i; while (i < text.length && !/[,}\s]/.test(text[i])) i++; value = text.slice(start, i); }
            if (key === 'type') type = value;
            else version = value;
        } else {
            let depth = 0;
            while (i < text.length) {
                const c = text[i];
                if (!depth && (c === ',' || c === '}')) break;
                if (c === '"') { string(); continue; }
                if (c === '{' || c === '[') depth++;
                if (c === '}' || c === ']') depth--;
                i++;
            }
        }
        if (type === 'dpaint' && image) return { version: version == null ? null : String(version) };
        whitespace(); if (text[i++] !== ',') break;
    }
    return null;
}
