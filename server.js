// Сервер оплаты Telegram Stars для NFT GRADE. Node 18+, без зависимостей.
// Запуск: BOT_TOKEN=... WEBHOOK_SECRET=... PUBLIC_URL=https://ваш-домен node server.js
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const { BOT_TOKEN, WEBHOOK_SECRET, PUBLIC_URL, SUPPORT, PORT = 3000 } = process.env;
// Администраторы: числовые Telegram ID через запятую. Свой ID покажет команда /id в боте.
const ADMINS = (process.env.ADMIN_IDS || '').split(',').map(x => Number(x.trim())).filter(Boolean);
if (!BOT_TOKEN || !WEBHOOK_SECRET) { console.error('Нужны BOT_TOKEN и WEBHOOK_SECRET'); process.exit(1); }
if (!ADMINS.length) console.warn('ADMIN_IDS не задан: админ-команды никому не доступны. Свой ID покажет /id в боте.');

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
db.users = db.users || {}; db.sales = db.sales || []; db.banned = db.banned || {}; db.grants = db.grants || {}; db.audit = db.audit || [];
const saveDb = () => fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db)) || fs.renameSync(DB_FILE + '.tmp', DB_FILE);

const tg = (method, body) => fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}).then(r => r.json()).catch(e => ({ ok: false, error: String(e) }));

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

