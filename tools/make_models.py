#!/usr/bin/env python3
"""Собирает данные моделей подарков для игры из папки models/.

В каждой папке models/<Gift>/ лежат:
  config.json   список моделей коллекции: name, rarity_permille (на самом деле проценты, сумма около 100)
  <name>.webp   картинка модели          (по ней строится NFT в игре)
  <name>.tgs    анимация модели (Telegram-стикер, это gzip-файл Lottie)
  prices.json   (не везде) реальные цены моделей в TON: {"models": {"Имя": цена}}

Что делает скрипт:
  1. сопоставляет папку с подарком игры (по названию, без учёта регистра и знаков);
  2. берёт только модели, для которых есть файл (картинка или анимация);
  3. считает множитель цены модели: чем дороже модель на рынке (prices.json) или чем она реже
     (если цен нет), тем выше множитель. Среднее по коллекции не выше 1.16, как у обычной
     системы редкости, поэтому экономика игры не ломается;
  4. пишет models.js (данные) и вставляет его в index.html между метками.

Запуск из корня проекта: python3 tools/make_models.py
Нужен node (читает названия подарков из data.js). После запуска перезапустите сервер.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, 'models')
E0 = 1.16        # средний множитель модели в обычной системе (MP и PRM.m в игре)
REL_CAP = 12.0   # потолок относительной цены модели


def norm(s):
    return re.sub(r'[^a-z0-9]', '', str(s).lower().replace('’', '').replace("'", ''))


def title(name):
    return ' '.join(w[:1].upper() + w[1:] for w in str(name).replace('_', ' ').split())


def game_gifts():
    js = ("const vm=require('vm'),fs=require('fs');const ctx={console,localStorage:{getItem(){return null},setItem(){}},window:{},document:{getElementById(){return null}}};"
          "vm.createContext(ctx);for(const f of ['config.js','data.js','prices.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);"
          "console.log(JSON.stringify(ctx.G.map(g=>g[0])))")
    out = subprocess.run(['node', '-e', js], cwd=ROOT, capture_output=True, text=True)
    if out.returncode:
        sys.exit('Не удалось прочитать data.js: ' + out.stderr[:300])
    return json.loads(out.stdout)


def mean_mult(items, a):
    return sum(w * (1 + a * (rel - 1)) for w, rel in items) / sum(w for w, _ in items)


def main():
    gifts = game_gifts()
    gnorm = {norm(g): g for g in gifts}
    result, report = {}, []
    for d in sorted(os.listdir(MODELS)):
        p = os.path.join(MODELS, d)
        cfg = os.path.join(p, 'config.json')
        if not os.path.isdir(p) or not os.path.exists(cfg):
            report.append((d, 'нет config.json, пропущена (папка ещё пустая?)'))
            continue
        gift = gnorm.get(norm(d))
        if not gift:
            report.append((d, 'в игре нет подарка с таким названием, пропущена'))
            continue
        conf = json.load(open(cfg, encoding='utf8'))
        files = set(os.listdir(p))
        prices = {}
        pj = os.path.join(p, 'prices.json')
        if os.path.exists(pj):
            for k, v in json.load(open(pj, encoding='utf8')).get('models', {}).items():
                n = norm(k)
                if n not in prices or '’' in k:
                    prices[n] = (k, v)
        rows = []
        for x in conf:
            nm = x['name']
            fl = (1 if nm + '.webp' in files else 0) | (2 if nm + '.tgs' in files else 0)
            if not fl:
                continue
            pct = float(x.get('rarity_permille', x.get('rarity_percent', 0)))
            pn = prices.get(norm(nm))
            rows.append({'file': nm, 'name': pn[0].replace("'", '’') if pn else title(nm), 'pct': pct, 'fl': fl, 'price': pn[1] if pn else None})
        if not rows:
            report.append((d, 'нет ни одного файла модели'))
            continue
        cov = sum(r['pct'] for r in rows)
        # относительная цена модели: по реальным ценам, иначе по редкости
        have = [r['price'] for r in rows if r['price']]
        if len(have) >= max(3, len(rows) * 0.7):
            base = sorted(have)[len(have) // 4]          # нижняя четверть: цена «обычной» модели
            src = 'цены prices.json'
            for r in rows:
                r['rel'] = min(REL_CAP, max(1.0, (r['price'] or base) / base))
        else:
            med = sorted(r['pct'] for r in rows)[len(rows) // 2]
            src = 'редкость (цен нет)'
            for r in rows:
                r['rel'] = min(REL_CAP, max(1.0, (med / max(r['pct'], 0.05)) ** 0.8))
        items = [(r['pct'], r['rel']) for r in rows]
        a = 1.0
        if mean_mult(items, 1.0) > E0:                   # подбираем силу надбавки, чтобы среднее было E0
            lo, hi = 0.0, 1.0
            for _ in range(40):
                mid = (lo + hi) / 2
                lo, hi = (mid, hi) if mean_mult(items, mid) < E0 else (lo, mid)
            a = lo
        for r in rows:
            r['mult'] = round(1 + a * (r['rel'] - 1), 2)
        slugs = {}
        for r in rows:
            sl = re.sub(r'[^a-z0-9]+', '-', r['file'].lower().replace('’', '').replace("'", '')).strip('-')
            if sl in slugs:
                sys.exit('Одинаковое имя файла после очистки: %s и %s в %s' % (slugs[sl], r['file'], d))
            slugs[sl] = r['file']
        result[gift] = {
            's': re.sub(r'[^a-z0-9]+', '-', gift.lower()).strip('-'), 'd': d, 'c': round(cov, 1),
            'm': [[r['name'], round(r['pct'], 2), r['file'], r['fl'], r['mult']] for r in sorted(rows, key=lambda r: -r['pct'])],
        }
        miss = [x['name'] for x in conf if not ((x['name'] + '.webp') in files or (x['name'] + '.tgs') in files)]
        no_img = [r['file'] for r in rows if not r['fl'] & 1]
        report.append((d, '%s: моделей %d из %d, охват шанса %.0f%%, множитель по: %s, средний множитель %.2f, максимум %.2f%s%s' % (
            gift, len(rows), len(conf), cov, src, mean_mult([(r['pct'], r['mult']) for r in rows], 1.0), max(r['mult'] for r in rows),
            (', нет файлов у: ' + ', '.join(miss[:6]) + ('…' if len(miss) > 6 else '')) if miss else '',
            (', только анимация, без картинки: ' + ', '.join(no_img)) if no_img else '')))

    js = ('/* Модели подарков. Создано tools/make_models.py из папки models/, руками не править.\n'
          '   GM[название подарка] = {s: папка в адресе, d: папка в models/, c: охват шанса в %,\n'
          '   m: [[название, шанс %, имя файла, флаги (1 картинка, 2 анимация), множитель цены]]} */\n'
          'var GM=' + json.dumps(result, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'models.js'), 'w', encoding='utf8').write(js)

    ip = os.path.join(ROOT, 'index.html')
    h = open(ip, encoding='utf8').read()
    block = '<!--models:start--><script>\n' + js + '</script><!--models:end-->'
    if '<!--models:start-->' in h:
        h = re.sub(r'<!--models:start-->.*?<!--models:end-->', lambda m: block, h, flags=re.S)
    else:
        i = h.index('IM["Witch Hat"]=')            # конец блока data.js
        j = h.index('</script>', i) + len('</script>')
        h = h[:j] + '\n' + block + h[j:]
    open(ip, 'w', encoding='utf8').write(h)
    for d, t in report:
        print('%-16s %s' % (d, t))
    print('Готово: models.js (%d КБ), index.html обновлён' % (len(js) // 1024))


if __name__ == '__main__':
    main()
