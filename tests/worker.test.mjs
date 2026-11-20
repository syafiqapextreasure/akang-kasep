import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{validateEnquiry} from '../src/worker.mjs';
import {createLocalDb} from '../scripts/local-db.mjs';

const payload={name:'Local QA',company:'Test only',email:'qa@example.test',phone:'',service:'general',location:'Test location',brief:'Local test enquiry; no external message.',privacy:'accepted'};
const request=(data=payload,key=crypto.randomUUID(),headers={})=>new Request('https://example.test/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://example.test','CF-Connecting-IP':'192.0.2.1','Idempotency-Key':key,...headers},body:JSON.stringify(data)});
const fixture=()=>({ENQUIRIES:createLocalDb(),ASSETS:{fetch:async()=>new Response('<!doctype html><title>Test</title>__ORIGIN__',{headers:{'Content-Type':'text/html'}})}});

test('validation identifies required fields, bad contacts, service and honeypot',()=>{
 assert.deepEqual(validateEnquiry(payload).errors,{});
 assert.equal(validateEnquiry({...payload,email:'',phone:'+60 9-6227587'}).errors.email,undefined);
 for(const data of [{...payload,name:''},{...payload,email:'bad'},{...payload,phone:'letters'},{...payload,service:'fake'},{...payload,privacy:''},{...payload,website:'spam'}])assert.ok(Object.keys(validateEnquiry(data).errors).length);
});
test('durable acceptance, idempotent retry, conflict and private receipt',async()=>{
 const env=fixture();try{const key=crypto.randomUUID();const first=await worker.fetch(request(payload,key),env);assert.equal(first.status,201);const result=await first.json();assert.ok(result.accepted);assert.match(result.reference,/^AK-\d{8}-[A-F0-9]{10}$/);
 const cookie=first.headers.get('Set-Cookie');assert.match(cookie,/HttpOnly; SameSite=Lax/);assert.match(cookie,/Secure/);
 const again=await worker.fetch(request(payload,key),env);assert.equal((await again.json()).reference,result.reference);assert.equal((await env.ENQUIRIES.prepare('SELECT count(*) AS n FROM enquiries').first()).n,1);
 assert.equal((await worker.fetch(request({...payload,brief:'Changed request contents'},key),env)).status,409);
 const status=await worker.fetch(new Request('https://example.test/api/enquiry-status',{headers:{Cookie:cookie}}),env);assert.deepEqual(await status.json(),result);
 const noCookie=await worker.fetch(new Request('https://example.test/api/enquiry-status'),env);assert.deepEqual(await noCookie.json(),{accepted:false});
 const forged=await worker.fetch(new Request('https://example.test/api/enquiry-status',{headers:{Cookie:'ak_receipt='+result.reference+'.'+'0'.repeat(64)}}),env);assert.equal((await forged.json()).accepted,false);
 }finally{env.ENQUIRIES.close();}
});
test('failure, invalid body, origin, payload limit and rate limit never report acceptance',async()=>{
 assert.equal((await worker.fetch(request(),{})).status,503);const env=fixture();try{
 assert.equal((await worker.fetch(request(payload,crypto.randomUUID(),{Origin:'https://untrusted.test'}),env)).status,403);
 assert.equal((await worker.fetch(request({...payload,brief:''}),env)).status,422);
 assert.equal((await worker.fetch(request({...payload,brief:'x'.repeat(40000)}),env)).status,413);
 const bad=new Request('https://example.test/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal((await worker.fetch(bad,env)).status,400);
 for(let i=0;i<5;i++)assert.equal((await worker.fetch(request(),env)).status,201);
 const limited=await worker.fetch(request(),env);assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'3600');
 }finally{env.ENQUIRIES.close();}
});
test('clean URL redirects, canonical origin, noindex, security and correct HTTP methods',async()=>{
 const env=fixture();try{
 for(const [path,to] of [['/about.html','/about'],['/about/index.html','/about'],['/about/','/about'],['/index.html','/']]){const r=await worker.fetch(new Request('https://example.test'+path),env);assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://example.test'+to);}
 const response=await worker.fetch(new Request('https://example.test/about'),env);assert.match(await response.text(),/https:\/\/example.test/);assert.equal(response.headers.get('X-Frame-Options'),'DENY');
 const missing=await worker.fetch(new Request('https://example.test/404'),env);assert.equal(missing.status,404);assert.match(missing.headers.get('X-Robots-Tag'),/noindex/);
 const thanks=await worker.fetch(new Request('https://example.test/thank-you'),env);assert.match(thanks.headers.get('Cache-Control'),/no-store/);assert.match(thanks.headers.get('X-Robots-Tag'),/noindex/);
 assert.equal((await worker.fetch(new Request('https://example.test/about',{method:'HEAD'}),env)).body,null);
 assert.equal((await worker.fetch(new Request('https://example.test/about',{method:'PUT'}),env)).status,405);
 }finally{env.ENQUIRIES.close();}
});
test('scheduled housekeeping deletes old records and leaves fresh enquiries',async()=>{
 const env=fixture();try{await worker.fetch(request(),env);await env.ENQUIRIES.prepare("UPDATE enquiries SET created_at='2020-01-01T00:00:00.000Z'").run();await worker.fetch(request(),env);await worker.scheduled({},env);assert.equal((await env.ENQUIRIES.prepare('SELECT count(*) AS n FROM enquiries').first()).n,1);}finally{env.ENQUIRIES.close();}
});
