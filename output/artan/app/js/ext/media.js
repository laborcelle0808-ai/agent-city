/* Artan extension: local photo & video library (IndexedDB 'artan-media', files never leave the device). */
(function(){
if(!window.ArtanExt)return;

var ALBUMS=['Операції','Простори','Вишколи','Пам\'ять','Родина','Інше'];
/* Official video slots: titles/links are placeholders until verified links are provided. */
var VIDEOS=[
  ['Офіційне відео підрозділу','Тема: [НАЗВА ВІДЕО]'],
  ['Вишкіл «Звитяга»: як це було','Відео з офіційної сторінки · [ДАТА]'],
  ['Простори «Артан»: відкриті двері','Відео з офіційної сторінки · [ДАТА]']
];

var DBN='artan-media',ST='m';
var db=null,dbState='wait'; /* wait | ok | off */
var items=[];               /* {id,album,cap,type,mime,name,size,ts,blob} sorted newest first */
var urls={};                /* id -> object URL */
var M={filter:'all',upAlbum:'Інше',lb:-1,del:false,msg:'',ok:true,busy:false,est:null,edit:false};
var root=null,box=null,lbEl=null,A=null,alive=false;

function css(){if(document.getElementById('ext-media'))return;var s=document.createElement('style');s.id='ext-media';s.textContent=
'.x-media-up{position:relative;overflow:hidden}'+
'.x-media-up input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}'+
'.x-media-sel,.x-media-in{width:100%;height:48px;padding:0 12px;border-radius:12px;border:1px solid #6E7463;background:var(--sf);color:var(--tx);font:inherit}'+
'.x-media-sel:focus,.x-media-in:focus{border-color:var(--ye);box-shadow:0 0 0 3px rgba(242,194,48,.18);outline:0}'+
'.x-media-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.x-media-chips::-webkit-scrollbar{display:none}'+
'.x-media-chips .chip{flex:none;white-space:nowrap}.x-media-chips .chip i{font-style:normal;opacity:.7;margin-left:4px}'+
'.x-media-grid{column-count:2;column-gap:10px}'+
'.x-media-it{break-inside:avoid;-webkit-column-break-inside:avoid;display:block;width:100%;margin:0 0 10px;padding:0;min-height:0;border-radius:14px;overflow:hidden;background:var(--sf);border:1px solid var(--ln);text-align:left;font-weight:400;position:relative;animation:pop .4s var(--ease) backwards}'+
'.x-media-it:hover{border-color:rgba(242,194,48,.5)}'+
'.x-media-it img,.x-media-it video{display:block;width:100%;height:auto;min-height:80px;max-height:360px;object-fit:cover;background:#0E100B;pointer-events:none}'+
'.x-media-it .x-media-cap{display:block;padding:8px 10px;font-size:12.5px;line-height:1.3}'+
'.x-media-it .x-media-cap b{display:block;font-weight:500;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.x-media-it .x-media-cap span{color:var(--ac);font-size:11px;letter-spacing:.5px;text-transform:uppercase}'+
'.x-media-play{position:absolute;top:8px;right:8px;width:34px;height:34px;border-radius:50%;background:rgba(10,11,9,.75);border:1px solid rgba(242,194,48,.6);display:flex;align-items:center;justify-content:center;color:var(--ye)}'+
'.x-media-play svg{width:18px;height:18px}'+
'.x-media-empty{text-align:center;align-items:center}.x-media-empty ol{text-align:left;margin:0;padding-left:20px;font-size:13.5px;color:var(--mu)}'+
'.x-media-lb{position:fixed;inset:0;z-index:60;background:#050604;display:flex;flex-direction:column}'+
'.x-media-lbtop{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px calc(10px);padding-top:calc(10px + env(safe-area-inset-top))}'+
'.x-media-lbst{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;padding:0 8px;touch-action:pan-y}'+
'.x-media-lbst img,.x-media-lbst video{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;display:block;animation:pop .35s var(--ease);user-select:none;-webkit-user-select:none}'+
'.x-media-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;padding:0;border-radius:50%;background:rgba(20,22,16,.8);font-size:22px;z-index:2}'+
'.x-media-nav.p{left:8px}.x-media-nav.n{right:8px}'+
'.x-media-lbbot{padding:12px 16px calc(14px + env(safe-area-inset-bottom));max-width:720px;width:100%;margin:0 auto}'+
'.x-media-cnt{font-family:Oswald,sans-serif;color:var(--ac);font-size:15px}'+
'@media (min-width:900px){.x-media-grid{column-count:2}}';
document.head.appendChild(s);}

function esc(s){return A?A.esc(s):String(s);}
function ic(k){return A.icon(A.I[k]||A.I.info);}
function mb(n){if(n==null)return '';if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' КБ';if(n<1024*1024*1024)return (n/1048576).toFixed(n<10485760?1:0).replace('.',',')+' МБ';return (n/1073741824).toFixed(1).replace('.',',')+' ГБ';}
function uid(){return 'm'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function shown(){return M.filter==='all'?items:items.filter(function(x){return x.album===M.filter;});}
function urlOf(it){if(!urls[it.id]){try{urls[it.id]=URL.createObjectURL(it.blob);}catch(e){urls[it.id]='';}}return urls[it.id];}
function revokeAll(){for(var k in urls){try{if(urls[k])URL.revokeObjectURL(urls[k]);}catch(e){}}urls={};}

/* ---------- IndexedDB ---------- */
function openDb(cb){
  if(db){cb();return;}
  if(dbState==='off'){cb();return;}
  try{
    var rq=indexedDB.open(DBN,1);
    rq.onupgradeneeded=function(){try{rq.result.createObjectStore(ST,{keyPath:'id'});}catch(e){}};
    rq.onsuccess=function(){db=rq.result;dbState='ok';cb();};
    rq.onerror=function(){dbState='off';cb();};
    rq.onblocked=function(){dbState='off';cb();};
  }catch(e){dbState='off';cb();}
}
function loadAll(cb){
  if(!db){cb();return;}
  try{
    var out=[],cur=db.transaction(ST).objectStore(ST).openCursor();
    cur.onsuccess=function(){var c=cur.result;if(c){out.push(c.value);c.continue();}else{out.sort(function(a,b){return b.ts-a.ts;});items=out;cb();}};
    cur.onerror=function(){cb();};
  }catch(e){cb();}
}
function dbPut(rec,ok,fail){
  if(!db){ok();return;}
  try{var tx=db.transaction(ST,'readwrite');tx.objectStore(ST).put(rec);tx.oncomplete=function(){ok();};tx.onerror=function(){fail(tx.error);};tx.onabort=function(){fail(tx.error);};}
  catch(e){fail(e);}
}
function dbDel(id){if(!db)return;try{db.transaction(ST,'readwrite').objectStore(ST).delete(id);}catch(e){}}

function estimate(){
  if(!(navigator.storage&&navigator.storage.estimate))return;
  try{navigator.storage.estimate().then(function(e){M.est=e;var el=root&&root.querySelector('#x-media-use');if(el)el.innerHTML=useText();},function(){});}catch(e){}
}
function useText(){
  var mine=0;items.forEach(function(x){mine+=x.size||0;});
  var t='У медіатеці: '+items.length+' '+plural(items.length,'файл','файли','файлів')+(items.length?' · '+mb(mine):'');
  if(M.est&&M.est.quota){var p=Math.min(100,Math.round((M.est.usage||0)/M.est.quota*100));
    t+='<br>Сховище браузера: '+mb(M.est.usage||0)+' з '+mb(M.est.quota)+' ('+p+'%)';}
  return t;
}
function plural(n,a,b,c){var m10=n%10,m100=n%100;if(m10===1&&m100!==11)return a;if(m10>=2&&m10<=4&&(m100<12||m100>14))return b;return c;}

/* ---------- views ---------- */
function headHtml(){
  return '<header class="top stack"><p class="ey">Особистий архів</p><h1>Медіатека</h1>'+
  '<p class="sm mu">Твої фото й відео про підрозділ, простори, вишколи та родину. Файли зберігаються лише на цьому пристрої й нікуди не надсилаються.</p></header>'+
  '<div id="x-media-body" class="stack"><p class="sm mu" role="status">Відкриваю медіатеку…</p></div>'+
  videosHtml();
}
function videosHtml(){
  return '<section class="stack" aria-labelledby="x-media-vh"><div class="row sb"><h2 id="x-media-vh">Відео підрозділу</h2><span class="badge off">офіційні</span></div>'+
  '<p class="sm mu">Тут з\'являться офіційні відео «Артану». Посилання додамо після перевірки, а поки дивіться відео на офіційних сторінках.</p>'+
  VIDEOS.map(function(v){return '<div class="card vid" role="group" aria-label="'+esc(v[0])+'"><span class="th">'+ic('ply')+'</span><span><b style="display:block">'+esc(v[0])+'</b><span class="sm mu">'+esc(v[1])+' · [ПОСИЛАННЯ]</span></span></div>';}).join('')+
  '<a class="btn" href="#social">'+ic('soc')+'Офіційні сторінки й відео '+ic('arr')+'</a></section>';
}
function bodyHtml(){
  var h='';
  if(dbState==='off')h+='<div class="msg no" role="status">Сховище браузера недоступне. Файли буде видно лише до закриття сторінки.</div>';
  h+='<div class="card stack x-media-up"><div class="row sb"><div><p class="ey">Додати</p><h3>Фото чи відео</h3></div><span style="color:var(--ye)">'+ic('cam')+'</span></div>'+
  '<div class="grid2"><div><label for="x-media-alb">Альбом</label><select id="x-media-alb" class="x-media-sel">'+ALBUMS.map(function(a){return '<option'+(a===M.upAlbum?' selected':'')+'>'+esc(a)+'</option>';}).join('')+'</select></div>'+
  '<div><label for="x-media-cap">Підпис</label><input id="x-media-cap" class="x-media-in" type="text" maxlength="80" placeholder="Необов\'язково"></div></div>'+
  '<label for="x-media-file" class="btn pri" style="margin:0;color:#14110A;font-size:15px"'+(M.busy?' aria-disabled="true"':'')+'>'+ic('cam')+(M.busy?'Зберігаю…':'Обрати файли')+'</label>'+
  '<input id="x-media-file" type="file" accept="image/*,video/*" multiple'+(M.busy?' disabled':'')+'>'+
  '<p class="sm mu" id="x-media-use" aria-live="polite">'+useText()+'</p>'+
  (M.msg?'<div class="msg '+(M.ok?'ok':'no')+'" role="status">'+M.msg+'</div>':'')+
  '<p class="sm mu">Не публікуй у мережі фото з бійцями, технікою чи позиціями без дозволу: обличчя, номери й геолокація допомагають ворогу.</p></div>';

  if(!items.length){
    return h+'<div class="card stack x-media-empty"><div class="big" aria-hidden="true">📷</div><h3>Тут поки порожньо</h3>'+
    '<ol><li>Обери альбом: «Операції», «Простори», «Вишколи», «Пам\'ять», «Родина» чи «Інше».</li>'+
    '<li>За бажанням додай підпис.</li><li>Натисни «Обрати файли» і вибери фото або відео з телефона.</li></ol>'+
    '<p class="sm mu">Натисни на файл, щоб відкрити на весь екран. Гортай свайпом або стрілками.</p></div>';
  }
  var cnt={};items.forEach(function(x){cnt[x.album]=(cnt[x.album]||0)+1;});
  h+='<div class="x-media-chips" role="toolbar" aria-label="Фільтр за альбомом"><button class="chip'+(M.filter==='all'?' on':'')+'" data-x="flt" data-a="all" aria-pressed="'+(M.filter==='all')+'">Усі<i>'+items.length+'</i></button>'+
  ALBUMS.map(function(a){var on=M.filter===a;return '<button class="chip'+(on?' on':'')+'" data-x="flt" data-a="'+esc(a)+'" aria-pressed="'+on+'">'+esc(a)+'<i>'+(cnt[a]||0)+'</i></button>';}).join('')+'</div>';
  var list=shown();
  if(!list.length)return h+'<div class="card stack" style="text-align:center"><h3>В альбомі «'+esc(M.filter)+'» ще немає файлів</h3><p class="sm mu">Обери цей альбом вище і додай фото чи відео.</p></div>';
  h+='<div class="x-media-grid">'+list.map(function(it,i){var u=urlOf(it),lab=(it.type==='video'?'Відео':'Фото')+(it.cap?': '+it.cap:'')+' · '+it.album;
    return '<button class="x-media-it" data-x="open" data-id="'+it.id+'" aria-label="'+esc(lab)+'. Відкрити на весь екран" style="animation-delay:'+Math.min(i*.04,.4)+'s">'+
    (it.type==='video'?'<video src="'+u+'#t=0.1" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video><span class="x-media-play" aria-hidden="true">'+ic('ply')+'</span>':'<img src="'+u+'" alt="" loading="lazy">')+
    '<span class="x-media-cap">'+(it.cap?'<b>'+esc(it.cap)+'</b>':'')+'<span>'+esc(it.album)+'</span></span></button>';}).join('')+'</div>';
  return h;
}
function draw(){if(!alive||!box)return;var f=document.activeElement&&document.activeElement.getAttribute&&document.activeElement.getAttribute('data-a');box.innerHTML=bodyHtml();if(f){var b=box.querySelector('[data-x="flt"][data-a="'+f+'"]');if(b)b.focus();}}

/* ---------- lightbox ---------- */
function lbHtml(){
  var list=shown(),it=list[M.lb];if(!it)return '';var u=urlOf(it);
  return '<div class="x-media-lbtop"><span class="x-media-cnt" aria-live="polite">'+(M.lb+1)+' / '+list.length+'</span><span class="badge off">'+esc(it.album)+'</span>'+
  '<button class="ghost" data-x="lbx" aria-label="Закрити перегляд" style="min-width:48px;padding:0;font-size:22px">✕</button></div>'+
  '<div class="x-media-lbst" id="x-media-st">'+
  (list.length>1?'<button class="x-media-nav p" data-x="prev" aria-label="Попередній файл">‹</button>':'')+
  (it.type==='video'?'<video src="'+u+'" controls playsinline preload="metadata" aria-label="'+esc(it.cap||'Відео')+'"></video>':'<img src="'+u+'" alt="'+esc(it.cap||('Фото з альбому «'+it.album+'»'))+'" draggable="false">')+
  (list.length>1?'<button class="x-media-nav n" data-x="next" aria-label="Наступний файл">›</button>':'')+'</div>'+
  '<div class="x-media-lbbot stack" style="gap:10px">'+
  (M.edit?'<div class="grid2"><div><label for="x-media-ecap">Підпис</label><input id="x-media-ecap" class="x-media-in" type="text" maxlength="80" value="'+esc(it.cap||'')+'"></div>'+
     '<div><label for="x-media-ealb">Альбом</label><select id="x-media-ealb" class="x-media-sel">'+ALBUMS.map(function(a){return '<option'+(a===it.album?' selected':'')+'>'+esc(a)+'</option>';}).join('')+'</select></div></div>'+
     '<div class="row"><button class="pri" data-x="esave" style="flex:1">Зберегти</button><button data-x="ecancel" style="flex:1">Скасувати</button></div>'
  :M.del?'<div class="msg no stack" role="alertdialog" aria-label="Підтвердження видалення" style="gap:10px"><b>Видалити цей файл назавжди?</b><span class="sm">Його буде стерто з цього пристрою. Скасувати не вийде.</span>'+
     '<div class="row"><button data-x="delyes" style="flex:1;border-color:var(--bad);color:#F6B9AD">Так, видалити</button><button data-x="delno" class="pri" style="flex:1">Ні, залишити</button></div></div>'
  :'<p>'+(it.cap?esc(it.cap):'<span class="mu">Без підпису</span>')+'</p><p class="sm mu">'+(it.type==='video'?'Відео':'Фото')+' · '+mb(it.size)+' · '+new Date(it.ts).toLocaleDateString('uk-UA')+'</p>'+
     '<div class="row"><button data-x="edit" style="flex:1">Змінити підпис</button><button data-x="del" style="flex:1;border-color:var(--bad);color:#F6B9AD">Видалити</button></div>')+
  '</div>';
}
function lbOpen(i,keep){
  M.lb=i;if(!keep){M.del=false;M.edit=false;}
  if(!lbEl){lbEl=document.createElement('div');lbEl.className='x-media-lb';lbEl.setAttribute('role','dialog');lbEl.setAttribute('aria-modal','true');lbEl.setAttribute('aria-label','Перегляд медіа');
    lbEl.addEventListener('click',onClick);bindSwipe(lbEl);document.body.appendChild(lbEl);document.body.style.overflow='hidden';}
  lbEl.innerHTML=lbHtml();
  var f=lbEl.querySelector(M.edit?'#x-media-ecap':M.del?'[data-x="delno"]':'[data-x="lbx"]');if(f)try{f.focus({preventScroll:true});}catch(e){f.focus();}
}
function lbClose(){
  if(!lbEl)return;var id=(shown()[M.lb]||{}).id;M.lb=-1;M.del=false;M.edit=false;
  try{lbEl.parentNode.removeChild(lbEl);}catch(e){}lbEl=null;document.body.style.overflow='';
  if(id&&box){var b=box.querySelector('[data-id="'+id+'"]');if(b)b.focus();}
}
function lbStep(d){var n=shown().length;if(n<2||M.del||M.edit)return;lbOpen((M.lb+d+n)%n);}
function bindSwipe(el){
  var x0=null,y0=0;
  el.addEventListener('touchstart',function(e){if(!e.target.closest('#x-media-st')||e.target.tagName==='VIDEO'&&e.touches[0].clientY>e.target.getBoundingClientRect().bottom-56){x0=null;return;}x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
  el.addEventListener('touchend',function(e){if(x0===null)return;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3)lbStep(dx<0?1:-1);else if(dy>110&&Math.abs(dy)>Math.abs(dx)*1.5)lbClose();},{passive:true});
}
function onKey(e){
  if(M.lb<0)return;
  if(e.key==='Escape'){e.preventDefault();if(M.del||M.edit){M.del=false;M.edit=false;lbOpen(M.lb,1);}else lbClose();}
  else if(e.key==='ArrowRight'&&!isField(e.target)){e.preventDefault();lbStep(1);}
  else if(e.key==='ArrowLeft'&&!isField(e.target)){e.preventDefault();lbStep(-1);}
  else if(e.key==='Tab'&&lbEl){var f=lbEl.querySelectorAll('button,input,select,video[controls]');if(!f.length)return;var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
}
function isField(t){return t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA');}

/* ---------- actions ---------- */
function addFiles(files){
  var list=[],i;for(i=0;i<files.length;i++){var f=files[i],t=(f.type||'').split('/')[0];if(t==='image'||t==='video')list.push(f);}
  var skipped=files.length-list.length;
  if(!list.length){M.msg='Можна додати лише фото або відео.';M.ok=false;draw();return;}
  var albEl=box.querySelector('#x-media-alb'),capEl=box.querySelector('#x-media-cap');
  var album=albEl?albEl.value:M.upAlbum,cap=capEl?capEl.value.trim().slice(0,80):'';
  M.upAlbum=album;M.busy=true;M.msg='';draw();
  var done=0,fail=0,now=Date.now();
  function next(k){
    if(k>=list.length){M.busy=false;
      M.ok=!fail;M.msg=fail?('Не вдалося зберегти '+fail+' з '+list.length+'. Можливо, на пристрої замало місця.'):('Додано '+done+' '+plural(done,'файл','файли','файлів')+' до альбому «'+esc(album)+'».'+(skipped?' Інші файли пропущено.':''));
      if(M.filter!=='all'&&M.filter!==album)M.filter=album;
      if(done&&A&&A.S&&!A.S.done.media){A.S.done.media=true;A.save();}
      draw();estimate();return;}
    var f=list[k],rec={id:uid(),album:album,cap:cap,type:f.type.indexOf('video')===0?'video':'image',mime:f.type,name:String(f.name||'').slice(0,120),size:f.size||0,ts:now+k,blob:f};
    dbPut(rec,function(){done++;items.unshift(rec);next(k+1);},function(){fail++;next(k+1);});
  }
  next(0);
}
function removeCur(){
  var list=shown(),it=list[M.lb];if(!it)return;
  dbDel(it.id);items=items.filter(function(x){return x.id!==it.id;});
  try{if(urls[it.id])URL.revokeObjectURL(urls[it.id]);}catch(e){}delete urls[it.id];
  var n=shown().length;M.msg='Файл видалено.';M.ok=true;
  if(!n){lbClose();}else lbOpen(Math.min(M.lb,n-1));
  draw();estimate();
}
function saveEdit(){
  var it=shown()[M.lb];if(!it||!lbEl)return;
  var c=lbEl.querySelector('#x-media-ecap'),a=lbEl.querySelector('#x-media-ealb');
  it.cap=c?c.value.trim().slice(0,80):it.cap;var oldAlb=it.album;it.album=a?a.value:it.album;
  dbPut(it,function(){},function(){});
  M.edit=false;
  if(M.filter!=='all'&&it.album!==oldAlb){lbClose();}else lbOpen(M.lb);
  draw();
}
function onClick(e){
  var b=e.target.closest('[data-x]');if(!b)return;var x=b.getAttribute('data-x');
  if(x==='flt'){M.filter=b.getAttribute('data-a');M.msg='';draw();}
  else if(x==='open'){var id=b.getAttribute('data-id'),l=shown();for(var i=0;i<l.length;i++)if(l[i].id===id){lbOpen(i);break;}}
  else if(x==='lbx')lbClose();
  else if(x==='prev')lbStep(-1);
  else if(x==='next')lbStep(1);
  else if(x==='del'){M.del=true;lbOpen(M.lb,1);}
  else if(x==='delno'){M.del=false;lbOpen(M.lb,1);}
  else if(x==='delyes')removeCur();
  else if(x==='edit'){M.edit=true;lbOpen(M.lb,1);}
  else if(x==='ecancel'){M.edit=false;lbOpen(M.lb,1);}
  else if(x==='esave')saveEdit();
}
function onChange(e){
  var t=e.target;
  if(t.id==='x-media-file'&&t.files&&t.files.length){var fs=[];for(var i=0;i<t.files.length;i++)fs.push(t.files[i]);t.value='';addFiles(fs);}
  else if(t.id==='x-media-alb')M.upAlbum=t.value;
}

ArtanExt.view({id:'media',title:'Медіатека',sub:'Фото й відео',icon:'cam',home:true,
  render:function(api){A=api;css();return headHtml();},
  mount:function(r,api){
    A=api;root=r;box=r.querySelector('#x-media-body');alive=true;M.lb=-1;M.del=false;M.edit=false;M.busy=false;
    r.addEventListener('click',onClick);r.addEventListener('change',onChange);document.addEventListener('keydown',onKey);
    openDb(function(){loadAll(function(){if(alive){draw();estimate();}});});
    return function(){
      alive=false;r.removeEventListener('click',onClick);r.removeEventListener('change',onChange);document.removeEventListener('keydown',onKey);
      if(lbEl){try{lbEl.parentNode.removeChild(lbEl);}catch(e){}lbEl=null;document.body.style.overflow='';}
      M.msg='';revokeAll();items=[];root=null;box=null;
    };
  }});
})();
