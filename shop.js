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
function gidx(nm){return G.map(function(q){return q[0]}).indexOf(nm)}
function cidx(nm){return CS.map(function(q){return q.n}).indexOf(nm)}
function claim(){ /* забрать подтверждённые сервером покупки (идемпотентно) */
 api("/claim").then(function(d){(d.items||[]).forEach(function(id){var it=PACKS.concat([PASS,BPV,BPL],FR).filter(function(x){return x.id==id})[0];if(it)grant(it)});var gs=(d.grants||[]).map(function(r){return r[0]=="gn"?["gift",gidx(r[1])]:r[0]=="cn"?["case",cidx(r[1])]:r[0]=="lim"?["lim",gidx(r[1]),r[2]]:r}).filter(function(r){return (r[0]=="coin"&&r[1]>0)||(r[0]=="gift"&&G[r[1]])||(r[0]=="case"&&CS[r[1]])||(r[0]=="lim"&&G[r[1]]&&r[2]>0)});gs.forEach(function(r){if(r[0]=="lim"){var li=mkItem(r[1]);li.sn=r[2];S.inv.push(li)}else bpApply(r)});if(gs.length){toast("От администрации: "+gs.map(function(r){return r[0]=="coin"?"+"+f(r[1])+" GRADE":r[0]=="gift"?G[r[1]][0]:r[0]=="lim"?G[r[1]][0]+" · лимитка #"+r[2]:"кейс «"+CS[r[1]].n+"»"}).join(", "));save();render()}}).catch(function(){})}
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
/* ===== модели улучшенных подарков (models.js собирает tools/make_models.py) =====
   У подарков из MODELS модель при улучшении выбирается по шансам из config.json, показывается её картинка и анимация.
   Остальные подарки и «хвост» шансов (если загружены не все модели) используют обычные модели MP. */
function MDL(g){return typeof MODELS!="undefined"&&MODELS[G[g][0]]||null}
function mtier(p){return p>=3?0:p>=2?1:p>=1.2?2:p>=.7?3:4}
function pickModel(g){var M=MDL(g);if(!M)return null;var x=Math.random()*100,t=0;for(var i=0;i<M.l.length;i++){t+=M.l[i][1];if(x<t)return i}return null}
var EMG=(function(){var e=0;for(var i=0;i<MP.length;i++)e+=MP[i]/100*(1+PRM.m[i]);return e})();
var MMC={};
/* множители моделей: цена модели относительно медианы подарка, подогнанная так, чтобы средняя цена улучшенного подарка осталась как у обычных (экономика не меняется) */
function mmS(g){var nm=G[g][0];if(MMC[nm])return MMC[nm];var M=MDL(g),sp=0;M.l.forEach(function(r){sp+=r[1]/100});sp=Math.min(1,sp);var w=M.l.map(function(r){return Math.min(12,Math.max(.5,r[4]))}),lo=0,hi=100;
 var ex=function(c){var t=(1-sp)*EMG;M.l.forEach(function(r,i){t+=r[1]/100*Math.min(8,Math.max(1,c*w[i]))});return t};
 for(var k=0;k<40;k++){var c=(lo+hi)/2;if(ex(c)<EMG)lo=c;else hi=c}
 return MMC[nm]=w.map(function(x){return Math.min(8,Math.max(1,(lo+hi)/2*x))})}
function mm(it){return it.k!=null&&MDL(it.g)?mmS(it.g)[it.k]:1+PRM.m[it.m]}
function MNI(it){return it.k!=null&&MDL(it.g)?MDL(it.g).l[it.k][0]:MN(it.g,it.m)}
function MPI(it){return it.k!=null&&MDL(it.g)?MDL(it.g).l[it.k][1]:MP[it.m]}
function mdist(g){var M=MDL(g),r=[];if(!M){MP.forEach(function(p,i){r.push([p/100,1+PRM.m[i]])});return r}
 var sp=0,S2=mmS(g);M.l.forEach(function(x,i){sp+=x[1]/100;r.push([x[1]/100,S2[i]])});sp=Math.min(1,sp);MP.forEach(function(p,i){if(sp<1)r.push([p/100*(1-sp),1+PRM.m[i]])});return r}
