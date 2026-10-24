import { types } from './types.js';
import { binaryType, dpaintHeader } from './signatures.js';
export { types } from './types.js';
export { recommend, applications } from './applications.js';
export { inspect, loadInspector } from './inspect.js';
export const HEADER_BYTES = 16384;
const byType = new Map(types.map(type => [type.type, type]));
const byExtension = new Map(types.flatMap(type => type.extensions.map(extension => [extension, type])));
const decoder = new TextDecoder();

function bytesOf(value) {
    if (value == null) return null;
    if (value instanceof Uint8Array) return value;
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    throw new TypeError('bytes must be an ArrayBuffer or typed array');
}
function fromName(name) {
    const base = String(name || '').split(/[\\/]/).pop().toLowerCase();
    // Compound suffixes (such as .dpaint.json) take precedence.
    for (let dot = base.indexOf('.'); dot >= 0; dot = base.indexOf('.', dot + 1)) {
        const found = byExtension.get(base.slice(dot + 1));
        if (found) return found;
    }
    return byType.get('UNKNOWN');
}

/** Synchronous and I/O-free. Input bytes/text may be a bounded prefix starting at offset zero. */
export function detect(input = {}) {
    if (typeof input === 'string') input = { name: input };
    const named = fromName(input.name);
    const allBytes = bytesOf(input.bytes);
    const bytes = allBytes?.subarray(0, HEADER_BYTES);
    const size = input.size ?? allBytes?.byteLength;
    let type = bytes && binaryType(bytes, size);
    // Amiga .info files may contain one or two ordinary PNG images.
    if (type === 'PNG' && named.type === 'ICON') type = 'ICON';
    let source = type ? 'signature' : named.type === 'UNKNOWN' ? 'unknown' : 'extension';
    let version;
    if (!type) {
        const text = input.text == null ? bytes && decoder.decode(bytes) : String(input.text).slice(0, HEADER_BYTES);
        let header;
        if (input.data?.type === 'dpaint' && input.data.image && typeof input.data.image === 'object' && !Array.isArray(input.data.image))
            header = { version: input.data.version == null ? null : String(input.data.version) };
        else if (text && /^\s*\{/.test(text)) {
            // A complete bounded document can be validated; larger documents use the header scanner.
            const complete = input.size == null ? (input.text != null ? String(input.text).length <= HEADER_BYTES : allBytes.byteLength <= HEADER_BYTES) :
                input.size <= (allBytes?.byteLength ?? String(input.text || '').length) && input.size <= HEADER_BYTES;
            if (complete) {
                try {
                    const data = JSON.parse(text);
                    if (data?.type === 'dpaint' && data.image && typeof data.image === 'object' && !Array.isArray(data.image))
                        header = { version: data.version == null ? null : String(data.version) };
                } catch { /* Malformed JSON is not a DPaint document. */ }
            } else header = dpaintHeader(text);
        }
        if (header) { type = 'DPAINT'; source = 'signature'; version = header.version; }
    }
    const container = type === 'ZIP' && ['DOCX', 'XLSX', 'PPTX'].includes(named.type) ? 'ZIP' : undefined;
    if (container) { type = named.type; source = 'extension'; }
    const definition = byType.get(type) || named;
    return { ...definition, extensions: [...definition.extensions], source,
        ...(version !== undefined ? { version } : {}),
        ...(container ? { container } : {}),
        ...(type && named.type !== 'UNKNOWN' && named.type !== type ? { extensionType: named.type } : {}),
    };
}
