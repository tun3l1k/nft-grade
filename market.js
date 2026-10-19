/* маркет */
var mqv="",mtab=0,shown=null,shp=0,shd=300,mp=null;
function stp(g){return Math.max(1,Math.round(G[g][3]*.05))}
function bl(){var g=NI[rnd(NI.length)],au=Math.random()<.35,l={id:S.nl++,it:mkItem(g,1),s:BT[rnd(BT.length)][0],type:au?"auc":"fix"};
 var v=pr(l.it);if(au){l.p=Math.max(1,Math.round(v*.9));l.by=null;l.end=Date.now()+(60+rnd(240))*1000}else l.p=Math.max(1,Math.round(v*(1+Math.random()*.4)));return l}
if(!S.mkt.length)for(var q=0;q<8;q++)S.mkt.push(bl());
function mqs(v){mqv=v.toLowerCase();rMk()}
function mtb(n){mtab=n;rMk()}
function minBid(l){return l.by?l.p+stp(l.it.g):l.p}
function mcard(l){var g=G[l.it.g],it=l.it,au=l.type=="auc",me=l.s=="you",fv=S.fav.indexOf(l.id)>=0,now=Date.now(),be=nbe(it.n),btn,bd="";
 if(LIM[g[0]])bd+='<span class="mbd lim">ЛИМИТКА</span>';if(it.m==5)bd+='<span class="mbd">MONO</span>';if(be)bd+='<span class="mbd">★ '+be[0]+'</span>';if(au)bd+='<span class="mbd">'+fmtT(l.end-now)+'</span>';
 if(me)btn=(au&&l.by)?'<button class="mb" disabled>Идут торги</button>':'<button class="mb" onclick="event.stopPropagation();unl('+l.id+')">'+f(l.p)+' · Снять</button>';
 else if(au)btn=l.by=="you"?'<button class="mb" disabled>Вы лидируете</button>':'<button class="mb pri" '+(S.bal<minBid(l)?'disabled ':'')+'onclick="event.stopPropagation();bid('+l.id+')">Ставка '+f(minBid(l))+'</button>';
 else btn='<button class="mb pri" '+(S.bal<l.p?'disabled ':'')+'onclick="event.stopPropagation();buy('+l.id+')">'+f(l.p)+' '+ic("coin",14)+'</button>';
 return '<div class="mc" style="--c:'+BG[it.b]+'" onclick="lotSheet('+l.id+')"><i class="mpt">'+Array(70).join(PS(it.g,it.s)+" ")+'</i><div class="mtop"><span class="mbds">'+bd+'</span>'+(me?'':'<button class="mfv'+(fv?' on':'')+'" onclick="event.stopPropagation();fav('+l.id+')">'+ic("star",18)+'</button>')+'</div>'
  +'<div class="mim'+(it.m==5?' mono':'')+'">'+gimg(it.g,70)+'</div><div class="mn">'+g[0]+' <b>#'+f(it.n)+'</b></div><div class="ms">'+MN(it.g,it.m)+' · '+BN[it.b]+'</div><div class="ms">'+(me?"Ваш лот":'@'+l.s)+(au&&l.by?' · ставка @'+(l.by=="you"?"вы":l.by):'')+'</div>'+btn+'</div>'}
/* лимитированные выпуски: покупка NFT с новым уникальным номером прямо у системы */
function limList(){return G.map(function(g,i){return i}).filter(function(i){return LIM[G[i][0]]})}
function limDay(){var a=limList();return a[dkey()%a.length]}
function limPrice(g){return Math.round(tv(g)*(g==limDay()?.935:1.1))}
function limCard(g){var q=G[g],sp=supply(g),left=limLeft(g),pc=Math.round(sp[1]/sp[0]*100),p=limPrice(g),day=g==limDay(),c=BG[g%5];
 return '<div class="mc lc" style="--c:'+c+'"><div class="mtop"><span class="mbds"><span class="mbd lim">ЛИМИТКА</span>'+(day?'<span class="mbd">−15% СЕГОДНЯ</span>':'')+'</span></div><div class="mim">'+gimg(g,70)+'</div><div class="mn">'+q[0]+'</div>'
  +'<div class="ms">'+f(sp[1])+'/'+f(sp[0])+' выпущено</div><div class="lbar"><i style="width:'+pc+'%"></i></div>'
  +(left>0?'<button class="mb pri" '+(S.bal<p?'disabled ':'')+'onclick="limBuy('+g+')">Выпустить · '+f(p)+'</button>':'<button class="mb" disabled>Тираж выпущен</button>')+'</div>'}
