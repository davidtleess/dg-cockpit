import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
const P='/Users/davidleess/frontend-studio/proposals/009-who-holds-what/matrix-v2.html';
const A='/Users/davidleess/frontend-studio/proposals/assets/009-matrix-v2';
mkdirSync(A,{recursive:true});
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1400,height:1100}});
const errs=[]; p.on('pageerror',e=>errs.push('ERR: '+e.message.slice(0,200)));
p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text().slice(0,150));});
await p.goto('file://'+P,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
await p.screenshot({path:A+'/01-full.png',fullPage:true});
await p.screenshot({path:A+'/02-fold.png'});
const d=await p.evaluate(()=>{
  const out={sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,col:[],clip:[]};
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const els=[...document.querySelectorAll('.rowh .t,.rowh .m span,.cellfoot span,.cellnm,.colh .p,.colh .n,.ends span')].filter(vis);
  for(let i=0;i<els.length;i++){const a=els[i].getBoundingClientRect();
    for(let j=i+1;j<els.length;j++){const c=els[j].getBoundingClientRect();
      if(els[i].contains(els[j])||els[j].contains(els[i]))continue;
      if(a.left<c.right-1&&c.left<a.right-1&&a.top<c.bottom-1&&c.top<a.bottom-1)
        out.col.push([els[i].textContent.trim().slice(0,24),els[j].textContent.trim().slice(0,24)]);}}
  document.querySelectorAll('.cellfoot span,.rowh .t,.colh .p').forEach(e=>{
    if(e.scrollWidth>e.clientWidth+1)out.clip.push(e.className+': '+e.textContent.trim().slice(0,30));});
  return out;});
console.log('overflowX:',d.sw>d.cw,d.sw+'/'+d.cw);
console.log('collisions:',d.col.length,d.col.slice(0,6));
console.log('clipped:',d.clip.length,d.clip.slice(0,6));
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true});
await m.goto('file://'+P,{waitUntil:'networkidle'}); await m.waitForTimeout(400);
const mo=await m.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
console.log('mobile:',mo.sw+'/'+mo.cw, mo.sw>mo.cw?'OVERFLOW':'ok');
await m.screenshot({path:A+'/03-mobile.png',fullPage:true});
console.log('errors:',errs.length?errs:'none');
await b.close();
