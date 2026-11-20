import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const configUrl=new URL('../wrangler.jsonc',import.meta.url);const config=JSON.parse(await fs.readFile(configUrl,'utf8'));
const cli=new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url);
function run(args,capture=false){const r=spawnSync(process.execPath,[fileURLToPath(cli),...args],{encoding:'utf8',stdio:capture?'pipe':'inherit'});if(r.status!==0){if(capture)process.stderr.write(r.stderr||r.stdout);process.exit(r.status||1);}return r.stdout||'';}
const binding=config.d1_databases[0];
if(binding.database_id==='00000000-0000-0000-0000-000000000000'){
 const existing=JSON.parse(run(['d1','list','--json'],true));const match=existing.find(d=>d.name===binding.database_name);
 if(match)binding.database_id=match.uuid||match.id;
 else{const out=run(['d1','create',binding.database_name],true);const id=out.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i)?.[0];if(!id)throw new Error('Database created but ID could not be read. Set database_id in wrangler.jsonc from Cloudflare dashboard.');binding.database_id=id;}
 await fs.writeFile(configUrl,JSON.stringify(config,null,2)+'\n');
}
run(['d1','migrations','apply',binding.database_name,'--remote']);
console.log('Cloudflare enquiry database configured. Run npm run deploy to publish.');
