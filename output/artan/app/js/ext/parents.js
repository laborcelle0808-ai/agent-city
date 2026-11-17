/* Artan extension: "Батькам і родинам" view.
   Static guidance + two on-device checklists stored in A.S.familyPlan (keys p_* and b_*).
   Contacts are only those verified with a public source (see content/fact-check.md). */
(function(){
  if(typeof ArtanExt==='undefined'||!ArtanExt||!ArtanExt.view){return;}

  var CSS=''+
    '.x-parents-ck{display:flex;flex-direction:column;padding-bottom:10px}'+
    '.x-parents-ck label{display:flex;align-items:center;gap:12px;min-height:48px;padding:6px 0;border-top:1px solid var(--ln);cursor:pointer;font-size:14.5px}'+
    '.x-parents-ck label:first-child{border-top:0}'+
    '.x-parents-ck input{width:22px;height:22px;flex:none;margin:0;accent-color:var(--ye);cursor:pointer}'+
    '.x-parents-ck label.on span{color:var(--mu)}'+
    '.x-parents-cnt{margin-left:10px;flex:none}'+
    '.x-parents-body{padding-bottom:14px;display:flex;flex-direction:column;gap:10px}'+
    '.x-parents-body h3{font-size:15px;margin:6px 0 0;color:var(--ye)}'+
    '.x-parents-body ul{margin:0;padding-left:20px;padding-bottom:0}'+
    '.x-parents-body li{margin:4px 0;font-size:14.5px;line-height:1.45}'+
    '.x-parents-src{font-size:12px;color:var(--mu);line-height:1.4}'+
    '.x-parents-src a{color:var(--ac)}'+
    '.x-parents-help{border:1px solid var(--ln);border-radius:12px;padding:10px 12px;background:var(--sf2);display:flex;flex-direction:column;gap:4px}'+
    '.x-parents-help b{font-family:Oswald,sans-serif;font-size:20px;color:var(--ye);letter-spacing:.02em}'+
    '.x-parents-help a.x-parents-num{color:var(--ye);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}'+
    '.x-parents-reset{align-self:flex-start;min-height:44px}'+
    '@media (prefers-reduced-motion:reduce){.x-parents-ck label{transition:none}}';

  function addCss(){
    if(typeof document==='undefined'||document.getElementById('ext-parents')){return;}
    var s=document.createElement('style');s.id='ext-parents';s.textContent=CSS;document.head.appendChild(s);
  }

  function ul(items){return '<ul>'+items.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>';}
  function src(html){return '<p class="x-parents-src">Джерело: '+html+'</p>';}
  function a(href,text){return '<a href="'+href+'" target="_blank" rel="noopener">'+text+'</a>';}

  /* ---------- content ---------- */
  var AGES=[
    ['6–9 років',[
      'Говоріть коротко, просто й чесно. Не вигадуйте, що «нічого не відбувається», але наголошуйте на безпеці: «Ми з тобою, дорослі дбають про твою безпеку».',
      'Спершу запитайте, що дитина вже чула, і відповідайте саме на її запитання — без зайвих подробиць.',
      'Обмежте новини, відео й розмови дорослих про страшне при дитині.',
      'Правила безпеки (сирена — укриття, невідомий предмет — не чіпати) відпрацьовуйте спокійно, як гру. Тут допоможуть місії «Школи захисника».',
      'Малювання, гра й казки допомагають дитині висловити почуття, для яких ще бракує слів.']],
    ['10–13 років',[
      'Почніть із запитання: «Що ти про це знаєш? Що говорять у школі й онлайн?» Виправляйте чутки фактами.',
      'Поясніть, як відрізнити фейк від новини і чому не варто поширювати неперевірене.',
      'Дозвольте сумувати, злитися, боятися. Назвіть почуття вголос: «Схоже, тобі страшно. Це нормально».',
      'Дайте посильну роль: зібрати свій рюкзак, вивчити номери, знайти укриття біля школи. Відчуття контролю знижує тривогу.',
      'Чесно кажіть, коли не знаєте відповіді: «Не знаю, але дізнаюся» — це теж підтримка.']],
    ['14–17 років',[
      'Розмовляйте на рівних: чесно, без драматизму й без нотацій. Поважайте думку підлітка, навіть якщо вона відрізняється.',
      'Обговоріть онлайн-ризики: публікації, що допомагають ворогу, вербування «за гроші», шахрайство.',
      'Залучайте до сімейного плану безпеки як повноправного учасника.',
      'Підтримуйте бажання допомагати безпечними способами: курси першої допомоги, волонтерство відповідно до віку, навчання.',
      'Помічайте відсторонення, ризиковану поведінку, різкі зміни в настрої — і говоріть про це прямо й без осуду.']]
  ];
  var GENERAL=[
    'Ваш спокій — головний сигнал безпеки для дитини. Подбайте й про себе: відпочинок, підтримка, допомога фахівця, якщо важко.',
    'Тримайтеся звичного розпорядку: сон, їжа, навчання, ігри. Передбачуваність заспокоює.',
    'Повертайтеся до розмови знову: одна розмова не закриває тему.'
  ];

  var STRESS_SIGNS=[
    'Проблеми зі сном, кошмари, страх засинати самому.',
    'Повернення до «молодшої» поведінки: смоктання пальця, нетримання сечі, дитина не відпускає вас ні на крок.',
    'Дратівливість, спалахи гніву, плаксивість або, навпаки, байдужість.',
    'Скарги на біль у животі чи голові без явної причини.',
    'Втрата інтересу до улюблених занять, друзів, навчання.',
    'У підлітків: замкнутість, ризикована поведінка, різкі зміни апетиту чи режиму.'
  ];
  var STRESS_DO=[
    'Будьте поруч: обійми, спільний час, увага без телефону.',
    'Слухайте без оцінок і не знецінюйте («та це дрібниці»).',
    'Повторіть разом вправи з місії «Психологічна самодопомога»: повільне дихання з довгим видихом, заземлення «5-4-3-2-1».',
    'Збережіть розпорядок і дайте можливість рухатися: прогулянки, спорт, ігри.',
    'Попередьте вчителя чи шкільного психолога, щоб підтримка була і в школі.'
  ];
  var STRESS_PRO=[
    'Ознаки не минають кілька тижнів або заважають навчатися, спати, спілкуватися.',
    'Дитина говорить про смерть, самоушкодження чи безнадію — зверніться по допомогу негайно; якщо є безпосередня загроза життю, телефонуйте 103 або 112.',
    'Почніть зі шкільного психолога або сімейного лікаря: вони підкажуть, до якого фахівця звернутися.'
  ];

  var PLAN=[
    ['p_meet1','Обрали місце зустрічі біля дому'],
    ['p_meet2','Обрали запасне місце зустрічі в іншому районі'],
    ['p_shelter','Знаємо найближчі укриття біля дому, школи й роботи'],
    ['p_paper','У кожного є папірець із важливими номерами'],
    ['p_relay','Домовилися про родича в іншому місті, якому всі повідомляють, що в безпеці'],
    ['p_school','Знаємо, хто і як забирає дитину зі школи чи садка під час тривоги'],
    ['p_alarm','Діти знають, що робити при сирені вдома, на вулиці й у школі'],
    ['p_drill','Потренувалися швидко доходити до укриття'],
    ['p_util','Дорослі вміють вимкнути газ, воду й електрику'],
    ['p_care','Продумали, як евакуювати тварин і родичів, яким потрібна допомога'],
    ['p_docs','Зробили паперові й цифрові копії документів']
  ];
  var BAG=[
    ['b_docs','Документи та їхні копії в герметичному пакеті'],
    ['b_water','Питна вода на 3 доби'],
    ['b_food','Їжа, що не потребує приготування'],
    ['b_meds','Аптечка й ліки, які хтось у родині приймає постійно'],
    ['b_medinfo','Аркуш із медичною інформацією: алергії, ліки, група крові'],
    ['b_light','Ліхтарик і запасні батарейки'],
    ['b_power','Павербанк і зарядні кабелі'],
    ['b_radio','Радіоприймач на батарейках'],
    ['b_cash','Готівка, розділена на кілька частин'],
    ['b_clothes','Змінний одяг, теплі шкарпетки, дощовик'],
    ['b_hyg','Засоби гігієни'],
    ['b_whistle','Свисток'],
    ['b_kids','Для дітей: улюблена іграшка чи книжка, перекус, записка з контактами батьків']
  ];

  var ONLINE=[
    'Налаштуйте приватність профілів разом із дитиною, вимкніть геомітки на фото.',
    'Поясніть: не можна публікувати фото й відео військових, техніки, блокпостів, роботи ППО та місць влучань — це допомагає ворогу.',
    'Якщо незнайомець пропонує гроші за «просте завдання» (сфотографувати будівлю, кудись щось віднести) — дитина нічого не робить і одразу каже вам. Так ворог вербує підлітків.',
    'Складні паролі, двофакторна автентифікація, жодних переходів за підозрілими посиланнями й «виграшами».',
    'Домовтеся: дитина може прийти до вас із будь-якою онлайн-проблемою, і її не покарають за те, що вона розповіла.',
    'Налаштуйте батьківський контроль відповідно до віку й обмежте стрічки з жорстоким контентом.'
  ];

  var MIL=[
    'Пояснюйте дитині, де мама чи тато, чесно, але без локацій, назв підрозділів і планів. І поясніть, чому про це не пишуть у мережі.',
    'Збережіть ритуали зв’язку: листи, малюнки, короткі відео, спільний «календар очікування».',
    'Коли рідний повертається зі служби, дайте всім час на адаптацію. Підтримка фахівця корисна для всієї родини, а не лише для ветерана.',
    'У разі втрати говоріть з дитиною правду простими словами, дозвольте горювати й пам’ятати. Не залишайтеся з цим наодинці — зверніться до психолога.',
    'Про пільги, виплати й державні програми дізнавайтеся тільки з офіційних ресурсів: сайту Мінветеранів, органів соцзахисту громади, ЦНАП. Не передавайте документи й дані посередникам, які обіцяють «прискорити».'
  ];

  /* ---------- render helpers ---------- */
  function plan(A){var s=A.S.familyPlan;return (s&&typeof s==='object')?s:{};}
  function cnt(items,st){var n=0;for(var i=0;i<items.length;i++){if(st[items[i][0]])n++;}return n;}
  function checks(group,items,st){
    return '<div class="x-parents-ck" role="group" aria-label="'+(group==='p'?'Сімейний план безпеки':'Тривожна валіза родини')+'">'+
      items.map(function(it){var on=!!st[it[0]];
        return '<label class="'+(on?'on':'')+'"><input type="checkbox" data-x-pk="'+it[0]+'" data-x-grp="'+group+'"'+(on?' checked':'')+'><span>'+it[1]+'</span></label>';}).join('')+
      '</div>';
  }
  function badge(group,items,st){
    return '<span class="badge x-parents-cnt'+(cnt(items,st)===items.length?'':' off')+'" data-x-cnt="'+group+'" aria-label="Виконано '+cnt(items,st)+' з '+items.length+'">'+cnt(items,st)+'/'+items.length+'</span>';
  }
  function help(num,tel,title,desc,source){
    return '<div class="x-parents-help">'+
      '<b>'+(tel?'<a class="x-parents-num" href="tel:'+tel+'">'+num+'</a>':num)+'</b>'+
      '<span><strong>'+title+'</strong></span>'+
      (desc?'<span class="sm mu">'+desc+'</span>':'')+
      (source?src(source):'')+
      '</div>';
  }

  function render(A){
    addCss();
    var st=plan(A);
    return '<header class="top stack"><p class="ey">Для дорослих</p><h1>Батькам і родинам</h1>'+
      '<p class="sm mu">Як говорити з дітьми про війну, помітити стрес, підготувати родину і де шукати допомоги. Відмітки в чек-листах зберігаються лише на цьому пристрої.</p></header>'+

      '<details><summary>Як говорити з дитиною про війну</summary><div class="x-parents-body">'+
        AGES.map(function(g){return '<h3>'+g[0]+'</h3>'+ul(g[1]);}).join('')+
        '<h3>Для будь-якого віку</h3>'+ul(GENERAL)+
      '</div></details>'+

      '<details><summary>Ознаки стресу в дитини і що робити</summary><div class="x-parents-body">'+
        '<h3>На що звернути увагу</h3>'+ul(STRESS_SIGNS)+
        '<h3>Що можна зробити вдома</h3>'+ul(STRESS_DO)+
        '<h3>Коли звертатися до фахівця</h3>'+ul(STRESS_PRO)+
      '</div></details>'+

      '<details><summary>Сімейний план безпеки'+badge('p',PLAN,st)+'</summary><div class="x-parents-body">'+
        '<p class="sm mu">Пройдіть пункти разом із дітьми. Відмітки бачите лише ви на цьому пристрої.</p>'+
        checks('p',PLAN,st)+
        '<button class="ghost x-parents-reset" data-x="reset" data-x-grp="p">Скинути відмітки</button>'+
      '</div></details>'+

      '<details><summary>Тривожна валіза родини'+badge('b',BAG,st)+'</summary><div class="x-parents-body">'+
        '<p class="sm mu">Запас розраховують на 3 доби. Зручніше зібрати рюкзак, щоб руки були вільні. Перевіряйте термін придатності води, їжі й ліків.</p>'+
        checks('b',BAG,st)+
        '<button class="ghost x-parents-reset" data-x="reset" data-x-grp="b">Скинути відмітки</button>'+
        src(a('https://mon.gov.ua/static-objects/mon/sites/1/civilniy-zahist/2022/03.02/Rekom.vmist.tryvozhnoyi.valizy.03.02.pdf','рекомендації МОН щодо вмісту тривожної валізи')+'; '+a('https://kyivcity.gov.ua/bezpeka_ta_pravoporiadok/pam_yatky/ekstrena_valiza_shcho_potribno_maty_na_vypadok_viiny/','пам’ятка КМДА')+'.')+
      '</div></details>'+

      '<details><summary>Безпека дітей онлайн</summary><div class="x-parents-body">'+
        ul(ONLINE)+
        '<p class="sm">Про онлайн-шахрайство чи загрози дитині в мережі повідомляйте кіберполіції через офіційний сайт cyberpolice.gov.ua. Якщо дитині загрожує небезпека зараз — телефонуйте 102.</p>'+
      '</div></details>'+

      '<details><summary>Де шукати допомоги</summary><div class="x-parents-body">'+
        '<div class="grid2">'+[['112','Єдиний екстрений номер'],['101','Рятувальники'],['102','Поліція'],['103','Швидка допомога']].map(function(t){return '<a class="btn tel" href="tel:'+t[0]+'"><b>'+t[0]+'</b><span>'+t[1]+'</span></a>';}).join('')+'</div>'+
        help('116 111','116111','Національна дитяча гаряча лінія','Для дітей, підлітків і батьків: безкоштовно й анонімно. Зі стаціонарного телефону — 0 800 500 225. Графік роботи уточнюйте на сайті ГО «Ла Страда-Україна».',
          a('https://bolgrad-rda.od.gov.ua/wp-content/uploads/2022/03/015-116-111-%E2%80%93-naczionalna-dytyacha-garyacha-liniya.pdf','пам’ятка Болградської РДА (2022)'))+
        help('116 123','116123','Національна гаряча лінія з попередження домашнього насильства, торгівлі людьми та ґендерної дискримінації','Цілодобово й безкоштовно. Також 0 800 500 335 (з мобільного чи стаціонарного).',
          a('https://ukraine.unfpa.org/sites/default/files/pub-pdf/shcho_varto_pam_yataty_u_vypadku_domashnogo_nasylstva_a4.pdf','UNFPA Україна'))+
        help('1547','1547','Урядова гаряча лінія','З питань протидії домашньому насильству, торгівлі людьми, насильству за ознакою статі та насильству стосовно дітей.',
          a('https://ukraine.unfpa.org/sites/default/files/pub-pdf/shcho_varto_pam_yataty_u_vypadku_domashnogo_nasylstva_a4.pdf','UNFPA Україна'))+
        '<p class="sm mu">Психологічну підтримку дитині допоможуть знайти шкільний психолог і сімейний лікар. Інші гарячі лінії перевіряйте лише на офіційних сайтах державних органів і відомих організацій.</p>'+
      '</div></details>'+

      '<details><summary>Підтримка родин військових і ветеранів</summary><div class="x-parents-body">'+
        ul(MIL)+
        help('0 800 505 217','0800505217','Єдина ветеранська лінія','Консультації для ветеранів, членів їхніх родин і родин полеглих. Запущена Мінветеранів разом з Українським Червоним Хрестом у березні 2024 року в тестовому режимі, тож актуальний графік уточнюйте.',
          a('https://lb.ua/society/2024/03/23/604864_ukraini_testovomu_rezhimi.html','LB.ua, 23.03.2024'))+
        '<p class="sm">Простори «Артан» підтримують ветеранів підрозділу й родини полеглих: допомагають з консультаціями, психологічною та іншою підтримкою.</p>'+
        src(a('https://suspilne.media/ivano-frankivsk/1251752-ak-u-frankivsku-pracue-vidkritij-prostir-specpidrozdilu-gur-artan/','Суспільне Івано-Франківськ'))+
        '<a class="btn" href="#map">Простори «Артан» на карті '+A.icon(A.I.arr)+'</a>'+
      '</div></details>'+

      '<a class="btn pri" href="#sos">SOS-пам’ятка для всієї родини '+A.icon(A.I.arr)+'</a>'+
      '<p class="sm mu">Розділ має довідковий характер і не замінює консультації лікаря чи психолога.</p>';
  }

  function mount(root,A){
    if(!root){return null;}
    function store(){
      if(!A.S.familyPlan||typeof A.S.familyPlan!=='object'){A.S.familyPlan={};}
      return A.S.familyPlan;
    }
    function refresh(group){
      var items=group==='p'?PLAN:BAG,st=plan(A),n=cnt(items,st);
      var b=root.querySelector('[data-x-cnt="'+group+'"]');
      if(b){b.textContent=n+'/'+items.length;b.setAttribute('aria-label','Виконано '+n+' з '+items.length);b.className='badge x-parents-cnt'+(n===items.length?'':' off');}
    }
    function onChange(e){
      var t=e.target;if(!t||!t.getAttribute){return;}
      var k=t.getAttribute('data-x-pk');if(!k){return;}
      var st=store();
      if(t.checked){st[k]=true;}else{delete st[k];}
      if(t.parentNode){t.parentNode.className=t.checked?'on':'';}
      A.save();
      refresh(t.getAttribute('data-x-grp'));
    }
    function onClick(e){
      var b=e.target&&e.target.closest?e.target.closest('[data-x="reset"]'):null;if(!b){return;}
      e.preventDefault();
      var g=b.getAttribute('data-x-grp'),items=g==='p'?PLAN:BAG,st=store();
      for(var i=0;i<items.length;i++){delete st[items[i][0]];}
      A.save();
      var boxes=root.querySelectorAll('input[data-x-grp="'+g+'"]');
      for(var j=0;j<boxes.length;j++){boxes[j].checked=false;if(boxes[j].parentNode){boxes[j].parentNode.className='';}}
      refresh(g);
    }
    root.addEventListener('change',onChange);
    root.addEventListener('click',onClick);
    return function(){root.removeEventListener('change',onChange);root.removeEventListener('click',onClick);};
  }

  ArtanExt.view({id:'parents',title:'Батькам і родинам',sub:'Як говорити з дітьми, безпека, підтримка',icon:'ppl',home:true,render:render,mount:mount});
})();
