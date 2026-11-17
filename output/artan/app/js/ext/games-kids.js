/* Artan extension: kids' games (ages 6-9).
   shelter - guide a character to the shelter avoiding glass
   hazard  - find hazards in illustrated scenes
   aidkit  - drag first-aid items into the kit
   puzzle  - assemble the Artan emblem */
(function(){
if(!window.ArtanExt)return;

/* ---------- shared styles ---------- */
function css(){
if(document.getElementById('ext-games-kids'))return;
var s=document.createElement('style');s.id='ext-games-kids';
s.textContent=[
'.x-gk-hud{display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:600}',
'.x-gk-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--sf2);border:1px solid var(--ln);font-size:13px}',
'.x-gk-snd{min-height:40px;padding:0 12px;font-size:13px;border-radius:999px}',
'.x-gk-tip{min-height:52px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;border-radius:12px;padding:8px 12px;background:var(--sf);border:1px solid var(--ln);color:var(--mu);font-size:14px;transition:background .3s,border-color .3s,color .3s}',
'.x-gk-tip.ok{background:#1B2A1C;border-color:var(--ok);color:#B9E6BB;animation:pop .3s var(--ease)}',
'.x-gk-tip.no{background:#2C1B18;border-color:var(--bad);color:#F6B9AD;animation:shake .35s}',
'.x-gk-tip.info{background:#2A2614;border-color:rgba(242,194,48,.6);color:var(--tx);animation:pop .3s var(--ease)}',
/* siren */
'.x-gk-siren{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--mu)}',
'.x-gk-siren i{width:12px;height:12px;border-radius:50%;background:var(--ln);position:relative}',
'.x-gk-siren.on{color:var(--ye)}.x-gk-siren.on i{background:var(--ye);animation:x-gk-blink .9s ease-in-out infinite}',
'.x-gk-siren.on i:after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--ye);animation:pulse 1.2s ease-out infinite}',
'@keyframes x-gk-blink{50%{opacity:.35}}',
/* maze */
'.x-gk-maze{position:relative;display:grid;gap:3px;padding:6px;border-radius:18px;border:1px solid var(--ln);background:radial-gradient(circle at 50% 30%,#1C2015,#0E100B);touch-action:none;user-select:none;-webkit-user-select:none;margin:0 auto;width:100%}',
'.x-gk-c{position:relative;aspect-ratio:1;border-radius:8px;background:#1A1D15;box-shadow:inset 0 0 0 1px #23271D}',
'.x-gk-c.w{background:linear-gradient(180deg,#4A523C,#30362A);box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 2px 0 #12140E}',
'.x-gk-c svg{position:absolute;inset:0;width:100%;height:100%;display:block}',
'.x-gk-c.g.hit{animation:x-gk-flash .6s ease}',
'@keyframes x-gk-flash{0%,100%{filter:none}30%{filter:brightness(1.8) drop-shadow(0 0 6px #EE8D7C)}}',
'.x-gk-c.h svg .x-gk-glow{animation:x-gk-glow 1.6s ease-in-out infinite}',
'@keyframes x-gk-glow{50%{opacity:.25}}',
'.x-gk-shine{animation:x-gk-shine 3s ease-in-out infinite}',
'@keyframes x-gk-shine{0%,60%{transform:translateX(-30px)}100%{transform:translateX(40px)}}',
'.x-gk-pl{position:absolute;left:6px;top:6px;z-index:2;transition:transform .2s cubic-bezier(.3,.9,.3,1);pointer-events:none}',
'.x-gk-pl svg{width:100%;height:100%;display:block;overflow:visible}',
'.x-gk-pl .x-gk-body{transform-origin:20px 36px;animation:x-gk-breathe 2.4s ease-in-out infinite}',
'.x-gk-pl.hop .x-gk-body{animation:x-gk-hop .22s cubic-bezier(.3,.9,.3,1)}',
'.x-gk-pl.bump .x-gk-body{animation:x-gk-bump .3s ease}',
'.x-gk-pl.in .x-gk-body{animation:x-gk-in .6s cubic-bezier(.6,0,.8,.4) forwards}',
'.x-gk-pl .x-gk-eyes{transform-origin:20px 12px;animation:x-gk-wink 4s infinite}',
'.x-gk-pl .x-gk-flip{transform-origin:20px 20px;transition:transform .15s}',
'.x-gk-pl.l .x-gk-flip{transform:scaleX(-1)}',
'@keyframes x-gk-breathe{50%{transform:scale(1.03,.97)}}',
'@keyframes x-gk-hop{0%{transform:scale(1.12,.86)}45%{transform:translateY(-7px) scale(.92,1.1)}80%{transform:scale(1.08,.92)}100%{transform:none}}',
'@keyframes x-gk-bump{30%{transform:scale(.9,1.08) rotate(-6deg)}60%{transform:scale(1.05,.95) rotate(4deg)}}',
'@keyframes x-gk-in{30%{transform:translateY(-6px) scale(.95,1.08)}100%{transform:translateY(6px) scale(.2);opacity:0}}',
'@keyframes x-gk-wink{0%,92%,100%{transform:none}95%{transform:scaleY(.1)}}',
'.x-gk-pad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,56px);gap:8px;justify-content:center}',
'.x-gk-pad button{min-height:0;padding:0;font-size:22px;border-radius:16px}',
'.x-gk-pad [data-x="u"]{grid-column:2}.x-gk-pad [data-x="l"]{grid-column:1;grid-row:2}.x-gk-pad [data-x="d"]{grid-column:2;grid-row:2}.x-gk-pad [data-x="r"]{grid-column:3;grid-row:2}',
'.x-gk-legend{display:flex;justify-content:center;gap:16px;font-size:12.5px;color:var(--mu)}.x-gk-legend span{display:inline-flex;align-items:center;gap:6px}.x-gk-legend svg{width:22px;height:22px;border-radius:5px}',
'.x-gk-lv{display:flex;gap:6px}.x-gk-lv i{width:22px;height:6px;border-radius:4px;background:var(--sf2);transition:background .4s}.x-gk-lv i.on{background:var(--ye)}',
/* hazard scenes */
'.x-gk-scene{position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--ln);background:#11130E;box-shadow:0 18px 40px -20px #000}',
'.x-gk-scene svg{display:block;width:100%;height:auto;cursor:pointer;touch-action:manipulation}',
'.x-gk-scene.in svg{animation:x-gk-scin .55s var(--ease)}',
'@keyframes x-gk-scin{from{opacity:0;transform:translateX(30px) scale(.98)}to{opacity:1;transform:none}}',
'.x-gk-hz{cursor:pointer}.x-gk-hz:focus{outline:none}.x-gk-hz:focus-visible .x-gk-hit{stroke:var(--ye);stroke-width:2;stroke-dasharray:4 4}',
'.x-gk-hit{fill:transparent;stroke:none}',
'.x-gk-ring{fill:none;stroke:var(--ye);stroke-width:3.5;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .5s ease-out forwards;filter:drop-shadow(0 0 4px rgba(242,194,48,.8))}',
'.x-gk-ok{transform-box:fill-box;transform-origin:center;animation:pop .45s .3s var(--ease) backwards}',
'.x-gk-hintc{fill:none;stroke:#fff;stroke-width:2;stroke-dasharray:6 5;transform-box:fill-box;transform-origin:center;animation:x-gk-hint 1s ease-in-out 3}',
'@keyframes x-gk-hint{0%,100%{opacity:0;transform:scale(1.4)}50%{opacity:1;transform:scale(1)}}',
'.x-gk-rip{fill:none;stroke:#EDEBE2;stroke-width:2;transform-box:fill-box;transform-origin:center;animation:x-gk-rip .6s ease-out forwards}',
'@keyframes x-gk-rip{from{transform:scale(.3);opacity:.9}to{transform:scale(1.6);opacity:0}}',
'.x-gk-heat{animation:x-gk-heat 1.4s ease-in-out infinite}',
'.x-gk-heat:nth-child(2){animation-delay:.45s}.x-gk-heat:nth-child(3){animation-delay:.9s}',
'@keyframes x-gk-heat{0%{transform:translateY(4px);opacity:0}40%{opacity:.9}100%{transform:translateY(-14px);opacity:0}}',
'.x-gk-burn{animation:x-gk-burn 1.2s ease-in-out infinite alternate}',
'@keyframes x-gk-burn{to{opacity:.65}}',
'.x-gk-spark{transform-box:fill-box;transform-origin:center;animation:x-gk-spark .7s steps(2) infinite}',
'@keyframes x-gk-spark{0%{opacity:1;transform:scale(1) rotate(0)}50%{opacity:.2;transform:scale(.6) rotate(30deg)}}',
'.x-gk-curt{transform-box:fill-box;transform-origin:top left;animation:x-gk-curt 2.6s ease-in-out infinite}',
'@keyframes x-gk-curt{50%{transform:skewX(-8deg) scaleX(1.06)}}',
'.x-gk-cloud{animation:x-gk-cloud 9s ease-in-out infinite alternate}',
'@keyframes x-gk-cloud{to{transform:translateX(18px)}}',
'.x-gk-sway{transform-box:fill-box;transform-origin:bottom center;animation:x-gk-sway 3.4s ease-in-out infinite}',
'@keyframes x-gk-sway{50%{transform:rotate(2deg)}}',
'.x-gk-cnt{display:flex;gap:6px}.x-gk-cnt i{width:26px;height:26px;border-radius:50%;border:2px dashed #6E7463;display:inline-flex;align-items:center;justify-content:center;transition:all .3s var(--ease)}',
'.x-gk-cnt i.on{border:2px solid var(--ye);background:var(--ye);animation:bump .35s}',
'.x-gk-cnt i.on:after{content:"";width:9px;height:5px;border-left:2.5px solid #14110A;border-bottom:2.5px solid #14110A;transform:translateY(-1px) rotate(-45deg)}',
/* aid kit */
'.x-gk-kitw{display:flex;align-items:center;justify-content:center;gap:16px;padding:10px;border-radius:18px;border:1px dashed #6E7463;background:radial-gradient(circle at 50% 60%,#1E2318,#12140E);transition:border-color .2s,background .2s}',
'.x-gk-kitw.over{border-color:var(--ye);border-style:solid;background:radial-gradient(circle at 50% 60%,#2A2A16,#12140E)}',
'.x-gk-kit{width:118px;height:96px;flex:none;overflow:visible}',
'.x-gk-kit .x-gk-lid{transform-box:fill-box;transform-origin:50% 100%;transition:transform .3s var(--ease)}',
'.x-gk-kitw.over .x-gk-lid{transform:translateY(-6px) rotate(-8deg)}',
'.x-gk-kit.b{animation:bump .35s}',
'.x-gk-kit.no{animation:shake .35s}',
'.x-gk-items{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
'.x-gk-it{flex-direction:column;min-height:96px;gap:4px;font-size:12.5px;font-weight:500;padding:8px 4px;border-radius:16px;touch-action:none;user-select:none;-webkit-user-select:none;animation:pop .4s var(--ease) backwards;cursor:grab;line-height:1.15}',
'.x-gk-it svg{width:44px;height:44px;display:block;pointer-events:none}',
'.x-gk-it.x-gk-lift{opacity:.25;transform:scale(.92)}',
'.x-gk-it.done{opacity:0;transform:scale(.3);pointer-events:none;transition:opacity .3s,transform .3s}',
'.x-gk-it.no{animation:shake .35s;border-color:var(--bad)}',
'.x-gk-ghost{box-shadow:0 18px 30px -10px rgba(0,0,0,.8);border-color:var(--ye)!important;background:var(--sf2)!important;opacity:1!important;transition:none!important;animation:none!important}',
'.x-gk-slots{display:flex;gap:5px;flex-wrap:wrap;max-width:150px}.x-gk-slots i{width:20px;height:20px;border-radius:6px;border:1.5px dashed #6E7463;transition:all .3s var(--ease)}',
'.x-gk-slots i.on{background:var(--ok);border:1.5px solid var(--ok);animation:bump .35s}',
/* puzzle */
'.x-gk-modes{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
'.x-gk-mode{flex-direction:column;min-height:170px;gap:8px;padding:14px;border-radius:18px}',
'.x-gk-mode .x-gk-mini{width:84px;height:84px;display:grid;gap:2px;border-radius:10px;overflow:hidden}',
'.x-gk-mode .x-gk-mini i{background:#2A2F21}',
'.x-gk-mode b{font-family:Oswald,sans-serif;font-size:22px;color:var(--ye)}',
'.x-gk-board{position:relative;display:grid;gap:3px;padding:6px;border-radius:18px;border:1px solid var(--ln);background:#0E100B;width:100%;max-width:340px;margin:0 auto;aspect-ratio:1;transition:gap .5s var(--ease),padding .5s var(--ease)}',
'.x-gk-board:before{content:"";position:absolute;inset:6px;border-radius:12px;background:url(img/emblem.png) center/contain no-repeat,radial-gradient(circle,#2A2F21,#14160F 70%);opacity:.22;transition:opacity .25s;pointer-events:none}',
'.x-gk-board.peek:before{opacity:.75}',
'.x-gk-slot{position:relative;border-radius:6px;box-shadow:inset 0 0 0 1px rgba(195,199,154,.18);transition:box-shadow .2s,background .2s}',
'.x-gk-slot.tgt{box-shadow:inset 0 0 0 2px var(--ye);background:rgba(242,194,48,.08)}',
'.x-gk-slot.no{animation:shake .35s;box-shadow:inset 0 0 0 2px var(--bad)}',
'.x-gk-pc{display:block;padding:0;min-height:0;border-radius:6px;border:1px solid rgba(237,235,226,.25);background-repeat:no-repeat;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;box-shadow:0 6px 14px -8px #000}',
'.x-gk-slot .x-gk-pc{position:absolute;inset:0;width:100%;height:100%;cursor:default;animation:x-gk-snap .35s var(--ease)}',
'@keyframes x-gk-snap{0%{transform:scale(1.15)}60%{transform:scale(.96)}100%{transform:none}}',
'.x-gk-tray{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px}',
'.x-gk-tray .x-gk-pc{animation:pop .4s var(--ease) backwards}',
'.x-gk-pc.sel{border-color:var(--ye);box-shadow:0 0 0 3px rgba(242,194,48,.45),0 10px 18px -8px #000;transform:translateY(-4px)}',
'.x-gk-pc.x-gk-lift{opacity:.2}',
'.x-gk-board.win{gap:0;padding:6px}.x-gk-board.win .x-gk-pc{border-color:transparent;border-radius:0;box-shadow:none}',
'.x-gk-board.win:after{content:"";position:absolute;inset:0;border-radius:18px;background:linear-gradient(110deg,transparent 30%,rgba(255,240,190,.35) 50%,transparent 70%);background-size:250% 100%;animation:x-gk-sweep 1.2s .3s ease-out both;pointer-events:none}',
'@keyframes x-gk-sweep{from{background-position:120% 0}to{background-position:-60% 0}}',
'.x-gk-peek{touch-action:none}'
].join('\n');
document.head.appendChild(s);}

function q(s,r){return r.querySelector(s);}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

/* ---------- gentle sounds (WebAudio) ---------- */
function Sound(){
var ctx=null,on=true;
function c(){if(!on)return null;try{if(!ctx){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();}if(ctx.state==='suspended')ctx.resume();}catch(e){return null;}return ctx;}
function tone(f,d,type,vol,delay){var x=c();if(!x)return;try{var t=x.currentTime+(delay||0),o=x.createOscillator(),g=x.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.06,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(x.destination);o.start(t);o.stop(t+d+.05);}catch(e){}}
return{
siren:function(){var x=c();if(!x)return;try{var t=x.currentTime,o=x.createOscillator(),g=x.createGain(),lp=x.createBiquadFilter();o.type='triangle';lp.type='lowpass';lp.frequency.value=1400;
o.frequency.setValueAtTime(480,t);for(var k=0;k<2;k++){o.frequency.linearRampToValueAtTime(760,t+k*1.4+.7);o.frequency.linearRampToValueAtTime(480,t+k*1.4+1.4);}
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.3);g.gain.setValueAtTime(.05,t+2.3);g.gain.linearRampToValueAtTime(0,t+2.8);
o.connect(lp);lp.connect(g);g.connect(x.destination);o.start(t);o.stop(t+2.9);}catch(e){}},
ok:function(){tone(660,.18,'sine',.06);tone(990,.25,'sine',.05,.09);},
no:function(){tone(220,.22,'sine',.05);},
step:function(){tone(420,.06,'sine',.025);},
win:function(){tone(523,.2,'sine',.06);tone(659,.2,'sine',.06,.12);tone(784,.35,'sine',.06,.24);},
toggle:function(){on=!on;return on;},
isOn:function(){return on;},
close:function(){try{if(ctx)ctx.close();}catch(e){}ctx=null;}
};}

/* ---------- drag helper (pointer events, mouse + touch) ---------- */
function Dragger(){
var live=[];
function ghostOf(el){var r=el.getBoundingClientRect(),g=el.cloneNode(true);g.removeAttribute('id');g.classList.add('x-gk-ghost');g.classList.remove('sel');g.setAttribute('aria-hidden','true');
g.style.cssText+=';position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;margin:0;z-index:60;pointer-events:none;will-change:transform';document.body.appendChild(g);live.push(g);return{g:g,r:r};}
function kill(g){var i=live.indexOf(g);if(i>-1)live.splice(i,1);if(g.parentNode)g.parentNode.removeChild(g);}
/* fly ghost along an arc to (x,y) viewport center point */
function fly(gh,x,y,cb){var g=gh.g,r=gh.r,cur=g.style.transform||'translate(0px,0px)',tx=x-(r.left+r.width/2),ty=y-(r.top+r.height/2),mx=tx/2,my=Math.min(ty,0)/2-60;
if(!g.animate){kill(g);if(cb)cb();return;}
var a=g.animate([{transform:cur},{transform:'translate('+mx+'px,'+my+'px) rotate(-8deg) scale(.9)',offset:.5},{transform:'translate('+tx+'px,'+ty+'px) scale(.3)',opacity:.3}],{duration:480,easing:'cubic-bezier(.45,0,.3,1)',fill:'forwards'});
a.onfinish=function(){kill(g);if(cb)cb();};}
function home(gh,cb){var g=gh.g;if(!g.animate){kill(g);if(cb)cb();return;}
var a=g.animate([{transform:g.style.transform||'none'},{transform:'translate(0px,0px) scale(1)'}],{duration:380,easing:'cubic-bezier(.2,1.3,.4,1)',fill:'forwards'});a.onfinish=function(){kill(g);if(cb)cb();};}
function bind(el,o){
var off=null;
function down(e){if(e.button>0||(o.can&&!o.can()))return;e.preventDefault();var sx=e.clientX,sy=e.clientY,gh=null,lx=sx,vx=0;
function mv(ev){var dx=ev.clientX-sx,dy=ev.clientY-sy;
if(!gh){if(dx*dx+dy*dy<81)return;gh=ghostOf(el);el.classList.add('x-gk-lift');if(o.start)o.start();}
vx=vx*.7+(ev.clientX-lx)*.3;lx=ev.clientX;
gh.g.style.transform='translate('+dx+'px,'+dy+'px) rotate('+clamp(vx*1.6,-16,16)+'deg) scale(1.08)';
if(o.move)o.move(ev.clientX,ev.clientY);}
function up(ev){stop();if(!gh){if(o.tap)o.tap();return;}el.classList.remove('x-gk-lift');o.drop(ev.clientX,ev.clientY,gh);}
function stop(){window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);var i=live.indexOf(off);if(i>-1)live.splice(i,1);off=null;}
off=stop;live.push(stop);
window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);}
el.addEventListener('pointerdown',down);
el.addEventListener('click',function(e){if(e.detail===0&&o.tap&&(!o.can||o.can()))o.tap();});/* keyboard */
}
return{bind:bind,ghostOf:ghostOf,fly:fly,home:home,
clean:function(){live.slice().forEach(function(x){if(typeof x==='function')x();else kill(x);});live=[];}};}

