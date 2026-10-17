/* профиль */
var rt=1;
var RL=null,lbT=0;
function rareN(){return S.st.leg+S.inv.filter(function(x){return G[x.g][2]>=2}).length}
function lbSync(){if(CFG.DEMO||Date.now()-lbT<8000)return;lbT=Date.now();api("/score",{v:cv(),l:lvl(),t:rareN()}).then(function(){return api("/top",{m:rt})}).then(function(d){if(d&&d.list){RL=d.list.map(function(x){return[x.me?"Вы":x.n,x.v,x.l,x.t]});rPro()}}).catch(function(){})}
setInterval(lbSync,60000);
function rts(n){rt=n;lbT=0;lbSync();rPro()}
function rPro(){var v=cv(),rare=S.st.leg+S.inv.filter(function(x){return G[x.g][2]>=2}).length;
 var A=[["Первый кейс","Откройте кейс",S.st.cases>=1],["Коллекционер","10 подарков в инвентаре",S.inv.length>=10],["Богач","Коллекция дороже 20 000",v>=20000],["Топ-находка","Выбейте NFT из топ-класса",S.st.leg>=1],["Удачливый","Выиграйте апгрейд",S.st.wins>=1],["Торговец","Совершите сделку",S.hist.length>=1]];
 $("ptt").textContent="Титул: "+TL[S.tt||0][0]+" · Ур. "+lvl();rAv();$("ttl").innerHTML=TL.map(function(t,i){var ok=t[2]();return '<button class="chip'+((S.tt||0)==i?" on":"")+'" style="'+(ok?"":"opacity:.45")+'" onclick="setTl('+i+')">'+(ok?"":"🔒 ")+t[0]+"</button>"}).join("");
 $("pst").innerHTML=[[f(v),"Коллекция"],[S.inv.length,"Подарков"],[S.st.cases,"Кейсов"]].map(function(x){return '<div>'+x[0]+'<small>'+x[1]+'</small></div>'}).join("");
 $("pgc").textContent=S.inv.length+" шт. · "+f(cv())+" GRADE";$("pgf").innerHTML=S.inv.map(function(x){return tile(x,"","sheet("+x.u+")")}).join("")||'<p class="note" style="grid-column:1/4">Подарков пока нет</p>';rAch();rCols();
 document.querySelectorAll("#rch .chip").forEach(function(b,i){b.classList.toggle("on",i+1==rt)});
 var L=(RL||BT.concat([["Вы",v,lvl(),rare]])).slice().sort(function(a,b){return b[rt]-a[rt]});
 $("rl").innerHTML=L.map(function(x,i){return '<div class="rk'+(x[0]=="Вы"?' me':'')+'"><span>'+(i+1)+'</span><span>'+x[0]+'</span><span>'+f(x[rt])+'</span></div>'}).join("")}

var TL=[["Новичок","стартовый",function(){return 1}],["Везунчик","достигните 3 уровня",function(){return lvl()>=3}],["Коллекционер","коллекция от 5 000",function(){return cv()>=5000}],["Магнат","коллекция от 20 000",function(){return cv()>=20000}],["Торговец","3 сделки на маркете",function(){return S.hist.length>=3}],["Легенда","выбейте NFT из топ-класса",function(){return S.st.leg>=1}],["Ветеран BP","награда Battle Pass (FREE, ур. 15)",function(){return !!(S.ttu&&S.ttu.v)}],["Элита BP","награда Battle Pass VIP (ур. 14)",function(){return !!(S.ttu&&S.ttu.e)}],["Чемпион сезона","награда Battle Pass VIP (ур. 24)",function(){return !!(S.ttu&&S.ttu.c)}],["Охотник за NFT","достижение «Топ-находка»",function(){return !!(S.ttu&&S.ttu.t1)}],["Постоянный игрок","достижение «Неделя подряд»",function(){return !!(S.ttu&&S.ttu.t2)}],["Коллектор","коллекция «Топ NFT»",function(){return !!(S.ttu&&S.ttu.s1)}]];
function setTl(i){if(TL[i][2]()){S.tt=i;save();rPro()}else toast("Откроется: "+TL[i][1])}
var TGU=null;try{var WA=window.Telegram&&Telegram.WebApp;if(WA){WA.ready();WA.expand();TGU=(WA.initDataUnsafe&&WA.initDataUnsafe.user)||null}}catch(e){}
function me(){return TGU?(TGU.username||TGU.first_name):"вы"}
function rAv(){var a=$("av"),n=TGU?(TGU.first_name||TGU.username||"Игрок"):"Игрок";$("pnm").textContent=n+(isPass()?" ✦":"");var fr=FR.filter(function(x){return x.id==S.frame})[0];a.style.border=fr?"3px solid transparent":"";a.style.background=fr?"linear-gradient(#202b38,#202b38) padding-box,linear-gradient(135deg,"+fr.c+") border-box":"";if(a.dataset.ok){return}a.textContent=n.charAt(0).toUpperCase();
 if(TGU&&TGU.photo_url){var im=new Image();im.onload=function(){a.textContent="";a.appendChild(im);a.dataset.ok=1};im.src=TGU.photo_url}}
