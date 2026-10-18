/* профиль */
var rt=1;
var RL=null,lbT=0;
function rareN(){return S.st.leg+S.inv.filter(function(x){return G[x.g][2]>=2}).length}
function lbSync(){if(Date.now()-lbT<8000)return;lbT=Date.now();api("/score",{v:cv(),l:lvl(),t:rareN()}).then(function(){return api("/top",{m:rt})}).then(function(d){if(d&&d.list){RL=d.list.map(function(x){return[x.me?"Вы":x.n,x.v,x.l,x.t]});rPro()}}).catch(function(){})}
setInterval(lbSync,60000);
function rts(n){rt=n;lbT=0;lbSync();rPro()}
function rPro(){try{rGifts()}catch(e){}rPf();var v=cv(),rare=S.st.leg+S.inv.filter(function(x){return G[x.g][2]>=2}).length;
 var A=[["Первый кейс","Откройте кейс",S.st.cases>=1],["Коллекционер","10 подарков в инвентаре",S.inv.length>=10],["Богач","Коллекция дороже 20 000",v>=20000],["Топ-находка","Выбейте NFT из топ-класса",S.st.leg>=1],["Удачливый","Выиграйте апгрейд",S.st.wins>=1],["Торговец","Совершите сделку",S.hist.length>=1]];
 $("ptt").textContent="в сети · "+TL[S.tt||0][0];$("plv").textContent=lvl();rAv();$("ttl").innerHTML=TL.map(function(t,i){var ok=t[2]();return '<button class="chip'+((S.tt||0)==i?" on":"")+'" style="'+(ok?"":"opacity:.45")+'" onclick="setTl('+i+')">'+(ok?"":"🔒 ")+t[0]+"</button>"}).join("");
 $("pst").innerHTML=[[f(v),"Коллекция"],[S.inv.length,"Подарков"],[S.st.cases,"Кейсов"]].map(function(x){return '<div>'+x[0]+'<small>'+x[1]+'</small></div>'}).join("");
 try{rAch();rCols()}catch(e){}
 var pp=profPending(),nb=$("pnb");nb.style.display=pp?"flex":"none";nb.innerHTML=pp?'<span>Можно забрать: '+[achPend()?achPend()+' '+pl(achPend(),'достижение','достижения','достижений'):'',setPend()?setPend()+' '+pl(setPend(),'коллекция','коллекции','коллекций'):''].filter(Boolean).join(' · ')+'</span><span>›</span>':'';
 document.querySelectorAll("#rch .chip").forEach(function(b,i){b.classList.toggle("on",i+1==rt)});
 var L=(RL||BT.concat([["Вы",v,lvl(),rare]])).slice().sort(function(a,b){return b[rt]-a[rt]});
 $("rl").innerHTML=L.map(function(x,i){return '<div class="rk'+(x[0]=="Вы"?' me':'')+'"><span>'+(i+1)+'</span><span>'+x[0]+'</span><span>'+f(x[rt])+'</span></div>'}).join("")}

var TL=[["Новичок","стартовый",function(){return 1}],["Везунчик","достигните 3 уровня",function(){return lvl()>=3}],["Коллекционер","коллекция от 5 000",function(){return cv()>=5000}],["Магнат","коллекция от 20 000",function(){return cv()>=20000}],["Торговец","3 сделки на маркете",function(){return S.hist.length>=3}],["Легенда","выбейте NFT из топ-класса",function(){return S.st.leg>=1}],["Ветеран BP","награда Battle Pass (FREE, ур. 15)",function(){return !!(S.ttu&&S.ttu.v)}],["Элита BP","награда Battle Pass VIP (ур. 14)",function(){return !!(S.ttu&&S.ttu.e)}],["Чемпион сезона","награда Battle Pass VIP (ур. 24)",function(){return !!(S.ttu&&S.ttu.c)}],["Охотник за NFT","достижение «Топ-находка»",function(){return !!(S.ttu&&S.ttu.t1)}],["Постоянный игрок","достижение «Неделя подряд»",function(){return !!(S.ttu&&S.ttu.t2)}],["Коллектор","коллекция «Топ NFT»",function(){return !!(S.ttu&&S.ttu.s1)}]];
function setTl(i){if(TL[i][2]()){S.tt=i;save();rPro()}else toast("Откроется: "+TL[i][1])}
var TGU=null;try{var WA=window.Telegram&&Telegram.WebApp;if(WA){WA.ready();WA.expand();TGU=(WA.initDataUnsafe&&WA.initDataUnsafe.user)||null}}catch(e){}
function tgUser(){try{var w=window.Telegram&&Telegram.WebApp;return(w&&w.initDataUnsafe&&w.initDataUnsafe.user)||TGU}catch(e){return TGU}}
function tgName(){var u=tgUser()||{};return((u.first_name||"")+" "+(u.last_name||"")).trim()||u.username||"Игрок"}
function me(){var u=tgUser();return u?(u.username||u.first_name):"вы"}
function rAv(){TGU=tgUser();var a=$("av"),n=tgName();$("pnm").textContent=n+(isPass()?" ✦":"");var fr=FR.filter(function(x){return x.id==S.frame})[0];a.style.border=fr?"3px solid transparent":"";a.style.background=fr?"linear-gradient(#202b38,#202b38) padding-box,linear-gradient(135deg,"+fr.c+") border-box":"";var ph=(TGU&&TGU.photo_url)||"";if(a.dataset.ph===ph&&a.firstChild)return;a.dataset.ph=ph;a.textContent=n.charAt(0).toUpperCase();
 if(ph){var im=new Image();im.onload=function(){if(a.dataset.ph===ph){a.textContent="";a.appendChild(im)}};im.src=ph}}
