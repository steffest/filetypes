import { bytesOf } from './binary-stream.js';
const modules = new Map();
/** Load optional codecs only on demand. Parsing works in Node; canvas rendering requires a browser. */
export async function loadInspector(type) {
    type = typeof type === 'string' ? type : type?.type;
    const key = type === 'ICON' ? 'icon' : ['IFF', 'ILBM', 'ANIM'].includes(type) ? 'iff' : null;
    if (!key) return null;
    if (!modules.has(key)) modules.set(key, (key === 'icon' ? import('./inspectors/amiga-icon.js') : import('./inspectors/iff.js')).then(module => module.default));
    return modules.get(key);
}
export async function inspect(input, detection) {
    const bytes = bytesOf(input?.bytes ?? input);
    detection ||= (await import('./index.js')).detect({ name: input?.name, bytes, size: input?.size ?? bytes.byteLength });
    const inspector = await loadInspector(detection);
    if (!inspector) return { type: detection.type, info: '', details: null };
    const details = await inspector.inspect(bytes);
    return { type: detection.type, ...details };
}
