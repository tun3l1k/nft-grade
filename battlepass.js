/* ===== BATTLE PASS ===== */
var BPV={id:"bpvip",st:599,n:"Battle Pass VIP"},BPL={id:"bplvl",st:60,n:"+1 уровень Battle Pass"},BPMAX=30,BPX=60,BPSD=14;
var BPT=0;
var DT=[["cases",3,"Открыть 3 кейса","📦",30],["sells",2,"Продать 2 подарка","💰",20],["ups",1,"Сделать апгрейд","⬆️",25],["spent",500,"Потратить 500 GRADE на кейсы","🪙",30],["nft",1,"Получить NFT","💠",25],["buys",1,"Купить лот на маркете","🛒",25],["lists",1,"Выставить лот на маркет","🏷️",20],["contracts",1,"Заключить контракт","📜",30]];
var WT=[["cases",20,"Открыть 20 кейсов","📦",120],["upw",2,"Выиграть 2 апгрейда","🏆",100],["rare",2,"Выбить 2 дорогих NFT","👑",100]];
var VN={12:"Astral Shard"};
/* награды: [тип,значение]; coin=монеты, gift=индекс подарка, frame=id рамки */
var BFR={3:["case",1],5:["gift",5],7:["case",1],10:["gift",9],12:["case",2],15:["title","v"],18:["gift",8],20:["gift",10],22:["case",2],25:["case",3],28:["gift",11],30:["gift",12]};
var BVP={2:["case",2],5:["gift",10],8:["case",3],10:["gift",11],12:["case",3],14:["title","e"],15:["gift",12],18:["case",3],20:["gift",13],22:["case",4],24:["title","c"],25:["gift",14],27:["case",4],28:["frame","f4"],30:["gift",17]};
var BTN={v:"Ветеран BP",e:"Элита BP",c:"Чемпион сезона",t1:"Охотник за NFT",t2:"Постоянный игрок",s1:"Коллектор"};
function bpFree(l){return BFR[l]||["coin",40+l*5]}
function bpVip(l){return BVP[l]||["coin",30+l*4]}
function rwTxt(r){if(r[0]=="coin")return["🪙",f(r[1]),"Монеты"];if(r[0]=="gift"){var g=G[r[1]];return[g[1],g[0],"Подарок"]}if(r[0]=="case")return[CS[r[1]].e,CS[r[1]].n,"Билет на кейс"];if(r[0]=="title")return["🎖️",BTN[r[1]],"Титул"];var fr=FR.filter(function(x){return x.id==r[1]})[0];return["🖼️",fr?fr.n:"Рамка","Рамка"]}
function dkey(){return Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5)}
function bpEns(){var B=S.bp,now=Date.now();
 if(B&&B.end-now>BPSD*864e5)B.end=now+BPSD*864e5;
 if(!B||now>B.end){
  if(B&&typeof busy!="undefined"&&busy)return B;
  var old=B;B=S.bp={s:old?old.s+1:1,end:now+BPSD*864e5,xp:0,vip:0,cf:{},cv:{},d:dkey(),dc:{},dd:{},w:Math.floor((dkey()+3)/7),wc:{},wd:{}};
  if(old)seasonReset(old)}
 var dk=dkey(),wk=Math.floor((dk+3)/7);
 if(B.d!=dk){B.d=dk;B.dc={};B.dd={}}
 if(B.w!=wk){B.w=wk;B.wc={};B.wd={}}
 return B}
function bpAdd(k,n){var B=bpEns();B.dc[k]=(B.dc[k]||0)+n;B.wc[k]=(B.wc[k]||0)+n}
function bpLv(){return Math.min(BPMAX,Math.floor(bpEns().xp/BPX))}
function bpDaily(){var L=DT.length,st=dkey()%L;return[0,2,4].map(function(o){var i=(st+o)%L;return{id:"d"+i,t:DT[i]}})}
function bpGain(x){var B=bpEns(),l0=bpLv();B.xp=Math.min(BPMAX*BPX,B.xp+x);if(bpLv()>l0)toast("Battle Pass: уровень "+bpLv())}
function bpCan(side,l){var B=bpEns();return l<=bpLv()&&!(side=="v"?B.cv:B.cf)[l]&&(side=="f"||B.vip)}
function bpApply(r){if(r[0]=="coin")S.bal+=r[1];else if(r[0]=="gift")S.inv.push(mkItem(r[1]));else if(r[0]=="case"){S.tix=S.tix||{};S.tix[r[1]]=(S.tix[r[1]]||0)+1}else if(r[0]=="title"){S.ttu=S.ttu||{};S.ttu[r[1]]=1}else{S.own=S.own||[];if(S.own.indexOf(r[1])<0)S.own.push(r[1]);S.frame=r[1]}}
function bpClaim(side,l){if(!bpCan(side,l)){if(side=="v"&&!bpEns().vip)toast("Нужен VIP Battle Pass");else if(l>bpLv())toast("Откроется на уровне "+l);return}
 var r=side=="v"?bpVip(l):bpFree(l);(side=="v"?bpEns().cv:bpEns().cf)[l]=1;bpApply(r);var t=rwTxt(r);toast("Получено: "+t[0]+" "+t[1]);sfx("ok");burst(14,["#2aabee","#ffd54a","#fff"]);save();render()}
