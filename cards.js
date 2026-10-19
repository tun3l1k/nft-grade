/* профиль в стиле Telegram, карточки подарков, улучшение подарка */
var ptb=1;
function ptab(n){ptb=n;rPro()}
function rPf(){
 document.querySelectorAll("#ptabs button").forEach(function(b,i){b.classList.toggle("on",i+1==ptb);if(i==0){var d=profPending();b.innerHTML="Прогресс"+(d?'<span class="dot">'+d+'</span>':'')}});
 $("pt1").style.display=ptb==1?"":"none";$("pt2").style.display=ptb==2?"":"none";
 $("pfu").textContent=TGU&&TGU.username?"@"+TGU.username:"—";
 $("pfl").textContent=S.inv.length+" · из них NFT "+S.inv.filter(function(x){return x.up}).length;
 $("pfv").innerHTML=ic("coin",16).replace('<svg','<svg style="display:inline;vertical-align:-3px;margin-right:4px"')+f(cv())+" GRADE";
 var b=$("bio");if(document.activeElement!=b)b.value=S.bio||""}
function tbr(k,v){return '<div class="r"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>'}
function pcb(p){return '<span class="pc">'+p+'%</span>'}
function fdt(t){return t?new Date(t).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}).replace(","," в"):"—"}
function nftHead(it){var g=G[it.g],c=BG[it.b];return '<div class="nfh" style="--c:'+c+'"><i class="npt">'+Array(90).join(PS(it.g,it.s)+" ")+'</i><span class="bpill">'+ic("coin",14)+f(S.bal)+'</span><div class="nfi'+(it.m==5?' mono':'')+'">'+gimg(it.g,132)+'</div><div class="h" style="font-size:22px">'+g[0]+' <span class="nno">#'+f(it.n)+'</span></div><div class="nfs">'+MN(it.g,it.m)+'</div></div>'}
function nftRows(it,owner,own){var sp=supply(it.g),lm=LIM[G[it.g][0]],be=nbe(it.n);return tbr("Владелец",owner)+tbr("Модель",MN(it.g,it.m)+pcb(MP[it.m]))+tbr("Узор",PN(it.g,it.s)+pcb(SP[it.s]))+tbr("Фон",BN[it.b]+pcb(BP[it.b]))+tbr("Номер","#"+f(it.n)+(be?" · "+be[0]:"")+' <span class="pc">×'+nmul(it.n,nmax(it.g)).toFixed(2)+'</span>')+tbr("Наличие",f(sp[1])+"/"+f(sp[0])+" выпущено"+(lm?' <span class="lmb">ЛИМИТКА</span>':''))+tbr("Надбавка за редкость","+"+Math.round((umul(it)-1)*100)+"%")+tbr("Рыночная цена",ic("coin",14)+f(pr(it)))+(own?tbr("Быстрая продажа",ic("coin",14)+f(sv(it))+' <small class="mu">комиссия '+Math.round((1-ECO.sell)*100)+'%</small>'):'')}
function ownerH(){var nm=tgName();return '<span class="oav">'+nm.charAt(0).toUpperCase()+'</span>'+nm}
var UPI='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(255,255,255,.2)"/><path d="M8 11l4-4 4 4M8 16l4-4 4 4"/></svg>';
function itemSheet(it){var u=it.u,g=G[it.g],sp=supply(it.g),h="";shown=u;
 if(it.up){
  h+=nftHead(it)+'<div class="tbl">'+nftRows(it,ownerH(),1)+'</div>'
  +'<button class="go" style="margin:0 0 8px;width:100%" onclick="sellOne2('+u+')">Продать за '+f(sv(it))+'</button>'
  +'<div class="bar" style="padding:0;display:flex;gap:8px"><button class="go gh" style="font-size:13px;flex:1" onclick="upOne('+u+')">В апгрейд</button><button class="go gh" style="font-size:13px;flex:1" onclick="closeSh();tab(3);mtb(5);msel('+u+')">На маркет</button></div>'}
 else{var can=!!g[4]&&(!!it.sn||limLeft(it.g)>0);
  h+='<div class="nfi" style="height:120px">'+gimg(it.g,112)+'</div><div class="h" style="font-size:22px">Подарок Вам</div>'
  +'<div class="at" style="text-align:center;padding:0 10px">Вы можете хранить этот подарок'+(can?', улучшить его':'')+' или обменять на '+f(sv(it))+' GRADE (комиссия '+Math.round((1-ECO.sell)*100)+'%).</div>'
  +'<div class="tbl">'+tbr("От",'<span class="oav">N</span>NFT GRADE')+tbr("Дата",fdt(it.d))+(it.sn?tbr("Номер при улучшении","#"+f(it.sn)+' <span class="lmb">ЛИМИТКА</span>'):'')
  +tbr("Рыночная цена",ic("coin",14)+f(g[3])+' <button class="lk" onclick="sellOne2('+u+')">продать за '+f(sv(it))+' GRADE</button>')+(can?tbr("После улучшения","≈ "+ic("coin",14)+f(tv(it.g))+' <small class="mu">зависит от модели, фона и узора</small>'):'')
  +tbr("Наличие",f(sp[1])+"/"+f(sp[0])+" выпущено"+(LIM[g[0]]?' <span class="lmb">ЛИМИТКА</span>':''))
  +tbr("Статус","Неуникальный")+'</div>'
  +'<div class="hv">'+(it.hid?'Подарок скрыт из профиля. ':'Подарок виден в профиле. ')+'<a href="#" onclick="hideG('+u+');return false">'+(it.hid?'Показать':'Скрыть')+' ›</a></div>'
  +(can?'<button class="go bigb" onclick="gUp('+u+')">Улучшить '+UPI+'</button><button class="go gh" style="margin:8px 0 0;width:100%" onclick="upOne('+u+')">В апгрейд</button>':'<button class="go gh" style="margin:0;width:100%" onclick="closeSh()">Закрыть</button>')}
 $("sh").innerHTML=h;$("sheet").className="ov end on"}
