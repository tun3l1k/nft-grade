/* Экран технического перерыва и первое предупреждение. Подключается последним. */
(function(){
 var m=document.createElement("div");m.id="mnt";
 m.innerHTML='<div class="mi">'+ic("gear",56)+'</div><div class="h" style="font-size:22px;margin:14px 0 8px">Технический перерыв</div><div class="mu" id="mnm"></div><button class="go" style="max-width:260px;margin-top:20px" onclick="mntChk()">Проверить снова</button>';
 document.body.appendChild(m);
 window.mntChk=function(){api("/status").then(function(d){var on=!!(d&&d.maint&&!d.admin);m.classList.toggle("on",on);if(on)$("mnm").textContent=d.msg||"Мы обновляем игру. Скоро вернёмся."}).catch(function(){})};
 mntChk();setInterval(mntChk,20000);
 /* v9: номера не больше тиража; лимитированные номера уникальны (учёт на сервере) */
 (function(){if(S.mv>=9)return;S.mv=9;S.ltk=S.ltk||{};
  var fix=function(x){if(!x||!x.up||!G[x.g])return;var nm=G[x.g][0],l=LIM[nm];
   if(l){if(x.n<1||x.n>l||(S.ltk[nm]||[]).indexOf(x.n)>=0){x.n=mintN(x.g)}else{(S.ltk[nm]=S.ltk[nm]||[]).push(x.n);S.ltp=S.ltp||[];S.ltp.push([nm,x.n])}}
   else{var D=nmax(x.g);if(!(x.n>=1)||x.n>D)x.n=((Math.max(x.n|0,1)-1)%D)+1}};
  S.inv.forEach(fix);(S.mkt||[]).forEach(function(l){fix(l.it)});save()})();

 /* v10: у старых улучшенных подарков из коллекций с моделями появляется конкретная модель */
 (function(){if(S.mv>=11)return;S.mv=11;var fix=function(x){if(!x||!x.up||x.mo>=0||!G[x.g]||!gmOf(x.g))return;var j=mpick(x.g);x.mo=j;if(j>=0)x.m=0};S.inv.forEach(fix);(S.mkt||[]).forEach(function(l){fix(l.it)});save()})();
 /* v12: фонов стало 80 (как в Telegram), старые номера 0-6 переводятся в новые по редкости */
 (function(){if(S.mv>=12)return;S.mv=12;var O=0,B=1,R=[2, 3, 5, 7, 10, 12, 13, 14, 17, 19, 23, 28, 29, 41, 43, 46, 50, 56, 58, 61],C=[4, 6, 8, 9, 11, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 44, 45, 47, 48, 49, 51, 52, 53, 54, 55, 57, 59, 60, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79],pk=function(a){return a[Math.floor(Math.random()*a.length)]};var fix=function(x){if(!x||!x.up||x.b>6)return;x.b=x.b==6?O:x.b==5?B:x.b==4?pk(R):x.b==3&&Math.random()<.5?pk(R):pk(C)};S.inv.forEach(fix);(S.mkt||[]).forEach(function(l){fix(l.it)});save()})();
 /* v13: старый тип модели «Монохром» убран, монохром теперь определяется по цвету */
 (function(){if(S.mv>=13)return;S.mv=13;var fix=function(x){if(x&&x.up&&x.m==5)x.m=4};S.inv.forEach(fix);(S.mkt||[]).forEach(function(l){fix(l.it)});save()})();
 limSync();setInterval(limSync,30000);
 if(!S.ack){var l=document.createElement("div");l.id="legal";
  l.innerHTML='<div class="box"><div class="h" style="font-size:20px;margin-bottom:10px">Добро пожаловать в NFT GRADE</div><div class="dis">'+DISC+'</div><button class="go" style="width:100%;margin:14px 0 0" onclick="legalOk()">Мне есть 18, всё понятно</button></div>';
  document.body.appendChild(l);window.legalOk=function(){S.ack=1;save();l.remove()}}
})();