var LF=[];
function lfRand(){return[BT[rnd(BT.length)][0],pickG(pickRar([55,30,12,3]))]}
for(var q=0;q<14;q++)LF.push(lfRand());
function rLive(an){$("feed").innerHTML=LF.slice(0,20).map(function(d,i){var g=G[d[1]];return '<div class="t sm'+(an&&!i?" nw":"")+'" style="--rc:'+(g[4]?BG[d[1]%5]:"#7f91a4")+';--bg2:'+BG[d[1]%5]+'"><b>'+gimg(d[1],34)+'</b><small>'+g[0]+'</small><em style="font-size:10px;color:var(--mu)">'+(d[0]=="вы"?"вы":"@"+d[0])+'</em></div>'}).join("")}
function livePush(u,g){LF.unshift([u,g]);if(LF.length>30)LF.pop();rLive(1)}
setInterval(function(){var d=lfRand();livePush(d[0],d[1])},3500);
function lvt(){var I=lvInfo();toast("Опыт: "+I[1]+" / "+I[2])}
function topup(){shopGo()}
function rTop(){var I=lvInfo(),p=I[1]/I[2]*100;$("lv").innerHTML='<span class="shd" style="height:28px;min-width:26px;font-size:14px">'+lvl()+'</span><div style="flex:1;min-width:0"><div class="lvt">Уровень · '+I[1]+' / '+I[2]+' XP</div><div class="lvl"><i style="width:'+p+'%"></i></div></div>';$("bal").innerHTML=ic("coin",18)+" "+f(S.bal)+'<button class="pl" onclick="topup()">+</button>'}
function render(){rCt();updSeen();rBp();rDl();rShop();rTop();rHome();rInv();rUp();rMk();rPro();rCat();rNav()}
var ACC=[["Синий","#2aabee","#1d8fd6"],["Фиолетовый","#8b7bff","#6a4fe0"],["Мятный","#1fb99d","#13866f"],["Розовый","#ec5f9e","#c93a7c"],["Оранжевый","#f08a24","#cf6a0c"]];
function applySet(){var t=S.set,d=document.documentElement.style,a=ACC[t.acc]||ACC[0];d.setProperty("--bs",t.bs);d.setProperty("--cols",t.cols);d.setProperty("--bl",a[1]);d.setProperty("--bl2",a[2]);
 $("p0").classList.toggle("nolive",!t.live);document.body.classList.toggle("nofx",!t.fx);rSet()}