function bpAll(){var n=0;for(var l=1;l<=BPMAX;l++)["f","v"].forEach(function(sd){if(bpCan(sd,l)){var r=sd=="v"?bpVip(l):bpFree(l);(sd=="v"?S.bp.cv:S.bp.cf)[l]=1;bpApply(r);n++}});toast(n?"Получено наград: "+n:"Нет доступных наград");save();render()}
function bpTask(kind,i){var B=bpEns(),T=kind=="d"?bpDaily()[i]:{id:"w"+i,t:WT[i]},c=(kind=="d"?B.dc:B.wc)[T.t[0]]||0,dn=kind=="d"?B.dd:B.wd;
 if(c<T.t[1]||dn[T.id])return;dn[T.id]=1;bpGain(T.t[4]);toast("+"+T.t[4]+" опыта Battle Pass");sfx("ok");save();render()}
function bpRewP(){var n=0;for(var l=1;l<=BPMAX;l++){if(bpCan("f",l))n++;if(bpCan("v",l))n++}return n}
function bpTaskP(){var B=bpEns(),n=0;bpDaily().forEach(function(T){if((B.dc[T.t[0]]||0)>=T.t[1]&&!B.dd[T.id])n++});WT.forEach(function(t,i){if((B.wc[t[0]]||0)>=t[1]&&!B.wd["w"+i])n++});return n}
function bpPending(){return bpRewP()+bpTaskP()}
function pl(n,a,b,c){var m=n%100,k=n%10;return m>10&&m<15?c:k==1?a:k>1&&k<5?b:c}
function bpLeft(B){var ms=Math.max(0,B.end-Date.now());return ms>=2*864e5?Math.ceil(ms/864e5)+" дн.":fmtT(ms)}
function bpHint(){var a=bpRewP(),b=bpTaskP(),p=[];if(a)p.push(a+" "+pl(a,"награда","награды","наград"));if(b)p.push(b+" "+pl(b,"задание","задания","заданий"));return p.join(" · ")}
function bpFocus(){setTimeout(function(){if(BPT)return;var e=document.querySelector("#bph .bc.ok");if(e)e.scrollIntoView({block:"center",behavior:"smooth"})},80)}
function bpOpen(){BPT=(!bpRewP()&&bpTaskP())?1:0;tab(9);bpFocus()}
function bpTaskAll(){var B=bpEns(),n=0;bpDaily().forEach(function(T){if((B.dc[T.t[0]]||0)>=T.t[1]&&!B.dd[T.id]){B.dd[T.id]=1;bpGain(T.t[4]);n++}});WT.forEach(function(t,i){if((B.wc[t[0]]||0)>=t[1]&&!B.wd["w"+i]){B.wd["w"+i]=1;bpGain(t[4]);n++}});toast(n?"Заданий засчитано: "+n:"Нет выполненных заданий");if(n)sfx("ok");save();render()}
function bpTab(n){BPT=n;rBp();if(!n)bpFocus()}
function dotH(n){return n?'<span class="dot">'+n+'</span>':''}
function rBp(){var B=bpEns(),l=bpLv(),rp=bpRewP(),tp=bpTaskP(),pend=rp+tp,inl=l>=BPMAX?BPX:B.xp%BPX,left=bpLeft(B),soon=B.end-Date.now()<2*864e5;
 $("bpb").innerHTML='<div class="r1"><span>BATTLE PASS'+(B.vip?' <span style="color:#ffd54a">VIP</span>':'')+dotH(pend)+'</span><span>Ур. '+l+' ›</span></div><div class="r2">Сезон '+B.s+' · осталось '+left+(soon?' · скоро сброс':'')+'</div>'+(pend?'<div class="r3">К получению: '+bpHint()+'</div>':'')+'<div class="pb"><i style="width:'+(inl/BPX*100)+'%"></i></div>';
 if(!$("p9").classList.contains("on"))return;
 var h='<div class="ihead"><div><div class="mu">Сезон '+B.s+' · осталось '+left+'</div><div class="h">Уровень '+l+' / '+BPMAX+'</div></div><div class="ihs"><div><b>'+(l>=BPMAX?BPX:inl)+'</b><small>из '+BPX+' опыта</small></div></div></div>';
 if(soon)h+='<div class="warnb">Сезон скоро закончится. Все награды, подарки и монеты обнулятся, заберите всё заранее.</div>';
 h+='<div class="seg" style="margin:0 12px 10px"><button class="'+(BPT==0?'on':'')+'" onclick="bpTab(0)">Награды'+dotH(rp)+'</button><button class="'+(BPT==1?'on':'')+'" onclick="bpTab(1)">Задания'+dotH(tp)+'</button></div>';
 if(!B.vip)h+='<div class="vipb"><div><div class="h" style="font-size:15px;color:#ffd54a">VIP Battle Pass</div><div class="mu" style="color:#e7cf93">NFT, кейсы, титулы и эксклюзивная рамка</div></div><button class="b" onclick="buyStars(BPV)">'+BPV.st+' ⭐</button></div>';
 if(BPT==0){
  if(tp)h+='<button class="nb" onclick="bpTab(1)"><span>Выполнено заданий: '+tp+'. Заберите опыт</span><span>›</span></button>';
  h+='<div style="display:flex;gap:8px;margin:0 12px 10px"><button class="go gh" style="margin:0;width:auto;flex:1;height:44px;font-size:14px" onclick="bpAll()">Забрать всё'+(rp?' · '+rp:'')+'</button>'+(l<BPMAX?'<button class="go gh" style="margin:0;width:auto;flex:1;height:44px;font-size:14px" onclick="buyStars(BPL)">+1 уровень · '+BPL.st+' ⭐</button>':'')+'</div>';
  h+='<div class="bph"><span></span><span>FREE</span><span class="v">VIP</span></div>';
  for(var i=1;i<=BPMAX;i++){h+='<div class="bpr'+(i==l?' cur':'')+'"><div class="bl">'+i+'</div>'+bpCell("f",i)+bpCell("v",i)+'</div>'}
 }else{
  var dl=Math.max(0,(dkey()+1)*864e5+new Date().getTimezoneOffset()*6e4-Date.now()),wl=Math.max(0,((Math.floor((dkey()+3)/7)+1)*7-3)*864e5+new Date().getTimezoneOffset()*6e4-Date.now());
  if(rp)h+='<button class="nb" onclick="bpTab(0)"><span>Есть награды за уровни: '+rp+'. Откройте вкладку «Награды»</span><span>›</span></button>';
  if(tp)h+='<button class="go" style="height:44px;font-size:14px" onclick="bpTaskAll()">Забрать весь опыт · '+tp+'</button>';
  h+='<h3 class="sec">Ежедневные <span class="mu">— обновятся через '+fmtT(dl)+'</span></h3>'+bpDaily().map(function(T,i){return tRow("d",i,T.t,B.dc,B.dd,T.id)}).join("");
  h+='<h3 class="sec">Недельные <span class="mu">— обновятся через '+(wl>=864e5?Math.floor(wl/864e5)+" д ":"")+fmtT(wl%864e5)+'</span></h3>'+WT.map(function(t,i){return tRow("w",i,t,B.wc,B.wd,"w"+i)}).join("");
  h+='<p class="note">За каждое задание вы получаете опыт Battle Pass. Каждые '+BPX+' опыта открывают новый уровень.</p>'}
 $("bph").innerHTML=h}
