import fs from 'node:fs/promises';
import path from 'node:path';
import {routes} from '../src/data.mjs';
import {shell} from '../src/components.mjs';
import {renderers} from '../src/pages.mjs';
const root=path.resolve(import.meta.dirname,'..');
await fs.mkdir(path.join(root,'dist'),{recursive:true});
// Remove the retired standalone progress document from an existing build.
await fs.rm(path.join(root,'dist','project-progress','index.html'),{force:true});
await fs.cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
for(const route of routes){const destination=route.path==='/'?'index.html':route.path==='/404'?'404.html':`${route.path.slice(1)}/index.html`;const full=path.join(root,'dist',destination);await fs.mkdir(path.dirname(full),{recursive:true});await fs.writeFile(full,shell(route,renderers[route.key]()),'utf8');}
await fs.writeFile(path.join(root,'dist','sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>!r.noindex).map(r=>`<url><loc>__ORIGIN__${r.path}</loc></url>`).join('')}</urlset>`);
await fs.writeFile(path.join(root,'dist','robots.txt'),'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: __ORIGIN__/sitemap.xml\n');
console.log(`Built ${routes.length} HTML routes with clean URLs and local assets.`);