var LF=[];
function lfRand(){return[BT[rnd(BT.length)][0],pickG(pickRar([55,30,12,3]))]}
for(var q=0;q<14;q++)LF.push(lfRand());
function rLive(an){$("feed").innerHTML=LF.slice(0,20).map(function(d,i){var g=G[d[1]];return '<div class="t sm'+(an&&!i?" nw":"")+'" style="--rc:'+(g[4]?BG[d[1]%5]:"#7f91a4")+';--bg2:'+BG[d[1]%5]+'"><b>'+g[1]+'</b><small>'+g[0]+'</small><em style="font-size:10px;color:var(--mu)">'+(d[0]=="вы"?"вы":"@"+d[0])+'</em></div>'}).join("")}
function livePush(u,g){LF.unshift([u,g]);if(LF.length>30)LF.pop();rLive(1)}
setInterval(function(){var d=lfRand();livePush(d[0],d[1])},3500);
var adm=0;
function rAdm(){var b=$("adm");if(!CFG.DEMO){b.style.display="none";return}if(!adm){b.innerHTML='<div class="lab">Админ-меню</div><div class="srow"><input class="gi" id="apw" type="password" inputmode="numeric" placeholder="Пароль"><button class="b" onclick="adIn()">Войти</button></div>';return}
 var B=[["+10 000 монет","coin"],["+100 XP","xp"],["Сброс таймера «Подарок дня»","free"],["Обновить маркет","mkt"],["Очистить инвентарь","inv"],["Выйти из админки","out"]];
 b.innerHTML='<div class="lab">Админ-меню</div><div class="grid g2" style="padding:0">'+B.map(function(x){return '<button class="go gh" style="width:auto;margin:0;height:44px;font-size:12px" onclick="ad(\''+x[1]+'\')">'+x[0]+'</button>'}).join("")+'</div><div class="lab" style="margin:14px 0 8px">Выдать подарок себе</div><div class="grid" style="padding:0">'+G.map(function(g,i){return gtile(i,"","adGift("+i+")")}).join("")+'</div>'}
function adIn(){if($("apw").value=="6121"){adm=1;rAdm()}else toast("Неверный пароль")}
function ad(k){if(k=="coin")S.bal+=10000;else if(k=="xp")S.xp+=100;else if(k=="free")S.free=0;else if(k=="inv")S.inv=[];else if(k=="mkt"){S.mkt=S.mkt.filter(function(l){return l.s=="you"});for(var q=0;q<8;q++)S.mkt.push(bl())}else if(k=="out")adm=0;
 save();render();rAdm();if(k!="out")toast("Готово")}
function adGift(i){S.inv.push(mkItem(i));save();render();toast("Выдано: "+G[i][0])}
function lvt(){var I=lvInfo();toast("Опыт: "+I[1]+" / "+I[2])}
function topup(){shopGo()}
function rTop(){var I=lvInfo(),p=I[1]/I[2]*100;$("lv").innerHTML='<div class="lvt">Ур. '+lvl()+'</div><div class="lvl"><i style="width:'+p+'%"></i></div>';$("bal").innerHTML=ic("coin",18)+" "+f(S.bal)+'<button class="pl" onclick="topup()">+</button>'}
function render(){rCt();updSeen();rBp();rDl();rShop();rTop();rHome();rInv();rUp();rMk();rPro();rCat();rNav()}
function applySet(){var t=S.set,d=document.documentElement.style;d.setProperty("--bs",t.bs);d.setProperty("--cols",t.cols);
 [.9,1,1.15].forEach(function(v,i){document.querySelectorAll("#bseg button")[i].classList.toggle("on",t.bs==v)});[3,4].forEach(function(v,i){document.querySelectorAll("#cseg button")[i].classList.toggle("on",t.cols==v)});
 document.querySelectorAll(".sw").forEach(function(b){b.classList.toggle("on",!!t[b.dataset.k])})}
function setS(k,v){S.set[k]=v;applySet();save()}
function tgS(k){S.set[k]=S.set[k]?0:1;applySet();save();rHome();vib()}
var rs=0;
function rst(){var b=$("rst");if(!rs){rs=1;b.textContent="Нажмите ещё раз, чтобы сбросить";setTimeout(function(){rs=0;b.textContent="Сбросить прогресс"},3000);return}
 rs=0;b.textContent="Сбросить прогресс";S={bal:1000,xp:0,inv:[],nu:1,mkt:[],nl:1,hist:[],fav:[],drops:[],st:{cases:0,ups:0,wins:0,leg:0},set:S.set};for(var q=0;q<8;q++)S.mkt.push(bl());isel={};U={};T=null;save();render();toast("Прогресс сброшен")}
