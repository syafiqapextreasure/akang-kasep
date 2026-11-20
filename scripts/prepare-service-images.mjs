import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const records=JSON.parse(await fs.readFile(path.join(root,'docs/generated-service-images.json'),'utf8'));
const masters=path.resolve(root,'../../output/imagegen/akang-kasep-services-2026-11-21');
await fs.mkdir(masters,{recursive:true});
const alts={
 'service-construction':'Illustrative building construction scene with concrete structure, scaffolding and site coordinators',
 'service-civil':'Illustrative civil works scene with road roller, drainage channel and surveyor',
 'service-maintenance':'Illustrative maintenance scene showing interior painting and window inspection',
 'service-me':'Illustrative mechanical and electrical scene with technicians inspecting plant-room equipment'
};
let html=await fs.readFile(path.join(root,'src/content/services.html'),'utf8');
const oldIds=[18,11,7,6];
for(let i=0;i<records.length;i++){
 const record=records[i],original=await fs.readFile(record.source),meta=await sharp(original).metadata();
 await fs.copyFile(record.source,path.join(masters,record.slug+'.png'));
 const sizes=[480,768,1080,meta.width];
 const files=[];
 for(const width of sizes){
  const name=record.slug+(width===meta.width?'':'-'+width)+'.webp';
  const file=path.join(root,'public/assets',name);
  await sharp(original).resize({width,withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(file);
  files.push({name,width,bytes:(await fs.stat(file)).size});
 }
 const full=path.join(root,'public/assets',record.slug+'.webp');
 const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
 if(digest(await sharp(original).removeAlpha().raw().toBuffer())!==digest(await sharp(full).removeAlpha().raw().toBuffer()))throw new Error('Lossless verification failed: '+record.slug);
 record.master=path.join(masters,record.slug+'.png');record.width=meta.width;record.height=meta.height;record.originalBytes=original.length;record.files=files;record.compression='Lossless WebP; decoded RGB verified identical for full-size derivative.';
 const attrs=`src="/assets/${record.slug}.webp" srcset="${files.map(f=>'/assets/'+f.name+' '+f.width+'w').join(', ')}" sizes="(max-width: 680px) 90vw, 45vw" width="${meta.width}" height="${meta.height}" alt="${alts[record.slug]}" loading="${i===0?'eager':'lazy'}" decoding="async" ${i===0?'fetchpriority="high"':''} data-photo-id="${record.slug}"`;
 html=html.replace(new RegExp('<img [^>]*data-photo-id="'+oldIds[i]+'"[^>]*>'),'<img '+attrs+'>');
}
html=html.replace('<figcaption class="image-tag">Project interior</figcaption>','');
await fs.writeFile(path.join(root,'src/content/services.html'),html);
await fs.writeFile(path.join(root,'docs/generated-service-images.json'),JSON.stringify(records,null,2)+'\n');
await fs.writeFile(path.join(masters,'prompts-and-assets.json'),JSON.stringify(records,null,2)+'\n');
console.log(JSON.stringify(records.map(r=>({slug:r.slug,width:r.width,height:r.height,original:r.originalBytes,web:r.files})),null,2));
