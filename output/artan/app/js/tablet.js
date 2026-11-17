/* ARTAN «Оперативний планшет»: HQ radar home, radial quick menu, adult/kid modes,
   «Шлях захисника» campaign path, rank chevrons, achievement patches, level-up overlay. */
(function(){
var A=window.ArtanAPI;if(!A)return;
var S=A.S,ui=A.ui,EXT=A.EXT,VIEWS=A.VIEWS,I=A.I,esc=A.esc;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||document).querySelector(s);}
function ico(k,w){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"'+(w?' style="width:'+w+'px;height:'+w+'px"':'')+'>'+(I[k]||I.info)+'</svg>';}
var EXTRA_I={path:'<path d="M4 20c3-1 3-5 6-6s5 1 7-2 1-6 3-8"/><circle cx="4" cy="20" r="1.6"/><circle cx="20" cy="4" r="1.6"/>',
  hq:'<path d="M12 3l9 5v8l-9 5-9-5V8z" fill="currentColor" fill-opacity=".2"/><path d="M12 8v8M8 10.5l4 2.5 4-2.5"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="3" fill="currentColor" fill-opacity=".2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  dip:'<path d="M5 3h14v14l-7 4-7-4z" fill="currentColor" fill-opacity=".2"/><path d="M9 9h6M9 13h4"/>'};
for(var k in EXTRA_I)if(!I[k])I[k]=EXTRA_I[k];

/* ---------- mode ---------- */
function kid(){return S.mode==='kid';}
function applyMode(){document.body.classList.toggle('kid',kid());}
function setMode(m){S.mode=m;A.save();applyMode();if(m==='kid'&&!S.age){S.age=6;A.save();}A.render(true);}

/* ---------- topographic background ---------- */
(function topo(){
  var r=(function(seed){return function(){seed=(seed*16807)%2147483647;return seed/2147483647;};})(7);
  var out='',W=900,H=900;
  for(var c=0;c<7;c++){var cx=r()*W,cy=r()*H,ph=r()*6,ph2=r()*6,a1=.06+r()*.06,a2=.04+r()*.05;
    for(var ring=1;ring<=7;ring++){var R=ring*26+r()*8,d='';
      for(var t=0;t<=64;t++){var th=t/64*Math.PI*2,rr=R*(1+a1*Math.sin(3*th+ph)+a2*Math.sin(5*th+ph2+ring*.3));
        d+=(t?'L':'M')+(cx+rr*Math.cos(th)).toFixed(1)+' '+(cy+rr*Math.sin(th)).toFixed(1);}
      out+='<path d="'+d+'Z"/>';}}
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><g fill="none" stroke="#BFC48F" stroke-opacity=".07" stroke-width="1">'+out+'</g></svg>';
  document.documentElement.style.setProperty('--topo','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")');
})();

/* ---------- ranks & chevrons ---------- */
function rankIdx(){var r=A.rank();for(var i=0;i<A.RANKS.length;i++)if(A.RANKS[i][1]===r.name)return i;return 0;}
function chevron(i,big){
  var c='var(--ye)',body='<path d="M8 4h44v42c0 10-10 16-22 20C18 62 8 56 8 46z" fill="#161A12" stroke="'+c+'" stroke-width="2"/>';
  if(i===0)body+='<rect x="18" y="30" width="24" height="5" rx="1" fill="'+c+'"/>';
  var n=Math.min(i,3);for(var k=0;k<n;k++){var y=44-k*11;body+='<path d="M16 '+y+'L30 '+(y-9)+'L44 '+y+'" fill="none" stroke="'+c+'" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>';}
  if(i>=4)body+='<path d="M30 9l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="'+c+'"/>';
  return '<svg viewBox="0 0 60 70" aria-hidden="true"'+(big?'':' width="16" height="18"')+'>'+body+'</svg>';}
var lastRank=null;
function onSave(){var i=rankIdx();if(lastRank===null){lastRank=i;return;}if(i>lastRank){lastRank=i;levelUp(i);}else lastRank=i;}
function levelUp(i){var o=document.createElement('div');o.className='lvl';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Нове звання');
  o.innerHTML='<div class="in">'+chevron(i,true)+'<p class="ey">Нове звання</p><h1>'+esc(A.RANKS[i][1])+'</h1><p class="mu">'+(kid()?'Ти молодець! Так тримати.':'Знання, які бережуть життя. Продовжуй шлях.')+'</p><button class="pri" type="button">Далі</button></div>';
  document.body.appendChild(o);A.confetti();var b=o.querySelector('button');b.focus();b.onclick=function(){o.remove();};}

/* ---------- sections ---------- */
function sections(all){
  var base=[
    {h:'#unit',ic:'ops',t:'Підрозділ',sh:'ПІДРОЗДІЛ',seg:'ops',ad:1},
    {h:'#unit',ic:'mem',t:'Стіна пам\'яті',sh:'ПАМ\'ЯТЬ',seg:'mem',ad:1,kd:1},
    {h:'#map',ic:'map',t:'Карта просторів',sh:'КАРТА',ad:1,kd:1},
    {h:'#school',ic:'path',t:'Шлях захисника',sh:'ШЛЯХ',ad:1,kd:1},
    {h:'#zvytiaha',ic:'flag',t:'Вишкіл «Звитяга»',sh:'ЗВИТЯГА',ad:1}];
  EXT.views.forEach(function(v){base.push({h:'#'+v.id,ic:v.id==='events'?'cal':(v.icon||'info'),t:v.title,sh:(v.short||v.title.split(' ')[0]).toUpperCase().slice(0,10),ad:v.home?1:0,kd:v.id==='media'?1:0,ext:1});});
  base.push({h:'#diploma',ic:'dip',t:'Диплом захисника',sh:'ДИПЛОМ',kd:1});
  base.push({h:'#sos',ic:'sos',t:'SOS-пам\'ятка',sh:'SOS',ad:1,kd:1});
  if(all){base.push({h:'#projects',ic:'ppl',t:'Проєкти',sh:''},{h:'#merch',ic:'tee',t:'Мерч',sh:''},{h:'#social',ic:'soc',t:'Соцмережі',sh:''},{h:'#more',ic:'info',t:'Більше',sh:''});
    base.unshift({h:'#home',ic:'hq',t:'Штаб',sh:''});return base;}
  return base.filter(function(s){return kid()?s.kd:s.ad;});}
function secAttrs(s){return 'href="'+s.h+'"'+(s.seg?' data-act="seg" data-s="'+s.seg+'"':'');}

/* ---------- radar ---------- */
function radar(list){
  var n=list.length,C=200,R=188,r0=58,out='',p=function(r,a){return (C+r*Math.cos(a)).toFixed(1)+' '+(C+r*Math.sin(a)).toFixed(1);};
  var rings='';[58,100,145,188].forEach(function(r){rings+='<circle class="ring" cx="200" cy="200" r="'+r+'"/>';});
  for(var t=0;t<72;t++){var a=t/72*Math.PI*2,l=t%6?5:11;rings+='<line class="tick" x1="'+(C+(R+2)*Math.cos(a)).toFixed(1)+'" y1="'+(C+(R+2)*Math.sin(a)).toFixed(1)+'" x2="'+(C+(R+2+l)*Math.cos(a)).toFixed(1)+'" y2="'+(C+(R+2+l)*Math.sin(a)).toFixed(1)+'"/>';}
  list.forEach(function(s,i){var gap=.025,a0=-Math.PI/2+i*2*Math.PI/n+gap,a1=-Math.PI/2+(i+1)*2*Math.PI/n-gap,am=(a0+a1)/2;
    var d='M'+p(r0,a0)+'L'+p(R,a0)+'A'+R+' '+R+' 0 0 1 '+p(R,a1)+'L'+p(r0,a1)+'A'+r0+' '+r0+' 0 0 0 '+p(r0,a0)+'Z';
    var lr=n>8?132:126,lx=C+lr*Math.cos(am),ly=C+lr*Math.sin(am);
    out+='<a class="sec" '+secAttrs(s)+' aria-label="'+esc(s.t)+'" style="--i:'+i+'"><path d="'+d+'"/><g transform="translate('+(lx-14).toFixed(1)+' '+(ly-26).toFixed(1)+') scale(1.15)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(I[s.ic]||I.info)+'</g><text x="'+lx.toFixed(1)+'" y="'+(ly+16).toFixed(1)+'">'+esc(s.sh)+'</text></a>';});
  var blips='';for(var b=0;b<4;b++){var ba=Math.random()*Math.PI*2,br=70+Math.random()*100;blips+='<circle class="blip" cx="'+(C+br*Math.cos(ba)).toFixed(1)+'" cy="'+(C+br*Math.sin(ba)).toFixed(1)+'" r="2.6" style="animation-delay:'+(b*.6)+'s"/>';}
  var sweep='<defs><linearGradient id="swg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2C230" stop-opacity="0"/><stop offset="1" stop-color="#F2C230" stop-opacity=".28"/></linearGradient></defs><g class="sweep"><path d="M200 200L200 12A188 188 0 0 1 333 67Z" fill="url(#swg)"/></g>';
  var core='<a class="core" href="#school" aria-label="Шлях захисника: продовжити"><circle class="c1" cx="200" cy="200" r="52"/><image href="img/emblem.png" x="166" y="160" width="68" height="68"/><text x="200" y="240">ШЛЯХ</text></a>';
  return '<div class="radar"><svg viewBox="-20 -20 440 440" role="group" aria-label="Сектори штабу">'+sweep+rings+blips+out+core+'</svg></div>';}

/* ---------- status strip ---------- */
function clock(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
function status(){var r=A.rank();
  return '<div class="status hud-frame" role="group" aria-label="Статус"><div><span>Час</span><b id="tclk">'+clock()+'</b></div><div><span>Мовчання 9:00</span><b id="sil">'+A.silence()+'</b></div><div><span>Звання</span><b title="'+esc(r.name)+'">'+chevron(rankIdx())+esc(r.name)+'</b></div><div><span>Бали'+(S.streak>1?' · серія '+S.streak:'')+'</span><b>'+S.xp+'</b></div></div>';}
function modeSw(){return '<div class="modesw" role="group" aria-label="Режим"><button type="button" data-t="mode" data-m="adult" aria-pressed="'+!kid()+'">Дорослий</button><button type="button" data-t="mode" data-m="kid" aria-pressed="'+kid()+'">Юний</button></div>';}

/* ---------- path nodes ---------- */
var BUILTIN=[{id:'touch',e:'🃏',t:'Чіпати чи ні?',d:'Гортай картки: праворуч — можна, ліворуч — небезпечно. 3 життя.',min:6},
  {id:'pack',e:'🎒',t:'Тривожний наплічник',d:'Збери 8 потрібних речей, поки біжить час.',min:6},
  {id:'mem',e:'🧠',t:'Номери порятунку',d:'Знайди пари: номер і служба.',min:6},
  {id:'morse',e:'📡',t:'Азбука Морзе',d:'Розшифруй сигнал ліхтарика: крапки й тире.',min:10}];
function nodes(){var age=S.age||6,ms=A.MISSIONS.filter(function(m){return m.min<=age;}).map(function(m){return {k:'m',id:m.id,t:m.t,d:m.tips&&m.tips[0]||'',e:null};});
  var gs=BUILTIN.filter(function(g){return g.min<=age;}).map(function(g){return {k:'g',id:g.id,t:g.t,d:g.d,e:g.e};})
    .concat(EXT.games.filter(function(g){return !g.min||g.min<=age;}).map(function(g){return {k:'g',id:g.id,t:g.title,d:g.desc,e:g.emoji};}));
  var out=[],mi=0,gi=0;while(mi<ms.length||gi<gs.length){if(mi<ms.length)out.push(ms[mi++]);if(mi<ms.length&&out.length%3!==2)out.push(ms[mi++]);if(gi<gs.length)out.push(gs[gi++]);}
  var done=0;out.forEach(function(n){n.done=!!S.done[n.id];if(n.done)done++;});
  out.forEach(function(n,i){n.open=n.done||i<done+3;});
  var nx=out.filter(function(n){return n.open&&!n.done;})[0];if(nx)nx.next=true;
  return out;}
function pathHTML(){var ns=nodes(),step=112,H=ns.length*step+70,W=340,pts=[];
  ns.forEach(function(n,i){pts.push([W/2+(W*.3)*Math.sin(i*1.15),50+i*step]);});
  var d='M'+pts[0][0].toFixed(1)+' '+pts[0][1];for(var i=1;i<pts.length;i++){var a=pts[i-1],b=pts[i],my=(a[1]+b[1])/2;d+=' C'+a[0].toFixed(1)+' '+my+' '+b[0].toFixed(1)+' '+my+' '+b[0].toFixed(1)+' '+b[1];}
  var doneN=ns.filter(function(n){return n.done;}).length,len=ns.length*step*1.25,frac=ns.length>1?Math.min(1,(ns.indexOf(ns.filter(function(n){return n.next;})[0])>-1?ns.indexOf(ns.filter(function(n){return n.next;})[0]):ns.length-1)/(ns.length-1)):0;
  var h='<div class="path" style="height:'+H+'px" role="list" aria-label="Шлях захисника: '+doneN+' з '+ns.length+' пройдено"><svg class="trail" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><path class="road" d="'+d+'"/><path class="dash" d="'+d+'"/><path class="walked" d="'+d+'" pathLength="1000" style="--len:1000;--off:'+Math.round(1000*(1-frac))+'"/></svg>';
  h+='<span class="path-flag" style="left:50%;top:22px">СТАРТ</span>';
  ns.forEach(function(n,i){var x=pts[i][0]/W*100,y=pts[i][1];
    h+='<button role="listitem" type="button" class="node'+(n.done?' done':'')+(n.next?' next':'')+(n.open?'':' lock')+'" style="left:'+x.toFixed(2)+'%;top:'+y+'px;--i:'+i+'" data-t="node" data-n="'+i+'" aria-label="'+esc(n.t)+(n.done?', пройдено':n.open?'':', поки закрито')+'">'+(n.e?'<span aria-hidden="true">'+n.e+'</span>':ico(n.k==='m'?'sch':'flag'))+'</button>';
    h+='<div class="node-l" style="left:'+x.toFixed(2)+'%;top:'+(y+38)+'px">'+esc(n.t)+'<small>'+(n.k==='m'?'МІСІЯ':'ГРА')+'</small></div>';});
  return h+'</div>';}
function openSheet(n){closeSheet();var bg=document.createElement('div');bg.className='sheet-bg';var sh=document.createElement('div');sh.className='sheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');sh.setAttribute('aria-label',n.t);
  var start=n.k==='m'?'<button class="pri" data-act="mission" data-id="'+n.id+'" data-t="closesheet">'+(n.done?'Пройти ще раз':'Почати місію')+'</button>':'<button class="pri" data-act="game" data-g="'+n.id+'" data-t="closesheet">'+(n.done?'Зіграти ще':'Грати')+'</button>';
  sh.innerHTML='<div class="grab" aria-hidden="true"></div><p class="ey">'+(n.k==='m'?'Брифінг місії':'Гра')+'</p><h2>'+esc(n.t)+'</h2><p class="mu">'+esc(n.d)+'</p>'+
   (n.k==='m'?'<p class="sm mono" style="color:var(--ac)">УРОК + 3 ЗАПИТАННЯ · ДО 30 БАЛІВ</p>':'')+
   (n.open?start:'<div class="msg no">Пройди попередні завдання, щоб відкрити це.</div>')+'<button class="ghost" type="button" data-t="closesheet">Закрити</button>';
  bg.onclick=closeSheet;document.body.appendChild(bg);document.body.appendChild(sh);(sh.querySelector('.pri')||sh.querySelector('.ghost')).focus();}
function closeSheet(){var a=$('.sheet'),b=$('.sheet-bg');if(a)a.remove();if(b)b.remove();}

/* ---------- patches wall ---------- */
var PCOL=['#F2C230','#BFC48F','#7BC47F','#E9A15B','#8FB8D8','#D9A0C8'];
function patch(n,i){var c=PCOL[i%PCOL.length],L=(n.t||'?').replace(/[«»"]/g,'').trim().charAt(0).toUpperCase();
  return '<div class="patch '+(n.done?'on':'off')+'"><svg viewBox="0 0 64 72" aria-hidden="true"><path d="M32 3l26 9v22c0 17-12 28-26 35C18 62 6 51 6 34V12z" fill="#151910" stroke="'+c+'" stroke-width="2.5"/><path d="M32 9l20 7v18c0 13-9 22-20 28-11-6-20-15-20-28V16z" fill="none" stroke="'+c+'" stroke-width="1" stroke-dasharray="2 3" opacity=".7"/><text x="32" y="44" text-anchor="middle" font-family="Oswald,sans-serif" font-size="24" font-weight="600" fill="'+c+'">'+esc(L)+'</text></svg><span>'+esc(n.t)+'</span></div>';}
function patchesHTML(){var ns=nodes(),d=ns.filter(function(n){return n.done;}).length;
  return '<div class="stack"><div class="row sb"><h2>Шеврони</h2><span class="badge">'+d+' / '+ns.length+'</span></div><div class="patches">'+ns.map(patch).join('')+'</div></div>';}

/* ---------- HOME (Штаб) ---------- */
var oldHome=VIEWS.home,oldSchool=VIEWS.school;
function greet(){var h=new Date().getHours();return h<5?'Доброї ночі':h<12?'Доброго ранку':h<18?'Доброго дня':'Доброго вечора';}
function head(){return '<header class="t-head"><div class="who"><img src="img/emblem.png" alt="Емблема «Артан»"><div><div class="wm">АРТАН</div><p>'+greet()+(S.call?', «'+esc(S.call)+'»':'')+'</p></div></div>'+modeSw()+'</header>';}
function daily(){var dd=S.daily===A.today();return '<div class="row sb"><p class="sm"><span class="mono" style="color:var(--ac)">ВИКЛИК ДНЯ</span><br>20 присідань і 10 віджимань</p><button data-act="daily" class="'+(dd?'':'pri')+'" style="min-height:42px;flex:none"'+(dd?' disabled':'')+'>'+(dd?'Виконано':'+5 балів')+'</button></div>';}
function vHQ(){
  if(kid()){var ns=nodes(),nx=ns.filter(function(n){return n.next;})[0];
    return head()+status()+
    '<div class="card stack hud-frame"><p class="ey">Твоє наступне завдання</p>'+(nx?'<div class="kid-go"><button type="button" class="node next" data-t="node" data-n="'+ns.indexOf(nx)+'" aria-label="Відкрити: '+esc(nx.t)+'">'+(nx.e?'<span aria-hidden="true">'+nx.e+'</span>':ico('sch'))+'</button><div><h2>'+esc(nx.t)+'</h2><p class="sm mu">'+(nx.k==='m'?'Місія':'Гра')+' · Шлях захисника</p></div></div>':'<h2>Увесь шлях пройдено!</h2>')+'<a class="btn pri" href="#school">Відкрити Шлях '+ico('arr')+'</a></div>'+
    radar(sections())+'<div class="card stack">'+daily()+'</div>'+
    '<a class="btn sosb" href="#sos">'+ico('sos')+'Що робити в небезпеці</a>';}
  var tpl=document.createElement('template');tpl.innerHTML=oldHome();var root=tpl.content;
  ['header.top','.grid2','.sosb'].forEach(function(s){var e=root.querySelector(s);if(e)e.remove();});
  [].slice.call(root.querySelectorAll('.card')).forEach(function(c){if(c.querySelector('#car')||c.querySelector('#sil')||/Твоє звання/.test(c.textContent))c.remove();});
  var hero=root.querySelector('.hero');var heroH=hero?hero.outerHTML:'';if(hero)hero.remove();
  var rest='';[].slice.call(root.children).forEach(function(e){rest+=e.outerHTML;});
  return head()+status()+radar(sections())+
   '<div class="card brief hud-frame"><div class="row sb"><p class="ey">Брифінг дня</p><span class="dl">'+new Date().toLocaleDateString('uk-UA',{day:'numeric',month:'long'})+'</span></div><div id="car"></div><div class="dots" role="tablist" aria-label="Операції">'+A.OPS.map(function(o,i){return '<button role="tab" aria-label="'+esc(o.t)+'" data-act="car" data-i="'+i+'"><i></i></button>';}).join('')+'</div>'+daily()+'</div>'+
   heroH+'<a class="btn sosb" href="#sos">'+ico('sos')+'SOS-пам\'ятка: що робити в небезпеці</a>'+rest;}
VIEWS.home=vHQ;

/* ---------- SCHOOL with campaign path ---------- */
VIEWS.school=function(){var h=oldSchool();if(ui.game||ui.mission||ui.ss==='lb'||!S.age)return h;
  var tpl=document.createElement('template');tpl.innerHTML=h;var root=tpl.content;
  [].slice.call(root.children).forEach(function(e){var h2=e.querySelector&&e.querySelector('h2');var t=h2?h2.textContent:'';
    if(/^Місії програми|^Ігри$|^Відзнаки$/.test(t))e.remove();else if(e.matches&&e.matches('button[data-act="game"]'))e.remove();});
  var ag=[].slice.call(root.children).filter(function(e){var h2=e.querySelector&&e.querySelector('h2');return h2&&/^Програма за віком/.test(h2.textContent);})[0];
  var ns=nodes(),dn=ns.filter(function(n){return n.done;}).length;
  var block=document.createElement('div');block.className='stack';
  block.innerHTML='<div class="row sb"><h2>Шлях захисника</h2><span class="badge">'+dn+' / '+ns.length+'</span></div><p class="sm mu">Місії й ігри відкриваються по черзі. Торкнись точки, щоб побачити брифінг.</p>'+pathHTML();
  if(ag)ag.parentNode.insertBefore(block,ag.nextSibling);else root.appendChild(block);
  var w=document.createElement('div');w.innerHTML=patchesHTML();root.appendChild(w.firstChild);
  var out='';[].slice.call(root.childNodes).forEach(function(e){out+=e.outerHTML||'';});return out;};

/* ---------- radial quick menu ---------- */
var rb=$('#radarBtn'),qm=null;
function openMenu(){if(qm)return closeMenu();qm=document.createElement('div');qm.className='qmenu';qm.setAttribute('role','dialog');qm.setAttribute('aria-modal','true');qm.setAttribute('aria-label','Усі сектори');
  qm.innerHTML='<div class="qwrap"><h2>СЕКТОРИ ПЛАНШЕТА</h2><div class="qgrid">'+sections(true).map(function(s,i){return '<a '+secAttrs(s)+' style="--i:'+i+'" data-t="qgo">'+ico(s.ic,26)+esc(s.t)+'</a>';}).join('')+'</div><button type="button" class="qclose" data-t="qclose">Закрити</button></div>';
  document.body.appendChild(qm);rb.setAttribute('aria-expanded','true');qm.querySelector('a').focus();}
function closeMenu(){if(!qm)return;qm.remove();qm=null;rb.setAttribute('aria-expanded','false');rb.focus();}
rb.addEventListener('click',openMenu);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){if(qm){closeMenu();}else if($('.sheet'))closeSheet();else{var l=$('.lvl');if(l)l.remove();}}
  if(e.key==='Tab'){var box=qm||$('.sheet')||$('.lvl');if(!box)return;var f=box.querySelectorAll('a,button');if(!f.length)return;var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});

/* ---------- own actions ---------- */
document.addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(!b)return;var t=b.getAttribute('data-t');
  if(t==='mode')setMode(b.getAttribute('data-m'));
  else if(t==='node'){var n=nodes()[+b.getAttribute('data-n')];if(n)openSheet(n);}
  else if(t==='closesheet')closeSheet();
  else if(t==='qclose')closeMenu();
  else if(t==='qgo'){if(qm){qm.remove();qm=null;rb.setAttribute('aria-expanded','false');}}
});

/* ---------- view transitions between sections ---------- */
document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey)return;
  var a=e.target.closest('a[href^="#"]');if(!a||a.target)return;var h=a.getAttribute('href');if(h.length<2)return;
  if(!document.startViewTransition||reduce)return;
  if(h===location.hash){return;}
  e.preventDefault();closeSheet();
  document.startViewTransition(function(){ui.mission=null;ui.game=null;if(!a.matches('[data-act="op"]'))ui.op=null;history.pushState(null,'',h);A.render(true);});
});
window.addEventListener('popstate',function(){});

/* clock tick on HQ */
setInterval(function(){var c=$('#tclk');if(c)c.textContent=clock();},20000);

window.ArtanTablet={onSave:onSave,chevron:chevron,nodes:nodes};
lastRank=rankIdx();
applyMode();
A.render(false);
})();
