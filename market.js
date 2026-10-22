/* маркет */
var mqv="",mtab=0,shown=null,shp=0,shd=300,mp=null;
function stp(g){return Math.max(1,Math.round(G[g][3]*.05))}
function bl(){var g=NI[rnd(NI.length)];for(var z=0;z<20&&LIM[G[g][0]];z++)g=NI[rnd(NI.length)];var au=Math.random()<.35,l={id:S.nl++,it:mkItem(g,1),s:BT[rnd(BT.length)][0],type:au?"auc":"fix"};
 var v=pr(l.it);if(au){l.p=Math.max(1,Math.round(v*.9));l.by=null;l.end=Date.now()+(60+rnd(240))*1000}else l.p=Math.max(1,Math.round(v*(1+Math.random()*.4)));return l}
if(!S.mkt.length)for(var q=0;q<8;q++)S.mkt.push(bl());
function mqs(v){mqv=v.toLowerCase();rMk()}
function mtb(n){mtab=n;rMk();if(n==6||n==0)limSync()}
function minBid(l){return l.by?l.p+stp(l.it.g):l.p}
var PTR=null;
/* узор как в Telegram: символы кольцами вокруг модели, дальше от центра мельче и бледнее */
function patLayer(sym){if(!PTR){PTR=[];[[6,.27,16,.24,0],[10,.43,12,.17,.3],[14,.6,9,.11,.1]].forEach(function(r){for(var i=0;i<r[0];i++){var a=Math.PI*2*i/r[0]+r[4],x=50+r[1]*100*Math.cos(a),y=42+r[1]*128*Math.sin(a);PTR.push([x,y,r[2],r[3]])}})}
 return PTR.map(function(p){return '<u style="left:'+p[0].toFixed(1)+'%;top:'+p[1].toFixed(1)+'%;font-size:'+p[2]+'px;opacity:'+p[3]+'">'+sym+'</u>'}).join("")}
function mcard(l){var g=G[l.it.g],it=l.it,au=l.type=="auc",me=l.s=="you",fv=S.fav.indexOf(l.id)>=0,now=Date.now(),be=nbe(it.n),btn,bd="";
 if(LIM[g[0]])bd+='<span class="mbd lim">ЛИМИТКА</span>';if(ismono(it))bd+='<span class="mbd">MONO</span>';if(hasMo(it)&&mrare(it))bd+='<span class="mbd">РЕДКАЯ</span>';if(be)bd+='<span class="mbd">★</span>';if(au)bd+='<span class="mbd">'+fmtT(l.end-now)+'</span>';
 if(me)btn=(au&&l.by)?'<button class="mb" disabled>Идут торги</button>':'<button class="mb" onclick="event.stopPropagation();unl('+l.id+')">'+tn(l.p)+' · Снять</button>';
 else if(au)btn=l.by=="you"?'<button class="mb" disabled>Вы лидируете</button>':'<button class="mb" '+(S.bal<minBid(l)?'disabled ':'')+'onclick="event.stopPropagation();bid('+l.id+')">'+tn(minBid(l))+' '+ic("coin",13)+'</button>';
 else btn='<button class="mb" '+(S.bal<l.p?'disabled ':'')+'onclick="event.stopPropagation();buy('+l.id+')">'+ic("coin",13)+' '+tn(l.p)+'</button>';
 return '<div class="mc" style="--c:'+BG[it.b]+'" onclick="lotSheet('+l.id+')"><div class="mpt">'+patLayer(PS(it.g,it.s))+'</div>'
  +(me?'<span class="mfv on">'+ic("gem",15)+'</span>':'<button class="mfv'+(fv?' fav':'')+'" onclick="event.stopPropagation();fav('+l.id+')">'+ic("gem",15)+'</button>')
  +'<div class="mrb"><b>#'+it.n+'</b></div>'
  +'<div class="mim'+(ismono(it)?' mono':'')+'">'+mimg(it,84)+'</div>'
  +'<div class="mn">'+g[0]+'</div>'+(bd?'<div class="mbds">'+bd+'</div>':'')+btn+'</div>'}
