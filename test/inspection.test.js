import assert from 'node:assert/strict';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import { detect, inspect, loadInspector } from '../index.js';
import BinaryStream from '../binary-stream.js';

function chunk(name, data) {
    const out = Buffer.alloc(8 + data.length + (data.length & 1));
    out.write(name); out.writeUInt32BE(data.length, 4); data.copy(out, 8); return out;
}
function iff(compressed = false) {
    const header = Buffer.alloc(20); header.writeUInt16BE(16); header.writeUInt16BE(1, 2); header[8] = 1; header[10] = compressed ? 1 : 0;
    const data = Buffer.concat([Buffer.from('ILBM'), chunk('BMHD', header), chunk('CMAP', Buffer.from([0,0,0,255,255,255])), chunk('BODY', Buffer.from(compressed ? [128,1,128,0] : [128,0]))]);
    const out = Buffer.alloc(data.length + 8); out.write('FORM'); out.writeUInt32BE(data.length,4); data.copy(out,8); return out;
}
function classicIcon() {
    const out = Buffer.alloc(100); out.writeUInt16BE(0xe310); out.writeUInt16BE(1,2);
    out.writeUInt16BE(16,12); out.writeUInt16BE(1,14); out[48] = 4;
    out.writeUInt16BE(16,82); out.writeUInt16BE(1,84); out.writeUInt16BE(1,86); out.writeUInt32BE(1,88);
    out[98] = 128; return out;
}

test('IFF inspection and bitplane decoding work in Node without DOM/globals', async () => {
    const data = iff();
    const result = await inspect({bytes: data});
    assert.equal(result.type, 'ILBM'); assert.equal(result.info, '16x1 2 colours');
    assert.equal(result.details.width,16); assert.equal(result.details.numPlanes,1);
    const codec = await loadInspector('ILBM');
    assert.strictEqual(await loadInspector('IFF'), codec);
    for (const data of [iff(),iff(true)]) {
        const image = codec.parse(data,true);
        assert.deepEqual(image.pixels[0].slice(0,3),[1,0,0]);
    }
    const stream = BinaryStream(data); stream.goto(7);
    codec.parse(stream); assert.equal(stream.index,7,'Parsing must not change the caller cursor');
});
test('Amiga icon metadata, classic pixels and writing have no host dependency', async () => {
    const data = classicIcon(), result = await inspect({bytes:data});
    assert.equal(result.type,'ICON'); assert.equal(result.info,'icon'); assert.equal(result.details.width,16);
    const codec = await loadInspector('ICON'), decoded = await codec.parse(data);
    assert.deepEqual(decoded.img.pixels[0].slice(0,3),[1,0,0]);
    const roundtrip = await codec.parse(codec.write(codec.create(2,2)));
    assert.equal(roundtrip.colorIcon.width,2); assert.equal(roundtrip.colorIcon.states.length,1);
    data.writeUInt16BE(2,2); assert.equal(detect({bytes:data}).type,'ICON');
});
test('PNG-based .info icons retain both image states without invoking browser rendering', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=','base64');
    assert.equal(detect({name:'drawer.info',bytes:png}).type,'ICON');
    assert.equal(detect({name:'photo.png',bytes:png}).type,'PNG');
    const codec = await loadInspector('ICON'), result = await codec.parse(Buffer.concat([png,png]));
    assert.equal(result.width,1); assert.equal(result.PNGIcon.bytes.length,2);
    assert.equal((await inspect({name:'drawer.info',bytes:png})).details.format,'PNG');
});
test('ARGB icon inflation uses native streams in Node without a global zlib dependency', async () => {
    const classic = classicIcon(), face = Buffer.from([0,0,0,0,0,0]);
    const payload = Buffer.concat([Buffer.alloc(10),deflateSync(Buffer.from([255,10,20,30]))]);
    const data = Buffer.concat([Buffer.from('ICON'), chunk('FACE',face),chunk('ARGB',payload)]);
    const form = Buffer.alloc(data.length+8); form.write('FORM'); form.writeUInt32BE(data.length,4); data.copy(form,8);
    const decoded = await (await loadInspector('ICON')).parse(Buffer.concat([classic,form]));
    assert.deepEqual(decoded.colorIcon.states[0].pixels[0],[10,20,30,1]);
});
test('truncated data and invalid dimensions fail without unbounded decoding', async () => {
    const codec = await loadInspector('ILBM');
    assert.throws(()=>codec.parse(iff().subarray(0,23)),/Truncated/);
    const bad=iff(); bad.writeUInt16BE(65535,20); bad.writeUInt16BE(65535,22);
    assert.throws(()=>codec.parse(bad,true),/limit/);
    const icon=await loadInspector('ICON'); await assert.rejects(icon.parse(classicIcon().subarray(0,99)),/Truncated/);
    assert.equal(await loadInspector('TXT'),null);
});