// ---------- Игроки и админ-команды ----------
const touch = user => { const isNew = !db.users[user.id]; const x = db.users[user.id] || (db.users[user.id] = { f: Date.now() }); x.n = String(user.first_name || '').slice(0, 40); x.u = String(user.username || '').slice(0, 40); x.l = Date.now(); if (isNew) saveDb(); };
const findUser = q => { q = String(q || '').replace(/^@/, '').toLowerCase(); if (!q) return null; const e = Object.entries(db.users).find(([id, x]) => id === q || (x.u || '').toLowerCase() === q); return e ? { id: e[0], ...e[1] } : null; };
const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const iso = ts => new Date(ts).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const spentBy = id => db.sales.filter(x => String(x.u) === String(id) && !x.refunded).reduce((a, x) => a + x.st, 0);
const pendingBc = {};
// Админ-меню на кнопках, лимитированные выпуски, промокоды (admin.js)
const A = require('./admin.js')({ db, tg, saveDb, ADMINS, PUBLIC_URL, SUPPORT, findUser, esc, iso, spentBy });
const ADMIN_CMDS = ['/admin', '/menu', '/adminhelp', '/cancel', '/stats', '/find', '/give', '/ban', '/unban', '/sales', '/refund', '/broadcast', '/yes'];
async function admin(m, cmd) {
  if (!ADMIN_CMDS.includes(cmd)) return;
  const a = m.text.trim().split(/\s+/).slice(1), say = t => tg('sendMessage', { chat_id: m.chat.id, text: t, parse_mode: 'HTML' });
  db.audit.push({ ts: Date.now(), a: m.from.id, t: m.text.slice(0, 200) }); db.audit = db.audit.slice(-300); saveDb();
  if (cmd === '/admin' || cmd === '/menu') return A.openMenu(m);
  if (cmd === '/cancel') { A.cancel(m.from.id); return say('Отменено.'); }
  if (cmd === '/adminhelp') return say('<b>Админ-команды</b>\n/stats: сводка\n/find @ник или id: карточка игрока\n/give @ник|id coin 1000\n/give @ник|id gift НОМЕР\n/give @ник|id case НОМЕР\n/ban id и /unban id\n/sales: последние покупки\n/refund id charge_id: вернуть Stars\n/broadcast текст: рассылка, затем /yes\n\nУдобнее через кнопки: /admin');
  if (cmd === '/stats') {
    const now = Date.now(), us = Object.values(db.users), act = d => us.filter(x => now - x.l < d * 864e5).length;
    const rev = db.sales.filter(x => !x.refunded).reduce((t, x) => t + x.st, 0);
    const top = Object.values(db.scores).sort((p, q) => q.v - p.v).slice(0, 3).map(x => esc(x.n) + ' ' + x.v).join(', ') || '-';
    return say('Игроков: ' + us.length + '\nАктивны за 24 ч: ' + act(1) + ', за 7 дней: ' + act(7) + '\nПокупок: ' + db.sales.length + ', выручка: ' + rev + ' ⭐\nЗабанено: ' + Object.keys(db.banned).length + '\nТоп по коллекции: ' + top);
  }
  if (cmd === '/find') {
    const f = findUser(a[0]); if (!f) return say('Игрок не найден. Он должен хотя бы раз открыть бота или игру.');
    const sc = db.scores[f.id] || {};
    return say('<b>' + esc(f.n) + '</b> @' + esc(f.u || '-') + '\nID: ' + f.id + '\nВпервые: ' + iso(f.f) + '\nПоследний вход: ' + iso(f.l) + '\nПотратил: ' + spentBy(f.id) + ' ⭐\nКоллекция: ' + (sc.v ?? '-') + ', уровень ' + (sc.l ?? '-') + '\nБан: ' + (db.banned[f.id] ? 'да' : 'нет'));
  }
  if (cmd === '/give') {
    const f = findUser(a[0]), kind = a[1], v = Number(a[2]), nm = a.slice(2).join(' ');
    const byName = ['gift', 'case'].includes(kind) && nm && !Number.isInteger(v);
    if (!a[0] || !['coin', 'gift', 'case'].includes(kind) || (!byName && (!Number.isInteger(v) || v < 0)) || (kind === 'coin' && (v < 1 || v > 1e6))) return say('Формат: /give @ник|id coin|gift|case число или название\nПримеры: /give @nick coin 1000, /give @nick gift Plush Pepe');
    if (!f) return say('Игрок не найден. Он должен хотя бы раз написать боту или открыть игру.');
    (db.grants[f.id] = db.grants[f.id] || []).push(byName ? [kind === 'gift' ? 'gn' : 'cn', nm] : [kind, v]); saveDb();
    const what = kind === 'coin' ? v + ' GRADE' : byName ? (kind === 'gift' ? 'подарок ' : 'кейс ') + nm : (kind === 'gift' ? 'подарок №' : 'кейс №') + v;
    tg('sendMessage', { chat_id: f.id, text: '🎁 Вам начислено от администрации: ' + what + '. Откройте игру, начисление придёт само.' });
    return say('Готово. ' + esc(f.n) + ' (' + f.id + ') получит ' + what + ': сразу, если игра открыта (до 30 сек), или при следующем входе.');
  }
  if (cmd === '/ban' || cmd === '/unban') {
    const f = findUser(a[0]); if (!f) return say('Игрок не найден.');
    if (cmd === '/ban') db.banned[f.id] = 1; else delete db.banned[f.id]; saveDb();
    return say((cmd === '/ban' ? 'Забанен: ' : 'Разбанен: ') + esc(f.n) + ' (' + f.id + ')');
  }
  if (cmd === '/sales') {
    const l = db.sales.slice(-10).reverse().map(x => iso(x.ts) + ' · ' + x.u + ' · ' + x.i + ' · ' + x.st + ' ⭐' + (x.refunded ? ' (возврат)' : '') + '\n<code>' + esc(x.c) + '</code>').join('\n\n');
    return say(l || 'Покупок пока нет.');
  }
  if (cmd === '/refund') {
    if (!a[0] || !a[1]) return say('Формат: /refund id charge_id (из /sales)');
    const r = await tg('refundStarPayment', { user_id: Number(a[0]), telegram_payment_charge_id: a[1] });
    const x = db.sales.find(y => y.c === a[1]); if (r.ok && x) { x.refunded = true; saveDb(); }
    return say(r.ok ? 'Возврат выполнен. То, что игрок получил в игре, само не отзывается.' : 'Ошибка: ' + esc(r.description || r.error));
  }
  if (cmd === '/broadcast') {
    const text = m.text.replace(/^\S+\s*/, ''); if (!text) return say('Формат: /broadcast текст');
    pendingBc[m.from.id] = text;
    return say('Отправить ' + Object.keys(db.users).length + ' игрокам?\n\n' + esc(text) + '\n\nПодтвердить: /yes');
  }
  if (cmd === '/yes') {
    const text = pendingBc[m.from.id]; if (!text) return say('Нечего подтверждать.');
    delete pendingBc[m.from.id]; say('Рассылка началась.');
    (async () => { let ok = 0; for (const id of Object.keys(db.users)) { if (db.banned[id]) continue; const r = await tg('sendMessage', { chat_id: id, text }); if (r.ok) ok++; await new Promise(r2 => setTimeout(r2, 60)); } say('Рассылка завершена. Доставлено: ' + ok + '.'); })();
  }
}