/* картинка улучшенного подарка: у моделей своя, иначе картинка подарка */
function mdUrl(it,ext){var M=MDL(it.g),r=M.l[it.k];return(ext=="tgs"?"tgs/":"img/m/")+M.d+"/"+r[2]+"."+ext}
function gimgI(it,z){if(it&&it.up&&it.k!=null&&MDL(it.g))return '<svg viewBox="0 0 100 100" width="'+z+'" height="'+z+'" style="display:block;margin:auto;filter:drop-shadow(0 4px 5px rgba(0,0,0,.4))"><image href="'+mdUrl(it,"webp")+'" width="100" height="100"/></svg>';return gimg(it.g,z)}
/* крупная картинка с анимацией модели (.tgs = gzip Lottie). Если проигрыватель или распаковка недоступны, остаётся картинка */
function gimgA(it,z){var h=gimgI(it,z);if(it&&it.up&&it.k!=null&&MDL(it.g)&&MDL(it.g).l[it.k][3])return '<span class="tgsv" data-t="'+mdUrl(it,"tgs")+'" style="display:block;width:'+z+'px;height:'+z+'px;margin:auto">'+h+'</span>';return h}
var TGC={},LTL=0,LTQ=[];
function lotLoad(cb){if(window.lottie)return cb();LTQ.push(cb);if(LTL)return;LTL=1;var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie_light.min.js";s.onload=function(){LTQ.splice(0).forEach(function(f){f()})};s.onerror=function(){LTL=0;LTQ=[]};document.head.appendChild(s)}
function tgsData(u){return TGC[u]||(TGC[u]=fetch(u).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(b){return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"))).json()}))}
function tgsInit(root){if(!window.DecompressionStream)return;(root||document).querySelectorAll(".tgsv[data-t]:not([data-d])").forEach(function(el){el.setAttribute("data-d",1);
 tgsData(el.getAttribute("data-t")).then(function(j){lotLoad(function(){if(!el.isConnected)return;el.innerHTML="";lottie.loadAnimation({container:el,renderer:"svg",loop:true,autoplay:true,animationData:JSON.parse(JSON.stringify(j))})})}).catch(function(){})})}
try{new MutationObserver(function(){tgsInit($("sh"))}).observe($("sh"),{childList:true})}catch(e){}
/* надбавка за малый номер считается от тиража D: первые 0,1% номеров x2,5, до 1% x1,5, до 10% x1,12 (для тиража 10 000 это номера до 10, до 100 и до 1000; первый номер всегда в первой группе) */
/* название и значок модели/узора конкретного подарка */
function MN(g,i){if(i==5)return"Monochrome";var N=MPOOL.length;return MPOOL[((g*7+3)%N+[5,7,11,13,17,19,23,25][g%8]*i)%N]}
function PP(g,i){var N=PPOOL.length;return PPOOL[((g*5+1)%N+[7,11,13,17,19,23,29][g%7]*i)%N]}
function PN(g,i){return PP(g,i)[0]}
function PS(g,i){return PP(g,i)[1]}
function nbm(n,D){return n<=Math.max(1,Math.round(D*.001))?2.5:n<=Math.max(1,Math.round(D*.01))?1.5:n<=Math.max(1,Math.round(D*.1))?1.12:1}
/* красивый номер: [название, множитель] или null */
function nbe(n){var s=String(n);if(n>=11&&/^(\d)\1+$/.test(s))return["Одинаковые цифры",PRM.nb.rep];if(n>=1000&&n%1000==0)return["Круглый номер",PRM.nb.rnd];if(n>=1000&&("0123456789".indexOf(s)>=0||"9876543210".indexOf(s)>=0))return["Лесенка",PRM.nb.seq];if(n>=101&&s==s.split("").reverse().join(""))return["Палиндром",PRM.nb.pal];return null}
function nmul(n,D){var e=nbe(n);return nbm(n,D)*(e?e[1]:1)}
function umul(it){return Math.min(PRM.max,mm(it)*(1+PRM.b[it.b])*(1+PRM.s[it.s])*nmul(it.n,nmax(it.g)))}
function pr(it){var g=G[it.g];return it.up?Math.round(g[3]*umul(it)):g[3]}
/* тираж: сколько всего подарков и сколько выпущено. Номер улучшенного подарка всегда от 1 до числа выпущенных */
function supply(g){var q=G[g],l=LIM[q[0]];if(l)return[l,limTaken(g)];var r=q[2],tot=[250000,30000,9000,2000][r]+((g*7919)%900)*(r+1),iss=Math.round(tot*(.55+((g*37)%40)/100));return[tot,iss]}
function nmax(g){return LIM[G[g][0]]||supply(g)[1]}
/* лимитированные: занятые номера (с сервера и свои), выдача свободного номера */
var LTK={};
function limSet(g){var nm=G[g][0],s={},a=(LTK[nm]||[]).concat((S.ltk||{})[nm]||[]);for(var i=0;i<a.length;i++)s[a[i]]=1;return s}
function limTaken(g){return Object.keys(limSet(g)).length}
function limLeft(g){var l=LIM[G[g][0]];return l?l-limTaken(g):1e9}
function mintN(g){var nm=G[g][0],l=LIM[nm],s=limSet(g),fr=[];for(var i=1;i<=l;i++)if(!s[i])fr.push(i);var n=fr.length?fr[rnd(fr.length)]:1+rnd(l);S.ltk=S.ltk||{};(S.ltk[nm]=S.ltk[nm]||[]).push(n);S.ltp=S.ltp||[];S.ltp.push([nm,n]);return n}
function limFind(nm,n){var a=S.inv.concat((S.mkt||[]).map(function(l){return l.it}));return a.filter(function(x){return x&&x.up&&G[x.g]&&G[x.g][0]==nm&&x.n==n})[0]}
/* выпуски лимиток от админа: ED[название] = {total, price, on, taken}; LIM берётся отсюда */
var ED=S.ed||{};
function edApply(e){ED=e||{};S.ed=ED;Object.keys(LIM).forEach(function(k){delete LIM[k]});Object.keys(ED).forEach(function(k){LIM[k]=ED[k].total})}
Object.keys(ED).forEach(function(k){LIM[k]=ED[k].total});
function limSync(){var sent=(S.ltp||[]).slice();api("/lim",{take:sent}).then(function(d){if(!d||!d.lim)return;LTK=d.lim;if(d.ed)edApply(d.ed);S.ltp=(S.ltp||[]).filter(function(x){return sent.indexOf(x)<0});
 (d.dup||[]).forEach(function(x){var it=limFind(x[0],x[1]),gi=G.map(function(q){return q[0]}).indexOf(x[0]);if(!it||gi<0)return;S.ltk[x[0]]=(S.ltk[x[0]]||[]).filter(function(v){return v!=x[1]});it.n=mintN(gi);toast("Номер "+x[0]+" занят, выдан #"+it.n)});save();if(typeof rMk=="function"&&mtab==6&&$("p3").classList.contains("on"))rMk()}).catch(function(){})}
/* средний множитель улучшенного подарка по шансам модели, фона, узора и номера (номер зависит от тиража подарка): нужен для честного шанса в апгрейде */
var EUC={};
function EUg(g){var D=nmax(g),key=D+"|"+(MDL(g)?G[g][0]:"");if(EUC[key])return EUC[key];var H={},k,n;for(n=1;n<=D;n++){k=nmul(n,D);H[k]=(H[k]||0)+1}
 var t=0,w=0,DM=mdist(g);for(var m=0;m<DM.length;m++)for(var b=0;b<BP.length;b++)for(var s=0;s<SP.length;s++)for(k in H){var p=DM[m][0]*BP[b]*SP[s]*H[k]/D;w+=p;t+=p*Math.min(PRM.max,DM[m][1]*(1+PRM.b[b])*(1+PRM.s[s])*k)}return EUC[key]=t/w}
function tv(g){return Math.round(G[g][3]*EUg(g))}
function mkItem(g,up,fx){if(!up)return{u:S.nu++,g:g,n:0,m:0,s:0,b:0,up:0,d:Date.now()};var k=pickModel(g),o={u:S.nu++,g:g,n:fx||(LIM[G[g][0]]?mintN(g):1+rnd(nmax(g))),m:k!=null?mtier(MDL(g).l[k][1]):wp(MP),s:wp(SP),b:wp(BP),up:1,d:Date.now()};if(k!=null)o.k=k;return o}
function pickG(r,ev,pool){var a=[];G.forEach(function(x,i){if(!x[6]&&!x[7]&&!LIM[x[0]]&&x[2]==r&&(ev?(x[5]==ev||(!x[5]&&r==0)):!x[5])&&(!pool||pool.indexOf(i)>=0))a.push(i)});return a[rnd(a.length)]}
function vib(){if(!S.set.vib)return;try{var h=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback;if(h)h.impactOccurred("light");else if(navigator.vibrate)navigator.vibrate(12)}catch(e){}}
document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("button"))vib()});
function toast(t){var d=$("toast");d.textContent=t;d.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(function(){d.style.display="none"},2500)}
function tile(it,cls,oc,inf){var g=G[it.g],n=!!it.up,c=n?BG[it.b]:"#7f91a4";
 return '<div class="t'+cls+'" style="--rc:'+c+';--bg2:'+(n?c:"#2b3a4b")+'" onclick="'+oc+'">'+(n?'<i class="pt">'+Array(40).join(PS(it.g,it.s)+" ")+'</i>':'')+(inf?'<span class="inf" onclick="event.stopPropagation();sheet('+it.u+')">i</span>':'')+'<b class="im'+(n&&it.m==5?' mono':'')+'">'+gimgI(it,52)+'</b><small>'+g[0]+(n?' #'+it.n:'')+'</small><em>'+f(pr(it))+'</em></div>'}
function gtile(i,cls,oc){var g=G[i],n=g[4],c=n?BG[i%5]:"#7f91a4";return '<div class="t'+cls+'" style="--rc:'+c+';--bg2:'+(n?c:"#2b3a4b")+'" onclick="'+oc+'"><b class="im">'+gimg(i,52)+'</b><small>'+g[0]+'</small><em>'+(n?"≈ ":"")+f(n?tv(i):g[3])+'</em></div>'}
function big(it){var g=G[it.g],n=!!it.up,c=n?BG[it.b]:"#7f91a4";return '<div class="bigc" style="--rc:'+c+';background:linear-gradient(160deg,'+(n?c:"#2b3a4b")+',#0e1621)">'+gimgI(it,108)+'</div><div class="h" style="font-size:22px">'+g[0]+'</div><div class="h" style="color:'+c+'">'+(n?"NFT":"Подарок")+'</div>'}
function atxt(it){return it.up?"Номер #"+it.n+" · "+MNI(it)+" · "+BN[it.b]+" · "+PN(it.g,it.s):"Подарок · можно улучшить"}
function atb(it){function r(l,nm,p,m){return '<div class="srow" style="margin:6px 0"><span>'+l+'</span><span>'+nm+' · '+p+'% <small style="display:inline;color:var(--mu)">×'+m.toFixed(2)+'</small></span></div>'}
 return '<div class="sbox" style="margin:8px 0">'+r("Модель",MNI(it),MPI(it),mm(it))+r("Фон",BN[it.b],BP[it.b],1+PRM.b[it.b])+r("Узор",PN(it.g,it.s),SP[it.s],1+PRM.s[it.s])+'<div class="srow" style="margin:6px 0"><span>Номер</span><span>#'+it.n+(nbe(it.n)?' · '+nbe(it.n)[0]:'')+' <small style="display:inline;color:var(--mu)">×'+nmul(it.n,nmax(it.g)).toFixed(2)+'</small></span></div></div>'}

var tabs=[["box","Кейсы"],["layers","Прогресс"],["up","Апгрейд"],["bag","Маркет"],["user","Профиль"]];
$("nav").innerHTML=tabs.map(function(t,i){return '<button onclick="tab('+i+')">'+ic(t[0],24)+t[1]+'</button>'}).join("");
$("s1").innerHTML=IC.search;$("s2").innerHTML=IC.search;
function tab(n){if(n==6)rSet();for(var i=0;i<11;i++)$("p"+i).classList.toggle("on",i==n);document.querySelectorAll(".nav button").forEach(function(b,i){b.classList.toggle("on",i==(n==10?1:n==5||n==8||n==9?0:n==6?-1:n==7?4:n))});window.scrollTo(0,0);render()}
