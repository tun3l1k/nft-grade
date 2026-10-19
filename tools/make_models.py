#!/usr/bin/env python3
"""Собирает модели улучшенных подарков из папки models/ для игры.

Запуск из корня репозитория:  python3 tools/make_models.py

В каждой папке models/<подарок>/ ожидаются:
  config.json   список моделей: name, rarity_permille (на деле проценты, сумма 100) или rarity_percent
  prices.json   (по желанию) рыночные цены: models, backdrops, symbols. Из него берётся цена каждой модели
  <модель>.webp картинка модели (128x128)
  <модель>.tgs  анимация модели (gzip Lottie)
Остальные файлы (creator.txt, mode, empty, 1) служебные, их игнорируем.

Результат:
  img/m/<подарок>/<модель>.webp   картинки, которые показывает игра
  tgs/<подарок>/<модель>.tgs      анимации
  models.js                       данные для игры (подключается после data.js)
Модели без картинки пропускаются. Если у подарка загружены не все модели, остальные шансы
достаются обычным моделям без картинки.
"""
import json, os, re, shutil, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'models')
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())

def slug(s):
    s = s.lower().replace("'", '').replace('’', '')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

# названия подарков из data.js
data = open(os.path.join(ROOT, 'data.js'), encoding='utf8').read()
gifts = {norm(n): n for n in re.findall(r'^IM\["([^"]+)"\]', data, re.M)}

out = {}
for folder in sorted(os.listdir(SRC)):
    d = os.path.join(SRC, folder)
    cfg = os.path.join(d, 'config.json')
    if not os.path.isdir(d) or not os.path.exists(cfg):
        print('пропуск', folder, '(нет config.json)'); continue
    gname = gifts.get(norm(folder))
    if not gname:
        print('пропуск', folder, '(нет такого подарка в data.js)'); continue
    gs = slug(gname)
    files = {os.path.splitext(f)[0]: f for f in os.listdir(d)}
    prices = {}
    pj = os.path.join(d, 'prices.json')
    if os.path.exists(pj):
        prices = {norm(k): v for k, v in json.load(open(pj, encoding='utf8')).get('models', {}).items()}
        shown = {norm(k): k for k in json.load(open(pj, encoding='utf8')).get('models', {})}
    else:
        shown = {}
    med = statistics.median(prices.values()) if prices else 0
    rows = []
    for m in json.load(open(cfg, encoding='utf8')):
        stem = os.path.splitext(os.path.basename(m['webp_path']))[0]
        if stem not in files or stem + '.webp' != files.get(stem, '') and not os.path.exists(os.path.join(d, stem + '.webp')):
            continue
        rar = m.get('rarity_permille', m.get('rarity_percent'))
        ms = slug(stem)
        os.makedirs(os.path.join(ROOT, 'img', 'm', gs), exist_ok=True)
        shutil.copyfile(os.path.join(d, stem + '.webp'), os.path.join(ROOT, 'img', 'm', gs, ms + '.webp'))
        tgs = os.path.join(d, stem + '.tgs')
        has = os.path.exists(tgs)
        if has:
            os.makedirs(os.path.join(ROOT, 'tgs', gs), exist_ok=True)
            shutil.copyfile(tgs, os.path.join(ROOT, 'tgs', gs, ms + '.tgs'))
        key = norm(stem)
        name = shown.get(key) or ' '.join(w.capitalize() for w in stem.replace('_', ' ').split())
        price = prices.get(key)
        rel = round(price / med, 3) if price and med else 1
        rows.append([name, float(rar), ms, 1 if has else 0, rel])
    if rows:
        out[gname] = {'d': gs, 'l': rows}
        print('%-16s моделей %3d, шансов на сумму %5.1f%%, анимаций %d' % (gname, len(rows), sum(r[1] for r in rows), sum(r[3] for r in rows)))

js = ('/* Модели улучшенных подарков. Файл собирает tools/make_models.py из папки models/, руками не правьте.\n'
      '   MODELS[подарок] = {d: папка с картинками, l: [[название, шанс %, файл, есть анимация, цена модели относительно медианы подарка], ...]}.\n'
      '   Картинка: img/m/<d>/<файл>.webp, анимация: tgs/<d>/<файл>.tgs */\n'
      'var MODELS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'models.js'), 'w', encoding='utf8').write(js)
print('models.js:', len(js), 'байт')

# обновить встроенную копию в index.html (игра собрана в один файл)
ip = os.path.join(ROOT, 'index.html')
if os.path.exists(ip):
    h = open(ip, encoding='utf8').read()
    block = '<script>' + js.rstrip('\n') + '</script>'
    m = re.search(r'<script>/\* Модели улучшенных подарков.*?</script>', h, re.S)
    if m:
        h = h[:m.start()] + block + h[m.end():]
    else:
        k = h.index('<script>/* Применяет цены подарков')  # сразу после data.js, до prices.js
        h = h[:k] + block + '\n' + h[k:]
    open(ip, 'w', encoding='utf8').write(h)
    print('index.html обновлён')