/* лимитированные выпуски админа: покупка даёт обычный (неулучшенный) подарок с закреплённым уникальным номером */
function edList(){var a=[];Object.keys(ED).forEach(function(nm){var gi=G.map(function(q){return q[0]}).indexOf(nm);if(gi>=0)a.push(gi)});return a.sort(function(x,y){return(ED[G[y][0]].on&&limLeft(y)>0)-(ED[G[x][0]].on&&limLeft(x)>0)||ED[G[y][0]].price-ED[G[x][0]].price})}
function limCard(g){var q=G[g],e=ED[q[0]],sp=supply(g),left=limLeft(g),pc=Math.round(sp[1]/sp[0]*100),p=e.price,c=BG[g%5],btn;
 if(left<=0)btn='<button class="mb" disabled>Тираж выпущен</button>';else if(!e.on)btn='<button class="mb" disabled>Продажа на паузе</button>';else btn='<button class="mb pri" '+(S.bal<p?'disabled ':'')+'onclick="limAsk('+g+')">Купить · '+tn(p)+'</button>';
 return '<div class="mc lc" style="--c:'+c+'"><div class="mbds"><span class="mbd lim">ЛИМИТКА</span></div><div class="mim">'+gimg(g,76)+'</div><div class="mn">'+q[0]+'</div>'
  +'<div class="ms">'+f(sp[1])+'/'+f(sp[0])+' выпущено</div><div class="lbar"><i style="width:'+pc+'%"></i></div>'+btn+'</div>'}
var limBusy=0;
function limBuy(g){var nm=G[g][0],e=ED[nm];if(limBusy)return;if(!e||!e.on){toast("Продажа недоступна");return}if(limLeft(g)<=0){toast("Тираж выпущен");return}var p=e.price;if(S.bal<p){toast("Не хватает TON");return}
 limBusy=1;S.bal-=p;render();
 api("/lim",{buy:nm}).then(function(d){limBusy=0;if(d&&d.ed)edApply(d.ed);if(d&&d.lim)LTK=d.lim;
  if(!d||!d.bought){S.bal+=p;save();render();toast(d&&d.sold?"Тираж выпущен":"Не удалось купить, монеты возвращены");rMk();return}
  var b=d.bought;if(b.price!=p)S.bal=Math.max(0,S.bal+p-b.price);
  var it=mkItem(g);it.sn=b.n;S.inv.push(it);bpAdd("buys",1);S.hist.unshift({t:"Куплено",n:nm+" · лимитка #"+b.n,p:b.price});save();render();rMk();vib();sfx("r2");burst(40,["#ffd54a","#fff","#2aabee"]);toast("Куплено: "+nm+", номер #"+b.n);sheet(it.u)})
 .catch(function(){limBusy=0;S.bal+=p;save();render();toast("Нет связи с сервером, монеты возвращены")})}
