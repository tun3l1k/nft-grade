/* Применяет цены подарков из config.js (ECO). Подключается после data.js. */
(function(){var F=ECO.floor;G.forEach(function(g){if(!g[4])return;var f=F[g[0]],v,r=0;
 if(f){r=f[0];v=f[1]}else v=Math.min(ECO.cap,Math.max(ECO.min,Math.round(g[3]*ECO.k/10)*10));
 g[3]=v;if(!g[5]){g[2]=r||(v<ECO.t1?1:v<ECO.t2?2:3)}else if(r)g[2]=r})})();
