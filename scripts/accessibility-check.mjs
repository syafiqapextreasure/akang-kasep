import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import {routes} from '../src/data.mjs';
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{channel:'msedge'})});
const results=[];
try{for(const width of [390,1440]){const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=await context.newPage();for(const route of routes){await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:4321')+route.path);await page.evaluate(()=>document.fonts.ready);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();results.push({width,route:route.path,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});console.log(width+' '+route.path+': '+result.violations.map(v=>v.id+'('+v.nodes.length+')').join(', '));}await context.close();}}finally{await browser.close();await fs.writeFile('review/accessibility-results.json',JSON.stringify(results,null,2));}
if(results.some(r=>r.violations.length))process.exitCode=1;