function mflt(){mf.open=!mf.open;rMk()}
function rMk(){var T=["Все","Аукционы","Лимитки","Мои","Избранное","История"],TI=[0,1,6,2,3,4];
 var nl=edList().filter(function(g){return ED[G[g][0]].on&&limLeft(g)>0}).length;try{sessionStorage.setItem("mt",JSON.stringify([mtab]))}catch(e){}
 $("mch").innerHTML=T.map(function(t,i){return '<button class="chip'+(mtab==TI[i]?' on':'')+'" onclick="mtb('+TI[i]+')">'+t+(TI[i]==6&&nl?' · '+nl:'')+'</button>'}).join("");
 var lst=mtab<4||mtab==6;$("mflt").style.display=(mtab<4&&mf.open)?"":"none";$("mfb").style.display=mtab<4?"":"none";$("mfb").classList.toggle("on",!!mf.open||mf.r>=0||mf.min>0||mf.max>0||mf.ser>=0||!!mf.sel||!!mf.mo||!!mf.pt);
 mtgR();$("mrar").style.display=mf.sel?"":"none";$("mrar").innerHTML=(mf.sel?'<button class="chip on" onclick="msl(\'\')">@'+mf.sel+" ✕</button>":"");
 $("msb").style.display=mtab==5?"none":"";if(mtab==5){rSell();return}
 if(mtab==6){var a6=edList();
  $("mlist").innerHTML='<div class="mstat"><span>Лимитки: покупка даёт подарок с закреплённым уникальным номером, его можно улучшить</span></div>'+(a6.length?'<div class="mg lg">'+a6.map(limCard).join("")+'</div>':'<p class="note">Пока нет активных выпусков. Следите за новостями в боте.</p>');return}
 if(mtab==4){$("mlist").innerHTML=S.hist.map(function(h){return '<div class="mrow"><div class="tt">'+h.t+': '+h.n+'<small>'+(h.p>0?tn(h.p)+' TON':'Подарок')+'</small></div></div>'}).join("")||'<p class="note">Сделок пока нет</p>';return}
 var now=Date.now(),a=S.mkt.filter(function(l){var me=l.s=="you";if(mqv&&(G[l.it.g][0]+" #"+l.it.n+" "+mname(l.it)+" "+PN(l.it.g,l.it.s)+" "+BN[l.it.b]).toLowerCase().indexOf(mqv)<0)return false;if(mf.r>=0&&l.it.b!=mf.r)return false;if(mf.mo&&mname(l.it)!=mf.mo)return false;if(mf.pt&&PN(l.it.g,l.it.s)!=mf.pt)return false;if(mf.min&&l.p<mf.min)return false;if(mf.max&&l.p>mf.max)return false;if(mf.ser==1&&!mrare(l.it))return false;if(mf.ser==2&&!ismono(l.it))return false;if(mf.ser==3&&!LIM[G[l.it.g][0]])return false;if(mf.sel&&l.s!=mf.sel)return false;return mtab==0?!me:mtab==1?(l.type=="auc"&&!me):mtab==2?me:S.fav.indexOf(l.id)>=0}).sort(function(x,y){return mf.sort==1?y.p-x.p:mf.sort==2?(x.type=="auc"?x.end:9e15)-(y.type=="auc"?y.end:9e15):mf.sort==3?x.it.n-y.it.n:mf.sort==4?y.id-x.id:x.p-y.p});
 var tot=a.reduce(function(s,l){return s+l.p},0);
 $("mlist").innerHTML=(mtab==0&&nl?'<div class="mstat lstrip" onclick="mtb(6)"><span>💎 Лимитки в продаже: '+nl+'</span><span>Открыть ›</span></div>':'')+'<div class="mstat"><span>Лотов: '+a.length+'</span><span>Баланс: '+tn(S.bal)+'</span></div>'+(a.length?'<div class="mg">'+a.map(mcard).join("")+'</div>':'<p class="note">Ничего не найдено. Измените фильтры или поиск.</p>')}
function lot(id){return S.mkt.filter(function(y){return y.id==id})[0]}
function fav(id){var i=S.fav.indexOf(id);if(i<0)S.fav.push(id);else S.fav.splice(i,1);save();rMk()}
function buy(id){var l=lot(id);if(!l||S.bal<l.p)return;S.bal-=l.p;l.it.u=S.nu++;S.inv.push(l.it);S.mkt=S.mkt.filter(function(y){return y.id!=id});phAdd(l.it.g,l.p);bpAdd("buys",1);S.hist.unshift({t:"Куплено",n:G[l.it.g][0]+" #"+l.it.n,p:l.p});toast("Куплено: "+G[l.it.g][0]);save();render()}
function bid(id){var l=lot(id);if(!l||l.type!="auc"||l.by=="you"||l.end<Date.now())return;var m=minBid(l);if(S.bal<m){toast("Не хватает монет");return}S.bal-=m;l.p=m;l.by="you";toast("Ставка принята: "+tn(m));save();render()}
function unl(id){var l=lot(id);if(!l||l.by)return;S.mkt=S.mkt.filter(function(y){return y.id!=id});S.inv.push(l.it);save();render()}
var tk=0;
setInterval(function(){tk++;var now=Date.now(),c=0;
 S.mkt=S.mkt.filter(function(l){if(l.type!="auc"||l.end>now)return true;c=1;var nm=G[l.it.g][0]+" #"+l.it.n;
  if(l.s=="you"){if(l.by){var nt=net(l.p);S.bal+=nt;S.hist.unshift({t:"Продано на аукционе",n:nm,p:nt});toast("Аукцион завершён: +"+tn(nt))}else{S.inv.push(l.it);toast("Аукцион без ставок: подарок возвращён")}}
  else if(l.by=="you"){l.it.u=S.nu++;S.inv.push(l.it);bpAdd("buys",1);S.hist.unshift({t:"Выиграно на аукционе",n:nm,p:l.p});toast("Вы выиграли: "+G[l.it.g][0])}
  return false});
 if(tk%5==0){S.mkt.forEach(function(l){var v=pr(l.it);if(l.type!="auc")return;
   if(l.s=="you"){if(Math.random()<.35&&l.p<v*1.1){l.p=minBid(l);l.by=BT[rnd(BT.length)][0];c=1}}
   else if(l.by=="you"){if(Math.random()<.2&&minBid(l)<v*1.1){S.bal+=l.p;l.p=minBid(l);l.by=BT[rnd(BT.length)][0];toast("Вашу ставку перебили");c=1}}
   else if(Math.random()<.15&&minBid(l)<v*1.1){l.p=minBid(l);l.by=BT[rnd(BT.length)][0];c=1}});
  S.mkt=S.mkt.filter(function(l){if(l.s=="you"&&l.type!="auc"&&l.p<=pr(l.it)*1.05&&Math.random()<.3){var nt=net(l.p);S.bal+=nt;phAdd(l.it.g,l.p);S.hist.unshift({t:"Продано",n:G[l.it.g][0]+" #"+l.it.n,p:nt});toast("Ваш лот куплен: +"+tn(nt));c=1;return false}return true});
  if(S.mkt.filter(function(l){return l.s!="you"}).length<8&&Math.random()<.4){S.mkt.push(bl());c=1}}
 if(c){save();render()}else if($("p3").classList.contains("on")&&mtab!=5)rMk()},1000);

