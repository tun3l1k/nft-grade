/* ===== профиль игрока из ленты live ===== */
var PD_NAME={crypto_wolf:"Crypto Wolf",nft_queen:"NFT Queen",tonfan:"TON Fan",alex_t:"Алекс",mari:"Мари",dima99:"Дима",kira:"Кира",neo:"Neo"};
var BTm={};BT.forEach(function(b){BTm[b[0]]=b});
var PC={},PI={},PID=0,PVU=null,PVT=1,PVF=0;
function hsh(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rngf(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function swp(r,w){var s=0,i;for(i=0;i<w.length;i++)s+=w[i];var x=r()*s;for(i=0;i<w.length;i++){x-=w[i];if(x<0)return i}return 0}
var GR=null;function gByR(){if(!GR){GR=[[],[],[],[]];G.forEach(function(x,i){if(!x[6]&&!x[7]&&!x[5]&&!LIM[x[0]]&&GR[x[2]])GR[x[2]].push(i)})}return GR}
function pvName(u){return PD_NAME[u]||u}
function pvAv(u,sz,fs){var h=hsh(u)%360;return '<span class="pvo" style="width:'+sz+'px;height:'+sz+'px;font-size:'+fs+'px;background:linear-gradient(135deg,hsl('+h+' 70% 56%),hsl('+(h+55)+' 70% 42%))">'+pvName(u).charAt(0).toUpperCase()+'</span>'}
function pvItemMk(r,g,from,when){var up=G[g][4]&&!LIM[G[g][0]]&&r()<(G[g][2]>=1?.75:.45)?1:0;var it={id:++PID,g:g,up:up,n:up?1+Math.floor(r()*nmax(g)):0,m:0,mo:-1,s:up?swp(r,SP):0,b:up?swp(r,BP):0,d:when,from:from,u:PID};if(up){var q=gmOf(g);if(q){var T=0,j;for(j=0;j<q.m.length;j++)T+=q.m[j][1];var x=r()*T,t=0;it.mo=q.m.length-1;for(j=0;j<q.m.length;j++){t+=q.m[j][1];if(x<t){it.mo=j;break}}}else it.m=swp(r,MP)}return it}
var PBIO=["Коллекционирую редкие NFT 💎","Ловлю удачу в кейсах","Тут за красивыми номерами","Не продаю, только копию","Собираю Monochrome","Апгрейд — мой стиль","Люблю Plush Pepe","Крипта, кофе и подарки","Всё по плану, всё в плюс","Торгую на маркете каждый день"],PAGO=["был(а) недавно","был(а) 12 минут назад","был(а) 1 час назад","был(а) 3 часа назад","был(а) вчера"];
function genP(u){var b=BTm[u],h=hsh(u),r=rngf(h),val=b[1],tier=val>=150000?3:val>=60000?2:val>=20000?1:0;
 var W=[[60,28,10,2],[48,32,15,5],[36,34,21,9],[24,32,28,16]][tier],now=Date.now(),a=[],sum=0,names=BT.map(function(x){return x[0]}).filter(function(x){return x!=u});
 for(var k=0;k<130;k++){var rem=val-sum;if(rem<18)break;var g=-1;
  for(var t=0;t<8;t++){var rr=swp(r,W),L=gByR()[rr];if(!L.length)continue;var c=L[Math.floor(r()*L.length)];if(G[c][3]<=rem*1.2){g=c;break}}
  if(g<0)break;var from=r()<.45?"NFT GRADE":names[Math.floor(r()*names.length)];
  var it=pvItemMk(r,g,from,now-Math.floor(r()*18*864e5)-36e5);a.push(it);PI[it.id]=[u,it];sum+=pr(it)}
 var ups=b[2]*3+Math.floor(r()*9),cs=b[2]*9+Math.floor(r()*40);
 var P={u:u,b:b,gifts:a,bd:[1+Math.floor(r()*28),Math.floor(r()*12)],on:r()<.42,ago:Math.floor(r()*5),bio:r()<.8?PBIO[Math.floor(r()*PBIO.length)]:"",ups:ups,wins:Math.round(ups*(.3+r()*.25)),cases:cs,deals:Math.floor(b[2]*1.6+r()*8)};
 P.val=function(){var s=0;P.gifts.forEach(function(x){s+=pr(x)});return s};return P}
function getP(u){if(!BTm[u])return null;return PC[u]||(PC[u]=genP(u))}
function mkLive(u,g){var it=pvItemMk(Math.random,g,"NFT GRADE",Date.now());var P=getP(u);if(P){P.gifts.unshift(it);PI[it.id]=[u,it]}return it}
LF.forEach(function(d,i){d[2]=mkLive(d[0],d[1]);d[2].d=Date.now()-i*95000});
livePush=function(u,g){var it=mkLive(u,g);LF.unshift([u,g,it]);if(LF.length>30)LF.pop();rLive(1)};
function tileH(d,an){var g=G[d[1]],it=d[2],up=it&&it.up,c=up?BG[it.b]:(g[4]?BG[d[1]%5]:"#7f91a4");
 return '<div class="t sm'+(an?" nw":"")+'" data-u="'+d[0]+'" data-i="'+(it?it.id:0)+'" onclick="liveTap(this)" style="--rc:'+c+';--bg2:'+(up?c:BG[d[1]%5])+'">'+(up?'<i class="pt">'+Array(40).join(PS(it.g,it.s)+" ")+'</i>':'')+'<b'+(ismono(it)?' class="mono"':'')+'>'+(up?mimg(it,34):gimg(d[1],34))+'</b><small>'+g[0]+'</small><em style="font-size:10px;color:var(--mu)">'+(d[0]=="вы"?"вы":"@"+d[0])+'</em></div>'}
rLive=function(an){var fd=$("feed");if(!fd)return;
 if(an&&fd.children.length&&LF.length){var sl=fd.scrollLeft;fd.insertAdjacentHTML("afterbegin",tileH(LF[0],1));while(fd.children.length>20)fd.removeChild(fd.lastChild);if(sl>4)fd.scrollLeft=sl+94}
 else fd.innerHTML=LF.slice(0,20).map(function(d){return tileH(d,0)}).join("")};
rLive();
function liveTap(el){var u=el.dataset.u;if(u=="вы"){tab(4);return}vib();pvOpen(u,+el.dataset.i)}

/* ---- экран профиля ---- */
var PV_ICO={
 back:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 call:'<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
 video:'<svg width="32" height="30" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="13" height="12" rx="3"/><path d="M16.500 10.500 22 7v10l-5.500-3.500z"/></svg>',
 bell:'<svg width="28" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.500 2.500 0 0 0 2.400-2h-4.800A2.500 2.500 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.700V3a2 2 0 0 0-4 0v1.300A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/></svg>',
 search:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M16.500 16.500 21 21"/></svg>',
 more:'<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
 qr:'<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18v3M21 17v1" stroke-linecap="round"/></svg>',
 cup:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.900V17h3v3H8v-3h3v-2.100A5 5 0 0 1 8.300 12H8a4 4 0 0 1-4-4V5h3zm-1 4v1a2 2 0 0 0 1 1.700V7zm12 0h-1v2.700A2 2 0 0 0 18 8z"/></svg>'};
function pvShield(l){return '<svg width="18" height="20" viewBox="0 0 24 26"><path d="M12 1.500l9 3.300v7.200c0 5.500-3.900 10-9 12-5.100-2-9-6.500-9-12V4.800z" fill="#2aabee"/><text x="12" y="16.500" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Inter,sans-serif">'+l+'</text></svg>'}
function pvTitle(P){var b=P.b;return b[3]>=6?"Легенда":b[1]>=80000?"Магнат":b[1]>=20000?"Коллекционер":b[2]>=3?"Везунчик":"Новичок"}
function pvAgo(t){var m=Math.max(0,Math.round((Date.now()-t)/6e4));if(m<1)return"только что";if(m<60)return m+" мин назад";var h=Math.round(m/60);if(h<24)return h+" ч назад";return Math.round(h/24)+" дн назад"}
function pvGift(x,P,focus){var n=!!x.up,c=n?BG[x.b]:"#7f91a4",h=hsh(x.from)%360;
 return '<div class="gc'+(x.id==focus?" nw2":"")+'" style="--rc:'+c+'" onclick="pvItem('+x.id+')"><span class="gs" style="background:linear-gradient(135deg,hsl('+h+' 70% 56%),hsl('+(h+55)+' 70% 42%))">'+x.from.charAt(0).toUpperCase()+'</span>'+(n?'<span class="gn" style="background:'+c+'">#'+x.n+'</span>':'')+(n?mimg(x,60):gimg(x.g,60))+'<small>'+(x.id==focus?"только что":f(pr(x)))+'</small></div>'}
function pvBody(){var P=getP(PVU),el=$("pvbody");if(!P||!el)return;
 var a=P.gifts.slice().sort(function(p,q){return(q.id==PVF)-(p.id==PVF)||pr(q)-pr(p)});
 el.innerHTML=PVT==1?'<div class="grid pvg">'+a.map(function(x){return pvGift(x,P,PVF)}).join("")+'</div>'
  :P.gifts.slice().sort(function(p,q){return q.d-p.d}).slice(0,25).map(function(x){var g=G[x.g];return '<div class="pvd" onclick="pvItem('+x.id+')"><div style="width:34px">'+(x.up?mimg(x,32):gimg(x.g,32))+'</div><div><b>'+g[0]+(x.up?" #"+x.n:"")+'</b><span>выпал из кейса</span></div><em>'+f(pr(x))+'<small>'+pvAgo(x.d)+'</small></em></div>'}).join("");
 document.querySelectorAll("#pvt button").forEach(function(b,i){b.classList.toggle("on",i+1==PVT)})}
function pvTab(n){PVT=n;pvBody()}
function pvSoon(t){toast(t||"Недоступно в демо")}
function pvRender(){var P=getP(PVU),b=P.b,u=PVU,h=hsh(u)%360,val=P.val(),nft=P.gifts.filter(function(x){return x.up}).length,rare=P.gifts.filter(function(x){return G[x.g][2]>=2}).length,
 place=BT.slice().sort(function(p,q){return q[1]-p[1]}).map(function(x){return x[0]}).indexOf(u)+1,
 top=P.gifts.slice().sort(function(p,q){return pr(q)-pr(p)}).slice(0,3).map(function(x){return G[x.g][1]}).join(""),
 mo=["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"],
 bt=function(ic,l,fn){return '<button onclick="'+fn+'">'+ic+'<span>'+l+'</span></button>'};
 $("pv").innerHTML='<div class="pve" id="pve"></div><div class="pvh"><button class="pvb" onclick="pvClose()">'+PV_ICO.back+'</button>'
 +'<div class="pvav" style="background:linear-gradient(135deg,hsl('+h+' 62% 46%),hsl('+(h+60)+' 66% 30%))">'+pvName(u).charAt(0).toUpperCase()+'</div>'
 +'<div class="pvn">'+pvName(u)+'</div><div class="pvst'+(P.on?' on':'')+'">'+pvShield(b[2])+'<span>'+(P.on?"в сети":PAGO[P.ago|0])+'</span></div></div>'
 +'<button class="pvsend" onclick="pvSend()">Отправить подарок</button>'
 +'<div class="pvm">'+PV_ICO.cup.replace(/20/g,'16')+'Титул: '+pvTitle(P)+' <span>· '+place+'-е место ›</span></div>'
 +'<div class="pvc">'+(P.bio?'<div class="r"><div class="k">о себе</div><div class="pvv">'+P.bio+'</div></div>':'')+'<div class="r"><div class="k">имя пользователя</div><div class="pvv bl2">@'+u+'</div><span class="pvq">'+PV_ICO.qr+'</span></div><div class="r"><div class="k">день рождения</div><div class="pvv">'+P.bd[0]+' '+mo[P.bd[1]]+'</div></div></div>'
 +'<div class="pvk"><div class="w">'+ic("coin",18)+f(val)+'<small>GRADE · коллекция</small></div>'
 +[[P.gifts.length,"Подарков"],[nft,"NFT"],[rare,"Редких"],[b[2],"Уровень"],[f(P.cases),"Кейсов"],[P.wins+"/"+P.ups,"Апгрейды"]].map(function(x){return '<div>'+x[0]+'<small>'+x[1]+'</small></div>'}).join("")+'</div>'
 +'<div class="pvt" id="pvt"><button onclick="pvTab(1)">Подарки '+top+'</button><button onclick="pvTab(2)">Дропы</button></div><div id="pvbody"></div>';
 pvBody();bindEdge()}
function pvItem(id){var q=PI[id];if(!q)return;var u=q[0],it=q[1],g=G[it.g],sp=supply(it.g),own=pvAv(u,22,11)+pvName(u),h;shown=null;
 if(it.up)h=nftHead(it).replace(/<span class="bpill">.*?<\/span>/,"")+'<div class="tbl">'+nftRows(it,own)+tbr("От",it.from)+tbr("Дата",fdt(it.d))+'</div>';
 else h='<div class="nfi" style="height:120px">'+gimg(it.g,112)+'</div><div class="h" style="font-size:22px">'+g[0]+'</div><div class="at" style="text-align:center;padding:0 10px">Подарок игрока '+pvName(u)+'</div><div class="tbl">'+tbr("Владелец",own)+tbr("От",it.from)+tbr("Дата",fdt(it.d))+tbr("Стоимость",ic("coin",14)+f(g[3]))+tbr("Наличие",f(sp[0]-sp[1])+" из "+f(sp[0]))+tbr("Статус","Неуникальный")+'</div>';
 $("sh").innerHTML=h+'<button class="go gh" style="margin:0;width:100%" onclick="closeSh()">Закрыть</button>';$("sheet").className="ov end on"}

/* ---- push-анимация и свайп назад (слева направо, как в Telegram) ---- */
var pvW=null,pvEl=null,pvSc=null,pvOn=false,pvT=null;
function pvInit(){if(pvW)return;pvW=document.createElement("div");pvW.id="pvw";pvW.innerHTML='<div id="pvs"></div><div id="pv"></div>';document.body.appendChild(pvW);pvEl=$("pv");pvSc=$("pvs")}
function pvSet(x){var w=pvW.clientWidth||480;pvEl.style.transform="translateX("+x+"px)";pvSc.style.opacity=(.55*(1-x/w)).toFixed(3)}
function pvOpen(u,focus){if(!getP(u))return;pvInit();PVU=u;PVT=1;PVF=focus||0;pvRender();clearTimeout(pvT);
 pvEl.scrollTop=0;pvEl.classList.remove("anim");pvSc.classList.remove("anim");pvW.classList.add("on");pvSet(pvW.clientWidth);void pvEl.offsetWidth;
 pvEl.classList.add("anim");pvSc.classList.add("anim");pvSet(0);pvOn=true;document.body.classList.add("pvon");
 try{var B=Telegram.WebApp.BackButton;B.onClick(pvClose);B.show()}catch(e){}}
function pvClose(){if(!pvOn)return;pvOn=false;closeSh();pvEl.classList.add("anim");pvSc.classList.add("anim");pvSet(pvW.clientWidth);
 document.body.classList.remove("pvon");try{var B=Telegram.WebApp.BackButton;B.offClick(pvClose);B.hide()}catch(e){}
 clearTimeout(pvT);pvT=setTimeout(function(){if(!pvOn)pvW.classList.remove("on")},460)}
function bindEdge(){var e=$("pve"),sx=0,sy=0,dx=0,t0=0,drag=false,id=null;if(!e)return;
 e.onpointerdown=function(ev){drag=true;id=ev.pointerId;sx=ev.clientX;dx=0;t0=Date.now();pvEl.classList.remove("anim");pvSc.classList.remove("anim");try{e.setPointerCapture(id)}catch(_){}};
 e.onpointermove=function(ev){if(!drag)return;dx=Math.max(0,ev.clientX-sx);pvSet(dx)};
 var end=function(){if(!drag)return;drag=false;var w=pvW.clientWidth,v=dx/Math.max(1,Date.now()-t0);pvEl.classList.add("anim");pvSc.classList.add("anim");
  if(dx>w*.33||(v>.5&&dx>30)){pvClose()}else{pvSet(0)}};
 e.onpointerup=end;e.onpointercancel=end}
document.addEventListener("keydown",function(e){if(e.key=="Escape"&&pvOn)pvClose()});

/* ---- отправить подарок игроку ---- */
var PVS=null;
function pvSend(){if(!S.inv.length){toast("Подарков пока нет");return}PVS=null;pvSendSheet()}
function pvPick(u){PVS=PVS==u?null:u;pvSendSheet()}
function pvSendSheet(){var a=S.inv.slice().sort(function(x,y){return pr(y)-pr(x)});
 $("sh").innerHTML='<div class="h" style="font-size:19px;margin-bottom:4px">Подарок для '+pvName(PVU)+'</div><div class="mu" style="margin-bottom:8px">Выберите подарок из своего инвентаря</div><div class="grid" style="padding:0;max-height:300px;overflow:auto">'+a.map(function(x){return tile(x,x.u==PVS?" on":"","pvPick("+x.u+")")}).join("")+'</div><button class="go" style="margin:12px 0 0;width:100%" '+(PVS==null?'disabled':'')+' onclick="pvSendGo()">'+(PVS==null?"Выберите подарок":"Отправить @"+PVU)+'</button>';
 $("sheet").className="ov end on"}
function pvSendGo(){if(PVS==null)return;var x=S.inv.filter(function(y){return y.u==PVS})[0];if(!x)return;var P=getP(PVU);
 S.inv=S.inv.filter(function(y){return y.u!=PVS});isel={};
 var it={id:++PID,g:x.g,up:x.up,n:x.n,m:x.m,mo:x.mo,s:x.s,b:x.b,d:Date.now(),from:"Вы",u:PID};P.gifts.unshift(it);PI[it.id]=[PVU,it];PVF=it.id;
 S.hist.unshift({t:"Подарено",n:G[x.g][0]+(x.up?" #"+x.n:"")+" → @"+PVU,p:0});PVS=null;closeSh();vib();sfx("r2");burst(30,["#2aabee","#fff","#ffd54a"]);toast("Подарок отправлен @"+PVU);save();render();pvRender()}
