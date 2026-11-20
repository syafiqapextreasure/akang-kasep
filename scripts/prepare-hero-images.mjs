import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const records=JSON.parse(await fs.readFile(path.join(root,'docs/generated-hero-images.json'),'utf8'));
for(const record of records){
 const image=sharp(record.source);const metadata=await image.metadata();
 const destination=path.resolve(root,'../../output/imagegen/akang-kasep-hero-comparison-2026-11-21');
 await fs.mkdir(destination,{recursive:true});
 const master=path.join(destination,record.slug+'.png');await fs.copyFile(record.source,master);
 record.master=master;record.width=metadata.width;record.height=metadata.height;record.files=[];
 for(const width of [480,768,1080,metadata.width].filter((w,i,a)=>w<=metadata.width&&a.indexOf(w)===i)){
  const name=record.slug+(width===metadata.width?'':'-'+width)+'.webp';
  const target=path.join(root,'public/assets',name);
  await image.clone().resize({width,withoutEnlargement:true}).webp({lossless:true,effort:5}).toFile(target);
  record.files.push({name,width,bytes:(await fs.stat(target)).size});
 }
 console.log(record.slug+': '+record.width+'x'+record.height);
}
await fs.writeFile(path.join(root,'docs/generated-hero-images.json'),JSON.stringify(records,null,2)+'\n');