function hit(r,x,y,pad){pad=pad||0;return x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad;}

/* ======================================================================
   1. SHELTER MAZE
   ====================================================================== */
var LEVELS=[
['#######','#S..#H#','#.#.#.#','#.#...#','#G##G.#','#.....#','#######'],
['#######','#S..G.#','###.#.#','#...#.#','#.###G#','#..G..#','##.##.#','#G...H#','#######'],
['#######','#S.G..#','#.#.#.#','#.#...#','#...#G#','##.#..#','#.....#','#G#.#.#','#.G.#H#','#######']
];
var KID='<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="37.5" rx="10" ry="2.4" fill="rgba(0,0,0,.45)"/><g class="x-gk-flip"><g class="x-gk-body">'+
'<rect x="9" y="18" width="8" height="12" rx="3" fill="#6B7446"/><rect x="14" y="30" width="4.5" height="6.5" rx="2" fill="#3B4A6B"/><rect x="21.5" y="30" width="4.5" height="6.5" rx="2" fill="#3B4A6B"/>'+
'<rect x="12" y="17" width="16" height="15" rx="7" fill="#F2C230"/><path d="M20 18v13" stroke="#C99A16" stroke-width="1.2"/><rect x="25" y="20" width="4" height="9" rx="2" fill="#E3B122"/>'+
'<circle cx="20" cy="11.5" r="8" fill="#F1C9A5"/><path d="M12 11c0-5 3.6-8 8-8s8 3 8 8c-2-2-5-3-8-3s-6 1-8 3z" fill="#5A3B22"/>'+
'<g class="x-gk-eyes"><circle cx="17.3" cy="12" r="1.25" fill="#1A1A1A"/><circle cx="23" cy="12" r="1.25" fill="#1A1A1A"/></g>'+
'<circle cx="15.5" cy="14.6" r="1.3" fill="#F29C8C" opacity=".6"/><circle cx="24.6" cy="14.6" r="1.3" fill="#F29C8C" opacity=".6"/><path d="M18 15.3q2 1.6 4 0" stroke="#7A3B2A" stroke-width="1.1" fill="none" stroke-linecap="round"/>'+
'</g></g></svg>';
var GLASS='<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="0" y="0" width="40" height="40" rx="8" fill="#1A1D15"/><rect x="5" y="5" width="30" height="30" rx="3" fill="#2B4250" stroke="#9CC3D4" stroke-width="2.4"/><path d="M20 5v30M5 20h30" stroke="#9CC3D4" stroke-width="2"/>'+
'<clipPath id="x-gk-gc"><rect x="6" y="6" width="28" height="28"/></clipPath><g clip-path="url(#x-gk-gc)"><path class="x-gk-shine" d="M8 30L22 6h5L13 30z" fill="rgba(255,255,255,.28)"/></g>'+
'<path d="M26 26l4 3M26 26l-2 4M26 26l4-1" stroke="#EE8D7C" stroke-width="1.4" stroke-linecap="round"/></svg>';
var DOOR='<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="0" y="0" width="40" height="40" rx="8" fill="#16241A"/><rect class="x-gk-glow" x="2" y="2" width="36" height="36" rx="7" fill="none" stroke="#7BC47F" stroke-width="2"/>'+
'<rect x="9" y="8" width="22" height="27" rx="3" fill="#2F5A36" stroke="#7BC47F" stroke-width="1.6"/><path d="M14 16h6v5h5v5h-6" fill="none" stroke="#EDEBE2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 28l-3 -2.2 3-2.2" fill="none" stroke="#EDEBE2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-90 20.5 26)"/><circle cx="27" cy="22" r="1.3" fill="#F2C230"/></svg>';

