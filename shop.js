/* ===== монетизация ===== */
function isPass(){return (S.pass||0)>Date.now()}
function feeR(){return isPass()?.03:.07}
function net(p){return Math.floor(p*(1-feeR()))}
function freeCd(){return isPass()?432e5:864e5}
var PACKS=[{id:"p50",st:50,g:500,t:"Старт"},{id:"p150",st:150,g:1650,t:"Выгодно +10%"},{id:"p500",st:500,g:6000,t:"Хит +20%"},{id:"p1500",st:1500,g:20000,t:"Максимум +33%"}];
var PASS={id:"pass",st:199,days:30};
var FRX=1;var FR=[{id:"f1",n:"Неон",st:50,c:"#2aabee,#a78bfa"},{id:"f2",n:"Золото",st:100,c:"#ffd54a,#ff9f1c"},{id:"f3",n:"Аврора",st:150,c:"#5fd068,#2aabee,#a78bfa"},{id:"f4",n:"Battle Pass",st:0,c:"#ff6b6b,#ffd54a",bp:1,how:"Награда VIP Battle Pass · уровень 28"},{id:"f5",n:"Хэллоуин",st:0,c:"#ff7a00,#7a2d00",bp:1,how:"Награда за коллекцию «Хэллоуин»"},{id:"f6",n:"Новый год",st:0,c:"#d94a4a,#2aabee,#5fd068",bp:1,how:"Награда за коллекцию «Новый год»"}];
function tgW(){return window.Telegram&&Telegram.WebApp}
function initD(){var w=tgW();return w&&w.initData||""}
function api(path,body){return fetch(CFG.API+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({initData:initD()},body||{}))}).then(function(r){return r.json()})}
function grant(it){ /* начисление товара */
 if(it.g){var m=(S.fp?1:2);S.bal+=it.g*m;S.fp=1;S.spent=(S.spent||0)+it.st;toast("+"+f(it.g*m)+" GRADE"+(m==2?" · бонус первой покупки ×2":""))}
 else if(it.id=="bpvip"){bpEns().vip=1;S.spent=(S.spent||0)+it.st;toast("VIP Battle Pass активирован")}
 else if(it.id=="bplvl"){bpGain(BPX);S.spent=(S.spent||0)+it.st;toast("+1 уровень Battle Pass")}
 else if(it.id=="pass"){S.pass=Math.max(Date.now(),S.pass||0)+it.days*864e5;S.spent=(S.spent||0)+it.st;toast("Pass активен до "+new Date(S.pass).toLocaleDateString("ru-RU"))}
 else{S.own=S.own||[];if(S.own.indexOf(it.id)<0)S.own.push(it.id);S.frame=it.id;S.spent=(S.spent||0)+it.st;toast("Рамка «"+it.n+"» получена")}
 save();render();rShop()}
function buyStars(it){
 
 api("/invoice",{item:it.id}).then(function(d){
  if(!d||!d.link){toast("Не удалось создать счёт");return}
  tgW().openInvoice(d.link,function(st){if(st=="paid"){setTimeout(claim,800)}else if(st=="failed")toast("Оплата не прошла")})
 }).catch(function(){toast("Сервер недоступен")})}
function claim(){ /* забрать подтверждённые сервером покупки (идемпотентно) */
 api("/claim").then(function(d){(d.items||[]).forEach(function(id){var it=PACKS.concat([PASS,BPV,BPL],FR).filter(function(x){return x.id==id})[0];if(it)grant(it)});var gs=(d.grants||[]).filter(function(r){return (r[0]=="coin"&&r[1]>0)||(r[0]=="gift"&&G[r[1]])||(r[0]=="case"&&CS[r[1]])});gs.forEach(function(r){bpApply(r)});if(gs.length){toast("От администрации: "+gs.map(function(r){return r[0]=="coin"?"+"+f(r[1])+" GRADE":r[0]=="gift"?G[r[1]][0]:"кейс «"+CS[r[1]].n+"»"}).join(", "));save();render()}}).catch(function(){})}
