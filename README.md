# NFT GRADE

Telegram Mini App + маленький сервер (Node 18+, без зависимостей). Все файлы лежат в одной папке.

## Файлы
- index.html, style1.css, style2.css: разметка и стили
- config.js: адрес сервера, имя бота и параметры экономики (ECO)
- data.js: подарки, картинки, кейсы, события, состояние игры
- shop.js, battlepass.js, effects.js, collections.js, cases.js, inventory.js, cards.js, upgrade.js, market.js, profile.js, boot.js, roll.js: части игры (порядок подключения в index.html менять нельзя)
- tg.js: запасное чтение данных игрока из Telegram (подключается в head после telegram-web-app.js)
- live.css, live.js: профиль игрока из ленты live (тап по подарку, свайп назад, отправка подарка). Подключаются в index.html последними
- server.js: раздача игры, оплата Stars, рейтинг, команды бота и админ-команды

## Переменные на хостинге
- BOT_TOKEN: токен от BotFather
- WEBHOOK_SECRET: любая длинная случайная строка
- PUBLIC_URL: адрес сайта с https, без слэша на конце
- SUPPORT: ваш ник для вопросов по оплате (по желанию)
- ADMIN_IDS: ваш числовой Telegram ID, несколько через запятую

Свой ID покажет команда /id в боте.

## Админ-команды (работают только у ADMIN_IDS, только в личке с ботом)
/admin, /stats, /find @ник, /give @ник coin|gift|case число, /ban, /unban, /sales, /refund id charge_id, /broadcast текст (потом /yes)

Выданное через /give игрок получает при следующем входе в игру.