function startShelter(box,A){
css();var snd=Sound(),lv=0,mist=0,steps=0,busy=false,over=false,grid,R,C,px,py,cells=[],root,maze,pl,tip,sx=0,sy=0,pid=null;
box.innerHTML='<div class="view stack" id="x-gk-sh">'+A.gHead('Шлях до укриття','Лунає сирена! Проведи друга до укриття. Від вікон і скла тримаємося подалі.')+
'<div class="x-gk-hud"><span class="x-gk-siren" id="x-gk-sir" role="status"><i></i><span>Тривога</span></span><span class="x-gk-lv" aria-hidden="true"><i></i><i></i><i></i></span><button class="ghost x-gk-snd" data-x="snd" aria-pressed="true">Звук: так</button></div>'+
'<div class="x-gk-maze" id="x-gk-mz" role="application" aria-label="Лабіринт. Керуй стрілками, свайпом або кнопками."></div>'+
'<div class="x-gk-legend"><span>'+DOOR+'Укриття</span><span>'+GLASS+'Вікно — обходь</span></div>'+
'<div class="x-gk-tip" id="x-gk-tip" role="status" aria-live="polite">Свайпни, торкнись поруч із другом або натисни стрілку</div>'+
'<div class="x-gk-pad"><button data-x="u" aria-label="Вгору">↑</button><button data-x="l" aria-label="Ліворуч">←</button><button data-x="d" aria-label="Вниз">↓</button><button data-x="r" aria-label="Праворуч">→</button></div></div>';
root=q('#x-gk-sh',box);maze=q('#x-gk-mz',box);tip=q('#x-gk-tip',box);
function say(t,k){tip.className='x-gk-tip'+(k?' '+k:'');void tip.offsetWidth;tip.textContent=t;}
function build(){grid=LEVELS[lv];R=grid.length;C=grid[0].length;cells=[];
var h='';for(var y=0;y<R;y++)for(var x=0;x<C;x++){var t=grid[y][x];if(t==='S'){px=x;py=y;}
h+='<div class="x-gk-c'+(t==='#'?' w':t==='G'?' g':t==='H'?' h':'')+'" data-t="'+t+'">'+(t==='G'?GLASS:t==='H'?DOOR:'')+'</div>';}
maze.style.gridTemplateColumns='repeat('+C+',1fr)';maze.style.maxWidth=(C*52)+'px';
maze.innerHTML=h+'<div class="x-gk-pl" id="x-gk-pl">'+KID+'</div>';pl=q('#x-gk-pl',maze);cells=maze.querySelectorAll('.x-gk-c');
var lvs=root.querySelectorAll('.x-gk-lv i');for(var i=0;i<lvs.length;i++)lvs[i].className=i<=lv?'on':'';
place(true);busy=false;
var sir=q('#x-gk-sir',root);sir.className='x-gk-siren on';q('span',sir).textContent='Тривога · рівень '+(lv+1);snd.siren();
A.later(function(){if(!over)sir.className='x-gk-siren';},2800);
say(lv===0?'Сирена! Спокійно йдемо в укриття — не біжимо до вікон.':lv===1?'Молодець! Новий будинок — знову шукай шлях без вікон.':'Останній рівень. Ти вже справжній захисник!','info');}
function place(now){var c=cells[0];if(!c)return;var w=c.offsetWidth,g=3;pl.style.width=w+'px';pl.style.height=w+'px';
if(now){pl.style.transition='none';}pl.style.transform='translate('+(px*(w+g))+'px,'+(py*(w+g))+'px)';if(now){void pl.offsetWidth;pl.style.transition='';}}
function anim(cls){pl.classList.remove('hop','bump');void pl.offsetWidth;pl.classList.add(cls);}
function move(dx,dy){if(busy||over)return;if(dx)pl.classList.toggle('l',dx<0);
var nx=px+dx,ny=py+dy,t=(grid[ny]||'')[nx];
if(!t||t==='#'){anim('bump');return;}
if(t==='G'){mist++;anim('bump');snd.no();var gc=cells[ny*C+nx];gc.classList.remove('hit');void gc.offsetWidth;gc.classList.add('hit');
say(['Ой, тут вікно! Скло може розбитися — шукай інший шлях.','Обережно, скло! Під час тривоги від вікон тримаємося далі.','Вікно — не наш шлях. Спробуй обійти!'][mist%3],'no');return;}
px=nx;py=ny;steps++;place();anim('hop');snd.step();
if(t==='H'){busy=true;A.later(function(){pl.classList.add('in');snd.ok();say('Ти в укритті! Тут безпечно.','ok');},220);
A.later(function(){lv++;if(lv>=LEVELS.length)fin();else build();},1500);}}
function fin(){if(over)return;over=true;snd.win();var pts=clamp(40-mist*5,10,40);
A.gEnd(box,'shelter','Шлях до укриття','Усі 3 рівні пройдено! Помилок біля вікон: '+mist+'. Пам\'ятай: під час тривоги — в укриття, подалі від вікон.',pts,mist<=2);}
function key(e){var k=e.key,m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[k];if(!m||over||!document.body.contains(maze))return;e.preventDefault();move(m[0],m[1]);}
window.addEventListener('keydown',key);
function rs(){if(!over&&document.body.contains(maze))place(true);}
window.addEventListener('resize',rs);
maze.addEventListener('pointerdown',function(e){pid=e.pointerId;sx=e.clientX;sy=e.clientY;});
maze.addEventListener('pointerup',function(e){if(pid!==e.pointerId)return;pid=null;var dx=e.clientX-sx,dy=e.clientY-sy;
if(Math.abs(dx)<20&&Math.abs(dy)<20){/* tap: step toward tapped point */var r=pl.getBoundingClientRect();dx=e.clientX-(r.left+r.width/2);dy=e.clientY-(r.top+r.height/2);if(Math.abs(dx)<r.width*.4&&Math.abs(dy)<r.height*.4)return;}
if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1,0);else move(0,dy>0?1:-1);});
root.addEventListener('click',function(e){var b=e.target.closest('[data-x]');if(!b)return;var x=b.getAttribute('data-x');
if(x==='snd'){var on=snd.toggle();b.textContent='Звук: '+(on?'так':'ні');b.setAttribute('aria-pressed',on);return;}
var m={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[x];if(m)move(m[0],m[1]);});
build();
return function(){over=true;window.removeEventListener('keydown',key);window.removeEventListener('resize',rs);snd.close();};}