var mf={r:-1,min:0,max:0,ser:-1,sort:0,sel:"",open:0,mo:"",pt:""};
$("fser").innerHTML='<option value="-1">Все модели</option><option value="1">Редкие модели</option><option value="2">Monochrome</option><option value="3">Лимитки</option>';
function mfs(){mf.min=tnIn($("fmin").value);mf.max=tnIn($("fmax").value);mf.ser=+$("fser").value;mf.sort=+$("fsort").value;rMk()}
function mrs(n){mf.r=n;rMk()}
function msl(n){mf.sel=n;closeSh();rMk()}
function ph(g){S.ph=S.ph||{};if(!S.ph[g]){var p=tv(g),a=[];for(var i=0;i<24;i++){p=Math.max(1,p*(.94+Math.random()*.12));a.push(Math.round(p))}S.ph[g]=a}return S.ph[g]}
function phAdd(g,p){var a=ph(g);a.push(Math.round(p));if(a.length>40)a.shift()}
function spark(a){var mn=Math.min.apply(0,a),mx=Math.max.apply(0,a),d=mx-mn||1;return '<svg viewBox="0 0 300 90" style="width:100%;height:90px"><polyline points="'+a.map(function(v,i){return(i*300/(a.length-1)).toFixed(1)+","+(80-(v-mn)/d*70).toFixed(1)}).join(" ")+'" fill="none" stroke="#2aabee" stroke-width="2.5" stroke-linejoin="round"/></svg>'}
function lotSheet(id){var l=lot(id);if(!l)return;var a=ph(l.it.g),av=a.reduce(function(x,y){return x+y},0)/a.length,me=l.s=="you",au=l.type=="auc";
 var sel=me?ownerH():'<span class="oav">'+l.s.charAt(0).toUpperCase()+'</span><u style="color:var(--bl)" onclick="sellerCard(\''+l.s+'\')">@'+l.s+'</u>';
 $("sh").innerHTML=nftHead(l.it)+'<div class="tbl">'+nftRows(l.it,sel)+'</div><div class="sbox" style="margin:0 0 12px;text-align:left"><div class="lab">История цен · '+a.length+' сделок</div>'+spark(a)+'<div class="srow"><small>мин '+tn(Math.min.apply(0,a))+'</small><small>сред. '+tn(av)+'</small><small>макс '+tn(Math.max.apply(0,a))+'</small></div></div>'+(me?'':'<button class="go" style="margin:0;width:100%" onclick="lotAct('+id+')">'+(au?"Ставка "+tn(minBid(l)):"Купить за "+tn(l.p))+'</button>');$("sheet").className="ov end on"}
