sortm=S.set.sort|0;applySet();$("gb").innerHTML=ic("gear",20);bpEns();render();rLive();claim();boot2();lbSync();
var frs=freeRdy();setInterval(function(){var n=freeRdy();if(n!=frs){frs=n;render()}seasonChk()},3000);
/* возврат на то же место после перезагрузки: вкладка, подвкладка маркета и прокрутка */
try{var _mt=JSON.parse(sessionStorage.getItem("mt")||"null");if(_mt&&_mt[0]!=5)mtab=_mt[0];var _nt=+sessionStorage.getItem("nt");if(_nt>0&&_nt<11&&!S.sn){tab(_nt);var _sy=+sessionStorage.getItem("sy")||0;if(_sy)setTimeout(function(){window.scrollTo(0,_sy)},60)}}catch(e){}
(function(){var sv=function(){try{sessionStorage.setItem("sy",window.scrollY)}catch(e){}};window.addEventListener("scroll",function(){clearTimeout(sv.t);sv.t=setTimeout(sv,200)},{passive:true});document.addEventListener("visibilitychange",sv);window.addEventListener("pagehide",sv)})();