function limBuy(g){var p=limPrice(g);if(limLeft(g)<=0){toast("Тираж исчерпан");return}if(S.bal<p){toast("Не хватает GRADE");return}
 S.bal-=p;var it=mkItem(g,1);S.inv.push(it);bpAdd("nft",1);S.hist.unshift({t:"Выпущено",n:G[g][0]+" #"+it.n,p:p});save();render();limSync();upAnim(it)}
function mflt(){mf.open=!mf.open;rMk()}
function rMk(){var T=["Все","Аукционы","Лимитки","Мои","Избранное","История"],TI=[0,1,6,2,3,4];
 $("mch").innerHTML=T.map(function(t,i){return '<button class="chip'+(mtab==TI[i]?' on':'')+'" onclick="mtb('+TI[i]+')">'+t+'</button>'}).join("");
 var lst=mtab<4||mtab==6;$("mflt").style.display=(mtab<4&&mf.open)?"":"none";$("mfb").style.display=mtab<4?"":"none";$("mfb").classList.toggle("on",!!mf.open||mf.r>=0||mf.min>0||mf.max>0||mf.ser>=0||!!mf.sel);
 $("mrar").innerHTML=[["Любой фон",-1]].concat(BN.map(function(r,i){return[r,i]})).map(function(x){return '<button class="chip'+(mf.r==x[1]?" on":"")+'" onclick="mrs('+x[1]+')">'+x[0]+"</button>"}).join("")+(mf.sel?'<button class="chip on" onclick="msl(\'\')">@'+mf.sel+" ✕</button>":"");
 $("msb").style.display=mtab==5?"none":"";if(mtab==5){rSell();return}
 if(mtab==6){var a6=limList().sort(function(x,y){return(y==limDay())-(x==limDay())||G[y][3]-G[x][3]});
  $("mlist").innerHTML='<div class="mstat"><span>Лимитированные NFT: номер выдаётся один раз на всех игроков</span></div><div class="mg">'+a6.map(limCard).join("")+'</div>';return}
 if(mtab==4){$("mlist").innerHTML=S.hist.map(function(h){return '<div class="mrow"><div class="tt">'+h.t+': '+h.n+'<small>'+(h.p>0?f(h.p)+' GRADE':'Подарок')+'</small></div></div>'}).join("")||'<p class="note">Сделок пока нет</p>';return}
 var now=Date.now(),a=S.mkt.filter(function(l){var me=l.s=="you";if(mqv&&(G[l.it.g][0]+" #"+l.it.n+" "+MN(l.it.g,l.it.m)+" "+PN(l.it.g,l.it.s)+" "+BN[l.it.b]).toLowerCase().indexOf(mqv)<0)return false;if(mf.r>=0&&l.it.b!=mf.r)return false;if(mf.min&&l.p<mf.min)return false;if(mf.max&&l.p>mf.max)return false;if(mf.ser==1&&l.it.m<3)return false;if(mf.ser==2&&l.it.m!=5)return false;if(mf.ser==3&&!LIM[G[l.it.g][0]])return false;if(mf.sel&&l.s!=mf.sel)return false;return mtab==0?!me:mtab==1?(l.type=="auc"&&!me):mtab==2?me:S.fav.indexOf(l.id)>=0}).sort(function(x,y){return mf.sort==1?y.p-x.p:mf.sort==2?(x.type=="auc"?x.end:9e15)-(y.type=="auc"?y.end:9e15):mf.sort==3?x.it.n-y.it.n:mf.sort==4?y.id-x.id:x.p-y.p});
 var tot=a.reduce(function(s,l){return s+l.p},0);
 $("mlist").innerHTML='<div class="mstat"><span>Лотов: '+a.length+'</span><span>Баланс: '+f(S.bal)+'</span></div>'+(a.length?'<div class="mg">'+a.map(mcard).join("")+'</div>':'<p class="note">Ничего не найдено. Измените фильтры или поиск.</p>')}
