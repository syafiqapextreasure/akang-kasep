import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../src/worker.mjs';
import {routes} from '../src/data.mjs';
import {renderers} from '../src/pages.mjs';

test('native comparison input updates clipping and accessible value at both endpoints',()=>{
 const handlers={},attributes={},variables={};
 const input={value:'50',addEventListener(name,fn){handlers[name]=fn;},setAttribute(name,value){attributes[name]=value;}};
 const frame={querySelector:()=>input,style:{setProperty(name,value){variables[name]=value;}},dataset:{}};
 vm.runInNewContext(fs.readFileSync(new URL('../public/comparison.js',import.meta.url),'utf8'),{document:{querySelectorAll:()=>[frame]}});
 assert.equal(variables['--comparison'],'50%');assert.equal(attributes['aria-valuetext'],'50% before, 50% after');
 for(const value of [0,27,100]){input.value=String(value);handlers.input();assert.equal(variables['--comparison'],value+'%');assert.equal(attributes['aria-valuetext'],`${value}% before, ${100-value}% after`);}
 assert.equal(frame.dataset.edge,'before');input.value='0';handlers.change();assert.equal(frame.dataset.edge,'after');
});
test('retired before-and-after URLs redirect directly to the merged hero',async()=>{
 for(const suffix of ['','/','.html','/index.html','?utm_source=old-link']){
  const response=await worker.fetch(new Request('https://example.test/project-progress'+suffix),{});
  assert.equal(response.status,308);
  assert.equal(response.headers.get('Location'),'https://example.test/projects/education-facility'+(suffix.startsWith('?')?suffix:'')+'#before-after');
 }
 const head=await worker.fetch(new Request('https://example.test/project-progress',{method:'HEAD'}),{});assert.equal(head.status,308);
});
test('merged project hero has one accessible slider and no separate page or internal legacy links',()=>{
 assert.equal(routes.length,10);assert.equal(routes.some(r=>r.path==='/project-progress'),false);
 const html=renderers.project();assert.equal((html.match(/type="range"/g)||[]).length,1);
 assert.match(html,/id="before-after"/);assert.match(html,/<noscript>/);
 for(const route of routes)assert.doesNotMatch(renderers[route.key](),/href="\/project-progress(?:["#?])/);
 assert.match(renderers.home(),/data-living-story/,'Selected homepage panels remain available');
});