// Приветствие по /start: имя игрока, коротко что в игре и кнопки.
const welcome = (m, firstVisit) => {
  const name = esc(m.from && m.from.first_name || 'друг'), sup = SUPPORT ? String(SUPPORT).trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '') : '';
  const text = (firstVisit ? '👋 Привет, <b>' + name + '</b>!\n\nДобро пожаловать в <b>NFT GRADE</b>.' : '🔥 С возвращением, <b>' + name + '</b>!\n\n<b>NFT GRADE</b> ждёт тебя.')
    + '\nОткрывай кейсы, выбивай редкие подарки и собирай коллекцию, которой позавидуют все.\n\n'
    + '🎁 Бесплатный подарок каждый день\n'
    + '💎 Улучшай подарки до уникальных NFT\n'
    + '🛒 Маркет: покупай и продавай другим игрокам\n'
    + '🏆 Рейтинг, Battle Pass и награды за задания\n\n'
    + (firstVisit ? 'Стартовые монеты уже на балансе. Жми <b>«Играть»</b> и открывай первый кейс 👇' : 'Жми <b>«Играть»</b> и забирай подарок дня 👇');
  const kb = [[{ text: '🎮 Играть', web_app: { url: PUBLIC_URL } }]];
  if (sup) kb.push([{ text: 'Поддержка', url: 'https://t.me/' + sup }]);
  return tg('sendMessage', { chat_id: m.chat.id, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: kb } });
};

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = req.url.split('?')[0];

  // Сам мини-апп: все файлы игры лежат рядом с server.js
  if (req.method === 'GET') {
    const p = url === '/' ? '/index.html' : url;
    // Картинки подарков: /img/<имя>.webp (оптимизированные копии из Image/, см. tools/make_images.py)
    // Модели улучшенных подарков: картинки /img/m/<подарок>/<модель>.webp и анимации /tgs/<подарок>/<модель>.tgs (см. tools/make_models.py)
    if (/^\/(img\/m|tgs)\/[\w\-]+\/[\w\-]+\.(webp|tgs)$/.test(p)) {
      try {
        const data = fs.readFileSync(path.join(__dirname, p));
        res.writeHead(200, { 'Content-Type': p.endsWith('.tgs') ? 'application/octet-stream' : 'image/webp', 'Cache-Control': 'public, max-age=604800' });
        return res.end(data);
      } catch { return send(res, 404, { error: 'not found' }); }
    }
    if (/^\/img\/[\w\-]+\.webp$/.test(p)) {
      try {
        const data = fs.readFileSync(path.join(__dirname, p));
        res.writeHead(200, { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=604800' });
        return res.end(data);
      } catch { return send(res, 404, { error: 'not found' }); }
    }
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
    if (db.banned[user.id]) return send(res, 403, { error: 'banned' }); touch(user);
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
    if (u.callback_query) await A.onCallback(u.callback_query);
    // Команды бота: /start открывает игру, /paysupport нужен для вопросов по оплате
    const m = u.message;
    if (m && m.text && m.chat) {
      const cmd = m.text.split(/[\s@]/)[0], reply = t => tg('sendMessage', { chat_id: m.chat.id, text: t, parse_mode: 'HTML' });
      const firstVisit = !!m.from && !db.users[m.from.id];
      if (m.from) touch(m.from);
      if (m.from && ADMINS.includes(m.from.id) && m.chat.type === 'private' && !m.text.startsWith('/') && A.hasState(m.from.id)) await A.onInput(m);
      if (cmd === '/promo' && m.from) await reply(esc(A.redeem(m.text.split(/\s+/)[1], m.from.id)));
      if (cmd === '/id' && m.from) await tg('sendMessage', { chat_id: m.chat.id, text: 'Ваш Telegram ID: ' + m.from.id });
      if (ADMIN_CMDS.includes(cmd)) {
        if (!m.from || !ADMINS.includes(m.from.id)) await reply('⛔ Эта команда доступна только администраторам.');
        else if (m.chat.type !== 'private') await reply('Админ-команды работают только в личке с ботом.');
        else await admin(m, cmd);
      }
      if (cmd === '/start' && PUBLIC_URL) await welcome(m, firstVisit);
      if (cmd === '/paysupport') await tg('sendMessage', { chat_id: m.chat.id, text: 'Проблема с оплатой? Напишите ' + (SUPPORT || 'в поддержку') + ' и укажите, что покупали и когда.' });
    }
    const sp = u.message && u.message.successful_payment;
    if (sp) {
      const charge = sp.telegram_payment_charge_id;
      if (!db.paid[charge]) { // идемпотентно: повтор апдейта не начислит дважды
        try { const pl = JSON.parse(sp.invoice_payload), it = ITEMS[pl.i];
          if (it && pl.u === u.message.from.id && sp.total_amount === it.st) {
            db.paid[charge] = 1; (db.pending[pl.u] = db.pending[pl.u] || []).push({ item: pl.i, charge });
            db.sales.push({ ts: Date.now(), u: pl.u, i: pl.i, st: it.st, c: charge }); saveDb();
            ADMINS.forEach(a => tg('sendMessage', { chat_id: a, text: 'Покупка: ' + it.title + ', ' + it.st + ' ⭐, игрок ' + pl.u })); }
        } catch {}
      }
    }
    return send(res, 200, {});
  }

  // 3) Клиент забирает подтверждённые покупки
  if (url === '/claim' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    if (db.banned[user.id]) return send(res, 403, { error: 'banned' }); touch(user);
    const list = db.pending[user.id] || [], grants = db.grants[user.id] || []; delete db.pending[user.id]; delete db.grants[user.id]; saveDb();
    return send(res, 200, { items: list.map(x => x.item), grants });
  }
  // 4) Рейтинг. Значения присылает клиент, поэтому они не защищены от подделки: используйте только как соревновательную витрину.
  if (url === '/score' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    if (db.banned[user.id]) return send(res, 403, { error: 'banned' }); touch(user);
    const num = (x, max) => Math.max(0, Math.min(max, Math.floor(Number(x) || 0)));
    const prev = db.scores[user.id];
    if (prev && Date.now() - prev.ts < 5000) return send(res, 200, { ok: true });
    db.scores[user.id] = { n: String(user.username || user.first_name || 'player').slice(0, 24), v: num(b.v, 5e6), l: num(b.l, 200), t: num(b.t, 10000), ts: Date.now() };
    saveDb();
    return send(res, 200, { ok: true });
  }
  // 4b) Лимитированные выпуски: список выпусков (тираж, цена, остаток), занятые номера, покупка. Подробнее в admin.js.
  if (url === '/lim' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    if (db.banned[user.id]) return send(res, 403, { error: 'banned' });
    const dup = A.takeNums(b.take, user.id), out = {};
    if (b.buy) { const r = A.buyEd(String(b.buy).slice(0, 40), user.id); Object.assign(out, r); }
    else if (Array.isArray(b.take) && b.take.length) saveDb();
    return send(res, 200, { ...out, lim: A.limMap(), ed: A.edMap(), dup });
  }
  // 4c) Статус игры: технический перерыв включается в админ-меню бота. Админы заходят и во время перерыва.
  if (url === '/status' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    return send(res, 200, { maint: !!db.maint.on, msg: db.maint.msg || '', admin: !!(user && ADMINS.includes(user.id)) });
  }
  if (url === '/top' && req.method === 'POST') {
    const b = await readBody(req), user = checkInitData(b.initData);
    if (!user) return send(res, 401, { error: 'auth' });
    const key = { 1: 'v', 2: 'l', 3: 't' }[Number(b.m)] || 'v';
    const all = Object.entries(db.scores).filter(([id]) => !db.banned[id]).map(([id, x]) => ({ id, n: x.n, v: x.v, l: x.l, t: x.t })).sort((a, c) => c[key] - a[key]);
    const rank = all.findIndex(x => x.id === String(user.id)) + 1;
    const list = all.slice(0, 30).map(x => ({ n: x.n, v: x.v, l: x.l, t: x.t, me: x.id === String(user.id) }));
    if (rank > 30) { const x = all[rank - 1]; list.push({ n: x.n, v: x.v, l: x.l, t: x.t, me: true }); }
    return send(res, 200, { list, rank });
  }
  send(res, 404, { error: 'not found' });
}).listen(PORT, async () => {
  console.log('listening', PORT);
  if (PUBLIC_URL) console.log('setWebhook:', await tg('setWebhook', { url: PUBLIC_URL + '/bot', secret_token: WEBHOOK_SECRET, allowed_updates: ['message', 'pre_checkout_query', 'callback_query'] }));
});