function lot(id){return S.mkt.filter(function(y){return y.id==id})[0]}
function fav(id){var i=S.fav.indexOf(id);if(i<0)S.fav.push(id);else S.fav.splice(i,1);save();rMk()}
function buy(id){var l=lot(id);if(!l||S.bal<l.p)return;S.bal-=l.p;l.it.u=S.nu++;S.inv.push(l.it);S.mkt=S.mkt.filter(function(y){return y.id!=id});phAdd(l.it.g,l.p);bpAdd("buys",1);S.hist.unshift({t:"Куплено",n:G[l.it.g][0]+" #"+l.it.n,p:l.p});toast("Куплено: "+G[l.it.g][0]);save();render()}
function bid(id){var l=lot(id);if(!l||l.type!="auc"||l.by=="you"||l.end<Date.now())return;var m=minBid(l);if(S.bal<m){toast("Не хватает монет");return}S.bal-=m;l.p=m;l.by="you";toast("Ставка принята: "+f(m));save();render()}
function unl(id){var l=lot(id);if(!l||l.by)return;S.mkt=S.mkt.filter(function(y){return y.id!=id});S.inv.push(l.it);save();render()}
var tk=0;
setInterval(function(){tk++;var now=Date.now(),c=0;
 S.mkt=S.mkt.filter(function(l){if(l.type!="auc"||l.end>now)return true;c=1;var nm=G[l.it.g][0]+" #"+l.it.n;
  if(l.s=="you"){if(l.by){var nt=net(l.p);S.bal+=nt;S.hist.unshift({t:"Продано на аукционе",n:nm,p:nt});toast("Аукцион завершён: +"+f(nt))}else{S.inv.push(l.it);toast("Аукцион без ставок: подарок возвращён")}}
  else if(l.by=="you"){l.it.u=S.nu++;S.inv.push(l.it);bpAdd("buys",1);S.hist.unshift({t:"Выиграно на аукционе",n:nm,p:l.p});toast("Вы выиграли: "+G[l.it.g][0])}
  return false});
 if(tk%5==0){S.mkt.forEach(function(l){var v=pr(l.it);if(l.type!="auc")return;
   if(l.s=="you"){if(Math.random()<.35&&l.p<v*1.1){l.p=minBid(l);l.by=BT[rnd(BT.length)][0];c=1}}
   else if(l.by=="you"){if(Math.random()<.2&&minBid(l)<v*1.1){S.bal+=l.p;l.p=minBid(l);l.by=BT[rnd(BT.length)][0];toast("Вашу ставку перебили");c=1}}
   else if(Math.random()<.15&&minBid(l)<v*1.1){l.p=minBid(l);l.by=BT[rnd(BT.length)][0];c=1}});
  S.mkt=S.mkt.filter(function(l){if(l.s=="you"&&l.type!="auc"&&l.p<=pr(l.it)*1.05&&Math.random()<.3){var nt=net(l.p);S.bal+=nt;phAdd(l.it.g,l.p);S.hist.unshift({t:"Продано",n:G[l.it.g][0]+" #"+l.it.n,p:nt});toast("Ваш лот куплен: +"+f(nt));c=1;return false}return true});
  if(S.mkt.filter(function(l){return l.s!="you"}).length<8&&Math.random()<.4){S.mkt.push(bl());c=1}}
 if(c){save();render()}else if($("p3").classList.contains("on")&&mtab!=5)rMk()},1000);

