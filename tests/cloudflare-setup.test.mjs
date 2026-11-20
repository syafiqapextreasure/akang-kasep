import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {prepareDatabase} from '../scripts/setup-cloudflare.mjs';

const id = '12345678-1234-1234-1234-123456789abc';
const name = 'akang-kasep-enquiries';
const fixture = database_id => ({d1_databases: [{binding: 'ENQUIRIES', database_name: name, ...(database_id ? {database_id} : {})}]});

test('first deploy creates the database, saves its real ID, then migrates', async () => {
  const events = [];
  let created = false;
  const config = fixture();
  const result = await prepareDatabase({config, run(args) {
    events.push(args[1]);
    if (args[1] === 'list') return JSON.stringify(created ? [{name, uuid: id}] : []);
    if (args[1] === 'create') {assert.deepEqual(args, ['d1', 'create', name, '--update-config=false']); created = true;}
    if (args[1] === 'migrations') assert.equal(config.d1_databases[0].database_id, id);
  }, save: async value => {assert.equal(value.d1_databases[0].database_id, id); events.push('save');}});
  assert.equal(result, id);
  assert.deepEqual(events, ['list', 'create', 'list', 'save', 'migrations']);
});

test('fresh Git builds and legacy placeholders reuse the existing database', async () => {
  for (const previous of [undefined, '00000000-0000-0000-0000-000000000000']) {
    const calls = [];
    await prepareDatabase({config: fixture(previous), run(args) {
      calls.push(args);
      if (args[1] === 'list') return JSON.stringify([{name: 'unrelated', uuid: 'other'}, {name, uuid: id}]);
    }, save: async () => {}});
    assert.deepEqual(calls, [['d1', 'list', '--json'], ['d1', 'migrations', 'apply', name, '--remote']]);
  }
});

test('configured IDs are retained; migration failures prevent deployment', async () => {
  const calls = [];
  await assert.rejects(prepareDatabase({config: fixture(id), run(args) {
    calls.push(args); throw new Error('Migration denied');
  }, save: async () => assert.fail('Existing ID must not be rewritten')}), /Migration denied/);
  assert.deepEqual(calls, [['d1', 'migrations', 'apply', name, '--remote']]);
  const pkg = JSON.parse(await fs.readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.deploy, /npm run cf:setup && wrangler deploy$/);
});

test('failed lookups and invalid IDs stop without creating or migrating', async () => {
  let calls = 0;
  await assert.rejects(prepareDatabase({config: fixture(), run() {calls++; throw new Error('D1 permission denied');}, save: async () => assert.fail()}), /permission denied/);
  assert.equal(calls, 1);
  await assert.rejects(prepareDatabase({config: fixture('bad-id'), run: () => assert.fail(), save: async () => assert.fail()}), /Invalid enquiry database ID/);
  await assert.rejects(prepareDatabase({config: fixture(), run: () => JSON.stringify([{name, uuid: '00000000-0000-0000-0000-000000000000'}]), save: async () => assert.fail()}), /Could not resolve/);
});
