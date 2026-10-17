/* ===== коллекции и достижения ===== */
var SETS=[{id:"s1",n:"Классика",ids:[1,2,3,4,5,6,7,8,11],r:["coin",800]},{id:"s2",n:"Базовые NFT",ids:[9,10,12,13,30,31,32],r:["case",4]},{id:"s3",n:"Дорогие NFT",ids:[14,15,16,33,34],r:["coin",4000]},{id:"s4",n:"Топ NFT",ids:[17,18,19],r:["title","s1"]},{id:"s5",n:"Хэллоуин",ids:[20,21,22,23,24],r:["frame","f5"],ev:1},{id:"s6",n:"Новый год",ids:[25,26,27,28,29],r:["frame","f6"],ev:2}];
function setProg(st){var n=0;st.ids.forEach(function(g){if((S.seen||{})[g])n++});return n}
var ACH=[
 {id:"a1",n:"Первый кейс",d:"Откройте кейс",v:function(){return S.st.cases},t:1,r:["coin",100]},
 {id:"a2",n:"Любитель кейсов",d:"Откройте 25 кейсов",v:function(){return S.st.cases},t:25,r:["case",1]},
 {id:"a3",n:"Мастер кейсов",d:"Откройте 100 кейсов",v:function(){return S.st.cases},t:100,r:["case",4]},
 {id:"a4",n:"Коллекционер",d:"10 подарков в инвентаре",v:function(){return S.inv.length},t:10,r:["case",1]},
 {id:"a5",n:"Богач",d:"Коллекция дороже 20 000",v:function(){return cv()},t:20000,r:["coin",1500]},
 {id:"a6",n:"Топ-находка",d:"Выбейте NFT из топ-класса",v:function(){return S.st.leg},t:1,r:["title","t1"]},
 {id:"a7",n:"Удачливый",d:"Выиграйте апгрейд",v:function(){return S.st.wins},t:1,r:["case",2]},
 {id:"a8",n:"Азартный",d:"Выиграйте 10 апгрейдов",v:function(){return S.st.wins},t:10,r:["coin",1000]},
 {id:"a9",n:"Торговец",d:"Совершите 5 сделок",v:function(){return S.hist.length},t:5,r:["coin",300]},
 {id:"a10",n:"Контрактник",d:"Заключите 3 контракта",v:function(){return S.st.contr||0},t:3,r:["case",3]},
 {id:"a11",n:"Неделя подряд",d:"Заходите 7 дней подряд",v:function(){return (S.dl||{}).n||0},t:7,r:["title","t2"]},
 {id:"a12",n:"Собиратель сетов",d:"Завершите 2 коллекции",v:function(){return Object.keys(S.setc||{}).length},t:2,r:["case",4]},
 {id:"a13",n:"Уровень 5",d:"Достигните 5 уровня",v:function(){return lvl()},t:5,r:["coin",500]}];
function achPend(){return 0} /* достижения временно отключены */
function setPend(){return SETS.filter(function(x){return setProg(x)>=x.ids.length&&!(S.setc||{})[x.id]}).length}
function profPending(){return achPend()+setPend()}
function achClaim(id){var a=ACH.filter(function(x){return x.id==id})[0];if(!a||a.v()<a.t||(S.achc||{})[id])return;S.achc=S.achc||{};S.achc[id]=1;bpApply(a.r);var t=rwTxt(a.r);toast("Достижение: "+t[0]+" "+t[1]);sfx("ok");burst(20,["#ffd54a","#2aabee","#fff"]);save();render()}
function setClaim(id){var x=SETS.filter(function(y){return y.id==id})[0];if(!x||setProg(x)<x.ids.length||(S.setc||{})[id])return;S.setc=S.setc||{};S.setc[id]=1;bpApply(x.r);var t=rwTxt(x.r);toast("Коллекция «"+x.n+"»: "+t[0]+" "+t[1]);sfx("r2");burst(40,["#a78bfa","#2aabee","#ffd54a"]);save();render()}
function rCols(){var ev=function(x){return !x.ev||(function(){var E=EVENTS[x.ev-1],n=Date.now();return n>=E.from&&n<E.until})()};
 $("cols").innerHTML=SETS.filter(function(x){return ev(x)||setProg(x)>0||(S.setc||{})[x.id]}).map(function(x){var n=setProg(x),full=n>=x.ids.length,cl=(S.setc||{})[x.id],t=rwTxt(x.r);
  return '<div class="mrow'+(full&&!cl?' rdy':'')+'" style="margin:0 0 8px;flex-wrap:wrap"><div class="tt" style="flex:1 0 60%">'+x.n+' · '+n+' / '+x.ids.length+'<small>Награда: '+t[0]+' '+t[1]+'</small></div>'+(cl?'<button class="b" disabled>✓</button>':full?'<button class="b" onclick="setClaim(\''+x.id+'\')">Забрать</button>':'<button class="b off" disabled>'+Math.round(n/x.ids.length*100)+'%</button>')+'<div style="flex:1 0 100%;display:flex;gap:6px;flex-wrap:wrap;font-size:22px">'+x.ids.map(function(g){return (S.seen||{})[g]?'<span title="'+G[g][0]+'">'+G[g][1]+'</span>':'<span style="filter:grayscale(1) brightness(.5)">❔</span>'}).join("")+'</div></div>'}).join("");
 var cd=$("cdot"),n1=setPend();cd.style.display=n1?"inline-block":"none";cd.textContent=n1}