setInterval(claim,30000);document.addEventListener("visibilitychange",function(){if(!document.hidden)claim()});
function shopGo(){tab(8)}
function rShop(){var b=$("shp8");if(!b)return;
 var fp=!S.fp,h='<div class="dnote">Покупки за Stars дают игровую валюту. Вывод из игры невозможен. Только 18+.</div>';
 if(fp)h+='<div class="ihead" style="background:linear-gradient(135deg,#b7791f,#ff9f1c)"><div><div class="mu" style="color:#fff3d0">Первая покупка</div><div class="h" style="font-size:22px">×2 монет</div></div><div style="font-size:42px">🎁</div></div>';
 h+='<div class="mrow" onclick="bpOpen()" style="cursor:pointer"><span class="e">🏆</span><div class="tt">Battle Pass · сезон '+bpEns().s+(bpPending()?'<span class="dot">'+bpPending()+'</span>':'')+'<small>'+(bpPending()?'К получению: '+bpHint():bpEns().vip?'VIP активен':'Задания, награды и VIP-дорожка')+'</small></div><span class="mu" style="font-size:24px">›</span></div>'+'<h3 class="sec">Монеты GRADE</h3>'+PACKS.map(function(k){return '<div class="mrow"><span class="e">🪙</span><div class="tt">'+f(k.g*(fp?2:1))+' GRADE<small>'+k.t+(fp?' · с бонусом ×2':'')+'</small></div><button class="b" onclick="buyStars(PACKS['+PACKS.indexOf(k)+'])">'+k.st+' ⭐</button></div>'}).join("");
 h+='<h3 class="sec">GRADE Pass · 30 дней</h3><div class="sbox"><div class="srow"><span>'+(isPass()?'Активен до '+new Date(S.pass).toLocaleDateString("ru-RU"):'Не активен')+'</span><button class="b" onclick="buyStars(PASS)">'+PASS.st+' ⭐</button></div><div class="mu" style="margin-top:10px;line-height:1.6">• «Подарок дня» раз в 12 часов вместо 24<br>• +10% к опыту<br>• комиссия маркета 3% вместо 7%<br>• значок Pass в профиле</div></div>';
 h+='<h3 class="sec">Рамки аватара</h3>'+FR.filter(function(k){return !k.bp}).map(function(k){var own=(S.own||[]).indexOf(k.id)>=0;return '<div class="mrow"><div class="av" style="width:44px;height:44px;font-size:18px;box-shadow:0 0 0 3px #17212b,0 0 0 6px transparent;border:3px solid transparent;background:linear-gradient(#202b38,#202b38) padding-box,linear-gradient(135deg,'+k.c+') border-box">И</div><div class="tt">'+k.n+'<small>Только внешний вид, на шансы не влияет</small></div>'+(own?'<button class="b '+(S.frame==k.id?'':'off')+'" onclick="S.frame=\''+k.id+'\';save();rShop();rAv()">'+(S.frame==k.id?'Надета':'Надеть')+'</button>':'<button class="b" onclick="buyStars(FR['+FR.indexOf(k)+'])">'+k.st+' ⭐</button>')+'</div>'}).join("");
 h+='<h3 class="sec">Пригласить друга</h3><div class="sbox"><div class="mu" style="line-height:1.5;margin-bottom:10px">Друг получает 300 GRADE на старт, вы — 300 GRADE за каждого и 5% от его покупок в монетах.</div><button class="go gh" style="width:100%;margin:0" onclick="invite()">Поделиться ссылкой</button></div>';
 h+='<p class="note">Внутриигровая валюта GRADE и подарки не имеют денежной стоимости, не выводятся и не обмениваются на реальные деньги, Stars или подарки Telegram. Шансы кейсов указаны в каждом кейсе. Только 18+.'+'</p>';
 b.innerHTML=h}
function invite(){var id=TGU?TGU.id:"demo",u="https://t.me/"+(CFG.BOT||"YOUR_BOT")+"?startapp=ref_"+id,w=tgW();
 if(w&&CFG.BOT)w.openTelegramLink("https://t.me/share/url?url="+encodeURIComponent(u)+"&text="+encodeURIComponent("Заходи в NFT GRADE — открывай кейсы и собирай коллекцию!"));
 else{try{navigator.clipboard.writeText(u);toast("Ссылка скопирована")}catch(e){toast(u)}}}

