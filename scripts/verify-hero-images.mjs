import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const records=JSON.parse(await fs.readFile(path.join(root,'docs/generated-hero-images.json'),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
const results=[];
for(const record of records){
 const original=await sharp(record.master).removeAlpha().raw().toBuffer();
 const encoded=await sharp(path.join(root,'public/assets',record.slug+'.webp')).removeAlpha().raw().toBuffer();
 const pixelsIdentical=hash(original)===hash(encoded);
 if(!pixelsIdentical)throw new Error('Lossless verification failed: '+record.slug);
 results.push({asset:record.slug,width:record.width,height:record.height,pixelsIdentical,sourceBytes:(await fs.stat(record.master)).size,webpBytes:(await fs.stat(path.join(root,'public/assets',record.slug+'.webp'))).size});
}
const output=path.resolve(root,'../../output/akang-kasep-comparison-review-2026-11-21/image-verification.json');
await fs.writeFile(output,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results));