/* подтверждение покупки: окно открывается поверх, вкладка и прокрутка не сбрасываются */
var CFM=null;
function cfmAsk(h,txt,ok,fn,back){CFM={fn:fn,back:back};$("sh").innerHTML='<div class="h" style="font-size:20px;margin-bottom:6px">'+h+'</div><div class="mu" style="line-height:1.5;margin-bottom:14px;text-align:center">'+txt+'</div><button class="go" style="width:100%;margin:0 0 8px" onclick="cfmYes()">'+ok+'</button><button class="go gh" style="width:100%;margin:0" onclick="cfmNo()">Отмена</button>';$("sheet").className="ov end on"}
function cfmYes(){var c=CFM;CFM=null;closeSh();if(c&&c.fn)keepPos(c.fn)}
function cfmNo(){var c=CFM;CFM=null;if(c&&c.back)c.back();else closeSh()}
function keepPos(fn){var y=window.scrollY;fn();setTimeout(function(){window.scrollTo(0,y)},0)}
function lotAct(id){var l=lot(id);if(!l)return;var au=l.type=="auc",p=au?minBid(l):l.p,nm=G[l.it.g][0]+" #"+f(l.it.n);
 if(S.bal<p){toast("Не хватает TON");return}
 cfmAsk(au?"Сделать ставку?":"Купить подарок?",nm+" · "+mname(l.it)+"<br>"+(au?"Ставка: ":"Цена: ")+"<b>"+tn(p)+" TON</b><br>Останется: "+tn(S.bal-p),au?"Сделать ставку":"Купить за "+tn(p),function(){if(au)bid(id);else buy(id)},function(){lotSheet(id)})}
function limAsk(g){var e=ED[G[g][0]];if(!e)return;if(S.bal<e.price){toast("Не хватает TON");return}
 cfmAsk("Купить лимитку?",G[g][0]+" · случайный свободный номер<br>Цена: <b>"+tn(e.price)+" TON</b><br>Останется: "+tn(S.bal-e.price),"Купить за "+tn(e.price),function(){limBuy(g)})}
function sellerCard(n){var b=BT.filter(function(x){return x[0]==n})[0];if(!b)return;var c=S.mkt.filter(function(l){return l.s==n}).length;
 $("sh").innerHTML='<div class="av" style="margin:0 auto 8px;width:72px;height:72px">'+n.charAt(0).toUpperCase()+'</div><div class="h" style="font-size:20px">@'+n+'</div><div class="mu" style="margin:4px 0 12px">Уровень '+b[2]+'</div><div class="stats" style="padding:0 0 12px">'+[[tn(b[1]),"Коллекция"],[b[3],"Топ"],[c,"Лотов"]].map(function(x){return'<div>'+x[0]+'<small>'+x[1]+'</small></div>'}).join("")+'</div><button class="go" onclick="msl(\''+n+'\')">Показать лоты продавца</button>';$("sheet").className="ov end on"}
function msel(u){mp=mp==u?null:u;var x=S.inv.filter(function(y){return y.u==mp})[0];if(x){shp=pr(x);shd=300}shown=mp;rSell()}
function rSell(){if(document.activeElement&&document.activeElement.id=="gu")return;
 var x=mp!=null?S.inv.filter(function(y){return y.u==mp})[0]:null;if(!x)mp=null;
 var a=S.inv.filter(function(y){return y.up}).sort(function(p,q){return pr(q)-pr(p)});
 var h='<h3 class="sec" style="margin-top:4px">Выберите подарок</h3><div class="grid">'+(a.map(function(y){return tile(y,y.u==mp?" on":"","msel("+y.u+")")}).join("")||'<p class="note" style="grid-column:1/4">Нет подарков. Откройте кейс.</p>')+'</div>';
 if(x){var g=G[x.g];h+='<div class="sbox" style="margin-top:12px"><div class="lab">'+g[1]+' '+g[0]+' #'+x.n+' · рынок '+tn(pr(x))+' · комиссия '+Math.round(feeR()*100)+'%</div>'+
  '<div class="rowb" style="margin:0 0 10px"><span>Цена: <b id="shp">'+tn(shp)+'</b></span><span style="display:flex;gap:6px"><button class="b off" onclick="shA(-1)">−</button><button class="b off" onclick="shA(1)">+</button></span></div>'+
  '<button class="go" style="width:100%;margin:0 0 8px" onclick="listIt('+x.u+')">Выставить по этой цене</button>'+
  '<div class="seg" id="dseg" style="margin-bottom:8px"><button class="'+(shd==60?'on':'')+'" onclick="shD(60)">1 мин</button><button class="'+(shd==300?'on':'')+'" onclick="shD(300)">5 мин</button><button class="'+(shd==3600?'on':'')+'" onclick="shD(3600)">1 час</button></div>'+
  '<button class="go gh" style="width:100%;margin:0 0 8px" onclick="aucIt('+x.u+')">Запустить аукцион</button>'+
  '<div class="rowb" style="gap:8px;margin:0"><input class="gi" id="gu" placeholder="@username" autocapitalize="off" autocorrect="off"><button class="b" onclick="giftIt('+x.u+')">Подарить</button></div></div>'}
 $("mlist").innerHTML=h}

