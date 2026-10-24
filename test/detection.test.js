import assert from 'node:assert/strict';
import test from 'node:test';
import { detect, recommend, HEADER_BYTES, applications } from '../index.js';
const bytes = text => new TextEncoder().encode(text);

test('name-only detection, compound suffixes, case and unknown files', () => {
    assert.equal(detect('C:\\a\\PICTURE.PNG').type, 'PNG');
    assert.equal(detect('project.dpaint.json').type, 'DPAINT');
    assert.equal(detect('config.json').type, 'JSON');
    assert.equal(detect('noextension').type, 'UNKNOWN');
    assert.equal(detect().source, 'unknown');
});
test('binary signatures win over conflicting extensions and handle sliced buffers', () => {
    const storage = Buffer.concat([Buffer.alloc(13), Buffer.from([137,80,78,71,13,10,26,10]), Buffer.alloc(2)]);
    const result = detect({ name:'fake.jpg', bytes:storage.subarray(13,21), size:10000 });
    assert.equal(result.type, 'PNG'); assert.equal(result.extensionType, 'JPG'); assert.equal(result.source, 'signature');
    assert.equal(detect({ bytes:new DataView(storage.buffer, storage.byteOffset + 13, 8) }).type, 'PNG');
    assert.equal(detect({ bytes:bytes('%PDF-1.7').buffer }).type, 'PDF');
    assert.equal(detect({ bytes:new Uint8Array([137,80]) }).type, 'UNKNOWN');
});
test('retains MOD, IFF, icon and ADF detection with bounded headers', () => {
    const mod = Buffer.alloc(1084); mod.write('M.K.',1080);
    assert.equal(detect({bytes:mod}).type,'MOD');
    const iff=Buffer.alloc(12); iff.write('FORM'); iff.writeUInt32BE(50000,4); iff.write('ILBM',8);
    assert.equal(detect({bytes:iff,size:50008}).type,'ILBM');
    assert.equal(detect({bytes:iff,size:100}).type,'UNKNOWN');
    assert.equal(detect({bytes:bytes('DOS'),size:901120}).type,'ADFDOS');
    assert.equal(detect({bytes:new Uint8Array([227,16,0,1])}).type,'ICON');
});
test('DPaint v1/v2 content is distinct from ordinary JSON, regardless of filename', () => {
    for (const version of ['1','2']) {
        const value = {type:'dpaint',version,image:{width:2,height:2,frames:[]}};
        for (const input of [{data:value},{text:JSON.stringify(value)},{bytes:bytes(JSON.stringify(value))}]) {
            const result=detect({name:'ordinary.json',...input});
            assert.equal(result.type,'DPAINT'); assert.equal(result.source,'signature'); assert.equal(result.version,version);
        }
    }
    for (const value of [{type:'dpaint'}, {image:{}}, {type:'palette',image:{}}, {type:'dpaint',image:[]}, {nested:{type:'dpaint',image:{}}}])
        assert.equal(detect({name:'config.json',text:JSON.stringify(value)}).type,'JSON');
    assert.equal(detect({name:'config.json',text:'{"type":"dpaint","image":{'}).type,'JSON');
});
test('large DPaint documents need only a bounded prefix; nested/string markers are ignored', () => {
    const document=JSON.stringify({type:'dpaint',version:'2',image:{width:1,pixels:'x'.repeat(1000000)}});
    assert.equal(detect({name:'project.json',bytes:bytes(document.slice(0,HEADER_BYTES)),size:document.length}).type,'DPAINT');
    assert.equal(detect({text:document}).type,'DPAINT');
    const fake=JSON.stringify({description:'"type":"dpaint","image":{}',nested:{type:'dpaint',image:{}},padding:'x'.repeat(30000)});
    assert.equal(detect({name:'config.json',bytes:bytes(fake),size:fake.length}).type,'JSON');
    const late=JSON.stringify({padding:'x'.repeat(30000),type:'dpaint',image:{}});
    assert.equal(detect({name:'late.json',text:late}).type,'JSON');
});
test('container signatures do not erase specific document extension hints', () => {
    const result=detect({name:'report.docx',bytes:new Uint8Array([80,75,3,4])});
    assert.equal(result.type,'DOCX'); assert.equal(result.container,'ZIP'); assert.equal(result.source,'extension');
});
test('recommendations describe deployment URL and actual DPaint transport', () => {
    const found=recommend(detect({data:{type:'dpaint',image:{}}}));
    assert.deepEqual(found.map(app=>app.action),['view','edit']);
    assert.equal(found[0].application,'dpaint.js');
    assert.equal(found[0].url,'https://www.stef.be/dpaint/');
    assert.equal(found[0].transport.input.parameter,'file');
    assert.equal(found[0].transport.output.parameter,'putback');
    assert.equal(found[0].transport.output.preservesDocument,false);
    assert.deepEqual(recommend('JSON'),[]);
    assert.deepEqual(recommend('DPAINT',{available:[]}),[]);
    assert.deepEqual(recommend('DPAINT',{applications:{'dpaint.js':false}}),[]);
    const edit=recommend('DPAINT',{action:'edit',applications:{'dpaint.js':{url:'/editor/',transport:{output:{kind:'host-function',function:'save'}}}}});
    assert.equal(edit.length,1); assert.equal(edit[0].url,'/editor/'); assert.equal(edit[0].transport.output.function,'save');
});
test('results and recommendation overrides cannot mutate shared definitions', () => {
    detect('x.png').extensions.push('oops');
    const first=recommend('PNG'); first[0].transport.input.parameter='changed';
    assert.equal(recommend('PNG')[0].transport.input.parameter,'file');
    assert.equal(detect('x.png').extensions.includes('oops'),false);
    assert.ok(Object.isFrozen(applications[0].transport.input));
});

test('Word recommendations expose the hosted binary transport and exclude legacy formats', () => {
    const app = recommend(detect('Report.DOCX'))[0];
    assert.equal(app.application, 'documents'); assert.equal(app.action, 'edit');
    assert.equal(app.url, 'https://os5.app/editor/documents/');
    assert.equal(app.transport.module, 'https://os5.app/shared/transport.js');
    assert.equal(app.transport.kind, 'postMessage'); assert.equal(app.transport.protocol, 'web-file-handler-v1');
    assert.equal(app.transport.input.kind, 'arraybuffer'); assert.equal(app.transport.output.format, 'DOCX');
    assert.equal(detect('old.doc').type, 'DOC'); assert.deepEqual(recommend(detect('old.doc')), []);
    assert.equal(detect('open.odt').type, 'ODT'); assert.deepEqual(recommend(detect('open.odt')), []);
});
