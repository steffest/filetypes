// Bounds-checked big-endian stream for the optional Amiga codecs. No host I/O.
export function bytesOf(input) {
    input = input?.binary || input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    if (input?.buffer instanceof ArrayBuffer) return new Uint8Array(input.buffer, input.byteOffset || 0, input.length ?? input.buffer.byteLength);
    throw new TypeError('Expected an ArrayBuffer, typed array, or binary stream');
}
export default function BinaryStream(input, bigEndian = true) {
    const bytes = bytesOf(input);
    // Isolate sliced views and legacy streams; never mutate the caller's cursor.
    const buffer = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength ? bytes.buffer : bytes.slice().buffer;
    const view = new DataView(buffer), little = !bigEndian;
    const stream = { buffer, dataView: view, length: bytes.byteLength, index: 0 };
    function take(length, position = stream.index) {
        if (!Number.isInteger(position) || !Number.isInteger(length) || length < 0 || position < 0 || position + length > stream.length)
            throw new RangeError('Truncated or invalid binary data');
        stream.index = position + length;
        return position;
    }
    stream.goto = position => { take(0, position); };
    stream.jump = amount => stream.goto(stream.index + amount);
    stream.isEOF = (margin = 0) => stream.index >= stream.length - margin;
    for (const [name, getter, setter, size] of [['Byte','getInt8','setInt8',1], ['Ubyte','getUint8','setUint8',1], ['Word','getUint16','setUint16',2], ['Short','getInt16','setInt16',2], ['Uint','getUint32','setUint32',4]]) {
        stream['read' + name] = position => view[getter](take(size, position), little);
        stream['write' + name] = (value, position) => view[setter](take(size, position), value, little);
    }
    stream.readLong = stream.readDWord = stream.readUint;
    stream.writeLong = stream.writeDWord = stream.writeUint;
    stream.readString = (length, position) => {
        const start = take(length, position); let value = '';
        for (let i = start; i < start + length && view.getUint8(i); i++) value += String.fromCharCode(view.getUint8(i));
        return value;
    };
    stream.writeString = (value, position) => { const start = take(value.length, position); for (let i = 0; i < value.length; i++) view.setUint8(start + i, value.charCodeAt(i)); };
    stream.readBits = (count, bitPosition, position = stream.index) => {
        if (!Number.isInteger(count) || count < 0 || count > 8 || !Number.isInteger(bitPosition) || bitPosition < 0) throw new RangeError('Invalid bit range');
        let value = 0;
        for (let i = 0; i < count; i++) { const bit = bitPosition + i; take(1, position + (bit >> 3)); value = value * 2 + ((view.getUint8(position + (bit >> 3)) >> (7 - (bit & 7))) & 1); }
        return value;
    };
    stream.writeBits = bits => { if (bits.length % 8) throw new RangeError('Expected whole bytes'); for (let i = 0; i < bits.length; i += 8) stream.writeUbyte(bits.slice(i, i + 8).reduce((value, bit) => value * 2 + bit, 0)); };
    return stream;
}