function setS(k,v){S.set[k]=v;if(k=="sort"){sortm=v;rInv()}applySet();save()}
function tgS(k){S.set[k]=S.set[k]?0:1;applySet();save();rHome();vib();if(k=="snd"&&S.set.snd)sfx("ok")}
function setAcc(i){S.set.acc=i;applySet();save()}
function setVol(v){S.set.vol=+v;var e=$("vv");if(e)e.textContent=v+"%";save()}
function vTest(){sfx("ok")}
function sGrp(t){return '<div class="sg">'+t+'</div>'}
function sRow(ico,t,sub,ctl,cls,oc){return '<div class="sr'+(cls?' '+cls:'')+'"'+(oc?' onclick="'+oc+'"':'')+'><span class="ib">'+ico+'</span><div class="st2">'+t+(sub?'<small>'+sub+'</small>':'')+'</div>'+(ctl||'')+'</div>'}
function sSw(k){return '<button class="sw'+(S.set[k]?' on':'')+'" onclick="tgS(\''+k+'\')"><i></i></button>'}
function sSeg(k,o){return '<div class="seg">'+o.map(function(x){return '<button class="'+(S.set[k]==x[1]?'on':'')+'" onclick="setS(\''+k+'\','+x[1]+')">'+x[0]+'</button>'}).join("")+'</div>'}
function rSet(){var b=$("sbody");if(!b)return;var B=bpEns(),el=Math.min(1,Math.max(0,1-(B.end-Date.now())/(BPSD*864e5))),h='';
 h+='<div class="sn"><div class="r1"><span>Сезон '+B.s+'</span><span>осталось '+bpLeft(B)+'</span></div><div class="pb"><i style="width:'+Math.round(el*100)+'%"></i></div><div class="mu">Сезон длится 14 дней. После него баланс, инвентарь, уровень, маркет, достижения и Battle Pass обнуляются. Остаются рамки, титулы наград, GRADE Pass и настройки.</div></div>';
 if((S.sh||[]).length)h+=sGrp("Прошлые сезоны")+'<div class="sc">'+S.sh.map(function(x){return sRow("🏁","Сезон "+x.s,"Коллекция "+f(x.v)+" · ур. "+x.l+" · кейсов "+x.c)}).join("")+'</div>';
 h+=sGrp("Интерфейс")+'<div class="sc">'+
  sRow("🔘","Размер кнопок","","","wrap")+sSeg("bs",[["Малые",.9],["Средние",1],["Большие",1.15]]).replace('<div class="seg">','<div class="seg sx">')+
  sRow("▦","Подарков в ряду","в инвентаре и контрактах","","wrap")+sSeg("cols",[["3",3],["4",4],["5",5]]).replace('<div class="seg">','<div class="seg sx">')+
  sRow("🎨","Цвет акцента","",'<div class="acs">'+ACC.map(function(a,i){return '<button class="ac'+(S.set.acc==i?' on':'')+'" title="'+a[0]+'" style="background:linear-gradient(135deg,'+a[1]+','+a[2]+')" onclick="setAcc('+i+')"></button>'}).join("")+'</div>')+
  sRow("📡","Лента «Live» на главной","последние выпадения игроков",sSw("live"))+'</div>';
 h+=sGrp("Инвентарь")+'<div class="sc">'+
  sRow("↕️","Сортировка по умолчанию","","","wrap")+sSeg("sort",[["Дороже",0],["Дешевле",1],["Новые",2],["№",3]]).replace('<div class="seg">','<div class="seg sx">')+
  sRow("🛡️","Подтверждать продажу","спросим перед продажей подарков",sSw("cfm"))+'</div>';
 h+=sGrp("Звук и отклик")+'<div class="sc">'+
  sRow("🔊","Звук","",sSw("snd"))+
  sRow("🎚️","Громкость",'<span id="vv">'+(S.set.vol==null?80:S.set.vol)+'%</span>','<input class="rg" type="range" min="0" max="100" step="5" value="'+(S.set.vol==null?80:S.set.vol)+'" oninput="setVol(this.value)" onchange="vTest()">',"wrap rgw")+
  sRow("📳","Вибрация","в Telegram, на iPhone в браузере не работает",sSw("vib"))+
  sRow("✨","Эффекты и анимации","конфетти и мигающие подсказки",sSw("fx"))+'</div>';
 h+=sGrp("Игра")+'<div class="sc">'+
  sRow("📊","Показывать шансы кейсов","",sSw("odds"))+'</div>';
 h+=sGrp("Помощь")+'<div class="sc">'+
  sRow("📖","Показать обучение","",'<span class="mu" style="font-size:22px">›</span>',"tap","tab(0);tutStep(0)")+
  sRow("🤝","Пригласить друга","300 GRADE вам и другу",'<span class="mu" style="font-size:22px">›</span>',"tap","invite()")+'</div>';
 h+='<p class="note">NFT GRADE · игровая валюта и подарки не имеют денежной стоимости. Только 18+.'+'</p>';
 b.innerHTML=h}

function pnGo(){ptb=1;rPro();var a=achPend(),c=setPend();$("dtc").open=!!c;$("dta").open=!!a;var e=$(c?"dtc":"dta");e.scrollIntoView({behavior:"smooth",block:"start"})}
