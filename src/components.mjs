import {company,photos,navigation} from './data.mjs';
export const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icons = {
 phone:'<path d="M7 3 4 4c-3 3 1 10 5 14s9 5 11 2l1-3-5-3-2 2c-2-1-5-4-6-6l2-2Z"/>',
 envelope:'<rect x="2" y="4" width="20" height="16" rx="1"/><path d="m3 5 9 8 9-8"/>',
 chat:'<path d="M21 3H3v15h5l4 4v-4h9Z"/><path d="M7 8h10M7 12h7"/>',
 arrow:'<path d="M3 12h17M14 6l6 6-6 6"/>',
 chevron:'<path d="m6 9 6 6 6-6"/>',
 document:'<path d="M6 2h9l5 5v15H4V4a2 2 0 0 1 2-2Z"/><path d="M15 2v6h5M8 12h8M8 16h8M8 20h6"/>',
 play:'<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
 pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
};
export const icon = (name,cls='')=>`<svg class="icon ${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.arrow}</svg>`;
export function photo(id,{className='',sizes='(max-width: 680px) 90vw, 45vw',eager=false,alt,position,contain=false}={}) {
 const [w,h,text]=photos[id];const name=`image-${String(id).padStart(2,'0')}`;
 return `<div class="photo ${className}${contain?' contain':''}" ${position?`style="--focal:${position}"`:''}><img src="/assets/${name}.webp" srcset="/assets/${name}-480.webp 480w, /assets/${name}-768.webp 768w, /assets/${name}.webp ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt||text)}" loading="${eager?'eager':'lazy'}" decoding="async" ${eager?'fetchpriority="high"':''} data-photo-id="${id}"></div>`;
}
export const button=(text,url='/contact',outline=false,extra='')=>`<a class="button${outline?' outline':''}" href="${url}" ${extra}>${text}${icon('arrow')}</a>`;
export const textLink=(text,url,extra='')=>`<a class="text-link" href="${url}" ${extra}>${text}${icon('arrow')}</a>`;
export const eyebrow=text=>`<div class="eyebrow"><span>${text}</span><i></i></div>`;
export const breadcrumb=(items)=>`<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a>${items.map(([t,u])=>`<span aria-hidden="true">/</span>${u?`<a href="${u}">${t}</a>`:`<span aria-current="page">${t}</span>`}`).join('')}</nav>`;
export const cta=()=>`<section class="closing-cta"><div class="wrap"><h2>Let’s discuss your next project.</h2><span class="accent-rule" aria-hidden="true"></span>${button('Discuss Your Project')}</div></section>`;
export function header(active){return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap"><a class="brand" href="/" aria-label="Akang Kasep home"><img src="/assets/logo-256.webp" srcset="/assets/logo-256.webp 256w, /assets/logo-320.webp 320w, /assets/logo-512.webp 512w" sizes="(max-width:680px) 35vw, 14vw" width="210" height="132" alt="Akang Kasep Sdn Bhd"></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav"><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button><nav id="site-nav" class="site-nav" aria-label="Main navigation">${navigation.map(([n,u])=>`<a href="${u}"${active===n.toLowerCase()?' aria-current="page"':''}>${n}</a>`).join('')}</nav></header>`;}
export const footer=()=>`<footer class="site-footer wrap"><a class="footer-name" href="/">AKANG KASEP SDN BHD</a><nav aria-label="Footer navigation">${navigation.map(([n,u])=>`<a href="${u}">${n}</a>`).join('')}</nav><a href="/privacy">Privacy</a></footer><button class="back-top" aria-label="Back to top" title="Back to top">${icon('arrow')}</button>`;
export function process(title='HOW WE WORK'){return `<section class="process wrap"><h2 class="${title==='HOW WE WORK'?'small-label':''}">${title}</h2><ol>${['Brief','Scope','Coordinate','Review'].map((s,i)=>`<li><span>${i+1}</span>${s}</li>`).join('')}</ol></section>`;}
export function schema(route){
 const org={'@type':'GeneralContractor','@id':'__ORIGIN__/#company',name:company.name,url:'__ORIGIN__',logo:'__ORIGIN__/assets/logo.webp',telephone:company.phoneHref,email:company.email,foundingDate:company.founded,identifier:company.registration,address:{'@type':'PostalAddress',streetAddress:'No. 3A, Tingkat 1, Bangunan Residensi Kodika, Lot 1298, Kampung Pulau Rusa',addressLocality:'Kuala Terengganu',addressRegion:'Terengganu',postalCode:'20050',addressCountry:'MY'}};
 const crumbs={'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:'__ORIGIN__/'},...(route.path==='/'?[]:[{'@type':'ListItem',position:2,name:route.title.split('|')[0].trim(),item:'__ORIGIN__'+route.path}])]};
 return JSON.stringify({'@context':'https://schema.org','@graph':[org,crumbs,{'@type':'WebPage','@id':'__ORIGIN__'+route.path,url:'__ORIGIN__'+route.path,name:route.title,description:route.description,about:{'@id':'__ORIGIN__/#company'}}]}).replace(/</g,'\\u003c');
}
export function shell(route,body){const active=['project','progress'].includes(route.key)?'projects':route.key;return `<!doctype html><html lang="en-MY"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(route.title)}</title><meta name="description" content="${esc(route.description)}"><meta name="theme-color" content="#173e36"><meta name="robots" content="${route.noindex?'noindex,follow':'index,follow,max-image-preview:large'}"><link rel="canonical" href="__ORIGIN__${route.path}"><meta property="og:type" content="website"><meta property="og:site_name" content="Akang Kasep Sdn. Bhd."><meta property="og:title" content="${esc(route.title)}"><meta property="og:description" content="${esc(route.description)}"><meta property="og:url" content="__ORIGIN__${route.path}"><meta property="og:image" content="__ORIGIN__/assets/image-09.webp"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.png"><link rel="preload" as="font" href="/assets/heading.woff2" type="font/woff2" crossorigin><link rel="preload" as="font" href="/assets/body.woff2" type="font/woff2" crossorigin><link rel="stylesheet" href="/styles.css">${route.key==='home'?'<link rel="stylesheet" href="/living-panels.css"><script src="/living-panels.js" defer></script>':''}<script type="application/ld+json">${schema(route)}</script>${route.key==='project'?'<link rel="stylesheet" href="/comparison.css"><script src="/comparison.js" defer></script>':''}<script src="/site.js" defer></script></head><body class="page-${route.key}">${header(active)}<main id="main" tabindex="-1">${body}</main>${footer()}<dialog class="lightbox" aria-label="Project photograph"><button class="lightbox-close" aria-label="Close photograph">${icon('close')}</button><img alt=""><p></p></dialog></body></html>`;}

