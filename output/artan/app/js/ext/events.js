/* Artan extension: events calendar — month grid, agenda, personal reminders, .ics export. */
(function(){
if(!window.ArtanExt)return;

var A=null,root=null,box=null,alive=false;
var E={y:0,m:0,sel:null,city:'all',form:null,del:null,msg:'',ok:true,dlink:null};
/* form: {id|null,t,date,time,city,own,note,err} */

function css(){if(document.getElementById('ext-events'))return;var s=document.createElement('style');s.id='ext-events';s.textContent=
'.x-events-in{width:100%;height:48px;padding:0 12px;border-radius:12px;border:1px solid #6E7463;background:var(--sf);color:var(--tx);font:inherit;color-scheme:dark}'+
'textarea.x-events-in{height:auto;min-height:84px;padding:10px 12px;resize:vertical;line-height:1.4}'+
'.x-events-in:focus{border-color:var(--ye);box-shadow:0 0 0 3px rgba(242,194,48,.18);outline:0}'+
'.x-events-in[aria-invalid=true]{border-color:var(--bad)}'+
'.x-events-mh{display:grid;grid-template-columns:48px 1fr 48px;align-items:center;gap:8px}'+
'.x-events-mh h2{text-align:center}.x-events-mh button{padding:0;font-size:22px}'+
'.x-events-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}'+
'.x-events-wd{text-align:center;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--ac);font-weight:600;padding:4px 0}'+
'.x-events-wd.we{color:#C9A27A}'+
'.x-events-d{min-height:48px;padding:4px 0 6px;border-radius:10px;flex-direction:column;gap:3px;font-family:Oswald,sans-serif;font-size:16px;font-weight:500;background:var(--sf);border:1px solid transparent;position:relative}'+
'.x-events-d.out{opacity:.35}'+
'.x-events-d.td{border-color:var(--ye);color:var(--ye)}'+
'.x-events-d.on{background:var(--ye);color:#14110A;border-color:var(--ye)}'+
'.x-events-d i{display:flex;gap:3px;height:6px}.x-events-d i b{width:6px;height:6px;border-radius:50%;background:var(--ye)}.x-events-d.on i b{background:#14110A}'+
'.x-events-ev{display:grid;grid-template-columns:62px 1fr;gap:12px;align-items:start;padding:12px}'+
'.x-events-ev .date{padding-top:2px}'+
'.x-events-ev h3{font-size:16px;margin-bottom:2px}'+
'.x-events-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.x-events-acts button{min-height:44px;font-size:13px;padding:0 12px}'+
'.x-events-ex{border-style:dashed;background:repeating-linear-gradient(45deg,#14160F 0 10px,#171A12 10px 20px)}'+
'.x-events-ex .badge{background:var(--sf2);color:var(--ac);border:1px solid var(--ln)}'+
'.x-events-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none}.x-events-chips::-webkit-scrollbar{display:none}.x-events-chips .chip{flex:none;white-space:nowrap}'+
'.x-events-today{border-color:rgba(242,194,48,.45)}'+
'.x-events-today li{margin:4px 0}';
document.head.appendChild(s);}

function esc(s){return A.esc(s==null?'':s);}
function ic(k){return A.icon(A.I[k]||A.I.info);}
function pad(n){return (n<10?'0':'')+n;}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function parse(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]):null;}
function todayIso(){return iso(new Date());}
function uid(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

/* Ukrainian names via Intl with static fallback */
var FB_M=['січень','лютий','березень','квітень','травень','червень','липень','серпень','вересень','жовтень','листопад','грудень'];
var FB_MG=['січ','лют','бер','кві','тра','чер','лип','сер','вер','жов','лис','гру'];
var FB_W=['пн','вт','ср','чт','пт','сб','нд'];
function fmt(d,o,fb){try{return new Intl.DateTimeFormat('uk-UA',o).format(d);}catch(e){return fb;}}
function monthName(y,m){var s=fmt(new Date(y,m,1),{month:'long'},FB_M[m]);if(/[ая]$/.test(s)&&s!==FB_M[m])s=FB_M[m];return cap1(s)+' '+y;}
function wdNames(){var r=[];for(var i=0;i<7;i++)r.push(fmt(new Date(2024,0,1+i),{weekday:'short'},FB_W[i]).replace('.',''));return r;}
function shortDate(s){var d=parse(s);if(!d)return '[ДАТА]';return d.getDate()+'<br>'+fmt(d,{month:'short'},FB_MG[d.getMonth()]).replace('.','').toUpperCase().slice(0,4);}
function cap1(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function longDate(s){var d=parse(s);if(!d)return '[ДАТА]';return cap1(fmt(d,{weekday:'long',day:'numeric',month:'long'},d.getDate()+'.'+pad(d.getMonth()+1)));}

/* Built-in samples: no real dates — placeholders only. */
function samples(){
  var sp=A.SPACES||[],c0=sp[0]?sp[0].c:'[МІСТО]',hasV=sp.some(function(s){return s.c==='Вінниця';});
  return [
    {id:'x1',ex:1,t:'«Звитяга»: заїзд на вишкіл',city:'[ОБЛАСТЬ]',time:'',note:'П\'ять днів з інструкторами: такмед, дрони, топографія. Для молоді 13–20 років. Дату й місце дивись в офіційних анонсах.',go:'#zvytiaha',goT:'Подати заявку'},
    {id:'x2',ex:1,t:'Зустріч у просторі «Артан»',city:c0,time:'[ЧАС]',note:'Відкриті двері для ветеранів і родин: консультації та підтримка. Адреса: [АДРЕСА].',go:'#map',goT:'Карта просторів'},
    {id:'x3',ex:1,t:'Турнір під егідою «Артану»',city:hasV?'Вінниця':'[МІСТО]',time:'',note:'Спортивні змагання серед дітей та молоді. Дату, вік учасників і реєстрацію уточнюй на офіційних сторінках.',go:'#social',goT:'Офіційні сторінки'}
  ];
}
function mine(){if(!A.S.events||Object.prototype.toString.call(A.S.events)!=='[object Array]')A.S.events=[];return A.S.events;}
function sortEv(a,b){return (a.date+(a.time||'99')).localeCompare(b.date+(b.time||'99'));}
function cityOk(ev){return E.city==='all'||ev.city===E.city;}
function onDay(s){return mine().filter(function(e){return e.date===s;});}
function cities(){var seen={},r=[];mine().forEach(function(e){if(e.city&&!seen[e.city]){seen[e.city]=1;r.push(e.city);}});samples().forEach(function(e){if(e.city.charAt(0)!=='['&&!seen[e.city]){seen[e.city]=1;r.push(e.city);}});return r;}

/* ---------- HTML ---------- */
function headHtml(){return '<header class="top stack"><p class="ey">Планування</p><h1>Календар подій</h1><p class="sm mu">Вишколи, зустрічі в просторах, турніри та твої нагадування. Усе зберігається лише на цьому пристрої.</p></header><div id="x-events-body" class="stack"></div>';}

function todayHtml(){
  var t=todayIso(),list=onDay(t).sort(sortEv),now=new Date(),h=now.getHours();
  return '<div class="card stack x-events-today" aria-labelledby="x-events-th"><div class="row sb"><div><p class="ey">Сьогодні</p><h3 id="x-events-th">'+esc(longDate(t))+'</h3></div><span style="color:var(--ye)">'+ic('flag')+'</span></div>'+
  '<ul style="list-style:none;padding:0">'+
  '<li class="row" style="gap:10px"><span class="date" style="width:48px">9:00</span><span class="sm">Загальнонаціональна хвилина мовчання'+(h>=9?' <span class="mu">· минула</span>':'')+'</span></li>'+
  list.map(function(e){return '<li class="row" style="gap:10px"><span class="date" style="width:48px">'+(e.time?esc(e.time):'день')+'</span><span class="sm"><b>'+esc(e.t)+'</b>'+(e.city?' <span class="mu">· '+esc(e.city)+'</span>':'')+'</span></li>';}).join('')+'</ul>'+
  '<p class="sm mu">'+(list.length?'Твоїх подій сьогодні: '+list.length+'.':'Твоїх подій на сьогодні немає.')+' Нагадування видно тут, у застосунку; сповіщення на телефон не надсилаються.</p></div>';
}
function calHtml(){
  var y=E.y,m=E.m,first=new Date(y,m,1),off=(first.getDay()+6)%7,start=new Date(y,m,1-off),t=todayIso(),wd=wdNames(),h='';
  for(var i=0;i<7;i++)h+='<div class="x-events-wd'+(i>4?' we':'')+'" aria-hidden="true">'+esc(wd[i])+'</div>';
  var cells=Math.ceil((off+new Date(y,m+1,0).getDate())/7)*7;
  for(var k=0;k<cells;k++){var d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+k),s=iso(d),evs=onDay(s).filter(cityOk),cls='btn x-events-d';
    if(d.getMonth()!==m)cls+=' out';if(s===t)cls+=' td';if(s===E.sel)cls+=' on';
    h+='<button class="'+cls+'" data-x="day" data-d="'+s+'" aria-pressed="'+(s===E.sel)+'" aria-label="'+esc(longDate(s))+(evs.length?', подій: '+evs.length:'')+(s===t?', сьогодні':'')+'">'+d.getDate()+'<i>'+evs.slice(0,3).map(function(){return '<b></b>';}).join('')+'</i></button>';}
  return '<div class="card stack"><div class="x-events-mh"><button data-x="mprev" aria-label="Попередній місяць">‹</button><h2 aria-live="polite">'+esc(monthName(y,m))+'</h2><button data-x="mnext" aria-label="Наступний місяць">›</button></div>'+
  '<div class="x-events-cal" role="group" aria-label="Дні місяця">'+h+'</div>'+
  '<div class="row"><button data-x="mtoday" class="ghost" style="flex:1">Сьогодні</button><button data-x="add" class="pri" style="flex:1">'+ic('flag')+'Додати</button></div></div>';
}
function evHtml(e){
  var confirm=E.del===e.id;
  return '<article class="card x-events-ev'+(e.ex?' x-events-ex':'')+'"><span class="date">'+(e.ex?'[ДАТА]':shortDate(e.date))+(e.time?'<br><span style="color:var(--tx);font-size:13px">'+esc(e.time)+'</span>':'')+'</span>'+
  '<div><div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:4px">'+(e.ex?'<span class="badge">приклад</span>':'<span class="badge off">моє</span>')+(e.city?'<span class="sm mu">'+ic('map').replace('class="ic"','class="ic" style="width:14px;height:14px;vertical-align:-2px"')+' '+esc(e.city)+'</span>':'')+'</div>'+
  '<h3>'+esc(e.t)+'</h3>'+(e.note?'<p class="sm mu" style="white-space:pre-line">'+esc(e.note)+'</p>':'')+
  (confirm?'<div class="msg no stack" role="alertdialog" aria-label="Підтвердження видалення" style="gap:8px;margin-top:10px"><b>Видалити цю подію?</b><div class="row"><button data-x="delyes" data-id="'+e.id+'" style="flex:1;border-color:var(--bad);color:#F6B9AD">Так, видалити</button><button data-x="delno" class="pri" style="flex:1">Ні</button></div></div>'
  :'<div class="x-events-acts">'+(e.ex?'<button data-x="fromex" data-id="'+e.id+'">'+ic('flag')+'Створити нагадування</button>'+(e.go?'<a class="btn ghost" style="min-height:44px;font-size:13px;padding:0 12px" href="'+e.go+'">'+esc(e.goT)+'</a>':'')
     :'<button data-x="ics" data-id="'+e.id+'">'+ic('pln')+'Додати в календар</button><button data-x="edit" data-id="'+e.id+'" class="ghost">Змінити</button><button data-x="del" data-id="'+e.id+'" class="ghost" style="color:#F6B9AD">Видалити</button>')+'</div>')+
  (E.dlink&&E.dlink.id===e.id?'<div class="msg ok" style="margin-top:10px" role="status">Збереження тут недоступне. <a href="'+E.dlink.href+'" download="'+esc(E.dlink.fn)+'" style="color:var(--ye);font-weight:600">Завантажити файл .ics</a> і відкрити його в календарі.</div>':'')+
  '</div></article>';
}
function formHtml(){
  var f=E.form,sp=A.SPACES||[],inList=!f.own;
  return '<form id="x-events-form" class="card stack" novalidate aria-labelledby="x-events-fh"><div class="row sb"><h2 id="x-events-fh">'+(f.id?'Змінити подію':'Нова подія')+'</h2><button type="button" data-x="fcancel" class="ghost" aria-label="Закрити форму" style="min-width:48px;padding:0">✕</button></div>'+
  '<div><label for="x-events-t">Назва</label><input id="x-events-t" class="x-events-in" type="text" maxlength="80" required value="'+esc(f.t)+'" placeholder="Напр., зустріч у просторі"'+(f.err==='t'?' aria-invalid="true"':'')+'></div>'+
  '<div class="grid2"><div><label for="x-events-d">Дата</label><input id="x-events-d" class="x-events-in" type="date" required value="'+esc(f.date)+'"'+(f.err==='d'?' aria-invalid="true"':'')+'></div>'+
  '<div><label for="x-events-tm">Час (необов\'язково)</label><input id="x-events-tm" class="x-events-in" type="time" value="'+esc(f.time)+'"></div></div>'+
  '<div><label for="x-events-c">Місто</label><select id="x-events-c" class="x-events-in"><option value="">Без міста</option>'+
  sp.map(function(s){return '<option'+(inList&&f.city===s.c?' selected':'')+'>'+esc(s.c)+'</option>';}).join('')+'<option value="__own"'+(f.own?' selected':'')+'>Інше місто…</option></select></div>'+
  (f.own?'<div><label for="x-events-co">Своє місто</label><input id="x-events-co" class="x-events-in" type="text" maxlength="30" value="'+esc(f.city)+'"></div>':'')+
  '<div><label for="x-events-n">Нотатка</label><textarea id="x-events-n" class="x-events-in" maxlength="300" placeholder="Що взяти, з ким іти…">'+esc(f.note)+'</textarea></div>'+
  '<p class="sm mu">Не записуй тут адреси військових об\'єктів, маршрути чи дані про бійців.</p>'+
  (f.err?'<div class="msg no" role="alert">'+(f.err==='t'?'Вкажи назву події.':'Обери дату події.')+'</div>':'')+
  '<div class="row"><button type="submit" class="pri" style="flex:1">'+(f.id?'Зберегти зміни':'Зберегти подію')+'</button><button type="button" data-x="fcancel" style="flex:1">Скасувати</button></div></form>';
}
function agendaHtml(){
  var t=todayIso(),all=mine().filter(cityOk).sort(sortEv),h='';
  var cs=cities();
  h+='<div class="stack" style="gap:8px"><h2>Розклад</h2>'+(cs.length?'<div class="x-events-chips" role="toolbar" aria-label="Фільтр за містом"><button class="chip'+(E.city==='all'?' on':'')+'" data-x="city" data-c="all" aria-pressed="'+(E.city==='all')+'">Усі міста</button>'+
  cs.map(function(c){var on=E.city===c;return '<button class="chip'+(on?' on':'')+'" data-x="city" data-c="'+esc(c)+'" aria-pressed="'+on+'">'+esc(c)+'</button>';}).join('')+'</div>':'')+'</div>';
  if(E.sel){var ds=all.filter(function(e){return e.date===E.sel;});
    h+='<div class="row sb"><h3>'+esc(longDate(E.sel))+'</h3><button class="ghost" data-x="unsel" style="min-height:40px">Усі дні</button></div>'+
    (ds.length?ds.map(evHtml).join(''):'<div class="card stack"><p class="sm mu">На цей день подій немає'+(E.city!=='all'?' у місті «'+esc(E.city)+'»':'')+'.</p><button data-x="add" class="pri">Додати подію на цей день</button></div>');}
  else{
    var up=all.filter(function(e){return e.date>=t;}),past=all.filter(function(e){return e.date<t;}).reverse();
    h+=up.length?up.map(evHtml).join(''):'<div class="card stack" style="text-align:center"><div class="big" aria-hidden="true">🗓️</div><h3>'+(mine().length&&E.city!=='all'?'Немає подій у місті «'+esc(E.city)+'»':'Твоїх запланованих подій поки немає')+'</h3><p class="sm mu">Натисни на день у календарі або «Додати подію». Можна взяти за основу приклад нижче.</p></div>';
    if(past.length)h+='<details><summary>Минулі події ('+past.length+')</summary><div class="stack" style="padding-bottom:12px">'+past.map(evHtml).join('')+'</div></details>';
  }
  var ex=samples().filter(cityOk);
  if(ex.length)h+='<div class="stack" style="gap:8px;margin-top:6px"><h2>Приклади подій</h2><p class="sm mu">Це зразки без реальних дат. Точні дати й місця — лише в офіційних анонсах підрозділу.</p>'+ex.map(evHtml).join('')+'</div>';
  return h;
}
function bodyHtml(){
  return todayHtml()+calHtml()+(E.form?formHtml():'')+(E.msg?'<div class="msg '+(E.ok?'ok':'no')+'" role="status">'+E.msg+'</div>':'')+agendaHtml();
}
function draw(focusSel){if(!alive||!box)return;box.innerHTML=bodyHtml();if(focusSel){var el=box.querySelector(focusSel);if(el)try{el.focus({preventScroll:false});}catch(e){el.focus();}}}

/* ---------- form ---------- */
function readForm(){
  var f=E.form;if(!f||!box)return;var g=function(id){var el=box.querySelector('#'+id);return el?el.value:null;};
  var v;if((v=g('x-events-t'))!==null)f.t=v;if((v=g('x-events-d'))!==null)f.date=v;if((v=g('x-events-tm'))!==null)f.time=v;if((v=g('x-events-n'))!==null)f.note=v;
  var c=g('x-events-c');if(c!==null){if(c==='__own'){if(!f.own){f.own=true;f.city='';}else{var o=g('x-events-co');if(o!==null)f.city=o;}}else{f.own=false;f.city=c;}}
}
function openForm(f){E.form=f;E.del=null;E.msg='';draw('#x-events-t');var fm=box.querySelector('#x-events-form');if(fm&&fm.scrollIntoView)fm.scrollIntoView({block:'center',behavior:'smooth'});}
function submit(){
  readForm();var f=E.form;f.t=(f.t||'').trim().slice(0,80);f.note=(f.note||'').trim().slice(0,300);f.city=(f.city||'').trim().slice(0,30);
  if(!f.t){f.err='t';draw('#x-events-t');return;}
  if(!parse(f.date)){f.err='d';draw('#x-events-d');return;}
  if(!/^\d{2}:\d{2}$/.test(f.time||''))f.time='';
  var list=mine(),rec={id:f.id||uid(),t:f.t,date:f.date,time:f.time,city:f.city,note:f.note,ts:Date.now()};
  if(f.id){for(var i=0;i<list.length;i++)if(list[i].id===f.id){list[i]=rec;break;}}else list.push(rec);
  A.save();
  var d=parse(f.date);E.y=d.getFullYear();E.m=d.getMonth();E.sel=f.date;
  if(E.city!=='all'&&E.city!==rec.city)E.city='all';
  E.msg=f.id?'Подію оновлено.':'Подію збережено. Її видно в календарі.';E.ok=true;E.form=null;
  if(!f.id&&!A.S.done.events){A.S.done.events=true;A.save();}
  draw();
}

/* ---------- .ics export ---------- */
function icsEsc(s){return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');}
function fold(line){var out='',n=0,cur='';for(var i=0;i<line.length;i++){var ch=line.charAt(i),b=encodeURIComponent(ch).replace(/%[0-9A-F]{2}/g,'x').length;if(n+b>73){out+=cur+'\r\n ';cur='';n=1;}cur+=ch;n+=b;}return out+cur;}
function stamp(d){return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';}
function loc(d){return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';}
function ics(e){
  var d=parse(e.date),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Artan//Calendar//UK','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:'+e.id+'@artan.local','DTSTAMP:'+stamp(new Date())];
  if(e.time){var p=e.time.split(':'),s=new Date(d.getFullYear(),d.getMonth(),d.getDate(),+p[0],+p[1]),en=new Date(s.getTime()+3600000);L.push('DTSTART:'+loc(s),'DTEND:'+loc(en));}
  else{var nx=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1);L.push('DTSTART;VALUE=DATE:'+iso(d).replace(/-/g,''),'DTEND;VALUE=DATE:'+iso(nx).replace(/-/g,''));}
  L.push('SUMMARY:'+icsEsc(e.t));if(e.city)L.push('LOCATION:'+icsEsc(e.city));if(e.note)L.push('DESCRIPTION:'+icsEsc(e.note));
  L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(e.t),'TRIGGER:'+(e.time?'-PT1H':'-PT15H'),'END:VALARM','END:VEVENT','END:VCALENDAR');
  return L.map(fold).join('\r\n')+'\r\n';
}
function fname(e){return ('Артан-'+e.date+'-'+e.t).replace(/[^\wА-Яа-яЇїІіЄєҐґ\- ]/g,'').replace(/\s+/g,'-').slice(0,60)+'.ics';}
function exportIcs(id){
  var e=mine().filter(function(x){return x.id===id;})[0];if(!e)return;
  var txt=ics(e),fn=fname(e),blob=new Blob([txt],{type:'text/calendar;charset=utf-8'});
  E.dlink=null;
  var fallback=function(){E.dlink={id:id,fn:fn,href:'data:text/calendar;charset=utf-8,'+encodeURIComponent(txt)};E.msg='';draw('[data-x="ics"][data-id="'+id+'"]');};
  var go=function(api){
    if(!alive)return;
    if(!api){fallback();return;}
    api.save({filename:fn,data:blob}).then(function(){E.msg='Файл «'+esc(fn)+'» збережено. Відкрий його, щоб додати подію в календар телефона.';E.ok=true;draw();},
      function(err){E.msg=err&&err.code==='declined'?'Збереження скасовано.':'Не вдалося зберегти файл. Спробуй ще раз.';E.ok=false;draw();});
  };
  var p;try{p=A.dl();}catch(x){p=null;}
  if(p&&p.then)p.then(go,function(){go(null);});else go(null);
}

/* ---------- events ---------- */
function onClick(ev){
  var b=ev.target.closest('[data-x]');if(!b||!box||!box.contains(b))return;var x=b.getAttribute('data-x'),id=b.getAttribute('data-id');
  if(x==='mprev'||x==='mnext'){readForm();E.m+=x==='mprev'?-1:1;if(E.m<0){E.m=11;E.y--;}if(E.m>11){E.m=0;E.y++;}draw('[data-x="'+x+'"]');}
  else if(x==='mtoday'){readForm();var n=new Date();E.y=n.getFullYear();E.m=n.getMonth();E.sel=todayIso();draw('[data-x="mtoday"]');}
  else if(x==='day'){readForm();var s=b.getAttribute('data-d'),d=parse(s);E.sel=E.sel===s?null:s;if(d.getMonth()!==E.m){E.y=d.getFullYear();E.m=d.getMonth();}if(E.form&&E.sel&&!E.form.id)E.form.date=E.sel;E.msg='';draw('[data-x="day"][data-d="'+s+'"]');}
  else if(x==='unsel'){E.sel=null;draw();}
  else if(x==='add'){openForm({id:null,t:'',date:E.sel||todayIso(),time:'',city:A.S.city&&(A.SPACES||[]).some(function(s){return s.c===A.S.city;})?A.S.city:'',own:false,note:'',err:''});}
  else if(x==='fromex'){var sx=samples().filter(function(s){return s.id===id;})[0];if(!sx)return;var real=sx.city.charAt(0)!=='[';
    openForm({id:null,t:sx.t,date:E.sel||'',time:'',city:real?sx.city:'',own:false,note:'Дату уточнити в офіційному анонсі.',err:''});}
  else if(x==='edit'){var e=mine().filter(function(z){return z.id===id;})[0];if(!e)return;var own=!!e.city&&!(A.SPACES||[]).some(function(s){return s.c===e.city;});
    openForm({id:e.id,t:e.t,date:e.date,time:e.time||'',city:e.city||'',own:own,note:e.note||'',err:''});}
  else if(x==='fcancel'){E.form=null;draw('[data-x="add"]');}
  else if(x==='del'){readForm();E.del=id;E.msg='';draw('[data-x="delno"]');}
  else if(x==='delno'){var was=E.del;E.del=null;draw('[data-x="del"][data-id="'+was+'"]');}
  else if(x==='delyes'){A.S.events=mine().filter(function(z){return z.id!==id;});A.save();E.del=null;if(E.form&&E.form.id===id)E.form=null;E.msg='Подію видалено.';E.ok=true;draw();}
  else if(x==='city'){readForm();E.city=b.getAttribute('data-c');draw('[data-x="city"][data-c="'+b.getAttribute('data-c')+'"]');}
  else if(x==='ics'){exportIcs(id);}
}
function onChange(ev){if(ev.target.id==='x-events-c'){readForm();E.form.err='';draw(E.form.own?'#x-events-co':'#x-events-c');}}
function onSubmit(ev){if(ev.target.id==='x-events-form'){ev.preventDefault();submit();}}

ArtanExt.view({id:'events',title:'Календар подій',sub:'Вишколи, зустрічі, нагадування',icon:'flag',home:true,
  render:function(api){A=api;css();mine();if(!E.y){var n=new Date();E.y=n.getFullYear();E.m=n.getMonth();}return headHtml();},
  mount:function(r,api){
    A=api;root=r;box=r.querySelector('#x-events-body');alive=true;E.del=null;E.dlink=null;E.msg='';
    r.addEventListener('click',onClick);r.addEventListener('change',onChange);r.addEventListener('submit',onSubmit);
    draw();
    return function(){alive=false;r.removeEventListener('click',onClick);r.removeEventListener('change',onChange);r.removeEventListener('submit',onSubmit);root=null;box=null;};
  }});
})();
