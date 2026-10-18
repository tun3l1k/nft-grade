/* Запасной вариант, если SDK Telegram не загрузился: берём данные игрока из адреса (tgWebAppData).
   Подключается сразу после telegram-web-app.js, до остальных скриптов. */
(function(){try{
 var W=window.Telegram&&Telegram.WebApp;
 if(W&&W.initData)return;
 var d=new URLSearchParams((location.hash||"").replace(/^#/,"")).get("tgWebAppData");
 if(!d){try{var s=JSON.parse(sessionStorage.getItem("__telegram__initParams")||"null");d=s&&s.tgWebAppData}catch(e){}}
 if(!d)return;
 var u=null;try{u=JSON.parse(new URLSearchParams(d).get("user"))}catch(e){}
 var T=window.Telegram=window.Telegram||{};W=T.WebApp=T.WebApp||{};
 W.initData=d;W.initDataUnsafe=W.initDataUnsafe||{};W.initDataUnsafe.user=u;
 ["ready","expand","close","enableClosingConfirmation"].forEach(function(k){if(!W[k])W[k]=function(){}});
 if(!W.HapticFeedback)W.HapticFeedback=null;
}catch(e){}})();