function hideG(u){var x=S.inv.filter(function(y){return y.u==u})[0];if(!x)return;x.hid=!x.hid;save();render();itemSheet(x)}
function upCost(it){return Math.max(10,Math.round(G[it.g][3]*ECO.upk))}
function gUp(u){var it=S.inv.filter(function(x){return x.u==u})[0];if(!it||it.up||!G[it.g][4])return;if(!it.sn&&limLeft(it.g)<=0){toast("Тираж исчерпан");return}var c=upCost(it),ok=S.bal>=c;
 var fe=function(ic2,t,d){return '<div class="feat">'+ic2+'<div><b>'+t+'</b><span>'+d+'</span></div></div>'};
 var I1='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 6 3-6M12 21L9 9M12 21l3-12"/></svg>';
 var I2='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
 var I3='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l2-11 5 5 2-8 2 8 5-5 2 11z"/></svg>';
 $("sh").innerHTML='<div class="nfi" style="height:120px">'+gimg(it.g,112)+'</div><div class="h" style="font-size:22px">Улучшение подарка</div><div class="at" style="text-align:center;padding:0 10px">Подарок станет уникальным коллекционным, и его можно будет передать или продать на маркете.</div>'
  +fe(I1,"Уникальность","При улучшении подарку присваиваются уникальный номер, модель, фон и узор.")+fe(I2,"Можно продать","Подарок можно продать на маркете или обменять на GRADE.")+fe(I3,"Можно носить","Подарок можно добавить в профиль и показывать другим.")
  +'<div class="tbl">'+tbr("Улучшение",ic("coin",14)+f(c)+" GRADE")+tbr("Ваш баланс",ic("coin",14)+f(S.bal))+'</div>'
  +'<button class="go bigb" '+(ok?'':'disabled')+' onclick="gUpDo('+u+')">'+(ok?'Улучшить за '+f(c)+' '+UPI:'Не хватает GRADE')+'</button><button class="go gh" style="margin:0;width:100%" onclick="sheet('+u+')">Назад</button>';
 $("sheet").className="ov end on"}
