import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const configUrl = new URL('../wrangler.jsonc', import.meta.url);
const cli = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
const placeholder = '00000000-0000-0000-0000-000000000000';
const validId = value => typeof value === 'string' && value !== placeholder && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value);

function runWrangler(args, capture = false) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    env: {...process.env, WRANGLER_SEND_METRICS: 'false'}
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) process.stderr.write(result.stderr || result.stdout || '');
    throw new Error('Cloudflare database setup failed (' + args.slice(0, 2).join(' ') + '). Deployment stopped; check the preceding Cloudflare error and D1 permissions.');
  }
  return result.stdout || '';
}

// Fresh Git builds resolve the same named database. Never replace or delete
// an existing database. Saving the ID before migration makes retries safe.
export async function prepareDatabase({config, run = runWrangler, save}) {
  const binding = config.d1_databases?.find(item => item.binding === 'ENQUIRIES');
  if (!binding?.database_name) throw new Error('Missing ENQUIRIES database configuration.');
  if (!binding.database_id || binding.database_id === placeholder) {
    const lookup = () => {
      const databases = JSON.parse(run(['d1', 'list', '--json'], true));
      if (!Array.isArray(databases)) throw new Error('Cloudflare returned an unexpected database list.');
      return databases.find(database => database.name === binding.database_name);
    };
    let database = lookup();
    if (!database) {
      run(['d1', 'create', binding.database_name, '--update-config=false']);
      database = lookup();
    }
    const id = database?.uuid || database?.id;
    if (!validId(id)) throw new Error('Could not resolve the enquiry database ID. Deployment stopped; retry after checking D1 in Cloudflare.');
    binding.database_id = id;
    await save(config);
  }
  if (!validId(binding.database_id)) throw new Error('Invalid enquiry database ID. Deployment stopped.');
  run(['d1', 'migrations', 'apply', binding.database_name, '--remote']);
  return binding.database_id;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await prepareDatabase({
      config: JSON.parse(await fs.readFile(configUrl, 'utf8')),
      save: config => fs.writeFile(configUrl, JSON.stringify(config, null, 2) + '\n')
    });
    console.log('Cloudflare enquiry database and tables are ready.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
