/* Artan extension: teen games (10+ / 14+) for the "Школа захисника" section.
   Games: azimuth (orienteering), fake (media literacy), firstaid (sequence), cipher (training cipher).
   ES5, no dependencies. Registers via window.ArtanExt.game. */
(function(){
if(!window.ArtanExt)return;

/* ---------- shared helpers ---------- */
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function hyp(x,y){return Math.sqrt(x*x+y*y);}
function norm(a){a=a%360;return a<0?a+360:a;}
function angDiff(a,b){var d=Math.abs(norm(a)-norm(b));return d>180?360-d:d;}
/* pointer angle relative to element centre, 0 = up, clockwise */
function ptrAngle(el,e){var r=el.getBoundingClientRect();return norm(Math.atan2(e.clientX-(r.left+r.width/2),-(e.clientY-(r.top+r.height/2)))*180/Math.PI);}
/* drag-to-rotate: get() returns current value in degrees, set(v,final) applies it */
function rotor(el,get,set){var on=false,a0=0,v0=0;
  el.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;on=true;a0=ptrAngle(el,e);v0=get();el.classList.add('x-gt-grab');try{el.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
  el.addEventListener('pointermove',function(e){if(!on)return;var d=ptrAngle(el,e)-a0;if(d>180)d-=360;if(d<-180)d+=360;v0+=d;a0+=d;set(v0,false);});
  function up(){if(!on)return;on=false;el.classList.remove('x-gt-grab');set(v0,true);}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
/* FLIP animate siblings around a DOM mutation */
function flip(list,fn){var kids=Array.prototype.slice.call(list.children),tops=kids.map(function(k){return k.getBoundingClientRect().top;});fn();
  kids.forEach(function(k,i){var d=tops[i]-k.getBoundingClientRect().top;if(!d||k.classList.contains('x-gt-drag'))return;k.style.transition='none';k.style.transform='translateY('+d+'px)';void k.offsetWidth;k.style.transition='transform .28s cubic-bezier(.16,1,.3,1)';k.style.transform='';});}

var CSS=[
/* common */
'.x-gt-task{border-color:rgba(242,194,48,.45);background:linear-gradient(135deg,#262B1D,#12140E)}',
'.x-gt-task b.x-gt-big{font-family:Oswald,sans-serif;font-size:26px;color:var(--ye);letter-spacing:.5px}',
'.x-gt-pts{display:inline-block}.x-gt-pts.b{animation:bump .35s}',
'.x-gt-next{animation:up .4s var(--ease) backwards}',
/* azimuth */
'.x-gt-map{position:relative;border-radius:18px;border:1px solid var(--ln);overflow:hidden;background:#141810;touch-action:manipulation}',
'.x-gt-map svg{display:block;width:100%;height:auto}',
'.x-gt-ray{transition:opacity .3s}.x-gt-ray line.m{stroke:var(--ye);stroke-width:2;stroke-dasharray:6 5;animation:x-gt-dash 1.2s linear infinite}',
'@keyframes x-gt-dash{to{stroke-dashoffset:-22}}',
'.x-gt-lm{position:absolute;width:44px;height:44px;min-height:0;padding:0;border-radius:50%;transform:translate(-50%,-50%);background:rgba(21,23,18,.92);border:2px solid #6E7463;font-size:22px;line-height:1;animation:x-gt-drop .5s cubic-bezier(.16,1,.3,1) backwards;z-index:2}',
'.x-gt-lm:active{transform:translate(-50%,-50%) scale(.92)}',
'.x-gt-lm span{position:absolute;top:44px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10.5px;font-weight:600;color:var(--tx);text-shadow:0 1px 3px #000,0 0 4px #000;pointer-events:none}',
'.x-gt-lm.good{border-color:var(--ok);background:#1B2A1C;box-shadow:0 0 0 6px rgba(123,196,127,.25)}',
'.x-gt-lm.wrong{border-color:var(--bad);background:#2C1B18;animation:shake .35s}',
'.x-gt-lm[disabled]{opacity:1}',
'@keyframes x-gt-drop{from{opacity:0;transform:translate(-50%,-90%) scale(.6)}to{opacity:1;transform:translate(-50%,-50%)}}',
'.x-gt-crow{display:grid;grid-template-columns:172px 1fr;gap:12px;align-items:center}',
'.x-gt-comp{position:relative;width:172px;height:172px;border-radius:50%;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 12px 18px rgba(0,0,0,.55))}',
'.x-gt-comp.x-gt-grab{cursor:grabbing}.x-gt-comp svg{width:100%;height:100%;display:block}',
'.x-gt-comp:focus-visible{outline:2px solid var(--ye);outline-offset:4px}',
'.x-gt-needle{transform-origin:100px 100px;animation:x-gt-sway 1.6s cubic-bezier(.16,1,.3,1)}',
'.x-gt-needle.s{animation:x-gt-sway2 1.6s cubic-bezier(.16,1,.3,1)}',
'@keyframes x-gt-sway{0%{transform:rotate(14deg)}25%{transform:rotate(-9deg)}50%{transform:rotate(5deg)}75%{transform:rotate(-2deg)}100%{transform:none}}',
'@keyframes x-gt-sway2{0%{transform:rotate(-14deg)}25%{transform:rotate(9deg)}50%{transform:rotate(-5deg)}75%{transform:rotate(2deg)}100%{transform:none}}',
'.x-gt-deg{font-family:Oswald,sans-serif;font-size:40px;line-height:1;color:var(--ye)}',
'.x-gt-deg.hit{color:var(--ok)}',
'.x-gt-step{display:grid;grid-template-columns:1fr 1fr;gap:8px}.x-gt-step button{padding:0 6px}',
/* fake */
'.x-gt-deck{height:360px}',
'.x-gt-fc{align-items:stretch;justify-content:flex-start;text-align:left;gap:10px;padding:52px 16px 16px}',
'.x-gt-src{display:flex;align-items:center;gap:10px}',
'.x-gt-av{width:40px;height:40px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:20px;background:var(--sf2);border:1px solid var(--ln)}',
'.x-gt-src b{display:block;font-size:14px;line-height:1.2}.x-gt-src .sm{display:block}',
'.x-gt-bub{background:#262B1F;border:1px solid #3A4031;border-radius:4px 16px 16px 16px;padding:12px 14px;font-size:14.5px;line-height:1.45;flex:1;overflow:auto}',
'.x-gt-bub.sys{border-radius:14px;background:#2A2516;border-color:rgba(242,194,48,.45)}',
'.x-gt-fc .x-gt-hint{text-align:center;margin:0}',
'.x-gt-flags{display:flex;flex-wrap:wrap;gap:6px}.x-gt-flags span{font-size:12px;font-weight:600;padding:4px 9px;border-radius:999px;border:1px solid currentColor;animation:pop .35s var(--ease) backwards}',
'.msg.no .x-gt-flags span{color:#F6B9AD}.msg.ok .x-gt-flags span{color:#B9E6BB}',
/* first aid */
'.x-gt-ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}',
'.x-gt-li{display:grid;grid-template-columns:40px 1fr 44px;align-items:center;gap:8px;padding:8px 6px 8px 8px;border-radius:14px;border:1px solid var(--ln);background:linear-gradient(180deg,#1E2218,#161912);user-select:none;-webkit-user-select:none;cursor:grab;position:relative;animation:up .45s var(--ease) backwards}',
'.x-gt-li p{margin:0;font-size:14px;line-height:1.35}',
'.x-gt-li.x-gt-drag{z-index:5;cursor:grabbing;border-color:var(--ye);box-shadow:0 18px 30px -12px #000,0 0 0 3px rgba(242,194,48,.18);background:#252A1C;transition:none}',
'.x-gt-grip{width:40px;height:48px;display:flex;align-items:center;justify-content:center;touch-action:none;color:var(--mu);font-size:18px;letter-spacing:-2px;border-radius:10px;flex-direction:column;gap:0}',
'.x-gt-grip .num{width:30px;height:30px;font-size:15px}',
'.x-gt-mv{display:flex;flex-direction:column;gap:4px}.x-gt-mv button{min-height:22px;height:24px;width:44px;padding:0;border-radius:8px;font-size:12px}',
'.x-gt-li.good{border-color:var(--ok);background:#1B2A1C}.x-gt-li.wrong{border-color:var(--bad);background:#2C1B18;animation:shake .35s}',
'.x-gt-li .x-gt-ok{position:absolute;right:8px;top:-9px;font-size:11px;font-weight:700;padding:1px 8px;border-radius:999px;background:var(--ok);color:#10200F}',
'.x-gt-li.wrong .x-gt-ok{background:var(--bad);color:#2A0F0A}',
'.x-gt-ex ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:14px}',
'.x-gt-sos{display:flex;gap:8px;flex-wrap:wrap}.x-gt-sos span{font-family:Oswald,sans-serif;font-size:13px;padding:3px 10px;border-radius:999px;border:1px solid var(--bad);color:#F6B9AD}',
/* cipher */
'.x-gt-code{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}',
'.x-gt-code i{font-style:normal;min-width:36px;height:46px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#0F110C;border:1px solid #3A4031;font-family:"Courier New",monospace;font-weight:700;font-size:24px;color:#9FE3A2;text-shadow:0 0 8px rgba(123,196,127,.6);animation:x-gt-type .3s steps(2) backwards}',
'.x-gt-code i.w{font-family:Inter,sans-serif;font-size:13.5px;padding:0 10px;color:#CFE9C9}',
'.x-gt-code i.gap{background:transparent;border-color:transparent;min-width:14px}',
'@keyframes x-gt-type{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}',
'.x-gt-wheel{position:relative;width:260px;height:260px;margin:0 auto;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}',
'.x-gt-wheel.x-gt-grab{cursor:grabbing}.x-gt-wheel svg{width:100%;height:100%;display:block}',
'.x-gt-wheel:focus-visible{outline:2px solid var(--ye);outline-offset:4px;border-radius:50%}',
'.x-gt-disk{transform-origin:130px 130px}.x-gt-disk.snap{transition:transform .35s cubic-bezier(.16,1,.3,1)}',
'.x-gt-wheel text{font:600 12px Inter,sans-serif;text-anchor:middle;dominant-baseline:middle}',
'.x-gt-tab{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 10px;font-size:12.5px;margin-top:10px}',
'.x-gt-tab b{color:var(--ye);font-family:Oswald,sans-serif;display:inline-block;width:16px}',
'.x-gt-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px}.x-gt-opts button{font-family:Oswald,sans-serif;letter-spacing:1px;font-size:16px}',
'.x-gt-time{height:8px}.x-gt-time i{transition:width .25s linear}',
'.x-gt-time.low i{background:var(--bad)}',
'details.x-gt-det summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600;color:var(--ac)}',
'@media (min-width:600px){.x-gt-crow{grid-template-columns:200px 1fr}.x-gt-comp{width:200px;height:200px}}'
].join('\n');
function css(){if(document.getElementById('ext-games-teen'))return;var st=document.createElement('style');st.id='ext-games-teen';st.textContent=CSS;document.head.appendChild(st);}

/* =====================================================================
   1. АЗИМУТ — orienteering with compass and 1:10 000 map
   ===================================================================== */
var K=0.4; /* px per metre: 100 m = 40 px = one grid cell = 1 cm at 1:10 000 */
var LMK=[['🌳','Старий дуб'],['🌉','Місток'],['⛪','Каплиця'],['🏠','Хата лісника'],['🪨','Валун'],['🐝','Пасіка'],['🌾','Стіг сіна'],['💧','Джерело'],['🌲','Самотня сосна'],['🗼','Водонапірна вежа'],['⛺','Туристична стоянка'],['🌻','Соняшникове поле']];
var DIRN=[[0,'північ'],[45,'північний схід'],[90,'схід'],[135,'південний схід'],[180,'південь'],[225,'південний захід'],[270,'захід'],[315,'північний захід']];
function azPt(az,d){var r=az*Math.PI/180;return {x:160+Math.sin(r)*d*K,y:160-Math.cos(r)*d*K};}
function azGen(r){var lv=r<2?0:r<4?1:2;
  for(var t=0;t<120;t++){var az,d,ds=[];
    if(lv===0){az=pick([0,90,180,270]);d=pick([200,250,300]);[90,180,270].forEach(function(o){ds.push([(az+o)%360,pick([150,200,250,300])]);});}
    else if(lv===1){az=pick([45,135,225,315,30,60,120,150,210,240,300,330]);d=pick([200,250,300,350]);ds.push([az,d>=250?d-150:d+150]);ds.push([(az+45)%360,d]);ds.push([(az+315)%360,pick([150,250,300])]);}
    else{az=5*(1+Math.floor(Math.random()*71));if(az%45===0)continue;d=pick([250,300,350]);ds.push([norm(az+pick([25,-25])),d]);ds.push([az,d>250?d-100:d+100]);ds.push([norm(az+pick([40,-40])),d+pick([50,-50])]);}
    var all=[[az,d]].concat(ds),pts=all.map(function(a){return azPt(a[0],a[1]);}),ok=true;
    for(var i=0;i<pts.length&&ok;i++){var p=pts[i];
      if(p.x<26||p.x>294||p.y<26||p.y>290)ok=false;
      if(p.x>262&&p.y<70)ok=false;           /* north arrow */
      if(p.x<150&&p.y>272)ok=false;          /* scale bar */
      if(hyp(p.x-160,p.y-160)<52)ok=false;
      for(var j=0;j<i;j++)if(hyp(p.x-pts[j].x,p.y-pts[j].y)<46)ok=false;}
    if(ok)return {az:az,d:d,lv:lv,pts:pts};}
  return {az:90,d:250,lv:0,pts:[azPt(90,250),azPt(180,250),azPt(270,200),azPt(0,300)]};}
function azMapSvg(){var g='',i;
  for(i=0;i<=320;i+=40)g+='<line x1="'+i+'" y1="0" x2="'+i+'" y2="320"/><line x1="0" y1="'+i+'" x2="320" y2="'+i+'"/>';
  var ticks='';for(i=1;i<=3;i++)ticks+='<line x1="-6" y1="'+(-i*40)+'" x2="6" y2="'+(-i*40)+'" stroke="#F2C230" stroke-width="2"/><text x="10" y="'+(-i*40+4)+'" fill="#F2C230" font-size="10" font-weight="600" font-family="Inter" paint-order="stroke" stroke="#141810" stroke-width="3">'+(i*100)+' м</text>';
  return '<svg viewBox="0 0 320 320" role="img" aria-label="Карта місцевості в масштабі 1:10 000, північ угорі. Сітка: одна клітинка — 100 метрів.">'+
  '<defs><pattern id="x-gt-tr" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.3" fill="#4C6B3A"/></pattern></defs>'+
  '<rect width="320" height="320" fill="#1A1F15"/>'+
  /* fields and forest */
  '<path d="M0 0H118C110 30 84 52 52 58C30 62 10 78 0 96Z" fill="#20301B"/><path d="M0 0H118C110 30 84 52 52 58C30 62 10 78 0 96Z" fill="url(#x-gt-tr)" opacity=".8"/>'+
  '<path d="M214 214C246 202 290 208 320 230V320H196C188 290 190 236 214 214Z" fill="#20301B"/><path d="M214 214C246 202 290 208 320 230V320H196C188 290 190 236 214 214Z" fill="url(#x-gt-tr)" opacity=".8"/>'+
  '<path d="M210 20h70v52h-70z" fill="#2A2A17" opacity=".7" transform="rotate(8 245 46)"/>'+
  /* contours */
  '<g fill="none" stroke="#6B5A3A" stroke-width="1" opacity=".75"><ellipse cx="80" cy="220" rx="56" ry="36"/><ellipse cx="80" cy="220" rx="36" ry="22"/><ellipse cx="82" cy="219" rx="16" ry="9"/></g>'+
  /* river and road */
  '<path d="M330 92C284 104 262 132 230 140S170 128 140 150 108 206 60 230 10 270-10 268" fill="none" stroke="#3E6B86" stroke-width="7" stroke-linecap="round" opacity=".9"/>'+
  '<path d="M330 92C284 104 262 132 230 140S170 128 140 150 108 206 60 230 10 270-10 268" fill="none" stroke="#6FA3C0" stroke-width="1.5" opacity=".6"/>'+
  '<path d="M-10 128C60 132 110 112 160 160S260 190 330 176" fill="none" stroke="#8E7A55" stroke-width="3" stroke-dasharray="9 5" opacity=".85"/>'+
  /* grid */
  '<g stroke="#C3C79A" stroke-opacity=".13" stroke-width="1">'+g+'</g>'+
  /* north arrow */
  '<g transform="translate(290 34)"><path d="M0-20L8 8 0 3-8 8Z" fill="#EE8D7C"/><text y="20" text-anchor="middle" fill="#EDEBE2" font-size="11" font-weight="700" font-family="Oswald">Пн</text></g>'+
  /* scale bar */
  '<g transform="translate(12 296)"><rect x="0" y="0" width="40" height="6" fill="#EDEBE2"/><rect x="40" y="0" width="40" height="6" fill="#1A1F15" stroke="#EDEBE2"/><rect x="80" y="0" width="40" height="6" fill="#EDEBE2"/>'+
  '<text x="0" y="17" fill="#EDEBE2" font-size="9" font-family="Inter">0</text><text x="40" y="17" fill="#EDEBE2" font-size="9" font-family="Inter" text-anchor="middle">100</text><text x="120" y="17" fill="#EDEBE2" font-size="9" font-family="Inter" text-anchor="middle">300 м</text>'+
  '<text x="0" y="-5" fill="#A9AD9D" font-size="9" font-family="Inter">1:10 000</text></g>'+
  /* bearing ray from start, rotated with compass */
  '<g class="x-gt-ray" id="x-gt-ray" transform="rotate(0 160 160)"><g transform="translate(160 160)"><line class="m" x1="0" y1="0" x2="0" y2="-150"/>'+ticks+'</g></g>'+
  /* start: orienteering triangle */
  '<g transform="translate(160 160)"><circle r="14" fill="none" stroke="#F2C230" stroke-opacity=".35"><animate attributeName="r" values="10;20;10" dur="2.4s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".6;0;.6" dur="2.4s" repeatCount="indefinite"/></circle><path d="M0-9L8 6H-8Z" fill="none" stroke="#F2C230" stroke-width="2.5" stroke-linejoin="round"/></g>'+
  '<text x="160" y="182" text-anchor="middle" fill="#F2C230" font-size="10" font-weight="700" font-family="Inter" paint-order="stroke" stroke="#141810" stroke-width="3">СТАРТ</text>'+
  '</svg>';}
function compassSvg(){var s='',i,lb={0:'Пн',90:'Сх',180:'Пд',270:'Зх'};
  for(i=0;i<360;i+=5){var big=i%30===0;s+='<line x1="100" y1="'+(big?14:17)+'" x2="100" y2="22" stroke="'+(i===0?'#EE8D7C':'#A9AD9D')+'" stroke-width="'+(big?2:1)+'" transform="rotate('+i+' 100 100)"/>';}
  for(i=0;i<360;i+=30){var r=i*Math.PI/180,x=(100+Math.sin(r)*68).toFixed(1),y=(100-Math.cos(r)*68).toFixed(1);
    s+='<text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="middle" font-family="'+(lb[i]?'Oswald':'Inter')+'" font-size="'+(lb[i]?14:10)+'" font-weight="600" fill="'+(i===0?'#EE8D7C':lb[i]?'#EDEBE2':'#A9AD9D')+'">'+(lb[i]||i)+'</text>';}
  return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="x-gt-cg" cx="50%" cy="40%"><stop offset="0" stop-color="#232819"/><stop offset="1" stop-color="#0E100B"/></radialGradient></defs>'+
  '<circle cx="100" cy="100" r="97" fill="#2A2E22"/><circle cx="100" cy="100" r="92" fill="url(#x-gt-cg)" stroke="#4A503F"/>'+s+
  '<g id="x-gt-dir" transform="rotate(0 100 100)"><path d="M100 26L108 52H92Z" fill="#F2C230"/><rect x="98.5" y="50" width="3" height="50" fill="#F2C230" opacity=".7"/><circle cx="100" cy="100" r="40" fill="none" stroke="#F2C230" stroke-opacity=".18" stroke-width="8"/></g>'+
  '<g class="x-gt-needle" id="x-gt-ndl"><path d="M100 64L106 100H94Z" fill="#EE8D7C"/><path d="M100 136L106 100H94Z" fill="#EDEBE2"/></g>'+
  '<circle cx="100" cy="100" r="5" fill="#14110A" stroke="#F2C230" stroke-width="2"/></svg>';}

function startAzimuth(box,A){css();var R=6,r=0,score=0,right=0,cur=null,busy=false,ang=0,sway=0,names=[];
  box.innerHTML='<div class="view stack">'+A.gHead('Азимут','Азимут — кут від напрямку на північ за годинниковою стрілкою. Покрути компас, проклади курс від старту й знайди орієнтир.')+
  '<div class="hud"><span id="x-gt-cnt"></span><span class="x-gt-pts" id="x-gt-sc">0 балів</span></div>'+
  '<div class="card x-gt-task stack" style="gap:6px"><p class="ey">Завдання</p><p style="margin:0">Йди на азимут <b class="x-gt-big" id="x-gt-az">0°</b> — <b class="x-gt-big" id="x-gt-d">0 м</b></p><p class="sm mu" id="x-gt-hint" style="margin:0"></p></div>'+
  '<div class="x-gt-map" id="x-gt-map">'+azMapSvg()+'</div>'+
  '<div class="x-gt-crow"><div class="x-gt-comp" id="x-gt-comp" tabindex="0" role="slider" aria-label="Компас: напрямок руху в градусах" aria-valuemin="0" aria-valuemax="359" aria-valuenow="0">'+compassSvg()+'</div>'+
  '<div class="stack" style="gap:8px"><span class="sm mu">Твій курс</span><span class="x-gt-deg" id="x-gt-deg" aria-hidden="true">0°</span><div class="x-gt-step"><button data-x="-5" aria-label="Повернути на 5 градусів проти годинникової">−5°</button><button data-x="5" aria-label="Повернути на 5 градусів за годинниковою">+5°</button></div><span class="sm mu">Тягни компас по колу або стрілками клавіатури</span></div></div>'+
  '<div class="toast" id="x-gt-tst" role="status" aria-live="polite"></div><div id="x-gt-nx"></div></div>';
  var map=$('#x-gt-map',box),comp=$('#x-gt-comp',box),ray=$('#x-gt-ray',box),dir=$('#x-gt-dir',box),ndl=$('#x-gt-ndl',box),deg=$('#x-gt-deg',box),tst=$('#x-gt-tst',box);
  function setAng(v,final){ang=norm(Math.round(v));dir.setAttribute('transform','rotate('+ang+' 100 100)');ray.setAttribute('transform','rotate('+ang+' 160 160)');
    deg.textContent=ang+'°';comp.setAttribute('aria-valuenow',ang);comp.setAttribute('aria-valuetext',ang+' градусів');
    deg.className='x-gt-deg'+(cur&&angDiff(ang,cur.az)<=3?' hit':'');
    if(final){sway=1-sway;ndl.setAttribute('class','x-gt-needle'+(sway?' s':''));}}
  rotor(comp,function(){return ang;},setAng);
  comp.addEventListener('keydown',function(e){var k=e.key,st=e.shiftKey?10:1;if(k==='ArrowRight'||k==='ArrowUp'){setAng(ang+st,true);e.preventDefault();}else if(k==='ArrowLeft'||k==='ArrowDown'){setAng(ang-st,true);e.preventDefault();}});
  function hint(c){var d=c.d/100;if(c.lv===0){var n=DIRN.filter(function(x){return x[0]===c.az;})[0];return 'Підказка: '+c.az+'° — це '+n[1]+'. Масштаб 1:10 000 → 1 см на карті = 100 м. '+c.d+' м = '+d+' клітинки сітки.';}
    if(c.lv===1)return 'Обережно: на одному курсі можуть стояти два орієнтири. Рахуй відстань: '+c.d+' м = '+d+' см на карті.';
    return 'Точність важлива: сусідні орієнтири відхилені на 25–40°. Встанови курс до градуса.';}
  function round(){if(r>=R){var pts=Math.min(40,score+(right===R?4:0));return A.gEnd(box,'azimuth','Азимут','Знайдено орієнтирів: '+right+' з '+R+'. Пам’ятай: азимут рахуємо від півночі за годинниковою стрілкою, а масштаб 1:10 000 означає 1 см = 100 м.',pts,right>=5);}
    busy=false;cur=azGen(r);$('#x-gt-cnt',box).textContent='Раунд '+(r+1)+' / '+R;$('#x-gt-az',box).textContent=cur.az+'°';$('#x-gt-d',box).textContent=cur.d+' м';$('#x-gt-hint',box).textContent=hint(cur);
    tst.className='toast';tst.textContent='';$('#x-gt-nx',box).innerHTML='';$$('.x-gt-lm',map).forEach(function(b){b.parentNode.removeChild(b);});
    names=A.shuffle(LMK).slice(0,4);var order=A.shuffle([0,1,2,3]);
    order.forEach(function(k,n){var p=cur.pts[k],b=document.createElement('button');b.className='x-gt-lm';b.setAttribute('data-k',k);b.style.left=(p.x/3.2)+'%';b.style.top=(p.y/3.2)+'%';b.style.animationDelay=(n*.07)+'s';
      b.setAttribute('aria-label',names[k][1]);b.innerHTML='<b aria-hidden="true">'+names[k][0]+'</b><span aria-hidden="true">'+names[k][1]+'</span>';map.appendChild(b);});
    setAng(ang,false);}
  box.addEventListener('click',function(e){var s=e.target.closest('[data-x]');if(s){setAng(ang+(+s.getAttribute('data-x')),true);return;}
    if(e.target.closest('.x-gt-go')){r++;round();var tk=$('.x-gt-task',box);if(tk&&tk.scrollIntoView)tk.scrollIntoView({block:'start'});return;}
    var b=e.target.closest('.x-gt-lm');if(!b||busy)return;busy=true;var k=+b.getAttribute('data-k'),ok=k===0,bonus=angDiff(ang,cur.az)<=5;
    $$('.x-gt-lm',map).forEach(function(x){x.disabled=true;if(x.getAttribute('data-k')==='0')x.classList.add('good');});
    if(ok){right++;var g=5+(bonus?1:0);score+=g;tst.className='toast ok';tst.textContent='Точно! '+names[0][1]+' — '+cur.az+'°, '+cur.d+' м. +'+g+(bonus?' (бонус за точний курс)':'');var sc=$('#x-gt-sc',box);sc.textContent=score+' балів';sc.classList.remove('b');void sc.offsetWidth;sc.classList.add('b');}
    else{b.classList.add('wrong');tst.className='toast no';tst.textContent='Це '+names[k][1]+'. Потрібно: '+names[0][1]+' — курс '+cur.az+'°, '+(cur.d/100)+' клітинки ('+cur.d+' м).';setAng(cur.az,true);}
    $('#x-gt-nx',box).innerHTML='<button class="pri x-gt-next x-gt-go" style="width:100%">'+(r+1>=R?'Підсумок':'Наступний раунд →')+'</button>';});
  round();
  return function(){busy=true;};}

/* =====================================================================
   2. ФЕЙК ЧИ ПРАВДА — media literacy swipe cards (all examples invented)
   ===================================================================== */
/* [avatar, sender, meta, text, truth 1=true/safe 0=fake/dangerous, explanation, flags, system-style] */
var FAKES=[
['📢','Канал «Новини району 24/7»','Переслано з невідомого каналу','ТЕРМІНОВО!!! Збір на лікування дитини. Переказуйте на картку 4149 •••• •••• 7712 до півночі, інакше буде пізно! Перешліть 10 друзям!',0,'Справжні благодійні фонди мають сайт, звіти й рахунок організації. Тиск часом, особиста картка й «перешли друзям» — типові ознаки шахрайства.',['Тиск часом','Особиста картка','Ланцюжок пересилань']],
['😱','Невідомий номер','щойно','Дивись злите відео з твоєї школи 😱 Перейди за посиланням і введи номер телефону та код з SMS, щоб підтвердити вік.',0,'Це фішинг: так крадуть акаунти. Код з SMS не можна повідомляти нікому. Розкажи дорослим і заблокуй відправника.',['Код з SMS','Невідоме посилання','Цікавість як пастка']],
['📡','Канал «Інсайди міста»','Переслано','Усім мешканцям району негайно евакуюватися! Інформація із закритого джерела, офіційно про це не повідомлятимуть.',0,'Евакуацію оголошують офіційні служби та місцева влада. «Закрите джерело» і «офіційно не скажуть» — ознаки фейку, що сіє паніку. Перевір офіційні канали громади.',['Невідоме джерело','Паніка','Неможливо перевірити']],
['🚨','Офіційний застосунок оповіщення','Системне сповіщення · на вулиці чути сирену','Повітряна тривога! Негайно пройдіть до найближчого укриття. Стежте за відбоєм тривоги.',1,'Сповіщення з офіційного застосунку збігається із сиреною. Тут не просять грошей і даних, а лише дати команду на безпеку. Дій одразу.',['Офіційне джерело','Збіг із сиреною','Чітка дія'],1],
['⚠️','Екстрене сповіщення на всі телефони','Системне повідомлення від служби порятунку','Штормове попередження: сильний вітер і гроза. Не стійте під деревами й біля ліній електропередачі. За потреби телефонуйте 112.',1,'Екстрене повідомлення приходить як системне на всі телефони в районі. Порада корисна, не просить переходити за посиланнями, а номер 112 справжній.',['Системний формат','Номер 112','Без посилань'],1],
['🎁','«Подарунки для школярів»','Реклама','Вітаємо! Ти виграв смартфон! Сплати лише доставку 99 грн карткою батьків за посиланням.',0,'Ти не брав участі в конкурсі, а тебе просять оплатити картою батьків. Безкоштовний приз з оплатою «доставки» — класичне шахрайство.',['Занадто добре','Оплата наперед','Картка батьків']],
['🙂','Акаунт друга Максима','онлайн','Привіт, це я. Терміново позич 500 грн на цю картку, потім поясню. Тільки нікому не кажи!',0,'Акаунт друга могли зламати. Перевір: зателефонуй другові голосом. Прохання «нікому не кажи» — тривожний знак.',['Секретність','Гроші терміново','Чужа картка']],
['🏫','Класна керівниця · шкільний чат','Чат класу, який ти знаєш','Завтра уроки дистанційно через погодні умови. Посилання на уроки — у електронному щоденнику, як завжди.',1,'Відоме джерело, звичний канал, нічого не просять. Інформацію можна перевірити в електронному щоденнику чи на сайті школи.',['Знайоме джерело','Можна перевірити','Нічого не просять']],
['💰','Бот «Народний репортер»','Переслано','Сфотографуй, куди влучило, або де стоїть техніка, і надішли в цей бот — отримаєш 1000 грн!',0,'Небезпечно! Фото місць влучань і техніки допомагає ворогу коригувати удари. Нічого не знімай і не публікуй. Розкажи дорослим.',['Допомога ворогу','Гроші за фото','Анонімний бот']],
['👩','Мама','Твій контакт «Мама»','Напиши, будь ласка, коли дійдеш додому зі школи. Обід у холодильнику ❤️',1,'Знайома людина, звичайне прохання, без посилань і грошей. Сумніваєшся — просто подзвони.',['Знайомий контакт','Без посилань','Звичне прохання']],
['🖼️','Сторінка «Шокуючі факти»','12 тис. поширень','Це фото зроблено ВЧОРА у нашому місті! (на фото — сніг, хоча зараз липень)',0,'Деталі не збігаються з реальністю, а джерела немає. Старі фото часто видають за нові. Перевіряй дату й джерело, шукай фото через пошук за зображенням.',['Деталі не збігаються','Немає джерела','Емоційний заголовок']],
['🔐','«Служба безпеки месенджера»','Новий контакт','Ваш акаунт буде видалено через 1 годину! Надішліть код, який прийде в SMS, щоб підтвердити власника.',0,'Справжні сервіси ніколи не просять код з SMS у повідомленні. Це спроба викрасти акаунт.',['Код з SMS','Погроза','Тиск часом']],
['🏛️','Офіційний застосунок громади','Сповіщення','Пункт незламності відкрито у спортзалі ліцею на вашій вулиці: тепло, вода, зарядка телефонів. Працює цілодобово.',1,'Офіційний канал громади, корисна інформація, нічого не просять. Адресу завжди можна перевірити на сайті громади чи в адміністратора.',['Офіційний канал','Корисна дія','Можна перевірити'],1]
];
function startFake(box,A){css();var deck=A.shuffle(FAKES),i=0,right=0,busy=false,card=null,sx=0,dx=0,drag=false;
  box.innerHTML='<div class="view stack">'+A.gHead('Фейк чи правда','Читай повідомлення уважно. Праворуч — правда та безпечно, ліворуч — фейк або небезпечно.')+
  '<div class="hud"><span id="x-gt-cnt"></span><span class="x-gt-pts" id="x-gt-sc">0 балів</span></div><div class="deck x-gt-deck" id="x-gt-deck"></div>'+
  '<div class="grid2"><button data-v="0" class="x-gt-fb" style="border-color:var(--bad)">← Фейк</button><button data-v="1" class="x-gt-fb" style="border-color:var(--ok)">Правда →</button></div>'+
  '<div id="x-gt-ex" aria-live="polite"></div></div>';
  var dk=$('#x-gt-deck',box),ex=$('#x-gt-ex',box);
  function btns(dis){$$('.x-gt-fb',box).forEach(function(b){b.disabled=dis;});}
  function show(){if(i>=deck.length){var pts=Math.min(40,right*3+(right===deck.length?1:0));return A.gEnd(box,'fake','Фейк чи правда','Розпізнано правильно: '+right+' з '+deck.length+'. Золоте правило: зупинись, перевір джерело, не поспішай пересилати.',pts,right>=10);}
    var t=deck[i];$('#x-gt-cnt',box).textContent=(i+1)+' / '+deck.length;ex.innerHTML='';btns(false);busy=false;
    dk.innerHTML='<div class="scard x-gt-fc" tabindex="0" aria-label="Повідомлення від '+A.esc(t[1])+': '+A.esc(t[3])+'"><span class="tag l">ФЕЙК</span><span class="tag r">ПРАВДА</span>'+
      '<div class="x-gt-src"><span class="x-gt-av" aria-hidden="true">'+t[0]+'</span><span><b>'+A.esc(t[1])+'</b><span class="sm mu">'+A.esc(t[2])+'</span></span></div>'+
      '<div class="x-gt-bub'+(t[7]?' sys':'')+'">'+A.esc(t[3])+'</div><p class="sm mu x-gt-hint">Потягни картку вбік</p></div>';
    card=dk.firstChild;
    card.addEventListener('pointerdown',function(e){if(busy)return;drag=true;sx=e.clientX;dx=0;card.style.transition='none';try{card.setPointerCapture(e.pointerId);}catch(_){}});
    card.addEventListener('pointermove',function(e){if(!drag)return;dx=e.clientX-sx;card.style.transform='translateX('+dx+'px) rotate('+(dx/16)+'deg)';$('.tag.r',card).style.opacity=Math.max(0,Math.min(1,dx/80));$('.tag.l',card).style.opacity=Math.max(0,Math.min(1,-dx/80));});
    function up(){if(!drag)return;drag=false;card.style.transition='transform .35s cubic-bezier(.16,1,.3,1)';if(Math.abs(dx)>80)decide(dx>0?1:0);else{card.style.transform='';$('.tag.r',card).style.opacity=0;$('.tag.l',card).style.opacity=0;}}
    card.addEventListener('pointerup',up);card.addEventListener('pointercancel',up);
    card.addEventListener('keydown',function(e){if(e.key==='ArrowRight')decide(1);else if(e.key==='ArrowLeft')decide(0);});}
  function decide(v){if(busy)return;busy=true;btns(true);var t=deck[i],ok=v===t[4];
    card.classList.add('fly');card.style.transform='translateX('+(v?440:-440)+'px) rotate('+(v?26:-26)+'deg)';card.style.opacity=0;
    if(ok){right++;var sc=$('#x-gt-sc',box);sc.textContent=(right*3)+' балів';sc.classList.remove('b');void sc.offsetWidth;sc.classList.add('b');}
    ex.innerHTML='<div class="msg '+(ok?'ok':'no')+' stack" style="gap:8px"><b>'+(ok?'Правильно! ':'Не зовсім. ')+(t[4]?'Це правда / безпечно.':'Це фейк / небезпечно.')+'</b><span>'+A.esc(t[5])+'</span>'+
      '<div class="x-gt-flags">'+t[6].map(function(f,n){return '<span style="animation-delay:'+(.1+n*.06)+'s">'+(t[4]?'✓ ':'⚑ ')+A.esc(f)+'</span>';}).join('')+'</div></div>'+
      '<button class="pri x-gt-next x-gt-go" style="width:100%;margin-top:12px">'+(i+1>=deck.length?'Підсумок':'Далі →')+'</button>';
    A.later(function(){var g=$('.x-gt-go',box);if(g){g.focus({preventScroll:true});g.scrollIntoView({behavior:'smooth',block:'nearest'});}},450);}
  box.addEventListener('click',function(e){var b=e.target.closest('.x-gt-fb');if(b&&!busy){decide(+b.getAttribute('data-v'));return;}if(e.target.closest('.x-gt-go')){i++;show();}});
  show();
  return function(){busy=true;drag=false;};}

/* =====================================================================
   3. ПЕРША ДОПОМОГА: ПОРЯДОК ДІЙ — drag steps into order (civil first aid)
   ===================================================================== */
var AID=[
{t:'Людина без свідомості',e:'😶',s:'На подвір’ї людина впала і не відповідає.',steps:[
 'Переконайся, що тобі нічого не загрожує: машини, струм, вогонь',
 'Голосно поклич людину й легенько потормоши за плечі',
 'Поклич дорослих і телефонуй 103 або 112, увімкни гучний зв’язок',
 'Перевір дихання: дивись, слухай, відчувай до 10 секунд',
 'Дихає — поверни на бік у безпечне положення й стеж до приїзду медиків'],
 x:'Якщо людина не дихає — диспетчер 103 підкаже, як робити натискання на грудну клітку. Не клади трубку.'},
{t:'Сильна кровотеча',e:'🩸',s:'Друг сильно порізав руку склом, кров тече швидко.',steps:[
 'Переконайся, що поруч безпечно: прибери скло, не поранься сам',
 'Поклич дорослих і телефонуй 103 або 112',
 'Одягни рукавички або візьми чистий пакет чи тканину',
 'Сильно притисни рану чистою тканиною або бинтом',
 'Не відпускай: якщо промокло — додай ще тканини зверху й тисни далі'],
 x:'Не знімай просочену тканину — так кровотеча посилиться. Джгут накладають дорослі, які пройшли навчання.'},
{t:'Опік',e:'🔥',s:'Молодша сестра торкнулася гарячої каструлі.',steps:[
 'Відведи від гарячого й вимкни плиту — переконайся, що безпечно',
 'Одразу охолоджуй опік прохолодною проточною водою близько 20 хвилин',
 'Поки ллється вода — поклич дорослих; великий опік чи на обличчі — 103 або 112',
 'Після охолодження накрий чистою пов’язкою або харчовою плівкою',
 'Стеж за самопочуттям і дочекайся дорослих або медиків'],
 x:'Не мащ опік олією, кремом чи зубною пастою, не прикладай лід і не проколюй пухирі.'},
{t:'Людина вдавилася',e:'🍎',s:'Однокласник на перерві закашлявся, тримається за горло.',steps:[
 'Переконайся, що поруч безпечно, і спитай: «Ти вдавився?»',
 'Кашляє — підбадьор кашляти сильніше, нічого не давай пити',
 'Поклич дорослих і телефонуй 103 або 112',
 'Не може ні кашляти, ні говорити — нахили вперед і зроби 5 ударів долонею між лопатками',
 'Не допомогло — 5 поштовхів у верхню частину живота; чергуй до приїзду медиків'],
 x:'Поштовхи в живіт (прийом Геймліха) краще відпрацювати на курсах першої допомоги. Після такої допомоги людину має оглянути лікар.'}
];
function startFirstAid(box,A){css();var sc=0,n=0,checked=false,total=0;
  box.innerHTML='<div class="view stack">'+A.gHead('Перша допомога: порядок дій','Розстав кроки в правильному порядку: тягни за номер або користуйся стрілками ▲▼. Спершу — власна безпека.')+
  '<div class="hud"><span id="x-gt-cnt"></span><span class="x-gt-pts" id="x-gt-sc">0 балів</span></div><div class="steps" id="x-gt-steps">'+AID.map(function(){return '<i></i>';}).join('')+'</div><div id="x-gt-sx" class="stack"></div></div>';
  var sx=$('#x-gt-sx',box);
  function scen(){if(n>=AID.length){return A.gEnd(box,'firstaid','Перша допомога','Правильних кроків: '+total+' з '+(AID.length*5)+'. Головне: власна безпека, виклик 103/112 і спокій.',Math.min(40,sc),sc>=30);}
    checked=false;var a=AID[n],ord=[0,1,2,3,4];while(ord.join()==='0,1,2,3,4')ord=A.shuffle(ord);
    $('#x-gt-cnt',box).textContent='Ситуація '+(n+1)+' / '+AID.length;$$('#x-gt-steps i',box).forEach(function(s,k){s.className=k<n?'on':'';});
    sx.innerHTML='<div class="card row x-gt-task x-gt-next"><span style="font-size:38px" aria-hidden="true">'+a.e+'</span><span><b style="font-size:17px">'+a.t+'</b><span class="sm mu" style="display:block">'+a.s+'</span></span></div>'+
      '<ol class="x-gt-ol" id="x-gt-ol" aria-label="Кроки, їх можна переставляти">'+ord.map(function(k,j){return '<li class="x-gt-li" data-k="'+k+'" style="animation-delay:'+(j*.05)+'s"><span class="x-gt-grip" aria-hidden="true"><span class="num">'+(j+1)+'</span></span><p>'+a.steps[k]+'</p><span class="x-gt-mv"><button data-m="-1" aria-label="Перемістити вище">▲</button><button data-m="1" aria-label="Перемістити нижче">▼</button></span></li>';}).join('')+'</ol>'+
      '<div class="x-gt-sos" aria-hidden="true"><span>103 — швидка</span><span>112 — єдиний номер</span></div>'+
      '<button class="pri x-gt-chk" style="width:100%">Перевірити порядок</button><div id="x-gt-res" aria-live="polite"></div>';
    sortable($('#x-gt-ol',box));}
  function renum(ol){$$('.x-gt-li',ol).forEach(function(li,j){$('.num',li).textContent=j+1;});}
  function sortable(ol){var d=null;
    ol.addEventListener('pointerdown',function(e){if(checked)return;var li=e.target.closest('.x-gt-li');if(!li||e.target.closest('button'))return;if(e.pointerType!=='mouse'&&!e.target.closest('.x-gt-grip'))return;
      d={li:li,sy:e.clientY,id:e.pointerId};li.classList.add('x-gt-drag');try{li.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
    ol.addEventListener('pointermove',function(e){if(!d||e.pointerId!==d.id)return;var li=d.li,dy=e.clientY-d.sy;li.style.transform='translateY('+dy+'px)';
      var r=li.getBoundingClientRect(),mid=r.top+r.height/2,nx=li.nextElementSibling,pv=li.previousElementSibling,o;
      if(nx){var nr=nx.getBoundingClientRect();if(mid>nr.top+nr.height/2){o=li.offsetTop;flip(ol,function(){ol.insertBefore(nx,li);});d.sy+=li.offsetTop-o;}}
      if(pv){var pr=pv.getBoundingClientRect();if(mid<pr.top+pr.height/2){o=li.offsetTop;flip(ol,function(){ol.insertBefore(li,pv);});d.sy+=li.offsetTop-o;}}
      li.style.transform='translateY('+(e.clientY-d.sy)+'px)';});
    function up(){if(!d)return;var li=d.li;d=null;li.classList.remove('x-gt-drag');li.style.transition='transform .3s cubic-bezier(.16,1,.3,1)';li.style.transform='';renum(ol);}
    ol.addEventListener('pointerup',up);ol.addEventListener('pointercancel',up);}
  box.addEventListener('click',function(e){var ol=$('#x-gt-ol',box),m=e.target.closest('[data-m]');
    if(m&&!checked){var li=m.closest('.x-gt-li'),dir=+m.getAttribute('data-m'),t=dir<0?li.previousElementSibling:li.nextElementSibling;if(!t)return;
      flip(ol,function(){if(dir<0)ol.insertBefore(li,t);else ol.insertBefore(t,li);});renum(ol);m.focus();return;}
    if(e.target.closest('.x-gt-chk')&&!checked){checked=true;var good=0,a=AID[n];
      $$('.x-gt-li',ol).forEach(function(li,j){var k=+li.getAttribute('data-k'),ok=k===j;if(ok)good++;li.className='x-gt-li '+(ok?'good':'wrong');li.style.animationDelay=(j*.06)+'s';
        li.insertAdjacentHTML('beforeend','<span class="x-gt-ok">'+(ok?'✓ вірно':'має бути '+(k+1))+'</span>');$$('button',li).forEach(function(b){b.disabled=true;});});
      var g=good*2;sc+=g;total+=good;var s=$('#x-gt-sc',box);s.textContent=sc+' балів';s.classList.remove('b');void s.offsetWidth;s.classList.add('b');
      e.target.closest('.x-gt-chk').style.display='none';
      $('#x-gt-res',box).innerHTML='<div class="msg '+(good===5?'ok':'no')+' stack x-gt-ex" style="gap:8px"><b>'+(good===5?'Усе правильно! +10':'Правильно '+good+' з 5. +'+g)+'</b><span>Правильний порядок:</span><ol>'+a.steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol><span class="sm">'+a.x+'</span></div>'+
        '<button class="pri x-gt-next x-gt-go" style="width:100%;margin-top:12px">'+(n+1>=AID.length?'Підсумок':'Наступна ситуація →')+'</button>';return;}
    if(e.target.closest('.x-gt-go')){n++;scen();window.scrollTo(0,0);}});
  scen();
  return function(){checked=true;};}

/* =====================================================================
   4. ШИФР РАДИСТА — training cipher: phonetic table + Caesar shift
   ===================================================================== */
var ABC='АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'.split('');
/* Invented training phonetic table (not an official standard) */
var PHON={'А':'Абрикос','Б':'Барвінок','В':'Верба','Г':'Гора','Ґ':'Ґудзик','Д':'Дніпро','Е':'Еней','Є':'Єнот','Ж':'Жайворонок','З':'Зірка','И':'Ирій','І':'Іскра','Ї':'Їжак','Й':'Йорж','К':'Калина','Л':'Лелека','М':'Мавка','Н':'Небо','О':'Озеро','П':'Писанка','Р':'Ромашка','С':'Соняшник','Т':'Тополя','У':'Усмішка','Ф':'Фіалка','Х':'Хата','Ц':'Цибуля','Ч':'Чайка','Ш':'Шипшина','Щ':'Щука','Ь':'Знак','Ю':'Юшка','Я':'Яблуко'};
var CLV=[
 {n:'Новобранець',t:'Фонетична таблиця',d:'Кожне слово означає свою першу літеру: «Калина» — К, «Озеро» — О. Склади літери в слово.',time:90,w:['КАРТА','РАДІО','ЛІХТАР','КОМПАС','ВОДА','СИГНАЛ'],ph:true,sh:false},
 {n:'Зв’язківець',t:'Шифр Цезаря',d:'Кожну літеру зсунули вперед абеткою на кілька кроків. Постав зсув ключа на колі: зовні — зашифрована літера, всередині під нею — справжня.',time:90,w:['УКРИТТЯ','СИРЕНА','АПТЕЧКА','МАРШРУТ','ПРИЙОМ','ВІДБІЙ'],ph:false,sh:true},
 {n:'Радист',t:'Подвійний шифр',d:'Спершу фонетична таблиця дає літери, а потім їх ще треба розшифрувати Цезарем за ключем.',time:120,w:['ЗБІР','ТИША','ШКОЛА','НАМЕТ','СВІТЛО','КОМПАС'],ph:true,sh:true}
];
var CPOOL=['КАРТА','РАДІО','ЛІХТАР','КОМПАС','ВОДА','СИГНАЛ','УКРИТТЯ','СИРЕНА','АПТЕЧКА','МАРШРУТ','ПРИЙОМ','ВІДБІЙ','ЗБІР','ТИША','ШКОЛА','НАМЕТ','СВІТЛО','КОМОРА','РАНЕЦЬ','КАРТОН','ВОГНИК','РАКЕТА','СПОКІЙ','ВЕРБА','ЛАМПА','ВІТЕР','СИТО','ТЕМП','МАРКА','ТРИВОГА','ДОПОМОГА','МАЯЧОК','СТЕЖКА','ПОРЯДОК','ПРИВАЛ','ЧЕРГОВИЙ','ГОРОД','ТИСК'];
function caesar(w,k){return w.split('').map(function(c){var i=ABC.indexOf(c);return i<0?c:ABC[(i+k+ABC.length)%ABC.length];}).join('');}
function wheelSvg(){var s='',o='',st=360/ABC.length;
  ABC.forEach(function(c,i){o+='<text x="130" y="22" fill="#9FE3A2" transform="rotate('+(i*st).toFixed(2)+' 130 130)">'+c+'</text>';
    s+='<text x="130" y="50" fill="#EDEBE2" transform="rotate('+(i*st).toFixed(2)+' 130 130)">'+c+'</text>';});
  return '<svg viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="128" fill="#0F110C" stroke="#3A4031"/><circle cx="130" cy="130" r="104" fill="none" stroke="#3A4031"/>'+o+
  '<g class="x-gt-disk snap" id="x-gt-disk"><circle cx="130" cy="130" r="102" fill="#1E2218" stroke="#4A503F"/>'+s+'<circle cx="130" cy="130" r="64" fill="#161912" stroke="#32372B"/>'+
  '<path d="M130 70l6 10h-12z" fill="#F2C230"/></g>'+
  '<rect x="121" y="6" width="18" height="56" rx="7" fill="none" stroke="#F2C230" stroke-width="1.5" opacity=".8"/>'+
  '<text x="130" y="122" fill="#A9AD9D" style="font-size:11px">ЗСУВ</text><text x="130" y="146" id="x-gt-shv" fill="#F2C230" style="font:600 28px Oswald,sans-serif">0</text></svg>';}
function startCipher(box,A){css();var lv=0,mi=0,msgs=[],left=0,right=0,score=0,bonus=0,lvRight=0,busy=true,run=false,shift=0,cur=null;
  box.innerHTML='<div class="view stack">'+A.gHead('Шифр радиста','Навчальний шифр, вигаданий для гри. Розшифруй короткі повідомлення, поки не вийшов час.')+
  '<div class="hud"><span id="x-gt-cnt"></span><span id="x-gt-tm" aria-live="off"></span><span class="x-gt-pts" id="x-gt-sc">0 балів</span></div>'+
  '<div class="bar x-gt-time" aria-hidden="true"><i id="x-gt-tb" style="width:100%"></i></div><div id="x-gt-cx" class="stack"></div></div>';
  var cx=$('#x-gt-cx',box);
  function tabHtml(open){return '<details class="card x-gt-det"'+(open?' open':'')+'><summary>Навчальна фонетична таблиця</summary><p class="sm mu" style="margin:0">Таблицю вигадано для тренування, це не офіційний стандарт.</p><div class="x-gt-tab">'+ABC.map(function(c){return '<span><b>'+c+'</b>'+PHON[c]+'</span>';}).join('')+'</div></details>';}
  function intro(){run=false;busy=true;var L=CLV[lv];msgs=A.shuffle(L.w).slice(0,3);mi=0;lvRight=0;left=L.time;
    $('#x-gt-cnt',box).textContent='Рівень '+(lv+1)+' / 3';$('#x-gt-tm',box).textContent=L.time+' с';$('#x-gt-tb',box).style.width='100%';
    cx.innerHTML='<div class="card x-gt-task stack x-gt-next" style="text-align:center"><p class="ey">Рівень '+(lv+1)+' · '+L.n+'</p><h2>'+L.t+'</h2><p>'+L.d+'</p><p class="sm mu">3 повідомлення · '+L.time+' секунд</p>'+
      (lv===0?'<p class="sm" style="margin:0">Приклад: Калина · Озеро · Тополя → <b style="color:var(--ye)">КОТ</b></p>':lv===1?'<p class="sm" style="margin:0">Приклад: ключ 1, «ЛПУ» → <b style="color:var(--ye)">КОТ</b></p>':'<p class="sm" style="margin:0">Приклад: ключ 1, Лелека · Писанка · Усмішка → ЛПУ → <b style="color:var(--ye)">КОТ</b></p>')+
      '</div><button class="pri x-gt-start" style="width:100%">Почати прийом</button>';}
  function tick(){if(!run)return;left=Math.max(0,left-.25);var L=CLV[lv],tb=$('#x-gt-tb',box);if(tb){tb.style.width=(left/L.time*100)+'%';tb.parentNode.className='bar x-gt-time'+(left<15?' low':'');}
    var tm=$('#x-gt-tm',box);if(tm)tm.textContent=Math.ceil(left)+' с';if(left<=0){run=false;busy=true;lvEnd(true);}}
  function message(){busy=false;var L=CLV[lv],w=msgs[mi],k=L.sh?1+Math.floor(Math.random()*(lv===1?4:3)):0,enc=caesar(w,k);
    var opts=A.shuffle(CPOOL.filter(function(x){return x!==w&&Math.abs(x.length-w.length)<=1;})).slice(0,3);opts=A.shuffle(opts.concat([w]));cur={w:w,k:k,enc:enc};
    var code=L.ph?enc.split('').map(function(c,n){return '<i class="w" style="animation-delay:'+(n*.08)+'s">'+PHON[c]+'</i>';}).join(''):enc.split('').map(function(c,n){return '<i style="animation-delay:'+(n*.08)+'s">'+c+'</i>';}).join('');
    cx.innerHTML='<div class="card stack x-gt-next" style="gap:10px"><div class="row sb"><p class="ey">Повідомлення '+(mi+1)+' / 3</p>'+(L.sh?'<span class="badge">Ключ: зсув '+k+'</span>':'')+'</div>'+
      '<div class="x-gt-code" role="img" aria-label="Шифровка: '+(L.ph?enc.split('').map(function(c){return PHON[c];}).join(', '):enc.split('').join(' '))+'">'+code+'</div></div>'+
      '<div class="x-gt-opts" role="group" aria-label="Варіанти розшифровки">'+opts.map(function(o){return '<button class="x-gt-o" data-o="'+o+'">'+o+'</button>';}).join('')+'</div><div class="toast" id="x-gt-tst" role="status" aria-live="polite"></div>'+
      (L.sh?'<div class="card stack" style="align-items:center"><span class="sm mu" style="text-align:center">Шифрувальне коло: крути внутрішній диск або кнопками. Зовні — шифровка, всередині — відповідь.</span><div class="x-gt-wheel" id="x-gt-wh" tabindex="0" role="slider" aria-label="Зсув шифрувального кола" aria-valuemin="0" aria-valuemax="32" aria-valuenow="'+shift+'">'+wheelSvg()+'</div><div class="grid2" style="width:100%"><button data-s="-1" aria-label="Зсув мінус 1">−1</button><button data-s="1" aria-label="Зсув плюс 1">+1</button></div></div>':'')+
      (L.ph?tabHtml(lv===0):'');
    if(L.sh){var wh=$('#x-gt-wh',box),disk=$('#x-gt-disk',box),st=360/ABC.length,val=shift;
      var setS=function(v,final){val=v;if(final){val=Math.round(v/st)*st;}disk.setAttribute('class','x-gt-disk'+(final?' snap':''));disk.style.transform='rotate('+val+'deg)';
        shift=((Math.round(val/st)%33)+33)%33;$('#x-gt-shv',box).textContent=shift;wh.setAttribute('aria-valuenow',shift);};
      val=shift*st;setS(val,true);wheelSet=function(dlt){setS(val+dlt*st,true);};
      rotor(wh,function(){return val;},setS);
      wh.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowUp'){wheelSet(1);e.preventDefault();}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){wheelSet(-1);e.preventDefault();}});}}
  var wheelSet=function(){};
  function lvEnd(timeout){var L=CLV[lv];if(lvRight===3&&left>=30){bonus++;}
    var done=lv>=2;
    cx.innerHTML='<div class="msg '+(lvRight>=2?'ok':'no')+' stack x-gt-next" style="text-align:center"><b>'+(timeout?'Час вийшов! ':'')+'Рівень «'+L.n+'»: '+lvRight+' з 3</b><span class="sm">'+(lvRight===3&&left>=30?'Швидко й точно — бонус +1.':'Радист працює спокійно: спершу ключ, потім літера за літерою.')+'</span></div>'+
      '<button class="pri x-gt-next x-gt-lv" style="width:100%">'+(done?'Підсумок':'Наступний рівень →')+'</button>';}
  box.addEventListener('click',function(e){var t;
    if(e.target.closest('.x-gt-start')){run=true;message();return;}
    if((t=e.target.closest('[data-s]'))){wheelSet(+t.getAttribute('data-s'));return;}
    if(e.target.closest('.x-gt-lv')){lv++;if(lv>2){var pts=Math.min(40,score+bonus+(right===9?1:0));return A.gEnd(box,'cipher','Шифр радиста','Розшифровано '+right+' з 9 повідомлень. Пам’ятай: справжні військові шифри — секрет, а цей навчальний.',pts,right>=7);}intro();window.scrollTo(0,0);return;}
    if((t=e.target.closest('.x-gt-o'))&&!busy&&run){busy=true;var ok=t.getAttribute('data-o')===cur.w,tst=$('#x-gt-tst',box);
      $$('.x-gt-o',box).forEach(function(b){b.disabled=true;if(b.getAttribute('data-o')===cur.w)b.classList.add('opt','good');});
      if(ok){right++;lvRight++;score+=4;tst.className='toast ok';tst.textContent='Прийнято! «'+cur.w+'»';var s=$('#x-gt-sc',box);s.textContent=score+' балів';s.classList.remove('b');void s.offsetWidth;s.classList.add('b');}
      else{t.classList.add('opt','wrong');tst.className='toast no';tst.textContent='Ні, це «'+cur.w+'»'+(cur.k?' (кожну літеру зсунули на '+cur.k+')':'');}
      A.later(function(){if(!run)return;mi++;if(mi>=3){run=false;lvEnd(false);}else message();},ok?900:1700);}});
  A.every(tick,250);intro();
  return function(){run=false;busy=true;};}

/* ---------- registration ---------- */
ArtanExt.game({id:'azimuth',min:10,emoji:'🧭',title:'Азимут',desc:'Компас, карта 1:10 000 і курс від півночі. Знайди орієнтир.',badge:'Юний орієнтувальник',start:startAzimuth});
ArtanExt.game({id:'fake',min:10,emoji:'🕵️',title:'Фейк чи правда',desc:'Гортай повідомлення: розпізнай фейк і небезпечні прохання.',badge:'Медіадетектив',start:startFake});
ArtanExt.game({id:'firstaid',min:10,emoji:'🩹',title:'Перша допомога: порядок дій',desc:'Розстав кроки допомоги в правильному порядку.',badge:'Помічник рятувальника',start:startFirstAid});
ArtanExt.game({id:'cipher',min:14,emoji:'📻',title:'Шифр радиста',desc:'Навчальний шифр: фонетична таблиця і зсув Цезаря на час.',badge:'Радист',start:startCipher});
})();