function bpCell(sd,l){var B=bpEns(),r=sd=="v"?bpVip(l):bpFree(l),t=rwTxt(r),got=(sd=="v"?B.cv:B.cf)[l],can=bpCan(sd,l),lk=!got&&!can;
 return '<div class="bc'+(sd=="v"?' vp':'')+(got?' got':can?' ok':' lk')+'" onclick="bpClaim(\''+sd+'\','+l+')"><b>'+t[0]+'</b><small>'+t[1]+'</small><small style="color:'+(t[2]=="NFT"?"#a78bfa":t[2]=="Титул"||t[2]=="Рамка"?"#ffd54a":t[2]=="Билет на кейс"?"#4be0c8":"var(--mu)")+'">'+t[2]+'</small>'+(lk&&sd=="v"&&!B.vip?'<small>🔒 VIP</small>':'')+'</div>'}
function tRow(kind,i,t,cnt,dn,id){var c=Math.min(t[1],cnt[t[0]]||0),done=c>=t[1],cl=dn[id];
 return '<div class="mrow'+(done&&!cl?' rdy':'')+'"><span class="e">'+t[3]+'</span><div class="tt">'+t[2]+'<small>'+f(c)+' / '+f(t[1])+' · +'+t[4]+' опыта</small><div class="tk2"><i style="width:'+(c/t[1]*100)+'%"></i></div></div>'+(cl?'<button class="b" disabled>✓</button>':done?'<button class="b" onclick="bpTask(\''+kind+'\','+i+')">Забрать</button>':'<button class="b off" disabled>'+Math.round(c/t[1]*100)+'%</button>')+'</div>'}