/* ======================================================================
   2. FIND THE HAZARD
   ====================================================================== */
function hz(i,x,y,r,label){return {i:i,x:x,y:y,r:r,label:label};}
var SCENES=[
{name:'Кухня',hz:[
 [hz(0,62,138,34,'Гаряча плита'),'Гаряча плита! Не торкайся конфорок і каструль — можна обпектися.'],
 [hz(1,205,123,24,'Розетка без заглушки'),'Розетка — не іграшка. Нічого не встромляй у неї, мокрими руками не чіпай.'],
 [hz(2,318,190,30,'Шнур чайника звисає'),'Не тягни за шнур чайника — гаряча вода може вилитися.']],
svg:function(){return ''+
'<defs><pattern id="x-gk-tile" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#3A4A44"/><path d="M0 0h20v20" fill="none" stroke="#2E3B36" stroke-width="1.5"/></pattern>'+
'<radialGradient id="x-gk-hot"><stop offset="0" stop-color="#FFE08A"/><stop offset=".55" stop-color="#FF6B2E"/><stop offset="1" stop-color="#C2361C"/></radialGradient>'+
'<linearGradient id="x-gk-sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC7D8"/><stop offset="1" stop-color="#D8E8D9"/></linearGradient></defs>'+
'<rect width="360" height="240" fill="#2F3D38"/><rect y="88" width="360" height="62" fill="url(#x-gk-tile)"/>'+
/* window */
'<rect x="18" y="12" width="96" height="64" rx="5" fill="#E9E3D2"/><rect x="24" y="18" width="84" height="52" rx="2" fill="url(#x-gk-sky1)"/><g class="x-gk-cloud"><ellipse cx="50" cy="34" rx="14" ry="6" fill="#fff" opacity=".85"/><ellipse cx="62" cy="31" rx="9" ry="6" fill="#fff" opacity=".85"/></g><path d="M66 18v52M24 44h84" stroke="#E9E3D2" stroke-width="4"/>'+
'<path d="M30 70q4-10 10-6 3-10 10-3" fill="#6FA35A"/>'+
/* upper cabinets */
'<rect x="140" y="8" width="210" height="62" rx="4" fill="#7A5E42"/><path d="M210 8v62M280 8v62" stroke="#5E4732" stroke-width="2"/><g fill="#D9C9A6"><rect x="200" y="34" width="4" height="14" rx="2"/><rect x="216" y="34" width="4" height="14" rx="2"/><rect x="286" y="34" width="4" height="14" rx="2"/></g>'+
/* counter + lower cabinets */
'<rect x="0" y="150" width="360" height="90" fill="#6B5240"/><path d="M200 162v78M270 162v78" stroke="#55402F" stroke-width="2"/><g fill="#D9C9A6"><rect x="190" y="176" width="4" height="16" rx="2"/><rect x="208" y="176" width="4" height="16" rx="2"/><rect x="278" y="176" width="4" height="16" rx="2"/></g>'+
'<rect x="0" y="146" width="360" height="10" rx="2" fill="#D6CFBB"/>'+
/* stove */
'<rect x="20" y="146" width="120" height="94" fill="#DCD9D0"/><rect x="20" y="146" width="120" height="8" fill="#BDB9AE"/><rect x="32" y="178" width="96" height="50" rx="5" fill="#3B3D3A"/><rect x="40" y="186" width="80" height="20" rx="3" fill="#565B55" opacity=".7"/>'+
'<g fill="#8A877E"><circle cx="40" cy="166" r="4"/><circle cx="60" cy="166" r="4"/><circle cx="100" cy="166" r="4"/><circle cx="120" cy="166" r="4"/></g>'+
'<ellipse cx="60" cy="148" rx="22" ry="5" fill="#2A2A28"/><ellipse class="x-gk-burn" cx="60" cy="147" rx="19" ry="3.6" fill="url(#x-gk-hot)"/>'+
'<g fill="none" stroke="#FF9A5A" stroke-width="2.4" stroke-linecap="round"><path class="x-gk-heat" d="M50 136q-4-5 0-10t0-10"/><path class="x-gk-heat" d="M60 134q-4-5 0-10t0-10"/><path class="x-gk-heat" d="M70 136q-4-5 0-10t0-10"/></g>'+
'<ellipse cx="108" cy="148" rx="20" ry="4.5" fill="#2A2A28"/><rect x="90" y="120" width="38" height="28" rx="5" fill="#8EA0AC"/><rect x="88" y="117" width="42" height="6" rx="3" fill="#A9B8C2"/><rect x="104" y="111" width="10" height="6" rx="3" fill="#5D6D78"/>'+
/* socket */
'<rect x="190" y="108" width="30" height="30" rx="7" fill="#F1EFE8" stroke="#BDB9AE"/><circle cx="205" cy="123" r="10" fill="#E2DFD6"/><circle cx="200.5" cy="123" r="2.6" fill="#2A2A28"/><circle cx="209.5" cy="123" r="2.6" fill="#2A2A28"/>'+
/* cutting board + plant */
'<rect x="230" y="128" width="34" height="20" rx="5" fill="#C99B62"/><circle cx="257" cy="138" r="3" fill="#A87B48"/>'+
'<rect x="160" y="130" width="16" height="16" rx="3" fill="#B86A4A"/><g class="x-gk-sway"><path d="M168 130q-10-14 0-22 10 8 0 22zM168 130q-14-4-12-14 10 2 12 14zM168 130q14-4 12-14-10 2-12 14z" fill="#6FA35A"/></g>'+
/* kettle with dangling cord */
'<path d="M282 146l4-30q12-6 24 0l4 30z" fill="#C8D3D8"/><path d="M286 116q12-8 24 0" stroke="#9AA8AE" stroke-width="3" fill="none"/><path d="M314 124q10 2 6 14" stroke="#9AA8AE" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M282 130l-8-6" stroke="#9AA8AE" stroke-width="4" stroke-linecap="round"/><rect x="290" y="128" width="16" height="6" rx="3" fill="#7BC47F" opacity=".7"/>'+
'<path d="M312 146q14 2 10 20t-6 28q-2 12 6 20" fill="none" stroke="#2E2E2C" stroke-width="3" stroke-linecap="round"/><rect x="316" y="212" width="12" height="14" rx="3" fill="#F1EFE8" stroke="#888"/>';}},
{name:'Кімната',hz:[
 [hz(0,70,92,44,'Відчинене вікно на висоті'),'Не підходь до відчиненого вікна і не сідай на підвіконня.'],
 [hz(1,156,163,24,'Сірники на столі'),'Сірники й запальнички — не іграшки. Віддай їх дорослим.'],
 [hz(2,232,214,26,'Розсипані ліки'),'Ліки дає тільки дорослий. Ніколи не куштуй таблетки сам.']],
svg:function(){return ''+
'<defs><linearGradient id="x-gk-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FB2CF"/><stop offset="1" stop-color="#CDE3E6"/></linearGradient></defs>'+
'<rect width="360" height="240" fill="#3E3A54"/><rect y="192" width="360" height="48" fill="#5A4433"/><path d="M0 204h360M0 220h360" stroke="#4C392B" stroke-width="2"/><rect y="188" width="360" height="6" fill="#2E2B40"/>'+
/* open window, high floor */
'<rect x="16" y="26" width="108" height="130" rx="4" fill="#E2DCCB"/><rect x="24" y="34" width="92" height="114" fill="url(#x-gk-sky2)"/>'+
'<g class="x-gk-cloud"><ellipse cx="54" cy="56" rx="16" ry="6" fill="#fff" opacity=".9"/><ellipse cx="68" cy="52" rx="10" ry="6" fill="#fff" opacity=".9"/></g>'+
'<g fill="#6E8796"><rect x="26" y="126" width="14" height="22"/><rect x="44" y="118" width="12" height="30"/><rect x="60" y="130" width="18" height="18"/><rect x="82" y="122" width="12" height="26"/><rect x="98" y="132" width="16" height="16"/></g>'+
'<g fill="#9FB4BF"><rect x="29" y="130" width="3" height="3"/><rect x="35" y="130" width="3" height="3"/><rect x="47" y="122" width="3" height="3"/><rect x="47" y="130" width="3" height="3"/><rect x="85" y="126" width="3" height="3"/></g>'+
'<path d="M70 34v114" stroke="#E2DCCB" stroke-width="4"/><path d="M70 36l38-12v128l-38-4z" fill="#BFD8E2" stroke="#E2DCCB" stroke-width="4" opacity=".85"/>'+
'<rect x="10" y="154" width="120" height="8" rx="3" fill="#CFC8B6"/>'+
'<path class="x-gk-curt" d="M124 20h22q-6 40 2 80t-6 64h-18z" fill="#C9A24A"/><rect x="10" y="16" width="140" height="6" rx="3" fill="#8B7A5A"/>'+
/* picture + lamp */
'<rect x="196" y="40" width="58" height="42" rx="3" fill="#C9A24A"/><rect x="201" y="45" width="48" height="32" fill="#6E9DB0"/><path d="M201 77l14-14 10 8 10-12 14 18z" fill="#5E8C4A"/><circle cx="238" cy="54" r="4" fill="#F2C230"/>'+
'<path d="M318 60h22l-6-20h-10z" fill="#E8D9A8"/><rect x="327" y="60" width="4" height="70" fill="#8B7A5A"/>'+
/* sofa with teddy */
'<rect x="200" y="112" width="150" height="40" rx="12" fill="#5C7A6A"/><rect x="190" y="132" width="170" height="48" rx="12" fill="#6E8F7C"/><rect x="186" y="128" width="20" height="56" rx="9" fill="#5C7A6A"/><rect x="346" y="128" width="14" height="56" rx="7" fill="#5C7A6A"/><rect x="200" y="180" width="8" height="10" fill="#3B2E22"/><rect x="340" y="180" width="8" height="10" fill="#3B2E22"/>'+
'<g transform="translate(296 108)"><circle cx="0" cy="12" r="12" fill="#B9844C"/><circle cx="0" cy="-4" r="9" fill="#C99460"/><circle cx="-7" cy="-11" r="3.5" fill="#C99460"/><circle cx="7" cy="-11" r="3.5" fill="#C99460"/><circle cx="-3" cy="-5" r="1.3" fill="#222"/><circle cx="3" cy="-5" r="1.3" fill="#222"/><ellipse cx="0" cy="-1" rx="3" ry="2" fill="#E8C9A0"/></g>'+
/* coffee table + matches */
'<rect x="112" y="172" width="96" height="8" rx="3" fill="#8B6A48"/><rect x="120" y="180" width="6" height="22" fill="#6E5236"/><rect x="194" y="180" width="6" height="22" fill="#6E5236"/>'+
'<rect x="132" y="164" width="18" height="10" rx="2" fill="#E6D8B8"/><rect x="134" y="166" width="14" height="6" fill="#7BC47F" opacity=".5"/>'+
'<rect x="148" y="159" width="20" height="13" rx="2" fill="#D84F3A"/><rect x="150" y="161" width="16" height="4" fill="#F2C230"/><g stroke="#E8D9A8" stroke-width="2" stroke-linecap="round"><path d="M166 162l9-5"/><path d="M166 166l10-1"/></g><circle cx="175.5" cy="156.5" r="2" fill="#C2361C"/><circle cx="176.5" cy="165" r="2" fill="#C2361C"/>'+
/* rug + spilled pills */
'<ellipse cx="190" cy="222" rx="80" ry="12" fill="#7E5B8A" opacity=".55"/>'+
'<g transform="rotate(-70 232 212)"><rect x="224" y="204" width="16" height="22" rx="3" fill="#F1EFE8"/><rect x="223" y="200" width="18" height="7" rx="2" fill="#E07B5F"/><rect x="226" y="212" width="12" height="7" fill="#7FB2CF"/></g>'+
'<g fill="#F2C230"><ellipse cx="246" cy="218" rx="3.5" ry="2.2"/><ellipse cx="254" cy="213" rx="3.5" ry="2.2"/></g><g fill="#EDEBE2"><circle cx="250" cy="222" r="2.6"/><circle cx="240" cy="224" r="2.6"/></g>';}},
{name:'Двір',hz:[
 [hz(0,312,200,28,'Незнайомий предмет у траві'),'Незнайомий предмет не чіпай! Відійди й одразу скажи дорослим.'],
 [hz(1,252,150,32,'Обірваний дріт'),'Обірваний дріт може вдарити струмом. Тримайся далеко й клич дорослих.'],
 [hz(2,120,206,30,'Відкритий люк'),'Відкритий люк обходь стороною, не зазирай усередину.']],
svg:function(){return ''+
'<defs><linearGradient id="x-gk-sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#78A9C0"/><stop offset="1" stop-color="#C7DFE0"/></linearGradient></defs>'+
'<rect width="360" height="240" fill="url(#x-gk-sky3)"/><circle cx="40" cy="34" r="16" fill="#F7D774"/>'+
'<g class="x-gk-cloud"><ellipse cx="120" cy="30" rx="20" ry="7" fill="#fff" opacity=".9"/><ellipse cx="136" cy="26" rx="12" ry="7" fill="#fff" opacity=".9"/><ellipse cx="290" cy="22" rx="16" ry="6" fill="#fff" opacity=".8"/></g>'+
/* house */
'<rect x="8" y="64" width="112" height="100" fill="#C9B79A"/><path d="M0 68l64-36 64 36z" fill="#8A5A44"/><g fill="#5F86A0" stroke="#EDE3CF" stroke-width="3"><rect x="22" y="82" width="26" height="24"/><rect x="80" y="82" width="26" height="24"/><rect x="22" y="120" width="26" height="24"/></g><rect x="78" y="120" width="28" height="44" rx="2" fill="#6B4A34"/><circle cx="100" cy="143" r="2" fill="#F2C230"/>'+
/* grass */
'<path d="M0 160q90-10 180 0t180 0v80H0z" fill="#5E8C4A"/><path d="M0 182q90-8 180 0t180 0v58H0z" fill="#6A9A52"/>'+
/* tree */
'<rect x="332" y="96" width="10" height="70" fill="#6B4A34"/><g class="x-gk-sway"><circle cx="337" cy="86" r="26" fill="#4E7E3E"/><circle cx="320" cy="100" r="16" fill="#5A8E48"/><circle cx="354" cy="102" r="14" fill="#5A8E48"/></g>'+
/* path */
'<path d="M92 164q10 30-30 76h70q20-40 10-76z" fill="#B9A98A" opacity=".75"/>'+
/* pole + wires */
'<rect x="226" y="36" width="8" height="132" rx="2" fill="#6E5A44"/><rect x="214" y="44" width="32" height="5" rx="2" fill="#6E5A44"/>'+
'<path d="M120 50q50 16 96-4" stroke="#2E2E2C" stroke-width="2" fill="none"/><path d="M244 46q30 10 60 4" stroke="#2E2E2C" stroke-width="2" fill="none"/>'+
'<path d="M244 46q22 30 6 64t10 64" stroke="#2E2E2C" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+
'<g class="x-gk-spark" transform="translate(260 174)"><path d="M0-9l2 6 7-3-5 6 6 4-7 0 0 7-3-6-6 4 2-7-6-2 7-2z" fill="#F7D774"/></g>'+
/* ball (safe) */
'<circle cx="190" cy="198" r="11" fill="#E0614A"/><path d="M179 198h22M190 187q6 11 0 22" stroke="#F1EFE8" stroke-width="2" fill="none"/>'+
/* open manhole */
'<ellipse cx="120" cy="208" rx="24" ry="9" fill="#5B5A55"/><ellipse cx="120" cy="208" rx="19" ry="6.5" fill="#141412"/><ellipse cx="152" cy="222" rx="18" ry="6" fill="#7A7870"/><path d="M140 222h24M146 218h12M146 226h12" stroke="#5B5A55" stroke-width="1.6"/>'+
/* unknown object in grass */
'<g transform="rotate(-18 312 200)"><rect x="294" y="192" width="38" height="16" rx="7" fill="#7D8278"/><rect x="294" y="192" width="38" height="5" rx="2.5" fill="#9AA095"/><rect x="330" y="195" width="6" height="10" rx="2" fill="#5E625A"/></g>'+
'<g fill="#4E7E3E"><path d="M292 214l4-16 3 16zM302 216l3-14 4 14zM318 214l4-18 3 18zM330 212l3-12 3 12z"/></g>';}}
];

