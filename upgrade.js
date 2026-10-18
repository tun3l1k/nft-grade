/* апгрейд */
var U={},T=null,ch=0,cur=0;
function usum(){return S.inv.reduce(function(a,x){return a+(U[x.u]?pr(x):0)},0)}
function arc(c){var r=130,a0=(180-c*180)*Math.PI/180,a1=(180+c*180)*Math.PI/180,p=function(a){return[(150+r*Math.sin(a)).toFixed(2),(150-r*Math.cos(a)).toFixed(2)]},s=p(a0),e=p(a1);
 $("arc").setAttribute("d",c<=0?"":"M"+s[0]+" "+s[1]+" A"+r+" "+r+" 0 "+(c>.5?1:0)+" 1 "+e[0]+" "+e[1])}
var MX=[1.5,2,3,5,10,20,50,100],mx=2;
function mxCh(k){return Math.min(90,95/k)}
function cchance(i,m){var c=tv(i);if(!G[i][4]||!(m>0&&c>m))return 0;var q=m/c*95;return q<.5?0:Math.min(90,q)}
function near(v,m){var b=null,d=1e18;G.forEach(function(g,i){var t=tv(i);if(g[4]&&t>m&&Math.abs(t-v)<d){d=Math.abs(t-v);b=i}});return b}
function setMx(k){if(busy)return;if(!usum()){toast("Сначала выберите свои подарки");return}mx=k;rUp()}
function closeSh(){$("sheet").className="ov end"}
function rUp(){var s=usum();if(mx&&s>0)T=near(s*mx,s);else if(T!=null&&!cchance(T,s))T=null;
 ch=(s>0&&T!=null)?cchance(T,s):0;
 $("umx").innerHTML=MX.map(function(k){return '<button class="chip mx'+(mx==k?" on":"")+'" onclick="setMx('+k+')"><b>×'+k+'</b><small>'+mxCh(k).toFixed(2)+' %</small></button>'}).join("");
 $("pct").textContent=ch.toFixed(1)+" %";var sb=$("sub");sb.textContent=!ch?"—":ch>=60?"Высокий шанс":ch>=30?"Средний шанс":"Низкий шанс";sb.className="sub "+(ch>=50?"s":"r");arc(ch/100);
 var g=$("ugo");g.disabled=!!busy||!ch;g.textContent=!s?"Выберите свои подарки":T==null?"Нет подходящей цели":"Улучшить";
 var inf='<div class="lab">Как считается шанс</div><div class="mu" style="line-height:1.5">Шанс = вложенное ÷ цена цели × 95%. Выберите ставку ×2, ×3… или конкретную цель ниже. В апгрейд подходят NFT и неулучшенные подарки, которые можно улучшить. Обычные подарки не участвуют.</div>';
 if(T!=null&&s)inf+='<div class="srow" style="margin-top:10px"><span>Вложено</span><b>'+f(s)+'</b></div><div class="srow"><span>Цель: '+G[T][1]+' '+G[T][0]+'</span><b>≈ '+f(tv(T))+'</b></div><div class="srow"><span>Шанс успеха</span><b style="color:var(--gr)">'+ch.toFixed(2)+' %</b></div><div class="srow"><span>Шанс неудачи</span><b style="color:var(--rd)">'+(100-ch).toFixed(2)+' %</b></div>';
 $("uinfo").innerHTML=inf;
 $("umine").innerHTML=S.inv.filter(upOk).sort(function(x,y){return pr(y)-pr(x)}).map(function(x){return tile(x,U[x.u]?" on":"","tu("+x.u+")")}).join("")||'<p class="note" style="grid-column:1/4">Нет подходящих подарков. В апгрейд идут NFT и неулучшенные подарки, которые можно улучшить. Обычные подарки не участвуют.</p>';
 $("utgt").innerHTML=G.map(function(x,i){if(!x[4])return"";var c=cchance(i,s);return gtile(i,(T==i?" on":"")+(c?"":" dm"),"tt("+i+")").replace("<b>",'<span class="bd'+(c>=50?' ok':'')+'">'+(c?c.toFixed(2)+" %":"—")+"</span><b>")}).join("");
 $("uhist").innerHTML=(S.uh||[]).map(function(h){return '<div class="mrow"><span class="e">'+(h.w?"✅":"❌")+'</span><div class="tt">'+h.a+' → '+G[h.t][1]+' '+G[h.t][0]+'<small>шанс '+h.c.toFixed(1)+' % · '+new Date(h.ts).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})+'</small></div></div>'}).join("")||'<p class="note">Попыток пока нет</p>'}
function upOk(x){return !!(x.up||G[x.g][4])}
function tu(u){if(busy)return;U[u]=!U[u];rUp()}
function tt(i){if(busy)return;var s=usum();if(!s){toast("Сначала выберите свои подарки");return}if(!cchance(i,s)){toast("Цель должна быть дороже вложенного");return}mx=0;T=i;rUp()}
function spin(){if(busy||!ch)return;busy=1;rUp();
 var win=Math.random()*100<ch,c=ch/100,lo=180-c*180,hi=180+c*180,a;
 if(win)a=lo+(hi-lo)*(.08+.84*Math.random());else{var L=lo,Rr=360-hi,t=Math.random()*(L+Rr);a=t<L?t:hi+(t-L)}
 var base=cur-((cur%360)+360)%360;cur=base+1800+a;var p=$("ptr");p.style.transition="transform 4.2s cubic-bezier(.12,.6,.1,1)";p.style.transform="rotate("+cur+"deg)";
 var used=Object.keys(U).filter(function(k){return U[k]}).map(Number),tg2=T,vs=usum(),chs=ch,em=S.inv.filter(function(x){return U[x.u]}).map(function(x){return G[x.g][1]}).join("");
 setTimeout(function(){S.inv=S.inv.filter(function(x){return used.indexOf(x.u)<0});S.st.ups++;bpAdd("ups",1);S.uh=S.uh||[];S.uh.unshift({w:win?1:0,c:chs,a:em,t:tg2,ts:Date.now()});S.uh=S.uh.slice(0,15);
  if(win){S.inv.push(mkItem(tg2,1));S.st.wins++;bpAdd("upw",1);bpAdd("nft",1);var l1=lvl();S.xp+=10;if(lvl()>l1)toast("Новый уровень: "+lvl())}
  var r=$("res"),w=$("wh");r.className="res "+(win?"w":"l");sfx(win?"win":"lose");if(win)burst(40,["#5fd068","#2aabee","#fff"]);r.textContent=win?"Успех! "+G[tg2][1]:"Неудача";r.style.display="block";w.classList.add(win?"fw":"wfl");
  U={};T=null;busy=0;save();render();
  setTimeout(function(){r.style.display="none";w.classList.remove("fw","wfl")},2200)},4400)}
