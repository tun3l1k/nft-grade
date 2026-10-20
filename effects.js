/* ===== звук и эффекты ===== */
var AC=null;
function au(){if(!S.set.snd)return null;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state=="suspended")AC.resume();return AC}catch(e){return null}}
function tone(fr,d,t0,ty,vol){var a=au();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(t0||0);o.type=ty||"sine";o.frequency.value=fr;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime((vol||.1)*((S.set.vol==null?80:S.set.vol)/80),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
function seq(a,d,ty,vol,gap){a.forEach(function(fr,i){tone(fr,d,i*(gap||.08),ty,vol)})}
function sfx(k){if(!S.set.snd)return;
 if(k=="tick")tone(1000,.03,0,"square",.03);
 else if(k=="r0")seq([440],.2);else if(k=="r1")seq([523,659],.2);else if(k=="r2")seq([523,659,784],.22);
 else if(k=="r3")seq([523,659,784,1047,1319],.3,"sawtooth",.07,.09);
 else if(k=="win")seq([523,784,1047],.2,"triangle",.12);else if(k=="lose")seq([262,196],.28,"sawtooth",.06,.14);
 else if(k=="ok")seq([660,880],.14,"triangle",.1,.07)}
function rtick(){if(!S.set.snd)return;var N=36;for(var i=1;i<=N;i++)setTimeout(function(){sfx("tick")},5500*(1-Math.pow(1-i/N,1/2.6)))}
function burst(n,cols){if(!S.set.fx)return;try{if(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches)return}catch(e){}var fx=$("fx"),sym=["✦","●","▲","◆","★"];
 for(var i=0;i<n;i++){var e=document.createElement("span"),a=Math.random()*Math.PI*2,d=90+Math.random()*190;e.className="fxp";e.textContent=sym[i%sym.length];e.style.color=cols[i%cols.length];
  e.style.setProperty("--dx",Math.round(Math.cos(a)*d)+"px");e.style.setProperty("--dy",Math.round(Math.sin(a)*d+60)+"px");e.style.setProperty("--r",Math.round(Math.random()*720-360)+"deg");fx.appendChild(e);(function(x){setTimeout(function(){x.remove()},1300)})(e)}}
function updSeen(){S.seen=S.seen||{};S.inv.forEach(function(x){S.seen[x.g]=1})}

/* ===== ежедневная награда ===== */
var DLR=[["coin",100],["case",12],["coin",200],["case",10],["coin",400],["case",16],["gift",32]];
function dlNext(){var d=S.dl||{n:0,last:-9},k=dkey();if(d.last==k)return null;return d.last==k-1?d.n+1:1}
function rDl(){var b=$("dlb"),nx=dlNext(),d=S.dl||{n:0};b.className="dlb"+(nx?" rd":"");
 b.innerHTML=nx?'<span>🎁 Ежедневная награда · день '+((nx-1)%7+1)+'</span><span class="dot">1</span>':'<span>✓ Серия: '+d.n+' дн.</span><span class="mu">завтра новая награда ›</span>'}
function dlOpen(){var d=S.dl||{n:0,last:-9},nx=dlNext(),idx=nx?(nx-1)%7:(d.n-1)%7,cells=DLR.map(function(r,i){var t=rwTxt(r),st=(i<idx||(!nx&&i==idx))?" got":(i==idx&&nx)?" ok today":" lk";
  return '<div class="bc'+st+'"><div class="dn">День '+(i+1)+'</div><b>'+t[0]+'</b><small>'+t[1]+'</small></div>'}).join("");
 $("sh").innerHTML='<div class="h" style="font-size:20px">Ежедневная награда</div><div class="at">Серия: '+(nx?(nx==1?0:d.n):d.n)+' дн. Если пропустить день, серия начнётся заново.</div><div class="dg">'+cells+'</div>'+(nx?'<button class="go" onclick="dlClaim()">Забрать награду</button>':'<button class="go" disabled>Приходите завтра</button>')+'<button class="go gh" onclick="closeSh()">Закрыть</button>';
 $("sheet").className="ov end on"}
function dlClaim(){var nx=dlNext();if(!nx)return;S.dl={n:nx,last:dkey()};var r=DLR[(nx-1)%7];bpApply(r);var t=rwTxt(r);toast("Получено: "+(t[0].charAt(0)=="<"?"":t[0]+" ")+t[1]);sfx("ok");burst(24,["#ffd54a","#ff9f1c","#fff"]);save();render();dlOpen()}

/* ===== обучение ===== */
var TUT=[["👋","Добро пожаловать в NFT GRADE","Открывайте кейсы, собирайте NFT-подарки и торгуйте ими на маркете. В конце обучения мы подарим билет на кейс «Старт»."],["📦","Кейсы","Нажмите на кейс, посмотрите шансы и откройте его. Билет открывает кейс бесплатно, а «Подарок дня» доступен раз в сутки."],["⬆️","Апгрейд и контракты","Вложите NFT в апгрейд, чтобы получить шанс на более дорогой. Контракт превращает 3–10 подарков в один новый."],["🏆","Задания и Battle Pass","Выполняйте ежедневные задания, получайте опыт и открывайте награды на двух дорожках: FREE и VIP. Сезон длится 14 дней, после него прогресс обнуляется."]];
function tutStep(i){if(i>=TUT.length){tutDone();return}var t=TUT[i];
 $("rv").innerHTML='<div style="font-size:72px;margin-bottom:6px">'+t[0]+'</div><div class="h" style="font-size:20px">'+t[1]+'</div><div class="at">'+t[2]+'</div><div class="tdots">'+TUT.map(function(x,k){return '<i class="'+(k==i?'on':'')+'"></i>'}).join("")+'</div><button class="go" onclick="tutStep('+(i+1)+')">'+(i==TUT.length-1?"Начать игру":"Далее")+'</button>'+(i<TUT.length-1?'<button class="go gh" onclick="tutDone()">Пропустить</button>':'');
 $("rev").className="ov on"}
function tutDone(){S.tut=1;if(!S.tutg){S.tutg=1;S.tix=S.tix||{};S.tix[2]=(S.tix[2]||0)+1;toast("Билет на кейс «Старт» получен")}closeRev();save();render();if(dlNext())setTimeout(dlOpen,350)}
function boot2(){if(S.mg){toast("Сердце убрано из игры: возврат +"+f(S.mg));S.mg=0;save()}if(S.sn)seasonShow();else if(!S.tut)tutStep(0);else if(dlNext())setTimeout(dlOpen,350)}
function rNav(){var n0=(dlNext()?1:0)+bpPending()+freeRdy(),n4=(typeof profPending=="function"?profPending():0),bs=document.querySelectorAll(".nav button");
 [[0,n0],[4,n4]].forEach(function(x){var b=bs[x[0]];if(!b)return;var d=b.querySelector(".dot");if(x[1]){if(!d){d=document.createElement("span");d.className="dot";b.appendChild(d)}d.textContent=x[1]}else if(d)d.remove()})}