/* карточка подарка */
function sheet(u,gi){var it=u!=null?S.inv.filter(function(x){return x.u==u})[0]:null;if(u!=null&&!it)return;if(it){itemSheet(it);return}
 var g=it?it.g:gi,gg=G[g],h=big(it||{g:g,b:g%5,n:0,m:0,s:0});shown=it?u:null;
 if(it){h+='<div class="at">'+atxt(it)+'</div>'+(gg[4]?atb(it):'')+'<button class="go" onclick="sellOne2('+u+')">Продать за '+tn(sv(it))+'</button>'+(gg[4]?'<button class="go" style="background:linear-gradient(90deg,#a78bfa,#2aabee)" onclick="upgSheet('+u+')">⚡ Улучшить NFT'+((it.lv||0)?' · Ур. '+it.lv:'')+'</button><button class="go gh" onclick="upOne('+u+')">В апгрейд</button><button class="go gh" onclick="closeSh();tab(3);mtb(5);msel('+u+')">Выставить на маркет</button>':'')}
 else{var cs=CS.filter(function(c){return csVis(c)&&drops(c).indexOf(g)>=0}).map(function(c){return c.n}).join(", ");h+='<div class="at">'+(gg[4]?"Подарок можно улучшить: он получит случайные модель, фон, узор и номер, цена зависит от них.":"Обычный подарок: улучшить нельзя.")+'<br>База: '+tn(gg[3])+' TON<br>Выпадает из кейсов: '+cs+'</div>'}
 $("sh").innerHTML=h;$("sheet").className="ov end on"}
function shA(d){var x=S.inv.filter(function(y){return y.u==shown})[0];shp=Math.max(1,shp+d*stp(x.g));$("shp").textContent=tn(shp)}
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

/* чипы фильтров как в Telegram: Цена, Модель, Фон, Узор */
function mtgR(){var el=$("mtg");if(!el)return;el.style.display=(mtab<4)?"":"none";var ch='<svg class="mcv" width="10" height="14" viewBox="0 0 10 14"><path d="M2 5l3-3 3 3M2 9l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 var pOn=mf.min>0||mf.max>0||mf.sort!=0||mf.open;
 el.innerHTML='<button class="tgc'+(pOn?' on':'')+'" onclick="mflt()">'+ic("coin",16)+' Цена</button>'
  +'<button class="tgc'+(mf.mo?' on':'')+'" onclick="mfp(\'mo\')">'+(mf.mo||"Модель")+ch+'</button>'
  +'<button class="tgc'+(mf.r>=0?' on':'')+'" onclick="mfp(\'r\')">'+(mf.r>=0?BN[mf.r]:"Фон")+ch+'</button>'
  +'<button class="tgc'+(mf.pt?' on':'')+'" onclick="mfp(\'pt\')">'+(mf.pt||"Узор")+ch+'</button>'}
function mfp(k){var c={},o=[];S.mkt.forEach(function(l){if(l.s=="you")return;var v=k=="mo"?mname(l.it):k=="r"?l.it.b:PN(l.it.g,l.it.s);c[v]=(c[v]||0)+1});
 Object.keys(c).forEach(function(v){o.push([v,c[v]])});o.sort(function(a,b){return b[1]-a[1]||(""+a[0]).localeCompare(""+b[0])});
 var cur=k=="r"?mf.r:mf[k],h=["Модель","Фон","Узор"][k=="mo"?0:k=="r"?1:2];
 $("sh").innerHTML='<div class="h" style="font-size:20px;margin-bottom:8px">'+h+'</div><div class="mpl"><button class="mpo'+((k=="r"?cur<0:!cur)?' on':'')+'" onclick="mset(\''+k+'\',-1)">Все</button>'
  +o.map(function(x){var v=x[0],lab=k=="r"?BN[v]:v,sw=k=="r"?'<i class="mpw" style="background:'+BG[v]+'"></i>':'';return '<button class="mpo'+(cur==v?' on':'')+'" onclick="mset(\''+k+'\','+(k=="r"?v:JSON.stringify(v).replace(/"/g,"&quot;"))+')">'+sw+'<span>'+lab+'</span><small>'+x[1]+'</small></button>'}).join("")+'</div>';
 $("sheet").className="ov end on"}
function mset(k,v){if(k=="r")mf.r=v==-1?-1:+v;else mf[k]=v==-1?"":v;closeSh();rMk()}