function startHazard(box,A){
css();var snd=Sound(),si=0,found=0,total=0,miss=0,hints=0,over=false,sc,tip,root,got={},wait=false;
SCENES.forEach(function(s){total+=s.hz.length;});
box.innerHTML='<div class="view stack" id="x-gk-hzr">'+A.gHead('Знайди небезпеку','Уважно роздивись малюнок і торкнись усього, що може бути небезпечним.')+
'<div class="x-gk-hud"><span class="x-gk-pill" id="x-gk-nm"></span><span class="x-gk-cnt" id="x-gk-cn" role="status"></span></div>'+
'<div class="x-gk-scene" id="x-gk-sc"></div><div class="x-gk-tip" id="x-gk-tip" role="status" aria-live="polite"></div>'+
'<div class="grid2"><button class="ghost" data-x="hint">Підказка</button><button class="pri" data-x="next" disabled>Далі →</button></div></div>';
root=q('#x-gk-hzr',box);sc=q('#x-gk-sc',box);tip=q('#x-gk-tip',box);
function say(t,k){tip.className='x-gk-tip'+(k?' '+k:'');void tip.offsetWidth;tip.textContent=t;}
function count(){var s=SCENES[si],h='';for(var i=0;i<s.hz.length;i++)h+='<i class="'+(got[si+'-'+i]?'on':'')+'"></i>';var c=q('#x-gk-cn',root);c.innerHTML=h;c.setAttribute('aria-label','Знайдено '+n()+' з '+s.hz.length);}
function n(){var k=0;SCENES[si].hz.forEach(function(_,i){if(got[si+'-'+i])k++;});return k;}
function show(){var s=SCENES[si];wait=false;q('#x-gk-nm',root).textContent=s.name+' · '+(si+1)+' / '+SCENES.length;
var h='<svg viewBox="0 0 360 240" role="img" aria-label="'+s.name+': знайди '+s.hz.length+' небезпеки">'+s.svg()+'<g id="x-gk-fx"></g>';
s.hz.forEach(function(z){var d=z[0];h+='<g class="x-gk-hz" data-h="'+d.i+'" tabindex="0" role="button" aria-label="'+d.label+'"><circle class="x-gk-hit" cx="'+d.x+'" cy="'+d.y+'" r="'+d.r+'"/></g>';});
sc.innerHTML=h+'</svg>';sc.classList.remove('in');void sc.offsetWidth;sc.classList.add('in');
q('[data-x="next"]',root).disabled=true;count();say('Знайди '+s.hz.length+' небезпеки на малюнку','');}
function svgPt(svg,cx,cy){var p=svg.createSVGPoint();p.x=cx;p.y=cy;var m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):{x:0,y:0};}
function fx(h){var g=q('#x-gk-fx',sc);g.insertAdjacentHTML('beforeend',h);return g.lastChild;}
function pick(i){var key=si+'-'+i,z=SCENES[si].hz[i];if(got[key]||over)return;got[key]=true;found++;snd.ok();
var d=z[0],ex=d.x+d.r*.72,ey=d.y-d.r*.72;
fx('<g><circle class="x-gk-ring" pathLength="1" cx="'+d.x+'" cy="'+d.y+'" r="'+d.r+'"/><g class="x-gk-ok"><circle cx="'+ex+'" cy="'+ey+'" r="9" fill="#7BC47F" stroke="#0E100B" stroke-width="2"/><path d="M'+(ex-4)+' '+ey+'l3 3 5-6" stroke="#0E100B" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>');
var hg=q('[data-h="'+i+'"]',sc);if(hg){hg.setAttribute('aria-label',d.label+' — знайдено');hg.style.pointerEvents='none';}
say(z[1],'ok');count();
if(n()===SCENES[si].hz.length){wait=true;var nb=q('[data-x="next"]',root);nb.disabled=false;nb.textContent=si<SCENES.length-1?'Далі →':'Завершити';}}
sc.addEventListener('click',function(e){if(over)return;var g=e.target.closest('.x-gk-hz');if(g){pick(+g.getAttribute('data-h'));return;}
var svg=q('svg',sc);if(!svg||wait)return;var p=svgPt(svg,e.clientX,e.clientY);miss++;snd.no();
var r=fx('<circle class="x-gk-rip" cx="'+p.x+'" cy="'+p.y+'" r="14"/>');A.later(function(){if(r&&r.parentNode)r.parentNode.removeChild(r);},700);
say(['Тут усе гаразд. Шукай далі!','Тут безпечно. Придивись уважніше!','Майже! Подивись на інші місця.'][miss%3],'no');});
sc.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest&&e.target.closest('.x-gk-hz')){e.preventDefault();pick(+e.target.closest('.x-gk-hz').getAttribute('data-h'));}});
root.addEventListener('click',function(e){var b=e.target.closest('[data-x]');if(!b||over)return;var x=b.getAttribute('data-x');
if(x==='hint'){var s=SCENES[si];for(var i=0;i<s.hz.length;i++){if(!got[si+'-'+i]){var d=s.hz[i][0];hints++;var c=fx('<circle class="x-gk-hintc" cx="'+d.x+'" cy="'+d.y+'" r="'+d.r+'"/>');A.later(function(){if(c.parentNode)c.parentNode.removeChild(c);},3100);say('Придивись до місця, що блимає.','info');return;}}}
if(x==='next'){if(si<SCENES.length-1){si++;show();}else fin();}});
function fin(){if(over)return;over=true;snd.win();var pts=clamp(found*4+(miss<=3?4:0)-hints*2-Math.max(0,miss-3),0,40);
A.gEnd(box,'hazard','Знайди небезпеку','Знайдено '+found+' з '+total+' небезпек'+(hints?', підказок: '+hints:'')+'. Побачив небезпеку — не чіпай і скажи дорослим.',pts,found===total&&miss<=5&&hints<=2);}
show();
return function(){over=true;snd.close();};}