function rAch(){$("pac").innerHTML=ACH.map(function(a){var c=Math.min(a.t,a.v()),done=c>=a.t,cl=(S.achc||{})[a.id],t=rwTxt(a.r);
  return '<div class="mrow'+(done&&!cl?' rdy':'')+'" style="margin:0 0 8px"><div class="tt">'+a.n+'<small>'+a.d+' · '+f(c)+' / '+f(a.t)+' · '+t[0]+' '+t[1]+'</small></div>'+(cl?'<button class="b" disabled>✓</button>':done?'<button class="b" onclick="achClaim(\''+a.id+'\')">Забрать</button>':'<button class="b off" disabled>'+Math.round(c/a.t*100)+'%</button>')+'</div>'}).join("");
 var ad=$("adot"),n2=achPend();ad.style.display=n2?"inline-block":"none";ad.textContent=n2}


/* ===== контракты ===== */
var CT={};
function ctIds(){return S.inv.filter(function(x){return CT[x.u]})}
function ctSum(){return ctIds().reduce(function(a,x){return a+pr(x)},0)}
function evg(g){return G[g][3]}
function ctRoll(V){var u=Math.random(),k=u<.7?.5+Math.random()*.45:u<.95?.95+Math.random()*.55:1.5+Math.random()*1.5,tv=Math.max(5,V*k),best=0,bd=1e18;
 G.forEach(function(g,i){if(g[5]||g[6])return;var d=Math.abs(Math.log(evg(i)/tv));if(d<bd){bd=d;best=i}});return best}
function ctTg(u){if(busy)return;var n=ctIds().length;if(!CT[u]&&n>=10){toast("Максимум 10 подарков");return}CT[u]=!CT[u];rCt()}
function rCt(){var a=S.inv.slice().sort(function(x,y){return pr(y)-pr(x)}),n=ctIds().length,V=ctSum();
 $("ctg").innerHTML=a.map(function(x){return tile(x,CT[x.u]?" on":"","ctTg("+x.u+")")}).join("")||'<p class="note" style="grid-column:1/4">Нет подарков. Откройте кейс.</p>';
 var ac=$("ctact");ac.style.display=n?"block":"none";
 ac.innerHTML='<div class="srow" style="justify-content:center;margin-bottom:6px"><span>Выбрано '+n+' / 10 · '+f(V)+' GRADE</span></div><div class="odds" style="margin-bottom:8px"><span style="color:var(--rd)">70% дешевле</span><span style="color:var(--bl)">25% чуть дороже</span><span style="color:#ffd54a">5% намного дороже</span></div><div class="bar"><button class="go gh" onclick="CT={};rCt()">Сбросить</button><button class="go" '+(n<3||busy?'disabled ':'')+'onclick="ctGo()">'+(n<3?'Нужно ещё '+(3-n):'Заключить')+'</button></div>'}
function ctGo(){var ids=ctIds();if(busy||ids.length<3||ids.length>10)return;busy=1;var V=ctSum(),g=ctRoll(V),it=mkItem(g),used=ids.map(function(x){return x.u});
 $("rv").innerHTML='<div class="shake">📜</div><div class="mu">Заключаем контракт…</div>';$("rev").className="ov on";sfx("tick");
 setTimeout(function(){S.inv=S.inv.filter(function(x){return used.indexOf(x.u)<0});S.inv.push(it);S.st.contr=(S.st.contr||0)+1;bpAdd("contracts",1);CT={};
  var rs=G[g][2],v=pr(it),good=v>=V;sfx(good?(rs>=2?"r3":"win"):"r0");if(good)burst(rs>=2?60:30,["#ffd54a","#2aabee","#fff"]);
  var l0=lvl();S.xp+=8;if(lvl()>l0)toast("Новый уровень: "+lvl());
  $("rv").innerHTML=big(it)+'<div class="at">'+atxt(it)+' · '+f(v)+' GRADE<br>Вложено: '+f(V)+' GRADE · '+(good?'<span style="color:var(--gr)">выгодно</span>':'<span style="color:var(--rd)">дешевле</span>')+'</div><button class="go" onclick="closeRev()">Забрать</button>';
  busy=0;save();render()},1400)}
