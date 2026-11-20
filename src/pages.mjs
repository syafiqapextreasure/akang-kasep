import {readFileSync} from 'node:fs';
import {routes} from './data.mjs';
import {livingPanels} from './living-panels.mjs';
// Editable page bodies; shared navigation, metadata and footer are in components.mjs.
export const renderers=Object.fromEntries(routes.map(route=>[route.key,()=>readFileSync(new URL('./content/'+route.key+'.html',import.meta.url),'utf8').replace('<!-- LIVING_PANELS -->',livingPanels())]));