var mf={r:-1,min:0,max:0,ser:-1,sort:0,sel:"",open:0};
$("fser").innerHTML='<option value="-1">Все модели</option><option value="1">Редкие модели</option><option value="2">Monochrome</option><option value="3">Лимитки</option>';
function mfs(){mf.min=+$("fmin").value||0;mf.max=+$("fmax").value||0;mf.ser=+$("fser").value;mf.sort=+$("fsort").value;rMk()}
function mrs(n){mf.r=n;rMk()}
function msl(n){mf.sel=n;closeSh();rMk()}
function ph(g){S.ph=S.ph||{};if(!S.ph[g]){var p=tv(g),a=[];for(var i=0;i<24;i++){p=Math.max(1,p*(.94+Math.random()*.12));a.push(Math.round(p))}S.ph[g]=a}return S.ph[g]}
function phAdd(g,p){var a=ph(g);a.push(Math.round(p));if(a.length>40)a.shift()}
function spark(a){var mn=Math.min.apply(0,a),mx=Math.max.apply(0,a),d=mx-mn||1;return '<svg viewBox="0 0 300 90" style="width:100%;height:90px"><polyline points="'+a.map(function(v,i){return(i*300/(a.length-1)).toFixed(1)+","+(80-(v-mn)/d*70).toFixed(1)}).join(" ")+'" fill="none" stroke="#2aabee" stroke-width="2.5" stroke-linejoin="round"/></svg>'}
function lotSheet(id){var l=lot(id);if(!l)return;var a=ph(l.it.g),av=a.reduce(function(x,y){return x+y},0)/a.length,me=l.s=="you",au=l.type=="auc";
 var sel=me?ownerH():'<span class="oav">'+l.s.charAt(0).toUpperCase()+'</span><u style="color:var(--bl)" onclick="sellerCard(\''+l.s+'\')">@'+l.s+'</u>';
 $("sh").innerHTML=nftHead(l.it)+'<div class="tbl">'+nftRows(l.it,sel)+'</div><div class="sbox" style="margin:0 0 12px;text-align:left"><div class="lab">История цен · '+a.length+' сделок</div>'+spark(a)+'<div class="srow"><small>мин '+f(Math.min.apply(0,a))+'</small><small>сред. '+f(av)+'</small><small>макс '+f(Math.max.apply(0,a))+'</small></div></div>'+(me?'':'<button class="go" style="margin:0;width:100%" onclick="lotAct('+id+')">'+(au?"Ставка "+f(minBid(l)):"Купить за "+f(l.p))+'</button>');$("sheet").className="ov end on"}
function lotAct(id){var l=lot(id);if(!l)return;if(l.type=="auc")bid(id);else buy(id);closeSh()}
function sellerCard(n){var b=BT.filter(function(x){return x[0]==n})[0];if(!b)return;var c=S.mkt.filter(function(l){return l.s==n}).length;
 $("sh").innerHTML='<div class="av" style="margin:0 auto 8px;width:72px;height:72px">'+n.charAt(0).toUpperCase()+'</div><div class="h" style="font-size:20px">@'+n+'</div><div class="mu" style="margin:4px 0 12px">Уровень '+b[2]+'</div><div class="stats" style="padding:0 0 12px">'+[[f(b[1]),"Коллекция"],[b[3],"Топ"],[c,"Лотов"]].map(function(x){return'<div>'+x[0]+'<small>'+x[1]+'</small></div>'}).join("")+'</div><button class="go" onclick="msl(\''+n+'\')">Показать лоты продавца</button>';$("sheet").className="ov end on"}
function msel(u){mp=mp==u?null:u;var x=S.inv.filter(function(y){return y.u==mp})[0];if(x){shp=pr(x);shd=300}shown=mp;rSell()}
function rSell(){if(document.activeElement&&document.activeElement.id=="gu")return;
 var x=mp!=null?S.inv.filter(function(y){return y.u==mp})[0]:null;if(!x)mp=null;
 var a=S.inv.filter(function(y){return y.up}).sort(function(p,q){return pr(q)-pr(p)});
 var h='<h3 class="sec" style="margin-top:4px">Выберите подарок</h3><div class="grid">'+(a.map(function(y){return tile(y,y.u==mp?" on":"","msel("+y.u+")")}).join("")||'<p class="note" style="grid-column:1/4">Нет подарков. Откройте кейс.</p>')+'</div>';
 if(x){var g=G[x.g];h+='<div class="sbox" style="margin-top:12px"><div class="lab">'+g[1]+' '+g[0]+' #'+x.n+' · рынок '+f(pr(x))+' · комиссия '+Math.round(feeR()*100)+'%</div>'+
  '<div class="rowb" style="margin:0 0 10px"><span>Цена: <b id="shp">'+f(shp)+'</b></span><span style="display:flex;gap:6px"><button class="b off" onclick="shA(-1)">−</button><button class="b off" onclick="shA(1)">+</button></span></div>'+
  '<button class="go" style="width:100%;margin:0 0 8px" onclick="listIt('+x.u+')">Выставить по этой цене</button>'+
  '<div class="seg" id="dseg" style="margin-bottom:8px"><button class="'+(shd==60?'on':'')+'" onclick="shD(60)">1 мин</button><button class="'+(shd==300?'on':'')+'" onclick="shD(300)">5 мин</button><button class="'+(shd==3600?'on':'')+'" onclick="shD(3600)">1 час</button></div>'+
  '<button class="go gh" style="width:100%;margin:0 0 8px" onclick="aucIt('+x.u+')">Запустить аукцион</button>'+
  '<div class="rowb" style="gap:8px;margin:0"><input class="gi" id="gu" placeholder="@username" autocapitalize="off" autocorrect="off"><button class="b" onclick="giftIt('+x.u+')">Подарить</button></div></div>'}
 $("mlist").innerHTML=h}