function gUpDo(u){var it=S.inv.filter(function(x){return x.u==u})[0];if(!it||it.up||!G[it.g][4])return;if(!it.sn&&limLeft(it.g)<=0){toast("Тираж исчерпан");return}var c=upCost(it);if(S.bal<c){toast("Не хватает GRADE");return}
 S.bal-=c;var n=mkItem(it.g,1,it.sn);delete it.sn;it.n=n.n;it.m=n.m;it.s=n.s;it.b=n.b;it.up=1;it.d=Date.now();bpAdd("nft",1);save();render();upAnim(it)}
var UA=null;
function upAnim(it){if(UA){clearInterval(UA);UA=null}
 var reduce=false;try{reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches}catch(e){}
 var fin=function(){vib();sfx("r2");burst(it.b>=3||it.m==5?70:44,[BG[it.b],"#ffd54a","#fff"]);itemSheet(it)};
 if(reduce){fin();return}
 var g=G[it.g],sp=supply(it.g);shown=it.u;
 $("sh").innerHTML='<div class="nfh" id="ua_h" style="--c:'+BG[rnd(BG.length)]+'"><i class="npt" id="ua_p"></i><span class="bpill">'+ic("coin",14)+f(S.bal)+'</span><div class="nfi ufl" id="ua_i">'+gimg(it.g,132)+'</div><div class="h" style="font-size:22px">'+g[0]+'</div><div class="nfs" id="ua_t">Улучшение подарка…</div></div>'
  +'<div class="tbl">'+tbr("Владелец",ownerH())+tbr("Модель",'<span id="ua_m">…</span>')+tbr("Узор",'<span id="ua_s">…</span>')+tbr("Фон",'<span id="ua_b">…</span>')+tbr("Рыночная цена",'<span id="ua_v">…</span>')+tbr("Наличие",f(sp[1])+"/"+f(sp[0])+" выпущено"+(LIM[g[0]]?' <span class="lmb">ЛИМИТКА</span>':''))+'</div><div class="mu" style="text-align:center;padding-bottom:6px">Определяем уникальные свойства…</div>';
 $("sheet").className="ov end on";
 var t0=Date.now(),lk={m:0,s:0,b:0},tk=0,pt=function(sym){$("ua_p").textContent=Array(90).join(sym+" ")};
 UA=setInterval(function(){var H=$("ua_h");if(!H||shown!=it.u){clearInterval(UA);UA=null;return}
  var e=Date.now()-t0;tk++;if(tk%3==0)sfx("tick");
  if(!lk.m){if(e>=1400){lk.m=1;$("ua_m").innerHTML=MN(it.g,it.m)+pcb(MP[it.m]);$("ua_i").classList.remove("ufl");$("ua_i").classList.add("upop");vib()}else $("ua_m").textContent=MN(it.g,rnd(6))}
  if(!lk.s){if(e>=2000){lk.s=1;$("ua_s").innerHTML=PN(it.g,it.s)+pcb(SP[it.s]);pt(PS(it.g,it.s))}else{var k=rnd(5);$("ua_s").textContent=PN(it.g,k);pt(PS(it.g,k))}}
  if(!lk.b){if(e>=2600){lk.b=1;$("ua_b").innerHTML=BN[it.b]+pcb(BP[it.b]);H.style.setProperty("--c",BG[it.b])}else{var q=rnd(BG.length);$("ua_b").textContent=BN[q];H.style.setProperty("--c",BG[q])}}
  if(e>=3000){clearInterval(UA);UA=null;$("ua_t").textContent=MN(it.g,it.m);$("ua_v").innerHTML=ic("coin",14)+f(pr(it));
   vib();sfx("r2");burst(it.b>=3||it.m==5?70:44,[BG[it.b],"#ffd54a","#fff"]);toast("Подарок улучшен: "+g[0]+" #"+it.n);
   setTimeout(function(){if(shown==it.u&&$("ua_h"))itemSheet(it)},900)}
 },90)}
