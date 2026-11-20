(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.menu-toggle');
  const closeMenu = () => {menu?.setAttribute('aria-expanded','false');};
  menu?.addEventListener('click', () => menu.setAttribute('aria-expanded',String(menu.getAttribute('aria-expanded')!=='true')));
  document.addEventListener('keydown', e => {if(e.key==='Escape'){closeMenu();}});
  $$('#site-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  matchMedia('(min-width:681px)').addEventListener('change',closeMenu);
  const topButton=$('.back-top');
  topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'}));
  let ticking=false;
  const parallax=$$('.hero-parallax');
  function scrollEffects(){ticking=false;topButton?.classList.toggle('visible',scrollY>600);if(topButton)topButton.tabIndex=scrollY>600?0:-1;if(!reduce.matches&&innerWidth>680)parallax.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.setProperty('--parallax',`${Math.max(-10,Math.min(10,(innerHeight/2-r.top-r.height/2)*.025))}px`);});}
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollEffects);ticking=true;}},{passive:true});scrollEffects();
  if(!reduce.matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.05});$$('.service-row,.history-item,.credential-card,.strength-grid article').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-ready');observer.observe(el);}});}
  $$('img').forEach(img=>img.addEventListener('error',()=>{img.classList.add('failed');}));
  const filters=$$('[data-filter]');
  filters.forEach(btn=>btn.addEventListener('click',()=>{const value=btn.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));let count=0;$$('[data-project-status]').forEach(item=>{item.hidden=value!=='all'&&item.dataset.projectStatus!==value;if(!item.hidden)count++;});const note=$('.history-note');if(note)note.hidden=value==='ongoing';$('[data-filter-status]').textContent=`${count} project${count===1?'':'s'} shown`;history.replaceState(null,'',value==='all'?'/projects':`/projects?filter=${value}`);}));
  const initialFilter=new URLSearchParams(location.search).get('filter');if(initialFilter)$(`[data-filter="${CSS.escape(initialFilter)}"]`)?.click();
  const dialog=$('.lightbox');let opener;
  $$('.gallery-open').forEach(btn=>btn.addEventListener('click',()=>{opener=btn;const img=$('img',dialog);img.src=btn.dataset.full;img.alt=btn.dataset.caption;$('p',dialog).textContent=btn.dataset.caption;dialog.showModal();}));
  $('.lightbox-close')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>opener?.focus());
  reduce.addEventListener('change',()=>{if(reduce.matches){$$('.reveal-ready').forEach(e=>e.classList.add('in-view'));parallax.forEach(e=>e.style.removeProperty('--parallax'));}});
  const form=$('#enquiry-form');
  if(form){const params=new URLSearchParams(location.search);const service=params.get('service');if(service&&$$('#service option').some(o=>o.value===service))$('#service').value=service;
    const errors=$('.form-errors',form);const status=$('.form-status',form);let busy=false;let requestKey=crypto.randomUUID();
    form.addEventListener('input',event=>{requestKey=crypto.randomUUID();event.target.removeAttribute('aria-invalid');});
    const showErrors=(message,fields={})=>{errors.replaceChildren();const heading=document.createElement('p');heading.textContent=message;errors.append(heading);const list=document.createElement('ul');Object.entries(fields).forEach(([name,text])=>{const field=form.elements.namedItem(name);if(!field||name==='website')return;field.setAttribute('aria-invalid','true');if(!field.id)field.id=name;const item=document.createElement('li');const link=document.createElement('a');link.href='#'+field.id;link.textContent=text;link.addEventListener('click',e=>{e.preventDefault();field.focus();});item.append(link);list.append(item);});if(list.children.length)errors.append(list);errors.hidden=false;errors.focus();};
    form.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;errors.hidden=true;const data=Object.fromEntries(new FormData(form));if(!data.email?.trim()&&!data.phone?.trim()){errors.textContent='Please provide an email address or phone number so we can respond.';errors.hidden=false;$('#email').focus();return;}if(!form.reportValidity())return;busy=true;const submit=$('[type=submit]',form);submit.disabled=true;submit.textContent='Sending…';status.textContent='Sending your enquiry securely…';
      try{const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestKey},body:JSON.stringify(data)});const result=await response.json();if(!response.ok){const error=new Error(result.message||'Your enquiry could not be accepted. Please try again.');error.fields=result.errors;throw error;}if(!result.accepted)throw new Error('Your enquiry was not accepted. Please contact us directly.');location.assign('/thank-you');}
      catch(error){showErrors(error.message+' You can also call 09-6227587 or email akangkasep.aksb@gmail.com.',error.fields);status.textContent='Your information remains in the form.';submit.disabled=false;submit.textContent='Send Enquiry';busy=false;}
    });
  }
  if(document.body.classList.contains('page-thanks'))fetch('/api/enquiry-status',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(result=>{if(result?.accepted){$('.confirmation-check').classList.add('accepted');$('[data-confirmation-title]').textContent='Thank you. Enquiry received.';$('[data-confirmation-text]').textContent='Your project enquiry has been recorded for our team to review. We look forward to discussing your requirements.';const ref=$('[data-reference]');ref.hidden=false;ref.textContent=`Reference: ${result.reference}`;}}).catch(()=>{});
})();
