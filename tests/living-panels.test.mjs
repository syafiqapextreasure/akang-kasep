import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../public/living-panels.js',import.meta.url),'utf8');
function harness({reduced=false}={}) {
  const events=()=>({handlers:{},addEventListener(type,callback){(this.handlers[type]??=[]).push(callback);},emit(type,event={}){for(const callback of this.handlers[type]??[])callback(event);}});
  const panels=Array.from({length:6},(_,index)=>({...events(),classList:{toggle(){}},attributes:{},setAttribute(name,value){this.attributes[name]=value;},querySelector(){return {textContent:'Scene '+index};},focus(){story.emit('focusin');}}));
  const status={textContent:''};
  const story={...events(),dataset:{},querySelectorAll:()=>panels,querySelector:()=>status,contains:target=>panels.includes(target)};
  const document={...events(),hidden:false,querySelectorAll:()=>[story]};
  const media={...events(),matches:reduced};
  const windowEvents=events(),tasks=new Map();let serial=0,observer;
  vm.runInNewContext(source,{document,matchMedia:()=>media,window:{IntersectionObserver:true},IntersectionObserver:class{constructor(callback){observer=callback;}observe(){}},addEventListener:windowEvents.addEventListener.bind(windowEvents),setTimeout(callback,delay){assert.equal(delay,4500);tasks.set(++serial,callback);return serial;},clearTimeout:id=>tasks.delete(id)});
  return {story,panels,document,media,status,tasks,windowEvents,visible(value=true){observer([{isIntersecting:value}]);},tick(){const next=tasks.entries().next().value;assert.ok(next,'Expected a pending automatic scene');tasks.delete(next[0]);next[1]();},active:()=>Number(story.dataset.activeScene)};
}
test('six scenes repeat continuously without accumulating timers',()=>{
 const h=harness();assert.equal(h.tasks.size,0);h.visible();
 for(let i=1;i<=14;i++){h.tick();assert.equal(h.active(),i%6);assert.equal(h.tasks.size,1);}
 assert.equal(h.status.textContent,'','Automatic changes must not repeatedly announce to screen readers');
});
test('hover holds, pointer leave resumes, touch entry does not suspend rotation',()=>{
 const h=harness();h.visible();h.tick();h.story.emit('pointerenter',{pointerType:'mouse'});assert.equal(h.tasks.size,0);assert.equal(h.active(),1);
 h.story.emit('pointerleave');h.tick();assert.equal(h.active(),2);
 h.story.emit('pointerenter',{pointerType:'touch'});assert.equal(h.tasks.size,1);
});
test('manual click stays selected after pointer leaves, focus changes and visibility returns',()=>{
 const h=harness();h.visible();h.panels[4].emit('click');assert.equal(h.active(),4);assert.equal(h.story.dataset.mode,'manual');
 h.story.emit('pointerleave');h.story.emit('focusout',{relatedTarget:null});h.visible(false);h.visible(true);
 h.document.hidden=true;h.document.emit('visibilitychange');h.document.hidden=false;h.document.emit('visibilitychange');
 assert.equal(h.tasks.size,0);assert.equal(h.active(),4);assert.match(h.status.textContent,/Selected for manual browsing/);
});
test('keyboard selection wraps and Home/End choose the first/last scene',()=>{
 const h=harness();h.visible();let prevented=0;const key=(index,value)=>h.panels[index].emit('keydown',{key:value,preventDefault(){prevented++;}});
 key(0,'ArrowLeft');assert.equal(h.active(),5);key(5,'ArrowRight');assert.equal(h.active(),0);key(0,'End');assert.equal(h.active(),5);key(5,'Home');assert.equal(h.active(),0);
 assert.equal(prevented,4);assert.equal(h.tasks.size,0);
});
test('keyboard focus and hidden/offscreen states suspend automatic changes',()=>{
 const h=harness();h.visible();h.story.emit('focusin');assert.equal(h.tasks.size,0);h.story.emit('focusout',{relatedTarget:null});assert.equal(h.tasks.size,1);
 h.visible(false);assert.equal(h.tasks.size,0);h.visible();h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.tasks.size,0);
 h.document.hidden=false;h.document.emit('visibilitychange');assert.equal(h.tasks.size,1);
});
test('reduced motion disables automatic looping but manual selection remains available',()=>{
 const h=harness({reduced:true});h.visible();assert.equal(h.tasks.size,0);assert.equal(h.story.dataset.mode,'reduced');
 h.media.matches=false;h.media.emit('change');assert.equal(h.tasks.size,1);h.media.matches=true;h.media.emit('change');assert.equal(h.tasks.size,0);
 h.panels[2].emit('click');assert.equal(h.active(),2);assert.equal(h.tasks.size,0);
});
