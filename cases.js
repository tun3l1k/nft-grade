/* кейсы */
var ci=0,busy=0;
var cf=-1,CATS=["События","Бесплатные","50/50","Дешёвые","Популярные","Дорогие"];
function csVis(c){if(!c.ev)return true;var E=EVENTS[c.ev-1],n=Date.now();return n>=E.from&&n<E.until}
function evEnd(c){return new Date(EVENTS[c.ev-1].until-1).toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"})}
function fmtT(ms){var t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),c=t%60;return h?h+"ч "+("0"+m).slice(-2)+"м":("0"+m).slice(-2)+":"+("0"+c).slice(-2)}
function cfs(n){cf=n;rHome()}
function caseTxt(c){if(c.free){var l=freeCd()-(Date.now()-(S.free||0));return l>0?fmtT(l):"Бесплатно"}return f(c.p)+" "+ic("coin",14)}
function drops(c){var a=[];G.forEach(function(g,i){if(c.w[g[2]]>0&&(c.ev?(g[5]==c.ev||(!g[5]&&g[2]==0)):!g[5])&&(!c.pool||c.pool.indexOf(i)>=0))a.push(i)});return a}
function ccard(c,i){var d=drops(c),dc=[0,1,2,3].map(function(k){return '<span class="d d'+(k+1)+'">'+G[d[(i*2+k*3)%d.length]][1]+'</span>'}).join("");
 return '<div class="cc" onclick="caseSheet('+i+')"><div class="cim" style="background:linear-gradient(135deg,'+c.c+')">'+dc+'<span class="m">'+c.e+'</span>'+(c.ev?'<span class="evb">до '+evEnd(c)+'</span>':'')+(S.tix&&S.tix[i]>0&&!c.free?'<span class="tkb">🎟 '+S.tix[i]+'</span>':'')+'</div><div class="cf"><span class="cn">'+c.n+'</span><span class="pp">'+caseTxt(c)+'</span></div></div>'}
function rHome(){$("hch").innerHTML=[["Все",-1]].concat(CATS.map(function(c,i){return[c,i]})).map(function(x){return '<button class="chip'+(cf==x[1]?' on':'')+'" onclick="cfs('+x[1]+')">'+x[0]+'</button>'}).join("");
 var h="";CATS.forEach(function(cat,k){if(cf>=0&&cf!=k)return;var l=[];CS.forEach(function(c,i){if(c.cat==cat&&csVis(c))l.push([c,i])});if(!l.length)return;
  h+='<div class="sech"><span class="h">'+cat+'</span><span class="mu">'+l.length+' '+(l.length==1?"кейс":l.length<5?"кейса":"кейсов")+'</span></div><div class="cgrid">'+l.map(function(x){return ccard(x[0],x[1])}).join("")+'</div>'});
 $("cases").innerHTML=h;
}
function caseSheet(i){ci=i;var c=CS[i],d=drops(c).sort(function(a,b){return G[b][2]-G[a][2]||G[b][3]-G[a][3]});
 $("sh").innerHTML='<div class="cim" style="background:linear-gradient(135deg,'+c.c+');margin:0 12px 10px"><span class="m">'+c.e+'</span></div><div class="h" style="font-size:20px">'+c.n+'</div>'+(c.ev?'<div class="mu" style="margin-top:4px">Событие «'+EVENTS[c.ev-1].n+'» до '+evEnd(c)+' · эксклюзивные подарки</div>':'')+
  (S.set.odds?'<div class="odds" style="margin:8px 0">'+c.w.map(function(w,k){return w?'<span style="color:'+R[k][1]+'">'+R[k][0]+' '+w+'%</span>':''}).join("")+'</div>':'')+
  '<div class="grid" style="margin-top:8px">'+d.map(function(g){return gtile(g,"","void 0")}).join("")+'</div>'+(S.tix&&S.tix[ci]>0&&!c.free?'<button class="go" style="background:linear-gradient(135deg,#ffd54a,#ff9f1c);color:#2a1a00" onclick="openCase(1)">🎟 Открыть по билету (×'+S.tix[ci]+')</button>':'')+'<button class="go'+(S.tix&&S.tix[ci]>0&&!c.free?' gh':'')+'" '+(S.bal<c.p?'disabled ':'')+'onclick="openCase()">Открыть: '+caseTxt(c)+'</button><button class="go gh" onclick="closeSh()">Закрыть</button>';
 $("sheet").className="ov end on"}
function pickRar(w){var x=Math.random()*100,t=0;for(var i=0;i<4;i++){t+=w[i];if(x<t)return i}return 0}
function openCase(tk){var c=CS[ci],cost=c.p;if(!csVis(c)){toast("Событие завершено");return}if(tk){if(c.free||!((S.tix||{})[ci]>0))return;cost=0}if(busy||S.bal<cost)return;if(c.free){var lf=freeCd()-(Date.now()-(S.free||0));if(lf>0){toast("Следующий подарок через "+fmtT(lf));return}S.free=Date.now()}busy=1;$("sheet").className="ov end";if(tk)S.tix[ci]--;S.bal-=cost;save();rTop();
 var r=pickRar(c.w),g=pickG(r,c.ev,c.pool),it=mkItem(g);
 function done(){S.inv.push(it);var l0=lvl();S.xp+=Math.round((5+r*5)*(isPass()?1.1:1));if(lvl()>l0)toast("Новый уровень: "+lvl());S.st.cases++;sfx("r"+r);if(r>=2)burst(r==3?70:36,r==3?["#ffd54a","#ff9f1c","#fff"]:["#a78bfa","#2aabee","#fff"]);bpAdd("cases",1);bpAdd("spent",cost);if(G[g][4])bpAdd("nft",1);if(r>=2)bpAdd("rare",1);if(r==3)S.st.leg++;livePush(me(),g);save();
  $("rv").innerHTML=big(it)+'<div class="at">'+atxt(it)+' · '+f(pr(it))+' GRADE</div><button class="go" onclick="closeRev()">Забрать</button><button class="go gh" onclick="sellOne('+it.u+')">Продать за '+f(pr(it))+'</button>';
  busy=0;render()}
 $("rev").className="ov on";
 if(S.set.fast){done();return}
 var N=42,W=34,st=[];for(var i=0;i<N;i++)st.push(i==W?g:pickG(pickRar(c.w),c.ev,c.pool));
 $("rv").innerHTML='<div class="h" style="font-size:18px;margin-bottom:12px">'+c.n+'</div><div class="roll"><div class="mk"></div><div class="strip" id="strip">'+st.map(function(gi){var x=G[gi];return '<div class="rt" style="border-color:'+(x[4]?BG[gi%5]:"#7f91a4")+';--bg2:'+BG[gi%5]+'">'+x[1]+'</div>'}).join("")+'</div></div><div class="mu">Открываем кейс…</div>';
 var strip=$("strip"),cw=strip.parentNode.offsetWidth,off=Math.round(Math.random()*50-25),end=W*104+48-cw/2+off;
 strip.getBoundingClientRect();strip.style.transition="transform 5.5s cubic-bezier(.08,.6,.12,1)";strip.style.transform="translateX("+(-end)+"px)";
 rtick();setTimeout(done,5800)}
function closeRev(){$("rev").className="ov"}
function sellOne(u){var x=S.inv.filter(function(y){return y.u==u})[0];if(!x)return;S.inv=S.inv.filter(function(y){return y.u!=u});S.bal+=pr(x);bpAdd("sells",1);closeRev();save();render()}