/* карточка подарка */
function sheet(u,gi){var it=u!=null?S.inv.filter(function(x){return x.u==u})[0]:null;if(u!=null&&!it)return;if(it){itemSheet(it);return}
 var g=it?it.g:gi,gg=G[g],h=big(it||{g:g,b:g%5,n:0,m:0,s:0});shown=it?u:null;
 if(it){h+='<div class="at">'+atxt(it)+'</div>'+(gg[4]?atb(it):'')+'<button class="go" onclick="sellOne2('+u+')">Продать за '+f(sv(it))+'</button>'+(gg[4]?'<button class="go" style="background:linear-gradient(90deg,#a78bfa,#2aabee)" onclick="upgSheet('+u+')">⚡ Улучшить NFT'+((it.lv||0)?' · Ур. '+it.lv:'')+'</button><button class="go gh" onclick="upOne('+u+')">В апгрейд</button><button class="go gh" onclick="closeSh();tab(3);mtb(5);msel('+u+')">Выставить на маркет</button>':'')}
 else{var cs=CS.filter(function(c){return csVis(c)&&drops(c).indexOf(g)>=0}).map(function(c){return c.n}).join(", ");h+='<div class="at">'+(gg[4]?"Подарок можно улучшить: он получит случайные модель, фон, узор и номер, цена зависит от них.":"Обычный подарок: улучшить нельзя.")+'<br>База: '+f(gg[3])+' GRADE<br>Выпадает из кейсов: '+cs+'</div>'}
 $("sh").innerHTML=h;$("sheet").className="ov end on"}
function shA(d){var x=S.inv.filter(function(y){return y.u==shown})[0];shp=Math.max(1,shp+d*stp(x.g));$("shp").textContent=f(shp)}
function shD(d){shd=d;document.querySelectorAll("#dseg button").forEach(function(b,i){b.classList.toggle("on",[60,300,3600][i]==d)})}
function sellOne2(u){sellOne(u,function(){closeSh();isel={}})}
function upOne(u){U={};U[u]=1;T=null;$("sheet").className="ov end";isel={};tab(2)}
function takeIt(u){var x=S.inv.filter(function(y){return y.u==u})[0];if(x)S.inv=S.inv.filter(function(y){return y.u!=u});isel={};mp=null;$("sheet").className="ov end";return x}
function listIt(u){var x=takeIt(u);if(!x)return;S.mkt.push({id:S.nl++,it:x,p:shp,s:"you",type:"fix"});bpAdd("lists",1);toast("Лот выставлен");save();render()}
function aucIt(u){var x=takeIt(u);if(!x)return;S.mkt.push({id:S.nl++,it:x,p:shp,s:"you",type:"auc",by:null,end:Date.now()+shd*1000});bpAdd("lists",1);toast("Аукцион запущен");save();render()}
function giftIt(u){var nm=($("gu").value||"").trim().replace(/^@/,"");if(!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(nm)){toast("Юзернейм: 5–32 символа, латиница, цифры, _");return}
 var x=takeIt(u);if(!x)return;S.hist.unshift({t:"Подарено",n:G[x.g][0]+" #"+x.n+" → @"+nm,p:0});toast("Подарок отправлен @"+nm);save();render()}

/* каталог */
var cq="",cr=-1;
function cqs(v){cq=v.toLowerCase();rCat()}
function crs(n){cr=n;rCat()}
function rCat(){var c=[["Все",-1],["Обычные",0],["Можно улучшить",1]];
 $("cch").innerHTML=c.map(function(x){return '<button class="chip'+(cr==x[1]?' on':'')+'" onclick="crs('+x[1]+')">'+x[0]+'</button>'}).join("");
 var h="";G.forEach(function(g,i){if(!g[6]&&(cr<0||g[4]==cr)&&(!cq||g[0].toLowerCase().indexOf(cq)>=0))h+=gtile(i,"","sheet(null,"+i+")")});$("cgrid").innerHTML=h||'<p class="note" style="grid-column:1/3">Ничего не найдено</p>'}
