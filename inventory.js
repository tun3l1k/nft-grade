/* инвентарь */
var isel={},sortm=0,ifl=0,imode=0;
function ism(){imode=!imode;isel={};$("isb").classList.toggle("on",imode);rInv()}
function isr(n){sortm=n;rInv()}
function itf(n){ifl=n;isel={};rInv()}
function invList(){return S.inv.filter(function(x){var n=!!x.up;return ifl==0||(ifl==1&&n)||(ifl==2&&!n)}).sort(function(x,y){return sortm==1?pr(x)-pr(y):sortm==2?y.u-x.u:sortm==3?(x.n||1e9)-(y.n||1e9):pr(y)-pr(x)})}
function selAll(){if(!imode){imode=1;$("isb").classList.add("on")}var a=invList(),all=a.every(function(x){return isel[x.u]});a.forEach(function(x){isel[x.u]=!all});rInv()}
function rInv(){var a=invList();$("itv").innerHTML=ic("coin",22)+" "+tn(cv());$("itn").textContent=S.inv.length;$("itnf").textContent=S.inv.filter(function(x){return x.up}).length;
 document.querySelectorAll("#itabs button").forEach(function(b,i){b.classList.toggle("on",i==ifl)});document.querySelectorAll("#isort .chip").forEach(function(b,i){if(i<4)b.classList.toggle("on",i==sortm)});
 $("igrid").innerHTML=a.map(function(x){return tile(x,isel[x.u]?" on":"",imode?"tg("+x.u+")":"sheet("+x.u+")")}).join("")||'<p class="note" style="grid-column:1/4">Здесь пусто. Откройте кейс на вкладке «Кейсы».</p>';
 var ids=selIds(),sm=0;S.inv.forEach(function(x){if(isel[x.u])sm+=sv(x)});$("iact").style.display=ids.length?"block":"none";var hn=!S.inv.some(function(x){return isel[x.u]&&upOk(x)});$("iup").style.display=hn?"none":"";$("iup").previousElementSibling.style.gridColumn=hn?"1/-1":"";$("isum").textContent="Выбрано "+ids.length+" · "+tn(sm)+" TON"}
function tg(u){isel[u]=!isel[u];rInv()}
function selIds(){return S.inv.filter(function(x){return isel[x.u]}).map(function(x){return x.u})}
function sellSel(){var n=selIds().length,sm=0;S.inv.forEach(function(x){if(isel[x.u])sm+=sv(x)});if(!n)return;cfmDo("Продать выбранные ("+n+") за "+tn(sm)+" TON?",function(){var s=0;bpAdd("sells",selIds().length);S.inv=S.inv.filter(function(x){if(isel[x.u]){s+=sv(x);return false}return true});S.bal+=s;isel={};toast("Продано: +"+tn(s));save();render()})}
function toUp(){U={};S.inv.forEach(function(x){if(isel[x.u]&&upOk(x))U[x.u]=1});isel={};tab(2)}
function detSel(){sheet(selIds()[0])}