function $(i){return document.getElementById(i)}
function f(v){return Math.round(v).toLocaleString("ru-RU")}
function rnd(n){return Math.floor(Math.random()*n)}
function need(l){return 100+100*l}
function lvInfo(){var x=S.xp,l=1;while(x>=need(l)){x-=need(l);l++}return[l,x,need(l)]}
function lvl(){return lvInfo()[0]}
function cv(){return S.inv.reduce(function(a,x){return a+pr(x)},0)}
function wp(a){var x=Math.random()*100,t=0;for(var i=0;i<a.length;i++){t+=a[i];if(x<t)return i}return 0}
function am(p){return Math.max(.85,Math.min(2.5,Math.pow(10/p,.5)))}
function nbm(n){return n<=100?1.6:n<=1000?1.2:1}
function pr(it){var g=G[it.g];if(!it.up)return g[3];return Math.round(g[3]*Math.max(1,Math.min(6,am(MP[it.m])*am(BP[it.b])*am(SP[it.s])*nbm(it.n))))}
function mkItem(g,up){return up?{u:S.nu++,g:g,n:1+rnd(9999),m:wp(MP),s:wp(SP),b:wp(BP),up:1,d:Date.now()}:{u:S.nu++,g:g,n:0,m:0,s:0,b:0,up:0,d:Date.now()}}
function pickG(r,ev,pool){var a=[];G.forEach(function(x,i){if(!x[6]&&!x[7]&&x[2]==r&&(ev?(x[5]==ev||(!x[5]&&r==0)):!x[5])&&(!pool||pool.indexOf(i)>=0))a.push(i)});return a[rnd(a.length)]}
function vib(){if(!S.set.vib)return;try{var h=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback;if(h)h.impactOccurred("light");else if(navigator.vibrate)navigator.vibrate(12)}catch(e){}}
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("button"))vib()});
function toast(t){var d=$("toast");d.textContent=t;d.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(function(){d.style.display="none"},2500)}
function tile(it,cls,oc,inf){var g=G[it.g],n=!!it.up,c=n?BG[it.b]:"#7f91a4";
 return '<div class="t'+cls+'" style="--rc:'+c+';--bg2:'+(n?c:"#2b3a4b")+'" onclick="'+oc+'">'+(n?'<i class="pt">'+Array(40).join(SY[it.s]+" ")+'</i>':'')+(inf?'<span class="inf" onclick="event.stopPropagation();sheet('+it.u+')">i</span>':'')+'<b class="im">'+gimg(it.g,52)+'</b><small>'+g[0]+(n?' #'+it.n:'')+'</small><em>'+f(pr(it))+'</em></div>'}
function gtile(i,cls,oc){var g=G[i],n=g[4],c=n?BG[i%5]:"#7f91a4";return '<div class="t'+cls+'" style="--rc:'+c+';--bg2:'+(n?c:"#2b3a4b")+'" onclick="'+oc+'"><b class="im">'+gimg(i,52)+'</b><small>'+g[0]+'</small><em>'+(n?"≈ ":"")+f(g[3])+'</em></div>'}
function big(it){var g=G[it.g],n=!!it.up,c=n?BG[it.b]:"#7f91a4";return '<div class="bigc" style="--rc:'+c+';background:linear-gradient(160deg,'+(n?c:"#2b3a4b")+',#0e1621)">'+gimg(it.g,108)+'</div><div class="h" style="font-size:22px">'+g[0]+'</div><div class="h" style="color:'+c+'">'+(n?"NFT":"Подарок")+'</div>'}
function atxt(it){return it.up?"Номер #"+it.n+" · "+MD[it.m]+" · "+BN[it.b]+" · "+SN[it.s]:"Подарок · можно улучшить"}
function atb(it){function r(l,nm,p,m){return '<div class="srow" style="margin:6px 0"><span>'+l+'</span><span>'+nm+' · '+p+'% <small style="display:inline;color:var(--mu)">×'+m.toFixed(2)+'</small></span></div>'}
 return '<div class="sbox" style="margin:8px 0">'+r("Модель",MD[it.m],MP[it.m],am(MP[it.m]))+r("Фон",BN[it.b],BP[it.b],am(BP[it.b]))+r("Узор",SN[it.s],SP[it.s],am(SP[it.s]))+'<div class="srow" style="margin:6px 0"><span>Номер</span><span>#'+it.n+' <small style="display:inline;color:var(--mu)">×'+nbm(it.n).toFixed(2)+'</small></span></div></div>'}

var tabs=[["box","Кейсы"],["layers","Прогресс"],["up","Апгрейд"],["bag","Маркет"],["user","Профиль"]];
$("nav").innerHTML=tabs.map(function(t,i){return '<button onclick="tab('+i+')">'+ic(t[0],24)+t[1]+'</button>'}).join("");
$("s1").innerHTML=IC.search;$("s2").innerHTML=IC.search;
function tab(n){if(n==6)rSet();for(var i=0;i<11;i++)$("p"+i).classList.toggle("on",i==n);document.querySelectorAll(".nav button").forEach(function(b,i){b.classList.toggle("on",i==(n==10?1:n==5||n==8||n==9?0:n==6?-1:n==7?4:n))});window.scrollTo(0,0);render()}
