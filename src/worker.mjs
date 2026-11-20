import {routes,services} from './data.mjs';
const encoder=new TextEncoder();
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
export function validateEnquiry(input){const data={};const errors={};for(const [key,max] of [['name',120],['company',180],['email',254],['phone',40],['service',80],['location',200],['brief',5000]]){data[key]=String(input[key]??'').trim();if(data[key].length>max)errors[key]=`${key} is too long.`;}if(!data.name)errors.name='Please enter your name.';if(!data.email&&!data.phone)errors.email='Please provide an email address or phone number.';if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))errors.email='Please enter a valid email address.';if(data.phone&&!/^[+()\d\s.\-]{6,40}$/.test(data.phone))errors.phone='Please enter a valid phone number.';if(![...services.map(s=>s.id),'company-profile','general'].includes(data.service))errors.service='Please select a service.';if(!data.location)errors.location='Please enter the project location.';if(data.brief.length<10)errors.brief='Please add a project brief of at least 10 characters.';if(input.privacy!=='accepted')errors.privacy='Please acknowledge the Privacy Notice.';if(input.website)errors.website='This enquiry could not be accepted.';return{data,errors};}

async function submit(request,env){
 const url=new URL(request.url);const origin=request.headers.get('Origin');
 if(origin&&origin!==url.origin)return json({message:'The request origin is not allowed.'},403);
 if(request.headers.get('Sec-Fetch-Site')==='cross-site')return json({message:'Cross-site submissions are not allowed.'},403);
 if(!env.ENQUIRIES)return json({message:'The enquiry form is temporarily unavailable. Please call or email our team.'},503);
 if(Number(request.headers.get('Content-Length'))>32768)return json({message:'This enquiry is too large.'},413);
 const type=request.headers.get('Content-Type')||'';let input;
 try{const body=await request.text();if(encoder.encode(body).byteLength>32768)return json({message:'This enquiry is too large.'},413);if(type.includes('application/json'))input=JSON.parse(body);else if(type.includes('application/x-www-form-urlencoded'))input=Object.fromEntries(new URLSearchParams(body));else return json({message:'Unsupported submission format.'},415);}catch{return json({message:'The enquiry could not be read. Please try again.'},400);}
 if(!input||typeof input!=='object'||Array.isArray(input))return json({message:'Invalid enquiry.'},400);
 const {data,errors}=validateEnquiry(input);if(Object.keys(errors).length)return json({message:Object.values(errors)[0],errors},422);
 const now=Date.now();const day=new Date(now).toISOString().slice(0,10);const ip=request.headers.get('CF-Connecting-IP')||'local-preview';
 const identifier=await hash(`${day}:${ip}:${env.RATE_LIMIT_SALT||'akang-kasep-rate-limit'}`);
 const rate=await env.ENQUIRIES.prepare('INSERT INTO rate_limits (identifier,window_start,attempts) VALUES (?,?,1) ON CONFLICT(identifier) DO UPDATE SET attempts=CASE WHEN window_start<? THEN 1 ELSE attempts+1 END,window_start=CASE WHEN window_start<? THEN excluded.window_start ELSE window_start END RETURNING attempts').bind(identifier,now,now-3600000,now-3600000).first();
 if(rate.attempts>5)return json({message:'Too many enquiries in a short time. Please try later or contact us directly.'},429,{'Retry-After':'3600'});
 let key=request.headers.get('Idempotency-Key')||crypto.randomUUID();if(!/^[a-zA-Z0-9_-]{16,80}$/.test(key.replaceAll('-','')))return json({message:'Invalid request identifier.'},400);
 const requestHash=await hash(JSON.stringify(data));const token=await hash(`${key}:${env.RECEIPT_SECRET||'receipt'}`);const receiptHash=await hash(token);const id=`AK-${day.replaceAll('-','')}-${(await hash(key)).slice(0,10).toUpperCase()}`;
 await env.ENQUIRIES.prepare('INSERT OR IGNORE INTO enquiries (id,created_at,name,company,email,phone,service,location,brief,request_key,request_hash,receipt_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,new Date(now).toISOString(),data.name,data.company,data.email,data.phone,data.service,data.location,data.brief,key,requestHash,receiptHash).run();
 const stored=await env.ENQUIRIES.prepare('SELECT id,request_hash FROM enquiries WHERE request_key=?').bind(key).first();
 if(!stored)return json({message:'The enquiry could not be recorded. Please try again.'},503);
 if(stored.request_hash!==requestHash)return json({message:'This request identifier was already used. Please reload the form before sending a different enquiry.'},409);
 const cookie=`ak_receipt=${stored.id}.${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${url.protocol==='https:'?'; Secure':''}`;
 if(!type.includes('application/json'))return new Response(null,{status:303,headers:{Location:'/thank-you','Set-Cookie':cookie,'Cache-Control':'no-store'}});
 return json({accepted:true,reference:stored.id},201,{'Set-Cookie':cookie});
}
async function receipt(request,env){if(!env.ENQUIRIES)return null;const cookie=request.headers.get('Cookie')?.match(/(?:^|;\s*)ak_receipt=([^;]+)/)?.[1];if(!cookie)return null;const [id,token]=cookie.split('.');if(!/^AK-\d{8}-[A-F0-9]{10}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(token||''))return null;const row=await env.ENQUIRIES.prepare('SELECT id FROM enquiries WHERE id=? AND receipt_hash=?').bind(id,await hash(token)).first();return row?{accepted:true,reference:row.id}:null;}
const security={
 'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};
function withSecurity(response){const result=new Response(response.body,response);for(const [k,v] of Object.entries(security))result.headers.set(k,v);return result;}
export default {
 async fetch(request,env){try{
  const url=new URL(request.url);let pathname=url.pathname;
  if(request.method==='POST'&&pathname==='/api/enquiries')return withSecurity(await submit(request,env));
  if(pathname==='/api/enquiry-status'&&request.method==='GET')return withSecurity(json(await receipt(request,env)||{accepted:false}));
  if(pathname.startsWith('/api/'))return withSecurity(json({message:'Not found.'},404));
  if(!['GET','HEAD'].includes(request.method))return withSecurity(new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}}));
  if(/^\/project-progress(?:\/index\.html|\.html|\/)?$/.test(pathname)){const destination=new URL('/projects/education-facility',url);destination.search=url.search;destination.hash='before-after';return withSecurity(Response.redirect(destination,308));}
  if(pathname.endsWith('/index.html')||pathname.endsWith('.html')){pathname=pathname==='/index.html'?'/':pathname.replace(/\/index\.html$|\.html$/,'');return withSecurity(Response.redirect(new URL(pathname||'/',url),308));}
  if(pathname.length>1&&pathname.endsWith('/'))return withSecurity(Response.redirect(new URL(pathname.replace(/\/+$/,''),url),308));
  let origin=url.origin;if(env.SITE_URL){const configured=new URL(env.SITE_URL);if(configured.protocol!=='https:')throw new Error('SITE_URL must use HTTPS');origin=configured.origin;}
  let response=await env.ASSETS.fetch(request);
  if(response.status>=300&&response.status<400)return withSecurity(response);
  const contentType=response.headers.get('Content-Type')||'';
  if(contentType.includes('text/html')||pathname==='/robots.txt'||pathname==='/sitemap.xml'){
    let text=(await response.text()).replaceAll('__ORIGIN__',origin);
    if(pathname==='/thank-you'){const result=await receipt(request,env);if(result){text=text.replace('class="confirmation-check"','class="confirmation-check accepted"').replace('data-confirmation-title>Your enquiry status.','data-confirmation-title>Thank you. Enquiry received.').replace('Submit your project brief through our contact page. A confirmation appears here only after your enquiry has been accepted.','Your project enquiry has been recorded for our team to review. We look forward to discussing your requirements.').replace(/data-reference hidden>\s*<\/p>/,`data-reference>Reference: ${result.reference}</p>`);}}
    const headers=new Headers(response.headers);headers.set('Cache-Control',pathname==='/thank-you'?'private, no-store':'public, max-age=0, must-revalidate');headers.delete('Content-Length');
    const route=routes.find(r=>r.path===pathname);if(route?.noindex||response.status===404)headers.set('X-Robots-Tag','noindex, follow');
    response=new Response(request.method==='HEAD'?null:text,{status:pathname==='/404'?404:response.status,headers});
  }
  return withSecurity(response);
 }catch{return withSecurity(json({message:'This service is temporarily unavailable. Please call 09-6227587 or email akangkasep.aksb@gmail.com.'},503));}},
 async scheduled(controller,env){if(!env.ENQUIRIES)return;const days=Math.max(1,Math.min(365,Number(env.RETENTION_DAYS)||90));const cutoff=new Date(Date.now()-days*86400000).toISOString();await env.ENQUIRIES.batch([env.ENQUIRIES.prepare('DELETE FROM enquiries WHERE created_at<?').bind(cutoff),env.ENQUIRIES.prepare('DELETE FROM rate_limits WHERE window_start<?').bind(Date.now()-86400000)]);}
};
