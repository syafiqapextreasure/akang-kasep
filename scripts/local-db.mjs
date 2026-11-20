import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function createLocalDb(filename=':memory:'){
 const db=new DatabaseSync(filename);db.exec(fs.readFileSync(new URL('../migrations/0001-enquiries.sql',import.meta.url),'utf8'));
 const adapter={prepare(sql){let args=[];return{bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)||null;},async run(){const r=db.prepare(sql).run(...args);return{success:true,meta:r};},async all(){return{results:db.prepare(sql).all(...args)};}};},async batch(items){return Promise.all(items.map(i=>i.run()));},close(){db.close();}};return adapter;
}
