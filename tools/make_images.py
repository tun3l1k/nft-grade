#!/usr/bin/env python3
"""Готовит картинки подарков для игры.
Берёт оригиналы из папки Image/ (webp 1024x1024), делает лёгкие копии 256x256 в img/ с именами латиницей
(например "Durov’s Cap.webp" -> img/durovs-cap.webp). Нужен Pillow: pip install pillow
Запуск из корня проекта: python3 tools/make_images.py"""
import os, re, sys
from PIL import Image

SRC, DST, SIZE = 'Image', 'img', 256

def slug(name):
    s = re.sub(r'\.(webp|png|jpg)$', '', name, flags=re.I).replace('’', "'").replace('‘', "'").strip().lower()
    s = s.replace("'", '')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def main():
    os.makedirs(DST, exist_ok=True)
    n = tot = 0
    for f in sorted(os.listdir(SRC)):
        if not f.lower().endswith('.webp'):
            continue
        im = Image.open(os.path.join(SRC, f)).convert('RGBA')
        im = im.resize((SIZE, SIZE), Image.LANCZOS)
        out = os.path.join(DST, slug(f) + '.webp')
        im.save(out, 'WEBP', quality=84, method=4)
        n += 1; tot += os.path.getsize(out)
    print(f'{n} файлов, {tot/1024:.0f} КБ')

if __name__ == '__main__':
    main()