function frameSheet(){var ini=($("pnm").textContent||"И").charAt(0).toUpperCase(),opts=[{id:"",n:"Без рамки",c:""}].concat(FR);
 var h='<div class="h" style="font-size:20px;margin-bottom:12px">Рамка аватара</div><div class="grid g2" style="padding:0;margin-bottom:12px">'+opts.map(function(k){
  var own=!k.id||(S.own||[]).indexOf(k.id)>=0,on=(S.frame||"")==k.id,
  st=k.c?"border:3px solid transparent;background:linear-gradient(#202b38,#202b38) padding-box,linear-gradient(135deg,"+k.c+") border-box":"border:3px solid var(--ln);background:var(--p2)",
  act=own?"pickFrame('"+k.id+"')":(k.bp?"toast('"+k.how+"')":"closeSh();shopGo()");
  return '<div class="sbox" style="margin:0;padding:12px 8px;text-align:center;cursor:pointer;'+(on?'border:1px solid var(--bl);':'')+(own?'':'opacity:.75')+'" onclick="'+act+'"><div class="av" style="width:64px;height:64px;margin:0 auto 8px;cursor:inherit;'+st+'">'+ini+'</div><div class="lab" style="margin:0 0 2px">'+k.n+'</div><div class="mu">'+(on?"Надета":own?"Надеть":k.bp?"🔒 Награда":"🔒 "+k.st+" ⭐")+'</div></div>'}).join("")+'</div><button class="go gh" onclick="closeSh()">Закрыть</button>';
 $("sh").innerHTML=h;$("sheet").className="ov end on"}
function pickFrame(id){S.frame=id||null;save();render();frameSheet()}

/* ===== сезон: сброс прогресса ===== */
function seasonReset(old){
 var sm={s:old.s,v:cv(),l:lvl(),c:S.st.cases,t:S.st.leg},tt0=S.tt||0;
 S={bal:1000,xp:0,inv:[],nu:S.nu||1,mkt:[],nl:S.nl||1,hist:[],fav:[],drops:[],st:{cases:0,ups:0,wins:0,leg:0},vib:1,
  set:S.set,bp:S.bp,own:S.own,frame:S.frame,pass:S.pass,fp:S.fp,spent:S.spent,tut:S.tut,tutg:S.tutg,ttu:S.ttu,ph:S.ph,
  sh:[sm].concat(S.sh||[]).slice(0,12),sn:sm};
 for(var q=0;q<8;q++)S.mkt.push(bl());
 isel={};U={};T=null;CT={};mp=null;shown=null;
 S.tt=(TL[tt0]&&TL[tt0][2]())?tt0:0;
 save()}
function seasonShow(){var n=S.sn;if(!n)return;
 $("rv").innerHTML='<div style="font-size:64px;margin-bottom:6px">🏁</div><div class="h" style="font-size:20px">Сезон '+n.s+' завершён</div><div class="at">Итоги: коллекция '+f(n.v)+' GRADE · уровень '+n.l+' · кейсов '+n.c+'</div><div class="sbox" style="text-align:left;margin:8px 0 12px"><div class="mu" style="line-height:1.6">Начался сезон '+(n.s+1)+' (14 дней).<br>Обнулены: баланс (снова 1 000), инвентарь, уровень, маркет, достижения, коллекции и Battle Pass.<br>Сохранены: рамки, титулы наград, GRADE Pass и настройки.</div></div><button class="go" style="width:100%;margin:0" onclick="seasonClose()">Начать сезон '+(n.s+1)+'</button>';
 $("rev").className="ov on"}
function seasonClose(){S.sn=null;closeRev();save();render();if(dlNext())setTimeout(dlOpen,350)}
function seasonChk(){bpEns();if(S.sn&&!(typeof busy!="undefined"&&busy)&&!$("rev").classList.contains("on")&&!$("sheet").classList.contains("on")){render();seasonShow()}}
