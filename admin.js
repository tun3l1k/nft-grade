// Админ-меню бота на кнопках. Подключается из server.js. Node 18+, без зависимостей.
// Открывается командой /admin (или /menu) в личке с ботом, доступно только ADMIN_IDS.
const vm = require('vm'), fs = require('fs'), path = require('path');

module.exports = function (env) {
  const { db, tg, saveDb, ADMINS, PUBLIC_URL, SUPPORT, findUser, esc, iso, spentBy, wipeAll } = env;
  db.ed = db.ed || {}; db.lim = db.lim || {}; db.promos = db.promos || {}; db.maint = db.maint || { on: false, msg: '' }; db.edn = db.edn || 0;

  // ---------- Каталог подарков и кейсов из файлов игры (чтобы админ выбирал названия, а не номера) ----------
  const cat = { gifts: [], cases: [] };
  let TONR = 0.0112;
  try {
    const ctx = { console: { log() {}, warn() {} }, localStorage: { getItem() { return null; }, setItem() {} }, window: {}, document: { getElementById() { return null; } } };
    vm.createContext(ctx);
    for (const f of ['config.js', 'data.js', 'models.js', 'prices.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, { filename: f });
    cat.gifts = ctx.G.map((g, i) => ({ i, name: g[0], emoji: g[1], price: g[3], up: !!g[4], hidden: !!g[6] }));
    cat.cases = ctx.CS.map((c, i) => ({ i, name: c.n, emoji: c.e, price: c.p }));
    if (ctx.TONR) TONR = ctx.TONR;
    cat.gm = ctx.GM || {}; cat.bn = ctx.BN || []; cat.bp = ctx.BP || []; cat.pool = ctx.PPOOL || []; cat.sp = ctx.SP || [];
    const ps = fs.readFileSync(path.join(__dirname, 'profile.js'), 'utf8'), ti = ps.indexOf('var TL=');
    cat.titles = ti < 0 ? [] : [...ps.slice(ti, ps.indexOf('];', ti)).matchAll(/\["([^"]+)","[^"]*",function/g)].map(m => m[1]);
  } catch (e) { console.warn('Каталог не загружен, названия подарков не проверяются:', e.message); }
  // узор у подарка зависит от редкости узора (0..4): те же формулы, что в игре (PP в shop.js)
  const patName = (g, i) => { const N = cat.pool.length; return N ? cat.pool[(((g * 5 + 1) % N) + [7, 11, 13, 17, 19, 23, 29][g % 7] * i) % N][0] : 'Узор ' + (i + 1); };
  const giftByName = n => cat.gifts.find(g => g.name.toLowerCase() === String(n).trim().toLowerCase());
  const search = (list, q) => { q = String(q).trim().toLowerCase(); if (!q) return []; const ex = list.filter(x => x.name.toLowerCase() === q); return ex.length ? ex : list.filter(x => x.name.toLowerCase().includes(q)).slice(0, 8); };

  const fmt = n => Math.round(n).toLocaleString('ru-RU');
  const tn = u => { const t = u * TONR; return (t >= 100 ? Math.round(t).toLocaleString('ru-RU') : t >= 10 ? t.toFixed(1) : t.toFixed(2)).replace(/\.0+$|(\.\d)0$/, '$1') + ' TON'; };
  const tnIn = s => { const t = Number(String(s).replace(/\s/g, '').replace(',', '.')); if (!isFinite(t) || t <= 0) return null; return Math.max(1, Math.round(t / TONR)); };
  const ST = {};            // состояние диалога по id админа: что бот сейчас ждёт текстом
  const pendingBc = {};     // рассылка, ожидающая подтверждения
  const audit = (a, t) => { db.audit.push({ ts: Date.now(), a, t: String(t).slice(0, 200) }); db.audit = db.audit.slice(-300); saveDb(); };

  // ---------- Лимитированные выпуски ----------
  const taken = nm => Object.keys(db.lim[nm] || {}).length;
  const edMap = () => { const o = {}; for (const [nm, e] of Object.entries(db.ed)) o[nm] = { total: e.total, price: e.price, on: !!e.on, taken: taken(nm) }; return o; };
  const limMap = () => { const o = {}; for (const [k, v] of Object.entries(db.lim)) o[k] = Object.keys(v).map(Number); return o; };
  const freeNum = nm => { const e = db.ed[nm], used = db.lim[nm] || {}, fr = []; for (let i = 1; i <= e.total; i++) if (!used[i]) fr.push(i); return fr.length ? fr[Math.floor(Math.random() * fr.length)] : 0; };
  // Покупка выпуска игроком: сервер резервирует свободный номер. Подарок игрок получает неулучшенным, номер закреплён за ним.
  const buyEd = (nm, uid) => {
    const e = db.ed[nm]; if (!e || !e.on) return { error: 'off' };
    const n = freeNum(nm); if (!n) return { sold: 1 };
    (db.lim[nm] = db.lim[nm] || {})[n] = uid; saveDb();
    return { bought: { n, price: e.price } };
  };
  const takeNums = (take, uid) => { const dup = []; (Array.isArray(take) ? take.slice(0, 50) : []).forEach(t => {
    const nm = String(t && t[0] || '').slice(0, 40), n = Math.floor(Number(t && t[1])), e = db.ed[nm];
    if (!e || !(n >= 1 && n <= e.total)) return;
    const o = db.lim[nm] = db.lim[nm] || {};
    if (o[n] && o[n] !== uid) dup.push([nm, n]); else o[n] = uid;
  }); return dup; };

  // ---------- Промокоды ----------
  const redeem = (code, uid) => {
    const p = db.promos[String(code || '').toUpperCase()];
    if (!p) return 'Такого промокода нет.';
    if (p.used && p.used[uid]) return 'Вы уже активировали этот промокод.';
    if (p.left <= 0) return 'Промокод закончился.';
    p.left--; (p.used = p.used || {})[uid] = 1; (db.grants[uid] = db.grants[uid] || []).push(['coin', p.coin]); saveDb();
    return '🎟 Промокод принят: +' + tn(p.coin) + '. Откройте игру, начисление придёт само.';
  };

  // ---------- Вспомогательное ----------
  const grant = (uid, g, what) => { (db.grants[uid] = db.grants[uid] || []).push(g); saveDb(); tg('sendMessage', { chat_id: uid, text: '🎁 Вам начислено от администрации: ' + what + '. Откройте игру, начисление придёт само.' }); };
  const kbPlay = PUBLIC_URL ? [[{ text: '🎮 Играть', web_app: { url: PUBLIC_URL } }]] : [];
  const broadcast = async (adminChat, text, withPlay) => {
    let ok = 0; tg('sendMessage', { chat_id: adminChat, text: 'Рассылка началась.' });
    for (const id of Object.keys(db.users)) { if (db.banned[id]) continue; const r = await tg('sendMessage', { chat_id: id, text, parse_mode: 'HTML', ...(withPlay && kbPlay.length ? { reply_markup: { inline_keyboard: kbPlay } } : {}) }); if (r.ok) ok++; await new Promise(r2 => setTimeout(r2, 60)); }
    tg('sendMessage', { chat_id: adminChat, text: 'Рассылка завершена. Доставлено: ' + ok + '.' });
  };
  const B = (text, d) => ({ text, callback_data: d });
  const back = (to = 'main') => [B('‹ Назад', 'a:' + to)];

  // ---------- Экраны ----------
  const screens = {
    main: () => ({ text: '<b>Админ-меню NFT GRADE</b>\nВыберите раздел.', kb: [
      [B('📊 Статистика', 'a:stats'), B('👥 Игроки', 'a:pl')],
      [B('💎 Лимитки', 'a:l'), B('🎁 Выдать игроку', 'a:g')],
      [B('📣 Рассылка', 'a:b'), B('🎟 Промокоды', 'a:c')],
      [B('🛠 Техперерыв', 'a:m'), B('📜 Журнал', 'a:j')],
      [B('🔄 Обновление игры (сброс прогресса)', 'a:wp')],
    ].concat(kbPlay) }),

    wp: () => ({ text: '<b>🔄 Обновление игры</b>\n\n⚠️ Это <b>удалит прогресс у ВСЕХ игроков</b>: баланс, подарки, NFT, маркет, рейтинг и занятые номера лимиток. Облачные сохранения будут стёрты, а при следующем входе игроков их локальный прогресс тоже обнулится.\n\nНе затрагиваются: покупки, баны, промокоды, выпуски лимиток (тираж освободится), журнал.\nИгроков сейчас: ' + Object.keys(db.users).length + '.\n\nОтменить это действие нельзя.', kb: [[B('Продолжить', 'a:wp2')], back()] }),
    tt: id => ({ text: '<b>🏷 Выдать титул</b>\nИгрок ' + id + ' сможет выбрать его в профиле. Выберите титул:', kb: cat.titles.map((t, i) => [B(t, 'a:ttp:' + id + ':' + i)]).concat([back('pu:' + id)]) }),
    stats: () => {
      const now = Date.now(), us = Object.values(db.users), act = d => us.filter(x => now - x.l < d * 864e5).length;
      const rev = db.sales.filter(x => !x.refunded).reduce((t, x) => t + x.st, 0);
      const top = Object.values(db.scores).sort((p, q) => q.v - p.v).slice(0, 3).map(x => esc(x.n) + ' ' + tn(x.v)).join(', ') || '-';
      const eds = Object.keys(db.ed).length, sold = Object.keys(db.ed).reduce((s, n) => s + taken(n), 0);
      return { text: '<b>📊 Статистика</b>\nИгроков: ' + us.length + '\nАктивны за 24 ч: ' + act(1) + ', за 7 дней: ' + act(7) + '\nПокупок: ' + db.sales.length + ', выручка: ' + rev + ' ⭐\nЗабанено: ' + Object.keys(db.banned).length + '\nЛимиток: ' + eds + ', выпущено номеров: ' + sold + '\nТоп по коллекции: ' + top, kb: [[B('↻ Обновить', 'a:stats')], back()] };
    },
    pl: () => ({ text: '<b>👥 Игроки</b>', kb: [[B('🔎 Найти игрока', 'a:pfind')], [B('🏆 Топ-10 по коллекции', 'a:ptop'), B('🚫 Бан-лист', 'a:pban')], back()] }),
    ptop: () => ({ text: '<b>🏆 Топ-10 по коллекции</b>\n' + (Object.entries(db.scores).sort((p, q) => q[1].v - p[1].v).slice(0, 10).map(([id, x], i) => (i + 1) + '. ' + esc(x.n) + ' · ' + tn(x.v) + ' · <code>' + id + '</code>').join('\n') || 'Пока пусто.'), kb: [back('pl')] }),
    pban: () => ({ text: '<b>🚫 Бан-лист</b>\n' + (Object.keys(db.banned).map(id => '<code>' + id + '</code> ' + esc((db.users[id] || {}).n || '')).join('\n') || 'Пусто.'), kb: [back('pl')] }),
    pu: id => {
      const f = db.users[id]; if (!f) return { text: 'Игрок не найден.', kb: [back('pl')] };
      const sc = db.scores[id] || {};
      return { text: '<b>' + esc(f.n) + '</b> @' + esc(f.u || '-') + '\nID: <code>' + id + '</code>\nВпервые: ' + iso(f.f) + '\nПоследний вход: ' + iso(f.l) + '\nПотратил: ' + spentBy(id) + ' ⭐\nКоллекция: ' + (sc.v ?? '-') + ', уровень ' + (sc.l ?? '-') + '\nБан: ' + (db.banned[id] ? 'да' : 'нет'),
        kb: [[B('💰 Монеты', 'a:gc:' + id), B('🎁 Подарок', 'a:gg:' + id)], [B('📦 Кейс', 'a:gk:' + id), B('💎 Лимитка', 'a:gl:' + id)], [B('🎨 NFT с параметрами', 'a:glm:n:' + id + ':0'), B('🏷 Титул', 'a:tt:' + id)], [B('✉️ Написать', 'a:gm:' + id), B(db.banned[id] ? '✅ Разбанить' : '🚫 Забанить', 'a:gb:' + id)], back('pl')] };
    },
    l: () => {
      const rows = Object.entries(db.ed).sort((a, b) => a[1].id - b[1].id).map(([nm, e]) => [B((e.on ? '▶ ' : '⏸ ') + nm + ' · ' + taken(nm) + '/' + e.total + ' · ' + tn(e.price), 'a:le:' + e.id)]);
      return { text: '<b>💎 Лимитированные выпуски</b>\nПродаются во вкладке «Лимитки» маркета как обычные неулучшенные подарки с закреплённым номером. Номер выдаётся один раз на всех игроков.\n' + (rows.length ? '' : '\nПока ни одного выпуска.'), kb: rows.concat([[B('➕ Новый выпуск', 'a:ln')], back()]) };
    },
    le: id => {
      const nm = Object.keys(db.ed).find(n => db.ed[n].id == id); if (!nm) return { text: 'Выпуск не найден.', kb: [back('l')] };
      const e = db.ed[nm], t = taken(nm);
      return { text: '💎 <b>' + esc(nm) + '</b>\nТираж: ' + fmt(e.total) + '\nВыпущено: ' + fmt(t) + ' · осталось ' + fmt(e.total - t) + '\nЦена: ' + tn(e.price) + '\nСтатус: ' + (e.on ? '▶ в продаже' : '⏸ на паузе') + '\nСоздан: ' + iso(e.ts),
        kb: [[B('💰 Цена', 'a:lp:' + id), B('📦 Тираж', 'a:lt:' + id)], [B(e.on ? '⏸ Пауза' : '▶ В продажу', 'a:lo:' + id), B('📣 Объявить', 'a:la:' + id)], [t ? B('🗑 Удалить (нельзя: есть проданные)', 'a:l') : B('🗑 Удалить', 'a:ld:' + id)], back('l')] };
    },
    m: () => ({ text: '<b>🛠 Технический перерыв</b>\nСтатус: ' + (db.maint.on ? '🔴 включён' : '🟢 выключен') + '\nТекст для игроков: ' + esc(db.maint.msg || 'Мы обновляем игру. Скоро вернёмся.') + '\n\nАдминистраторы заходят в игру и во время перерыва.', kb: [[B(db.maint.on ? '🟢 Выключить' : '🔴 Включить', 'a:mt')], [B('✏️ Изменить текст', 'a:mm')], back()] }),
    c: () => {
      const rows = Object.entries(db.promos).map(([code, p]) => [B('🎟 ' + code + ' · +' + tn(p.coin) + ' · осталось ' + p.left, 'a:cd:' + code)]);
      return { text: '<b>🎟 Промокоды</b>\nИгрок вводит <code>/promo КОД</code> в боте и получает монеты. Нажмите на промокод, чтобы удалить.', kb: rows.concat([[B('➕ Создать', 'a:cn')], back()]) };
    },
    j: () => ({ text: '<b>📜 Журнал действий</b>\n' + (db.audit.slice(-10).reverse().map(x => iso(x.ts).slice(5) + ' · ' + x.a + ' · ' + esc(x.t)).join('\n') || 'Пусто.'), kb: [back()] }),
  };

  // Показать экран: правим сообщение с кнопкой, а после текстового ответа шлём новое
  const show = async (ctx, s) => {
    const body = { chat_id: ctx.chat, text: s.text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: s.kb || [] } };
    if (ctx.msg) { const r = await tg('editMessageText', { ...body, message_id: ctx.msg }); if (r.ok || /not modified/.test(r.description || '')) return; }
    return tg('sendMessage', body);
  };
  const ask = async (ctx, uid, st, text) => { ST[uid] = st; return show(ctx, { text, kb: [[B('✖ Отмена', 'a:x')]] }); };
  const pickGift = (q) => { const r = search(cat.gifts.filter(g => g.up && !g.hidden), q); return r; };

  // ---------- Нажатия кнопок ----------
  async function onCallback(cq) {
    const uid = cq.from.id, chat = cq.message && cq.message.chat && cq.message.chat.id;
    if (!ADMINS.includes(uid) || !cq.message || cq.message.chat.type !== 'private') return tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Только для администраторов', show_alert: true });
    tg('answerCallbackQuery', { callback_query_id: cq.id });
    const ctx = { chat, msg: cq.message.message_id }, d = String(cq.data || '').split(':'); d.shift(); const act = d[0], arg = d[1], arg2 = d[2];
    if (act !== 'x') delete ST[uid]; else { delete ST[uid]; return show(ctx, screens.main()); }
    const S = screens;
    if (S[act] && !['pu', 'le'].includes(act)) return show(ctx, S[act]());
    if (act === 'pu') return show(ctx, S.pu(arg));
    if (act === 'le') return show(ctx, S.le(arg));
    if (act === 'pfind' || act === 'g') return ask(ctx, uid, { a: 'find' }, 'Пришлите @ник или числовой ID игрока.\nИгрок должен хотя бы раз открыть бота или игру.');
    if (act === 'gb') { if (db.banned[arg]) delete db.banned[arg]; else db.banned[arg] = 1; audit(uid, 'ban toggle ' + arg); return show(ctx, S.pu(arg)); }
    if (act === 'gc') return ask(ctx, uid, { a: 'coin', u: arg }, 'Сколько TON начислить? Например 5 или 0.5.');
    if (act === 'gg') return ask(ctx, uid, { a: 'gift', u: arg }, 'Название подарка (можно часть названия), например: Plush Pepe');
    if (act === 'gk') return ask(ctx, uid, { a: 'case', u: arg }, 'Название кейса (можно часть названия), например: Diamond');
    if (act === 'gm') return ask(ctx, uid, { a: 'msg', u: arg }, 'Текст сообщения игроку:');
    if (act === 'gl') { const rows = Object.entries(db.ed).map(([nm, e]) => [B(nm + ' · ' + taken(nm) + '/' + e.total, 'a:gL:' + arg + ':' + e.id)]); return show(ctx, { text: 'Какую лимитку выдать? Номер выберется случайный из свободных, он закрепится за игроком.', kb: rows.concat([back('pu:' + arg)]) }); }
    if (act === 'gL') {
      const nm = Object.keys(db.ed).find(n => db.ed[n].id == arg2); if (!nm) return show(ctx, { text: 'Выпуск не найден.', kb: [back('pl')] });
      const n = freeNum(nm); if (!n) return show(ctx, { text: 'Тираж «' + esc(nm) + '» полностью выпущен.', kb: [back('pu:' + arg)] });
      (db.lim[nm] = db.lim[nm] || {})[n] = Number(arg); grant(arg, ['lim', nm, n], nm + ' · лимитка #' + n); audit(uid, 'give lim ' + nm + ' #' + n + ' -> ' + arg);
      return show(ctx, { text: '✅ Выдано: ' + esc(nm) + ' · лимитка #' + n + ' игроку ' + arg + '.', kb: [back('pu:' + arg)] });
    }
    if (act === 'gp') { const g = cat.gifts[arg2]; if (!g) return; grant(arg, ['gn', g.name], g.name); audit(uid, 'give gift ' + g.name + ' -> ' + arg); return show(ctx, { text: '✅ Выдан подарок «' + esc(g.name) + '» игроку ' + arg + '.', kb: [back('pu:' + arg)] }); }
    if (act === 'gq') { const c = cat.cases[arg2]; if (!c) return; grant(arg, ['cn', c.name], 'кейс «' + c.name + '»'); audit(uid, 'give case ' + c.name + ' -> ' + arg); return show(ctx, { text: '✅ Выдан кейс «' + esc(c.name) + '» игроку ' + arg + '.', kb: [back('pu:' + arg)] }); }
    // лимитки
    if (act === 'ln') return ask(ctx, uid, { a: 'newname' }, 'Какой подарок выпускаем? Название (можно часть), например: Plush Pepe\nПодойдут только подарки, которые можно улучшить.');
    if (act === 'lp') return ask(ctx, uid, { a: 'price', id: arg }, 'Новая цена в TON (например 12.5):');
    if (act === 'lt') return ask(ctx, uid, { a: 'total', id: arg }, 'Новый тираж (число). Меньше уже выпущенного поставить нельзя.');
    if (act === 'lo') { const nm = Object.keys(db.ed).find(n => db.ed[n].id == arg); if (nm) { db.ed[nm].on = !db.ed[nm].on; audit(uid, 'edition ' + nm + (db.ed[nm].on ? ' on' : ' off')); } return show(ctx, S.le(arg)); }
    if (act === 'ld') { const nm = Object.keys(db.ed).find(n => db.ed[n].id == arg); if (nm && !taken(nm)) { delete db.ed[nm]; delete db.lim[nm]; audit(uid, 'edition delete ' + nm); } return show(ctx, S.l()); }
    if (act === 'la') {
      const nm = Object.keys(db.ed).find(n => db.ed[n].id == arg); if (!nm) return; const e = db.ed[nm];
      pendingBc[uid] = { text: '💎 <b>Новый лимитированный выпуск!</b>\n\n' + esc(nm) + '\nТираж: ' + fmt(e.total) + '\nЦена: ' + tn(e.price) + '\n\nУспей купить во вкладке «Лимитки» на маркете. Номер получишь уникальный, когда улучшишь подарок.', play: true };
      return show(ctx, { text: 'Отправить объявление ' + Object.keys(db.users).length + ' игрокам?\n\n' + pendingBc[uid].text, kb: [[B('✅ Отправить', 'a:bgo'), B('✖ Отмена', 'a:x')]] });
    }
    // рассылка
    if (act === 'b') return ask(ctx, uid, { a: 'bc' }, 'Текст рассылки (можно <b>жирный</b> и <i>курсив</i> HTML):');
    if (act === 'bgo') { const p = pendingBc[uid]; if (!p) return show(ctx, { text: 'Нечего отправлять.', kb: [back()] }); delete pendingBc[uid]; audit(uid, 'broadcast'); broadcast(chat, p.text, p.play); return show(ctx, { text: 'Рассылка запущена.', kb: [back()] }); }
    // промокоды
    if (act === 'cn') return ask(ctx, uid, { a: 'pcode' }, 'Код промокода: латиница и цифры, 3–20 символов, например SPRING100');
    if (act === 'cd') { delete db.promos[arg]; audit(uid, 'promo delete ' + arg); return show(ctx, S.c()); }
    // техперерыв
    if (act === 'mt') { db.maint.on = !db.maint.on; audit(uid, 'maint ' + db.maint.on); return show(ctx, S.m()); }
    if (act === 'mm') return ask(ctx, uid, { a: 'mmsg' }, 'Текст, который увидят игроки во время перерыва:');
    return show(ctx, S.main());
  }

  // ---------- Текстовые ответы на вопросы бота ----------
  async function onInput(m) {
    const uid = m.from.id, st = ST[uid], txt = m.text.trim(), ctx = { chat: m.chat.id };
    if (!st) return false;
    const num = (lo, hi) => { const v = Number(txt.replace(/\s/g, '')); return Number.isInteger(v) && v >= lo && v <= hi ? v : null; };
    const again = t => show(ctx, { text: t, kb: [[B('✖ Отмена', 'a:x')]] });
    if (st.a === 'wipeconf') {
      delete ST[uid];
      if (txt !== 'СБРОС') { await show(ctx, { text: 'Сброс отменён.', kb: [back()] }); return true; }
      const w = wipeAll(); audit(uid, 'WIPE ALL id ' + w.id);
      await show(ctx, { text: '✅ Прогресс у всех игроков сброшен. Id сброса: <code>' + w.id + '</code>. При следующем входе игроки начнут с нуля. Рассылкой можно предупредить об обновлении.', kb: [[B('📣 Рассылка', 'a:b')], back()] }); return true;
    }
    if (st.a === 'gsearch') {
      const pool = giftPool(st.mode).filter(g => g.name.toLowerCase().includes(txt.toLowerCase()));
      if (!pool.length) return again('Ничего не найдено. Попробуйте другую часть названия или нажмите «Отмена».'), true;
      delete ST[uid]; await show(ctx, giftList(st.mode, st.u, 0, pool.slice(0, 40))); return true;
    }
    if (st.a === 'nbnum') {
      const v = num(0, 100000); if (v === null) return again('Нужно целое число от 0 до 100 000 (0 = случайный).'), true;
      delete ST[uid]; if (NB[uid]) NB[uid].n = v; await show(ctx, nbScreen(uid)); return true;
    }
    if (st.a === 'find') {
      const f = findUser(txt); if (!f) return again('Игрок не найден. Он должен хотя бы раз открыть бота или игру. Пришлите ещё раз или отмените.'), true;
      delete ST[uid]; await show(ctx, screens.pu(f.id)); return true;
    }
    if (st.a === 'coin') { const v = tnIn(txt); if (!v || v > 1e8) return again('Нужно число TON, например 5 или 0.5.'), true; delete ST[uid]; grant(st.u, ['coin', v], tn(v)); audit(uid, 'give coin ' + v + ' -> ' + st.u); await show(ctx, { text: '✅ Начислено ' + tn(v) + ' игроку ' + st.u + '.', kb: [back('pu:' + st.u)] }); return true; }
    if (st.a === 'gift' || st.a === 'case') {
      const isG = st.a === 'gift', r = isG ? search(cat.gifts.filter(g => !g.hidden), txt) : search(cat.cases, txt);
      if (!r.length) return again('Не нашёл. Попробуйте другое название или отмените.'), true;
      delete ST[uid]; await show(ctx, { text: 'Выберите:', kb: r.map(x => [B(x.emoji + ' ' + x.name, (isG ? 'a:gp:' : 'a:gq:') + st.u + ':' + x.i)]).concat([back('pu:' + st.u)]) }); return true;
    }
    if (st.a === 'msg') { delete ST[uid]; const r = await tg('sendMessage', { chat_id: st.u, text: txt }); await show(ctx, { text: r.ok ? '✅ Отправлено.' : 'Не доставлено: ' + esc(r.description || ''), kb: [back('pu:' + st.u)] }); return true; }
    if (st.a === 'bc') { pendingBc[uid] = { text: txt }; delete ST[uid]; await show(ctx, { text: 'Отправить ' + Object.keys(db.users).length + ' игрокам?\n\n' + txt, kb: [[B('✅ Отправить', 'a:bgo'), B('✖ Отмена', 'a:x')]] }); return true; }
    if (st.a === 'mmsg') { db.maint.msg = txt.slice(0, 300); delete ST[uid]; audit(uid, 'maint msg'); await show(ctx, screens.m()); return true; }
    if (st.a === 'newname') {
      const r = pickGift(txt); if (!r.length) return again('Не нашёл подходящий подарок (нужен такой, что можно улучшить). Попробуйте другое название.'), true;
      delete ST[uid]; await show(ctx, { text: 'Выберите подарок:', kb: r.map(x => [B(x.emoji + ' ' + x.name + ' · база ' + tn(x.price), 'a:np:' + x.i)]).concat([[B('✖ Отмена', 'a:x')]]) }); return true;
    }
    if (st.a === 'newtotal') { const v = num(1, 100000); if (!v) return again('Тираж: число от 1 до 100 000.'), true; const t = taken(st.name); if (v < t) return again('Уже выпущено ' + t + ', тираж не может быть меньше.'), true; ST[uid] = { a: 'newprice', name: st.name, total: v, base: st.base }; await show(ctx, { text: 'Цена одного подарка в TON.\nБаза подарка: ' + tn(st.base) + '. Подсказка: ' + tn(st.base * 1.15) + ' (база +15%).', kb: [[B('✖ Отмена', 'a:x')]] }); return true; }
    if (st.a === 'newprice') {
      const v = tnIn(txt); if (!v) return again('Цена: число TON, например 12.5.'), true; delete ST[uid];
      const id = ++db.edn; db.ed[st.name] = { id, total: st.total, price: v, on: true, ts: Date.now() }; audit(uid, 'edition create ' + st.name + ' x' + st.total + ' @' + v);
      await show(ctx, { text: '✅ Выпуск создан и уже в продаже: <b>' + esc(st.name) + '</b>, тираж ' + fmt(st.total) + ', цена ' + tn(v) + '.', kb: [[B('📣 Объявить игрокам', 'a:la:' + id)], [B('Открыть выпуск', 'a:le:' + id)], back('l')] }); return true;
    }
    if (st.a === 'price') { const v = tnIn(txt); if (!v) return again('Цена: число TON, например 12.5.'), true; const nm = Object.keys(db.ed).find(n => db.ed[n].id == st.id); if (nm) { db.ed[nm].price = v; audit(uid, 'edition price ' + nm + ' ' + v); } delete ST[uid]; await show(ctx, screens.le(st.id)); return true; }
    if (st.a === 'total') { const nm = Object.keys(db.ed).find(n => db.ed[n].id == st.id), v = num(1, 100000); if (!nm || !v) return again('Тираж: число от 1 до 100 000.'), true; if (v < taken(nm)) return again('Уже выпущено ' + taken(nm) + ', тираж не может быть меньше.'), true; db.ed[nm].total = v; audit(uid, 'edition total ' + nm + ' ' + v); delete ST[uid]; await show(ctx, screens.le(st.id)); return true; }
    if (st.a === 'pcode') { const c = txt.toUpperCase(); if (!/^[A-Z0-9_]{3,20}$/.test(c)) return again('Код: латиница, цифры и _, 3–20 символов.'), true; if (db.promos[c]) return again('Такой код уже есть.'), true; ST[uid] = { a: 'pcoin', code: c }; await show(ctx, { text: 'Сколько TON даёт код? Например 2 или 0.5.', kb: [[B('✖ Отмена', 'a:x')]] }); return true; }
    if (st.a === 'pcoin') { const v = tnIn(txt); if (!v) return again('Число TON, например 2 или 0.5.'), true; ST[uid] = { a: 'puses', code: st.code, coin: v }; await show(ctx, { text: 'Сколько раз можно активировать (всего игроков)?', kb: [[B('✖ Отмена', 'a:x')]] }); return true; }
    if (st.a === 'puses') { const v = num(1, 1e6); if (!v) return again('Число от 1.'), true; db.promos[st.code] = { coin: st.coin, left: v, used: {}, ts: Date.now() }; audit(uid, 'promo create ' + st.code); delete ST[uid]; await show(ctx, { text: '✅ Промокод <code>' + st.code + '</code>: +' + tn(st.coin) + ', активаций ' + fmt(v) + '. Игроки вводят: /promo ' + st.code, kb: [back('c')] }); return true; }
    return false;
  }

  // ---------- Списки подарков (режимы: e = новый лимитированный выпуск, g = обычный подарок, n = NFT с параметрами) ----------
  const NB = {}; // конструктор NFT по id админа
  const GP = 8;
  const giftPool = mode => cat.gifts.filter(g => !g.hidden && (mode === 'g' || g.up) && !(mode === 'e' && db.ed[g.name]));
  const modeTitle = { e: '💎 Какой подарок выпускаем ограниченным тиражом?', g: '🎁 Какой подарок выдать?', n: '🎨 Для какого подарка собрать NFT?' };
  const modeCb = (mode, uid, g) => mode === 'e' ? 'a:np:' + g.i : mode === 'g' ? 'a:gp:' + uid + ':' + g.i : 'a:nbg:' + uid + ':' + g.i;
  const giftList = (mode, uid, page, pool) => {
    pool = pool || giftPool(mode); const pages = Math.max(1, Math.ceil(pool.length / GP)); page = Math.max(0, Math.min(page, pages - 1));
    const rows = pool.slice(page * GP, page * GP + GP).map(g => [B(g.emoji + ' ' + g.name + ' · ' + tn(g.price) + (mode === 'e' ? '' : '') + (db.ed[g.name] ? ' 💎' : ''), modeCb(mode, uid, g))]);
    const nav = []; if (page > 0) nav.push(B('‹', 'a:glm:' + mode + ':' + uid + ':' + (page - 1))); nav.push(B((page + 1) + '/' + pages, 'a:noop')); if (page < pages - 1) nav.push(B('›', 'a:glm:' + mode + ':' + uid + ':' + (page + 1)));
    return { text: '<b>' + modeTitle[mode] + '</b>\n' + (mode === 'e' ? 'Показаны подарки, которые можно улучшить и у которых ещё нет выпуска. 💎 помечены те, у кого выпуск уже есть.\n' : '') + 'Всего: ' + pool.length, kb: rows.concat([nav, [B('🔎 Искать по названию', 'a:gls:' + mode + ':' + uid)], back(mode === 'e' ? 'l' : 'pu:' + uid)]) };
  };
  const nbScreen = uid => {
    const s = NB[uid]; if (!s) return { text: 'Сессия истекла, начните заново.', kb: [back()] };
    const g = cat.gifts[s.gi], q = cat.gm[g.name];
    return { text: '<b>🎨 NFT для игрока ' + s.u + '</b>\nПодарок: <b>' + esc(g.name) + '</b>\n\nМодель: ' + (!q ? 'по редкости (у подарка нет моделей)' : s.mo === -2 ? '🎲 случайная' : esc(q.m[s.mo][0])) + '\nФон: ' + (s.b < 0 ? '🎲 случайный' : esc(cat.bn[s.b])) + '\nУзор: ' + (s.s < 0 ? '🎲 случайный' : esc(patName(s.gi, s.s))) + '\nНомер: ' + (s.n ? '#' + s.n : '🎲 случайный') + '\n\nВыберите, что задать. Что не задано, выпадет случайно, как при обычном улучшении.',
      kb: [[B('Модель', 'a:nbm:0'), B('Фон', 'a:nbb:0')], [B('Узор', 'a:nbs'), B('Номер', 'a:nbn')], [B('🎲 Всё случайно', 'a:nbr'), B('✅ Выдать', 'a:nbgo')], back('pu:' + s.u)] };
  };
  const pageNav = (act, page, pages) => { const nav = []; if (page > 0) nav.push(B('‹', 'a:' + act + ':' + (page - 1))); nav.push(B((page + 1) + '/' + pages, 'a:noop')); if (page < pages - 1) nav.push(B('›', 'a:' + act + ':' + (page + 1))); return nav; };

  async function onCallbackNew(cq) {
    const d = String(cq.data || '').split(':'); d.shift(); const act = d[0];
    const mine = ['wp', 'wp2', 'glm', 'gls', 'tt', 'ttp', 'nbg', 'nbm', 'nbmp', 'nbb', 'nbbp', 'nbs', 'nbsp', 'nbn', 'nbr', 'nbx', 'nbgo', 'noop', 'ln', 'gg'];
    if (!mine.includes(act)) return null;
    const uid = cq.from.id, chat = cq.message && cq.message.chat && cq.message.chat.id;
    if (!ADMINS.includes(uid) || !cq.message || cq.message.chat.type !== 'private') { tg('answerCallbackQuery', { callback_query_id: cq.id, text: 'Только для администраторов', show_alert: true }); return true; }
    tg('answerCallbackQuery', { callback_query_id: cq.id });
    if (act === 'noop') return true;
    const ctx = { chat, msg: cq.message.message_id };
    delete ST[uid];
    if (act === 'wp') { await show(ctx, screens.wp()); return true; }
    if (act === 'wp2') { await ask(ctx, uid, { a: 'wipeconf' }, '⚠️ Последнее подтверждение. Чтобы удалить прогресс у всех игроков, отправьте слово <b>СБРОС</b> (заглавными). Любой другой текст или кнопка «Отмена» отменят действие.'); return true; }
    if (act === 'ln') { await show(ctx, giftList('e', 0, 0)); return true; }
    if (act === 'gg') { await show(ctx, giftList('g', d[1], 0)); return true; }
    if (act === 'glm') { await show(ctx, giftList(d[1], d[2], Number(d[3]) || 0)); return true; }
    if (act === 'gls') { await ask(ctx, uid, { a: 'gsearch', mode: d[1], u: d[2] }, 'Часть названия подарка (например: pepe):'); return true; }
    if (act === 'tt') { await show(ctx, screens.tt(d[1])); return true; }
    if (act === 'ttp') {
      const t = cat.titles[d[2]]; if (!t) return true;
      grant(d[1], ['ttl', Number(d[2])], 'титул «' + t + '»'); audit(uid, 'give title ' + t + ' -> ' + d[1]);
      await show(ctx, { text: '✅ Титул «' + esc(t) + '» выдан игроку ' + d[1] + '. Он появится в профиле при следующем входе в игру.', kb: [back('pu:' + d[1])] }); return true;
    }
    if (act === 'nbg') {
      const g = cat.gifts[d[2]]; if (!g) return true;
      if (db.ed[g.name]) { await show(ctx, { text: '«' + esc(g.name) + '» сейчас лимитированный подарок. Выдайте его кнопкой «💎 Лимитка» в карточке игрока: номер должен быть уникальным.', kb: [back('pu:' + d[1])] }); return true; }
      NB[uid] = { u: d[1], gi: Number(d[2]), mo: -2, b: -1, s: -1, n: 0 }; await show(ctx, nbScreen(uid)); return true;
    }
    const s = NB[uid]; if (!s) { await show(ctx, { text: 'Сессия сборки истекла, начните заново из карточки игрока.', kb: [back()] }); return true; }
    const g = cat.gifts[s.gi], q = cat.gm[g.name];
    if (act === 'nbx') { await show(ctx, nbScreen(uid)); return true; }
    if (act === 'nbr') { Object.assign(s, { mo: -2, b: -1, s: -1, n: 0 }); await show(ctx, nbScreen(uid)); return true; }
    if (act === 'nbm') {
      if (!q) { await show(ctx, { text: 'У «' + esc(g.name) + '» нет загруженных моделей, модель выпадает по редкости.', kb: [[B('‹ К сборке', 'a:nbx')]] }); return true; }
      const P = 10, pages = Math.ceil(q.m.length / P), pg = Math.max(0, Math.min(Number(d[1]) || 0, pages - 1));
      const rows = q.m.slice(pg * P, pg * P + P).map((m, k) => [B(m[0] + ' · ' + m[1] + '%' + (m[4] > 1.5 ? ' ×' + m[4] : ''), 'a:nbmp:' + (pg * P + k))]);
      await show(ctx, { text: '<b>Модель</b> для ' + esc(g.name), kb: rows.concat([pageNav('nbm', pg, pages), [B('🎲 Случайная', 'a:nbmp:-2')], [B('‹ К сборке', 'a:nbx')]]) }); return true;
    }
    if (act === 'nbmp') { s.mo = Number(d[1]); await show(ctx, nbScreen(uid)); return true; }
    if (act === 'nbb') {
      const P = 12, pages = Math.ceil(cat.bn.length / P), pg = Math.max(0, Math.min(Number(d[1]) || 0, pages - 1));
      const rows = cat.bn.slice(pg * P, pg * P + P).map((n, k) => [B(n + ' · ' + (cat.bp[pg * P + k] || 0).toFixed(2) + '%', 'a:nbbp:' + (pg * P + k))]);
      await show(ctx, { text: '<b>Фон</b> (' + cat.bn.length + ' штук, самые дорогие Black и Onyx Black)', kb: rows.concat([pageNav('nbb', pg, pages), [B('🎲 Случайный', 'a:nbbp:-1')], [B('‹ К сборке', 'a:nbx')]]) }); return true;
    }
    if (act === 'nbbp') { s.b = Number(d[1]); await show(ctx, nbScreen(uid)); return true; }
    if (act === 'nbs') { await show(ctx, { text: '<b>Узор</b> для ' + esc(g.name) + ' (от частого к редкому)', kb: [0, 1, 2, 3, 4].map(i => [B(patName(s.gi, i) + ' · ' + (cat.sp[i] || '') + '%', 'a:nbsp:' + i)]).concat([[B('🎲 Случайный', 'a:nbsp:-1')], [B('‹ К сборке', 'a:nbx')]]) }); return true; }
    if (act === 'nbsp') { s.s = Number(d[1]); await show(ctx, nbScreen(uid)); return true; }
    if (act === 'nbn') { await ask(ctx, uid, { a: 'nbnum' }, 'Номер NFT: число от 1 (меньше номер, дороже). Если больше тиража подарка, игра поставит максимальный. 0 = случайный.'); return true; }
    if (act === 'nbgo') {
      grant(s.u, ['nft', g.name, s.mo, s.b, s.s, s.n], 'NFT «' + g.name + '»'); audit(uid, 'give nft ' + g.name + ' m' + s.mo + ' b' + s.b + ' s' + s.s + ' n' + s.n + ' -> ' + s.u);
      const u = s.u; delete NB[uid]; await show(ctx, { text: '✅ NFT «' + esc(g.name) + '» выдан игроку ' + u + '.', kb: [back('pu:' + u)] }); return true;
    }
    return null;
  }
  // Выбор подарка для нового выпуска приходит кнопкой a:np:<индекс каталога>
  const origCb = onCallback;
  async function onCallback2(cq) {
    const nr = await onCallbackNew(cq); if (nr) return;
    const d = String(cq.data || '').split(':');
    if (d[1] === 'np' && ADMINS.includes(cq.from.id) && cq.message) {
      const g = cat.gifts[d[2]]; tg('answerCallbackQuery', { callback_query_id: cq.id });
      if (!g) return;
      if (db.ed[g.name]) return show({ chat: cq.message.chat.id, msg: cq.message.message_id }, { text: 'Для «' + esc(g.name) + '» выпуск уже есть.', kb: [[B('Открыть', 'a:le:' + db.ed[g.name].id)], back('l')] });
      ST[cq.from.id] = { a: 'newtotal', name: g.name, base: g.price };
      return show({ chat: cq.message.chat.id, msg: cq.message.message_id }, { text: 'Подарок: <b>' + esc(g.name) + '</b>\nТираж (сколько штук всего будет), число от 1 до 100 000:', kb: [[B('✖ Отмена', 'a:x')]] });
    }
    return origCb(cq);
  }

  return { onCallback: onCallback2, onInput, openMenu: m => show({ chat: m.chat.id }, screens.main()), cancel: uid => { delete ST[uid]; }, hasState: uid => !!ST[uid], redeem, buyEd, takeNums, edMap, limMap, grant, cat, giftByName };
};
