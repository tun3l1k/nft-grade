/* Облачное сохранение прогресса. Состояние игры S хранится на устройстве (localStorage) и копируется на сервер (/save).
   При входе с другого устройства подтягивается более свежая версия (/load). Если админ сбросил прогресс у всех (id сброса w изменился),
   локальный прогресс стирается. Без Telegram (нет initData) всё работает как раньше, только на устройстве. */
var CL={ready:0,tm:null,busy:0};
function cloudReload(){try{var k="clrl",n=Date.now(),l=+sessionStorage.getItem(k)||0;if(n-l<60000)return;sessionStorage.setItem(k,n)}catch(e){}location.reload()}
function cloudPush(){if(!CL.ready||CL.busy||!initD())return;CL.busy=1;clearTimeout(CL.tm);CL.tm=null;
 api("/save",{s:S,t:S.ts||Date.now(),w:S.wp||""}).then(function(d){CL.busy=0;if(!d)return;
  if(d.wipe!==undefined)cloudInit(1);else if(d.stale){CL.ready=0;cloudInit(1)}else if(CL.tm===null&&CL.dirty){CL.dirty=0;cloudSched()}}).catch(function(){CL.busy=0})}
function cloudSched(){if(!CL.ready)return;CL.dirty=1;if(CL.tm)return;CL.tm=setTimeout(function(){CL.tm=null;CL.dirty=0;cloudPush()},4000)}
function cloudInit(force){if(!initD()){CL.ready=1;return}
 api("/load").then(function(d){if(!d||d.error){CL.ready=1;return}var w=d.w||"";
  if(FRESH&&d.s&&d.t>0){try{localStorage.setItem("nftgrade3",JSON.stringify(d.s))}catch(e){}cloudReload();return}
  if((S.wp||"")!==w){
   if(FRESH||(!S.wp&&!w)){S.wp=w;CL.ready=1;save();return}
   /* админ сбросил прогресс: стираем локальный, на сервере его уже нет */
   try{localStorage.removeItem("nftgrade3")}catch(e){}cloudReload();return}
  if(d.s&&d.t>(S.ts||0)){try{localStorage.setItem("nftgrade3",JSON.stringify(d.s))}catch(e){}cloudReload();return}
  CL.ready=1;if(!d.s||(S.ts||0)>d.t)cloudPush()}).catch(function(){CL.ready=1})}
document.addEventListener("visibilitychange",function(){if(document.hidden&&CL.ready&&CL.dirty){clearTimeout(CL.tm);CL.tm=null;CL.dirty=0;cloudPush()}});
setInterval(function(){if(CL.ready&&!document.hidden){cloudPush()}},120000);
cloudInit();
