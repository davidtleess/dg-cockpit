import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
const P='/Users/davidleess/frontend-studio/proposals/010-who-can-i-get/prototype.html';
const A='/Users/davidleess/frontend-studio/proposals/assets/010';
mkdirSync(A,{recursive:true});
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1360,height:1000}});
const errs=[];
p.on('pageerror',e=>errs.push('PAGE ERR: '+e.message.slice(0,200)));
p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text().slice(0,160));});
await p.goto('file://'+P,{waitUntil:'networkidle'});
await p.waitForTimeout(600);
await p.click('.vw[data-view="table"]'); await p.waitForTimeout(300);  // probe the table view
await p.screenshot({path:A+'/01-fold.png'});
await p.screenshot({path:A+'/02-full-qb.png',fullPage:true});
for(const pos of ['WR','RB','TE']){
  await p.click(`.chip[data-p="${pos}"]`); await p.waitForTimeout(400);
  await p.screenshot({path:`${A}/03-${pos}.png`,fullPage:true});
}
await p.click('.chip[data-p="RB"]'); await p.waitForTimeout(300);
// expand a bargain row (Skattebo) and a star row
const rows=p.locator('.trow');
console.log('RB rows:',await rows.count());
const n=await rows.count();
for(let i=0;i<n;i++){
  const t=await rows.nth(i).innerText();
  if(t.includes('Skattebo')){ await rows.nth(i).click(); break; }
}
await p.waitForTimeout(500);
await p.screenshot({path:A+'/04-rb-skattebo-open.png',fullPage:true});
await p.click('.chip[data-p="QB"]'); await p.waitForTimeout(300);
await rows.nth(0).click(); await p.waitForTimeout(500);
await p.screenshot({path:A+'/05-qb-allen-open.png',fullPage:true});

const diag=await p.evaluate(()=>{
  const out={scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth,
    collisions:[], clipped:[]};
  const visible = e => {
    const ex = e.closest('.exp');
    if (ex && !ex.classList.contains('open')) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const els=[...document.querySelectorAll('.who-nm,.who-sub,.read,.slot,.who,.room-row .nm,.room-row .val,.badge,.room-hd')].filter(visible);
  for(let i=0;i<els.length;i++){
    const a=els[i].getBoundingClientRect();
    for(let j=i+1;j<els.length;j++){
      const bb=els[j].getBoundingClientRect();
      if(els[i].contains(els[j])||els[j].contains(els[i])) continue;
      if(a.left<bb.right-1&&bb.left<a.right-1&&a.top<bb.bottom-1&&bb.top<a.bottom-1)
        out.collisions.push([els[i].textContent.trim().slice(0,28),els[j].textContent.trim().slice(0,28)]);
    }
  }
  document.querySelectorAll('*').forEach(e=>{
    if(e.children.length===0&&e.textContent.trim()&&(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1))
      out.clipped.push((e.className||e.tagName)+': '+e.textContent.trim().slice(0,34));
  });
  return out;
});
console.log('overflowX:',diag.scrollW>diag.clientW, diag.scrollW+'/'+diag.clientW);
console.log('text collisions:',diag.collisions.length, diag.collisions.slice(0,8));
console.log('clipped:',diag.clipped.length, diag.clipped.slice(0,8));

const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
await m.goto('file://'+P,{waitUntil:'networkidle'}); await m.waitForTimeout(500);
const mo=await m.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
console.log('mobile scrollWidth/clientWidth:',mo.sw+'/'+mo.cw, mo.sw>mo.cw?'OVERFLOW':'ok');
await m.screenshot({path:A+'/06-mobile.png',fullPage:true});
console.log('errors:',errs.length?errs:'none');
await b.close();