/* ======================================================================
   3. FIRST-AID KIT
   ====================================================================== */
var IC={
bandage:'<svg viewBox="0 0 48 48"><ellipse cx="24" cy="36" rx="14" ry="5" fill="#D9D4C6"/><rect x="10" y="14" width="28" height="22" fill="#F4F1E8"/><ellipse cx="24" cy="14" rx="14" ry="5" fill="#FFFFFF" stroke="#D9D4C6"/><ellipse cx="24" cy="14" rx="5" ry="1.8" fill="#CFC9B8"/><path d="M38 30q6 2 4 10l-8-2" fill="#F4F1E8" stroke="#D9D4C6"/><path d="M14 20v12M20 20v12M28 20v12M34 20v12" stroke="#E6E1D3" stroke-width="1.2"/></svg>',
plaster:'<svg viewBox="0 0 48 48"><g transform="rotate(-30 24 24)"><rect x="4" y="17" width="40" height="14" rx="7" fill="#E7B98C"/><rect x="17" y="18.5" width="14" height="11" rx="2" fill="#F6E6D2"/><g fill="#C99668"><circle cx="9" cy="22" r="1"/><circle cx="12" cy="26" r="1"/><circle cx="36" cy="22" r="1"/><circle cx="39" cy="26" r="1"/></g></g></svg>',
antiseptic:'<svg viewBox="0 0 48 48"><rect x="19" y="4" width="10" height="7" rx="2" fill="#E9E5D9"/><rect x="21" y="10" width="6" height="4" fill="#BFC7CC"/><path d="M14 18q0-4 4-4h12q4 0 4 4v22q0 4-4 4H18q-4 0-4-4z" fill="#7FB2CF"/><rect x="16" y="22" width="16" height="14" rx="2" fill="#F4F1E8"/><path d="M24 25v8M20 29h8" stroke="#3E9B5A" stroke-width="2.6" stroke-linecap="round"/><path d="M17 17q0 10 0 22" stroke="#fff" stroke-width="1.6" opacity=".5"/></svg>',
blanket:'<svg viewBox="0 0 48 48"><defs><linearGradient id="x-gk-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7E08A"/><stop offset=".45" stop-color="#C99A2E"/><stop offset=".55" stop-color="#E8EDF0"/><stop offset="1" stop-color="#9AA6AD"/></linearGradient></defs><rect x="8" y="10" width="32" height="28" rx="4" fill="url(#x-gk-foil)"/><path d="M8 24h32M24 10v28" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/><path d="M12 14l8 6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/></svg>',
gloves:'<svg viewBox="0 0 48 48"><path d="M16 42V26l-5-7q-2-3 1-4 2-1 4 2l2 3V9q0-3 2.5-3T23 9v10V6q0-3 2.5-3T28 6v13V8q0-3 2.5-3T33 8v13-9q0-3 2.5-3T38 12v16q0 8-5 14z" fill="#8FC3E8" stroke="#5C93BC" stroke-width="1.4" stroke-linejoin="round"/><rect x="15" y="38" width="19" height="6" rx="2" fill="#5C93BC"/></svg>',
scissors:'<svg viewBox="0 0 48 48"><circle cx="13" cy="35" r="6" fill="none" stroke="#3E9B5A" stroke-width="3.4"/><circle cx="29" cy="39" r="6" fill="none" stroke="#3E9B5A" stroke-width="3.4"/><path d="M17 30L38 8q2 3 0 6L22 33z" fill="#C5CED3"/><path d="M24 34L36 10q3 2 1 6L27 36z" fill="#AEB8BE"/><circle cx="22" cy="30" r="2" fill="#5E6A70"/></svg>',
candy:'<svg viewBox="0 0 48 48"><path d="M10 24l-7-8v16zM38 24l7-8v16z" fill="#F29CB8"/><ellipse cx="24" cy="24" rx="15" ry="11" fill="#E0614A"/><path d="M14 18q6 12 0 12M24 13q6 11 0 22M33 16q5 8 0 16" stroke="#F7D774" stroke-width="2.6" fill="none"/></svg>',
teddy:'<svg viewBox="0 0 48 48"><circle cx="13" cy="10" r="5" fill="#B9844C"/><circle cx="35" cy="10" r="5" fill="#B9844C"/><circle cx="24" cy="31" r="13" fill="#B9844C"/><circle cx="24" cy="16" r="10" fill="#C99460"/><circle cx="20" cy="14" r="1.5" fill="#222"/><circle cx="28" cy="14" r="1.5" fill="#222"/><ellipse cx="24" cy="19" rx="4" ry="3" fill="#E8C9A0"/><circle cx="24" cy="18" r="1.2" fill="#222"/><ellipse cx="24" cy="33" rx="6" ry="7" fill="#E8C9A0"/></svg>',
ball:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="#7FB2CF"/><path d="M7 24h34M24 7q10 17 0 34M24 7q-10 17 0 34" stroke="#F4F1E8" stroke-width="3" fill="none"/><path d="M14 13q4-4 9-5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/></svg>',
markers:'<svg viewBox="0 0 48 48"><g transform="rotate(-20 24 24)"><rect x="10" y="10" width="7" height="28" rx="2" fill="#E0614A"/><rect x="20" y="10" width="7" height="28" rx="2" fill="#F2C230"/><rect x="30" y="10" width="7" height="28" rx="2" fill="#7BC47F"/><path d="M10 38l3.5 6 3.5-6M20 38l3.5 6 3.5-6M30 38l3.5 6 3.5-6" fill="#3B3D3A"/></g></svg>'
};
var KIT=[
['bandage','Бинт',1,'Бинт — щоб перев\'язати рану.'],
['plaster','Пластир',1,'Пластир закриє подряпину.'],
['antiseptic','Антисептик',1,'Антисептик очищає ранку.'],
['blanket','Термоковдра',1,'Термоковдра зігріє, коли холодно.'],
['gloves','Рукавички',1,'Рукавички — щоб руки були чисті.'],
['scissors','Ножиці',1,'Ножиці з круглими кінчиками — розрізати бинт.'],
['candy','Цукерки',0,'Цукерки смачні, але не лікують. Їм не місце в аптечці.'],
['teddy','Іграшка',0,'Іграшку краще взяти в наплічник, а не в аптечку.'],
['ball','М\'яч',0,'М\'яч — для гри, в аптечці він зайвий.'],
['markers','Фломастери',0,'Фломастери не допоможуть при ранці.']];
var KITSVG='<svg class="x-gk-kit" id="x-gk-kit" viewBox="0 0 120 96" aria-hidden="true"><ellipse cx="60" cy="90" rx="46" ry="5" fill="rgba(0,0,0,.45)"/><rect x="44" y="10" width="32" height="14" rx="6" fill="none" stroke="#3F6B44" stroke-width="6"/>'+
'<rect x="10" y="30" width="100" height="56" rx="10" fill="#3E9B5A"/><rect x="10" y="70" width="100" height="16" rx="8" fill="#2F7D47" opacity=".8"/>'+
'<g class="x-gk-lid"><rect x="8" y="22" width="104" height="16" rx="7" fill="#4FB06A"/><rect x="52" y="26" width="16" height="8" rx="2" fill="#2F7D47"/></g>'+
'<rect x="49" y="44" width="22" height="34" rx="3" fill="#F4F1E8"/><rect x="43" y="50" width="34" height="22" rx="3" fill="#F4F1E8"/></svg>';

