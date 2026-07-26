import { chromium } from '/Users/davidleess/dynasty-genius-product/frontend/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
const P='/Users/davidleess/frontend-studio/proposals/009-who-holds-what/prototype.html';
const A='/Users/davidleess/frontend-studio/proposals/assets/009-board';
mkdirSync(A,{recursive:true});
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1360,height:1000}});
const errs=[];
p.on('pageerror',e=>errs.push('PAGE ERR: '+e.message.slice(0,200)));
p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text().slice(0,160));});
await p.goto('file://'+P,{waitUntil:'networkidle'});
await p.waitForTimeout(600);
await p.screenshot({path:A+'/01-wr-full.png',fullPage:true});
await p.screenshot({path:A+'/02-wr-fold.png'});
for(const pos of ['QB','TE','RB']){
  await p.click(`.chip[data-pos="${pos}"]`); await p.waitForTimeout(400);
  await p.screenshot({path:`${A}/03-${pos}.png`,fullPage:true});
}
// expand a couple of rows on TE
await p.click('.chip[data-pos="TE"]'); await p.waitForTimeout(300);
const rows=p.locator('.trow');
console.log('rows:',await rows.count());
await rows.nth(0).locator('.thead').click(); await p.waitForTimeout(450);
await p.screenshot({path:A+'/04-te-expanded.png',fullPage:true});
// expand David's row on WR
await p.click('.chip[data-pos="WR"]'); await p.waitForTimeout(300);
const me=p.locator('.trow.me');
await me.locator('.thead').click(); await p.waitForTimeout(450);
await me.scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
await p.screenshot({path:A+'/05-wr-me-expanded.png'});
await p.screenshot({path:A+'/05b-wr-me-full.png',fullPage:true});

// ---- automated defect probes ----
const diag=await p.evaluate(()=>{
  const out={overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth, collisions:[], clipped:[]};
  // only elements that are actually visible: skip anything inside a collapsed panel
  const visible = e => {
    const pan = e.closest('.panel');
    if (pan && !pan.closest('.trow').classList.contains('open')) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const els=[...document.querySelectorAll('.tname,.tmeta span,.plist .nm,.plist .rk,.plist .ag,.state .v,.state .n,.axends span,.wk')].filter(visible);
  for(let i=0;i<els.length;i++){
    const a=els[i].getBoundingClientRect();
    for(let j=i+1;j<els.length;j++){
      const b=els[j].getBoundingClientRect();
      if(els[i].contains(els[j])||els[j].contains(els[i])) continue;
      if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1)
        out.collisions.push([els[i].textContent.trim().slice(0,28),els[j].textContent.trim().slice(0,28)]);
    }
  }
  document.querySelectorAll('*').forEach(e=>{
    if(e.children.length===0&&e.textContent.trim()&&(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1))
      out.clipped.push(e.className+': '+e.textContent.trim().slice(0,34));
  });
  return out;
});
console.log('overflowX:',diag.overflowX, diag.scrollW+'/'+diag.clientW);
console.log('text collisions:',diag.collisions.length, diag.collisions.slice(0,8));
console.log('clipped:',diag.clipped.length, diag.clipped.slice(0,8));

// mobile — measure DOM, do not trust the screenshot (2026-07-24 lesson)
const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
await m.goto('file://'+P,{waitUntil:'networkidle'}); await m.waitForTimeout(500);
const mo=await m.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
console.log('mobile scrollWidth/clientWidth:',mo.sw+'/'+mo.cw, mo.sw>mo.cw?'OVERFLOW':'ok');
await m.screenshot({path:A+'/06-mobile.png',fullPage:true});
console.log('errors:',errs.length?errs:'none');
await b.close();
