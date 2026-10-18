/* Экран технического перерыва и первое предупреждение. Подключается последним. */
(function(){
 var m=document.createElement("div");m.id="mnt";
 m.innerHTML='<div class="mi">'+ic("gear",56)+'</div><div class="h" style="font-size:22px;margin:14px 0 8px">Технический перерыв</div><div class="mu" id="mnm"></div><button class="go" style="max-width:260px;margin-top:20px" onclick="mntChk()">Проверить снова</button>';
 document.body.appendChild(m);
 window.mntChk=function(){api("/status").then(function(d){var on=!!(d&&d.maint&&!d.admin);m.classList.toggle("on",on);if(on)$("mnm").textContent=d.msg||"Мы обновляем игру. Скоро вернёмся."}).catch(function(){})};
 mntChk();setInterval(mntChk,20000);
 if(!S.ack){var l=document.createElement("div");l.id="legal";
  l.innerHTML='<div class="box"><div class="h" style="font-size:20px;margin-bottom:10px">Добро пожаловать в NFT GRADE</div><div class="dis">'+DISC+'</div><button class="go" style="width:100%;margin:14px 0 0" onclick="legalOk()">Мне есть 18, всё понятно</button></div>';
  document.body.appendChild(l);window.legalOk=function(){S.ack=1;save();l.remove()}}
})();