function startAidkit(box,A){
css();var snd=Sound(),dr=Dragger(),items=A.shuffle(KIT),need=KIT.filter(function(k){return k[2];}).length,got=0,bad=0,total=40,left=40,over=false,root,kw,tip;
var slots='';for(var s=0;s<need;s++)slots+='<i></i>';
box.innerHTML='<div class="view stack" id="x-gk-ak">'+A.gHead('Збери аптечку','Перетягни в аптечку все, що допомагає при ранці чи холоді. Зайве — залиш. Можна просто торкнутися.')+
'<div class="x-gk-hud"><span id="x-gk-got" role="status">0 / '+need+'</span><span id="x-gk-tm">'+total+' с</span></div><div class="bar" aria-hidden="true"><i id="x-gk-tb" style="width:100%;transition:width .2s linear"></i></div>'+
'<div class="x-gk-kitw" id="x-gk-kw">'+KITSVG+'<div class="stack" style="gap:6px"><b>Аптечка</b><div class="x-gk-slots" id="x-gk-sl" aria-hidden="true">'+slots+'</div></div></div>'+
'<div class="x-gk-items">'+items.map(function(p,i){return '<button class="x-gk-it" data-i="'+i+'" aria-label="'+p[1]+'" style="animation-delay:'+(i*.04)+'s">'+IC[p[0]]+'<span>'+p[1]+'</span></button>';}).join('')+'</div>'+
'<div class="x-gk-tip" id="x-gk-tip" role="status" aria-live="polite">Що покладемо першим?</div></div>';
root=q('#x-gk-ak',box);kw=q('#x-gk-kw',root);tip=q('#x-gk-tip',root);
function say(t,k){tip.className='x-gk-tip'+(k?' '+k:'');void tip.offsetWidth;tip.textContent=t;}
function kitC(){var r=kw.querySelector('.x-gk-kit').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height*.55];}
function kick(c){var k=q('#x-gk-kit',root);k.classList.remove('b','no');void k.getBoundingClientRect();k.classList.add(c);}
function judge(el,p,gh){
if(p[2]){el.classList.add('done');el.disabled=true;var c=kitC();dr.fly(gh,c[0],c[1],function(){if(over)return;kick('b');snd.ok();});
got++;q('#x-gk-got',root).textContent=got+' / '+need;var sl=root.querySelectorAll('#x-gk-sl i');if(sl[got-1])sl[got-1].className='on';say(p[3],'ok');
if(got===need)A.later(fin,700);}
else{bad++;left=Math.max(0,left-3);snd.no();kick('no');dr.home(gh,function(){el.classList.remove('no');void el.offsetWidth;el.classList.add('no');});say(p[3]+' −3 с','no');}}
var btns=root.querySelectorAll('.x-gk-it');
Array.prototype.forEach.call(btns,function(el){var p=items[+el.getAttribute('data-i')];
dr.bind(el,{can:function(){return !over&&!el.disabled;},
move:function(x,y){kw.classList.toggle('over',hit(kw.getBoundingClientRect(),x,y,16));},
drop:function(x,y,gh){var inKit=hit(kw.getBoundingClientRect(),x,y,16);kw.classList.remove('over');if(inKit)judge(el,p,gh);else dr.home(gh);},
tap:function(){judge(el,p,dr.ghostOf(el));}});});
A.every(function(){if(over)return;left-=.2;if(left<=0){left=0;fin();return;}var tb=q('#x-gk-tb',root);tb.style.width=(left/total*100)+'%';q('#x-gk-tm',root).textContent=Math.ceil(left)+' с';tb.style.background=left<10?'var(--bad)':'';},200);
function fin(){if(over)return;over=true;dr.clean();if(got===need)snd.win();var pts=clamp(got*5+(got===need?Math.round(left/4):0)-bad*2,0,40);
A.gEnd(box,'aidkit','Збери аптечку',(got===need?'Аптечку зібрано!':'Зібрано '+got+' з '+need+'.')+' В аптечці: бинт, пластир, антисептик, термоковдра, рукавички, ножиці.'+(bad?' Зайвих речей спробував: '+bad+'.':''),pts,got===need&&bad<=2);}
return function(){over=true;dr.clean();snd.close();};}

