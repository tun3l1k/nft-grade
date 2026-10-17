// Сервер оплаты Telegram Stars для NFT GRADE. Node 18+, без зависимостей.
// Запуск: BOT_TOKEN=... WEBHOOK_SECRET=... PUBLIC_URL=https://ваш-домен node server.js
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const { BOT_TOKEN, WEBHOOK_SECRET, PUBLIC_URL, SUPPORT, PORT = 3000 } = process.env;
if (!BOT_TOKEN || !WEBHOOK_SECRET) { console.error('Нужны BOT_TOKEN и WEBHOOK_SECRET'); process.exit(1); }

// Каталог. Цены (Stars) задаются ТОЛЬКО здесь: клиенту доверять нельзя.
const ITEMS = {
  p50:   { title: '500 GRADE',    st: 50 },
  p150:  { title: '1 650 GRADE',  st: 150 },
  p500:  { title: '6 000 GRADE',  st: 500 },
  p1500: { title: '20 000 GRADE', st: 1500 },
  pass:  { title: 'GRADE Pass · 30 дней', st: 199 },
  bpvip: { title: 'Battle Pass VIP', st: 599 },
  bplvl: { title: '+1 уровень Battle Pass', st: 60 },
  f1:    { title: 'Рамка «Неон»',   st: 50 },
  f2:    { title: 'Рамка «Золото»', st: 100 },
  f3:    { title: 'Рамка «Аврора»', st: 150 },
};

// Хранилище: JSON-файл. Для продакшена замените на SQLite/Postgres.
const DB_FILE = path.join(__dirname, 'db.json');
let db = { pending: {}, paid: {} }; // pending[userId] = [{id,item,charge}], paid[charge]=1
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {}
db.scores = db.scores || {};
const saveDb = () => fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db)) || fs.renameSync(DB_FILE + '.tmp', DB_FILE);

const tg = (method, body) => fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}).then(r => r.json());

// Проверка подписи initData (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
function checkInitData(initData) {
  if (!initData) return null;
  const p = new URLSearchParams(initData), hash = p.get('hash'); p.delete('hash');
  const str = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calc = crypto.createHmac('sha256', secret).update(str).digest('hex');
  if (!hash || calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
  if (Date.now() / 1000 - Number(p.get('auth_date')) > 86400) return null; // устарела
  try { return JSON.parse(p.get('user')); } catch { return null; }
}

const readBody = req => new Promise(res => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(d || '{}')); } catch { res({}); } }); });
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(JSON.stringify(obj)); };

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = req.url.split('?')[0];

  // Сам мини-апп: все файлы игры лежат рядом с server.js
  if (req.method === 'GET') {
    const p = url === '/' ? '/index.html' : url;
    if (/^\/[\w\-]+\.(html|css|js|png|jpg|webp|svg)$/.test(p) && p !== '/server.js') {
      try {
        const data = fs.readFileSync(path.join(__dirname, p));
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        return res.end(data);
      } catch { return send(res, 404, { error: 'not found' }); }
    }
  }

  // 1) Клиент просит счёт
  if (url === '/invoice' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData), item = ITEMS[b.item];
    if (!user || !item) return send(res, 400, { error: 'bad request' });
    const r = await tg('createInvoiceLink', {
      title: item.title, description: item.title, payload: JSON.stringify({ u: user.id, i: b.item }),
      currency: 'XTR', prices: [{ label: item.title, amount: item.st }], // для Stars provider_token пустой
    });
    return r.ok ? send(res, 200, { link: r.result }) : send(res, 502, { error: 'telegram' });
  }

  // 2) Telegram присылает апдейты (pre_checkout и успешная оплата)
  if (url === '/bot' && req.method === 'POST') {
    if (req.headers['x-telegram-bot-api-secret-token'] !== WEBHOOK_SECRET) return send(res, 403, {});
    const u = await readBody(req);
    if (u.pre_checkout_query) {
      const q = u.pre_checkout_query; let ok = false;
      try { const pl = JSON.parse(q.invoice_payload), it = ITEMS[pl.i]; ok = !!it && pl.u === q.from.id && q.currency === 'XTR' && q.total_amount === it.st; } catch {}
      await tg('answerPreCheckoutQuery', { pre_checkout_query_id: q.id, ok, ...(ok ? {} : { error_message: 'Товар недоступен' }) });
    }
    // Команды бота: /start открывает игру, /paysupport нужен для вопросов по оплате
    const m = u.message;
    if (m && m.text && m.chat) {
      const cmd = m.text.split(/[\s@]/)[0];
      if (cmd === '/start' && PUBLIC_URL) await tg('sendMessage', { chat_id: m.chat.id, text: 'NFT GRADE: открывай кейсы и собирай коллекцию.', reply_markup: { inline_keyboard: [[{ text: 'Играть', web_app: { url: PUBLIC_URL } }]] } });
      if (cmd === '/paysupport') await tg('sendMessage', { chat_id: m.chat.id, text: 'Проблема с оплатой? Напишите ' + (SUPPORT || 'в поддержку') + ' и укажите, что покупали и когда.' });
    }
    const sp = u.message && u.message.successful_payment;
    if (sp) {
      const charge = sp.telegram_payment_charge_id;
      if (!db.paid[charge]) { // идемпотентно: повтор апдейта не начислит дважды
        try { const pl = JSON.parse(sp.invoice_payload), it = ITEMS[pl.i];
          if (it && pl.u === u.message.from.id && sp.total_amount === it.st) {
            db.paid[charge] = 1; (db.pending[pl.u] = db.pending[pl.u] || []).push({ item: pl.i, charge }); saveDb(); }
        } catch {}
      }
    }
    return send(res, 200, {});
  }

  // 3) Клиент забирает подтверждённые покупки
  if (url === '/claim' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    const list = db.pending[user.id] || []; delete db.pending[user.id]; saveDb();
    return send(res, 200, { items: list.map(x => x.item) });
  }
  // 4) Рейтинг. Значения присылает клиент, поэтому они не защищены от подделки: используйте только как соревновательную витрину.
  if (url === '/score' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    const num = (x, max) => Math.max(0, Math.min(max, Math.floor(Number(x) || 0)));
    const prev = db.scores[user.id];
    if (prev && Date.now() - prev.ts < 5000) return send(res, 200, { ok: true });
    db.scores[user.id] = { n: String(user.username || user.first_name || 'player').slice(0, 24), v: num(b.v, 5e6), l: num(b.l, 200), t: num(b.t, 10000), ts: Date.now() };
    saveDb();
    return send(res, 200, { ok: true });
  }
  if (url === '/top' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    const key = { 1: 'v', 2: 'l', 3: 't' }[Number(b.m)] || 'v';
    const all = Object.entries(db.scores).map(([id, x]) => ({ id, n: x.n, v: x.v, l: x.l, t: x.t })).sort((a, c) => c[key] - a[key]);
    const rank = all.findIndex(x => x.id === String(user.id)) + 1;
    const list = all.slice(0, 30).map(x => ({ n: x.n, v: x.v, l: x.l, t: x.t, me: x.id === String(user.id) }));
    if (rank > 30) { const x = all[rank - 1]; list.push({ n: x.n, v: x.v, l: x.l, t: x.t, me: true }); }
    return send(res, 200, { list, rank });
  }
  send(res, 404, { error: 'not found' });
}).listen(PORT, async () => {
  console.log('listening', PORT);
  if (PUBLIC_URL) console.log('setWebhook:', await tg('setWebhook', { url: PUBLIC_URL + '/bot', secret_token: WEBHOOK_SECRET, allowed_updates: ['message', 'pre_checkout_query'] }));
});