/* ======================================================================
   4. EMBLEM PUZZLE
   ====================================================================== */
var BGL='linear-gradient(135deg,#3C4A2A 0%,#1C2216 45%,#2A2414 70%,#4A3A1E 100%)';
function startPuzzle(box,A){
css();var snd=Sound(),dr=Dragger(),n=0,placed=0,mist=0,over=false,sel=null,root,board,tray,tip;
function menu(){
function mini(k){var h='<span class="x-gk-mini" style="grid-template-columns:repeat('+k+',1fr)">';for(var i=0;i<k*k;i++)h+='<i style="'+pcBg(i,k)+'"></i>';return h+'</span>';}
box.innerHTML='<div class="view stack" id="x-gk-pz">'+A.gHead('Пазл «Артан»','Збери емблему з частинок. Перетягни частинку на її місце або торкнись частинки, а потім клітинки.')+
'<div class="x-gk-modes"><button class="x-gk-mode" data-x="m3">'+mini(3)+'<b>3 × 3</b><span class="sm mu">Легко · 9 частинок</span></button><button class="x-gk-mode" data-x="m4">'+mini(4)+'<b>4 × 4</b><span class="sm mu">Складніше · 16 частинок</span></button></div></div>';
root=q('#x-gk-pz',box);root.addEventListener('click',function(e){var b=e.target.closest('[data-x]');if(!b)return;play(b.getAttribute('data-x')==='m3'?3:4);});}
function pcBg(i,k){var c=i%k,r=Math.floor(i/k),p=(c/(k-1)*100)+'% '+(r/(k-1)*100)+'%';
return 'background-image:url(img/emblem.png),'+BGL+';background-size:'+(k*100)+'% '+(k*100)+'%;background-position:'+p+','+p+';background-repeat:no-repeat';}
function play(k){n=k;placed=0;mist=0;sel=null;var order=A.shuffle(range(n*n));
box.innerHTML='<div class="view stack" id="x-gk-pz">'+A.gHead('Пазл «Артан»','Тьмяна емблема на полі підкаже, куди класти частинки.')+
'<div class="x-gk-hud"><span class="x-gk-pill" id="x-gk-pp" role="status">0 / '+(n*n)+'</span><button class="ghost x-gk-snd x-gk-peek" data-x="peek" aria-label="Підглянути картинку (утримуй)">Підглянути</button></div>'+
'<div class="x-gk-board" id="x-gk-bd" style="grid-template-columns:repeat('+n+',1fr)">'+range(n*n).map(function(i){return '<div class="x-gk-slot" data-s="'+i+'" role="button" tabindex="0" aria-label="Клітинка '+(i+1)+'"></div>';}).join('')+'</div>'+
'<div class="x-gk-tip" id="x-gk-tip" role="status" aria-live="polite">Почни з кутів — у них видно край кола</div>'+
'<div class="x-gk-tray" id="x-gk-tr">'+order.map(function(i,j){var sz=n===3?84:64;return '<button class="x-gk-pc" data-p="'+i+'" aria-label="Частинка '+(i+1)+'" style="width:'+sz+'px;height:'+sz+'px;animation-delay:'+(j*.03)+'s;'+pcBg(i,n)+'"></button>';}).join('')+'</div></div>';
root=q('#x-gk-pz',box);board=q('#x-gk-bd',root);tray=q('#x-gk-tr',root);tip=q('#x-gk-tip',root);
Array.prototype.forEach.call(tray.querySelectorAll('.x-gk-pc'),function(el){
dr.bind(el,{can:function(){return !over&&el.parentNode===tray;},
start:function(){unsel();},
move:function(x,y){var s=slotAt(x,y);Array.prototype.forEach.call(board.children,function(c){c.classList.toggle('tgt',c===s);});},
drop:function(x,y,gh){clearTgt();var s=slotAt(x,y);if(s)tryPut(el,s,gh);else dr.home(gh);},
tap:function(){if(sel===el){unsel();return;}unsel();sel=el;el.classList.add('sel');say('Тепер торкнись клітинки на полі','info');}});});
board.addEventListener('click',function(e){var s=e.target.closest('.x-gk-slot');if(!s||!sel||over)return;var el=sel;unsel();tryPut(el,s,dr.ghostOf(el));});
board.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&sel){var s=e.target.closest('.x-gk-slot');if(s){e.preventDefault();var el=sel;unsel();tryPut(el,s,dr.ghostOf(el));}}});
var pk=q('[data-x="peek"]',root);
function pon(e){if(e&&e.preventDefault)e.preventDefault();board.classList.add('peek');}function poff(){board.classList.remove('peek');}
pk.addEventListener('pointerdown',pon);pk.addEventListener('pointerup',poff);pk.addEventListener('pointerleave',poff);pk.addEventListener('pointercancel',poff);
pk.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter')pon(e);});pk.addEventListener('keyup',poff);}
function range(k){var a=[];for(var i=0;i<k;i++)a.push(i);return a;}
function say(t,k){tip.className='x-gk-tip'+(k?' '+k:'');void tip.offsetWidth;tip.textContent=t;}
function unsel(){if(sel)sel.classList.remove('sel');sel=null;}
function clearTgt(){Array.prototype.forEach.call(board.children,function(c){c.classList.remove('tgt');});}
function slotAt(x,y){var ch=board.children;for(var i=0;i<ch.length;i++){if(hit(ch[i].getBoundingClientRect(),x,y,0))return ch[i];}return null;}
function tryPut(el,s,gh){if(over)return;var pi=+el.getAttribute('data-p'),si=+s.getAttribute('data-s');
if(pi===si&&!s.firstChild){var r=s.getBoundingClientRect();
dr.fly(gh,r.left+r.width/2,r.top+r.height/2,function(){});
/* settle: move real piece into slot (snap animation) */
el.style.width='';el.style.height='';el.style.animationDelay='0s';el.classList.remove('x-gk-lift','sel');el.setAttribute('tabindex','-1');el.setAttribute('aria-label','Частинка на місці');s.appendChild(el);
s.setAttribute('aria-label','Клітинка '+(si+1)+' — заповнено');placed++;snd.step();snd.ok();q('#x-gk-pp',root).textContent=placed+' / '+(n*n);
say(placed===n*n?'Емблему зібрано!':['Точно на місці!','Чудово!','Так тримати!','Супер!'][placed%4],'ok');
if(placed===n*n)win();}
else{mist++;snd.no();dr.home(gh);s.classList.remove('no');void s.offsetWidth;s.classList.add('no');say(s.firstChild?'Ця клітинка вже зайнята. Пошукай вільну!':'Не зовсім тут. Подивись на підказку на полі!','no');}}
function win(){over=true;dr.clean();board.classList.add('win');snd.win();A.confetti();
var base=n===3?30:40,pts=clamp(base-mist*2,n===3?10:12,base);
A.later(function(){A.gEnd(box,'puzzle','Пазл «Артан»','Емблему '+n+'×'+n+' зібрано'+(mist?', помилок: '+mist:' без жодної помилки')+'!',pts,mist<=n*2);},1700);}
menu();
return function(){over=true;dr.clean();snd.close();};}

/* ---------- register ---------- */
ArtanExt.game({id:'shelter',min:6,emoji:'🏠',title:'Шлях до укриття',desc:'Лунає сирена: проведи друга до укриття, оминаючи вікна. 3 рівні.',badge:'Знаю шлях',start:startShelter});
ArtanExt.game({id:'hazard',min:6,emoji:'🔍',title:'Знайди небезпеку',desc:'Роздивись кухню, кімнату й двір — торкнись усього небезпечного.',badge:'Уважний погляд',start:startHazard});
ArtanExt.game({id:'aidkit',min:6,emoji:'🩹',title:'Збери аптечку',desc:'Перетягни потрібні речі в аптечку, поки біжить час.',badge:'Юний рятувальник',start:startAidkit});
ArtanExt.game({id:'puzzle',min:6,emoji:'🧩',title:'Пазл «Артан»',desc:'Збери емблему з частинок: 3×3 або 4×4.',badge:'Майстер пазлів',start:startPuzzle});
})();
