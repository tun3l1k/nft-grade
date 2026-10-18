/* Настройки подключения. API пустой = тот же сайт, где открыта игра. */
var CFG={API:"",BOT:"nftgrade_game_bot",GROUP:"https://t.me/NFTGRADEGAME",SUPPORT:"https://t.me/nftgrade_game_bot"};

/* ЭКОНОМИКА
   1 GRADE примерно равен 1 звезде по стоимости подарка. Обычные подарки стоят как в Telegram (15-100 звёзд).
   Улучшаемые (NFT) подарки оценены по рыночным ценам перепродажи: до $20 по 50 GRADE за доллар,
   выше цена растёт медленнее (сжатие), чтобы редкие подарки оставались достижимыми.
   floor: название -> [редкость (0 = оставить), цена в GRADE]. Подарки не из списка: старая цена * k (но от min до cap).
   Цены - ориентиры, их нужно сверять с Fragment, Getgems и tgsupergift и обновлять здесь.
   sell: сколько платит система при быстрой продаже (маркет игроков выгоднее). */
var ECO={sell:.85,k:4,min:250,cap:30000,t1:1500,t2:10000,floor:{"Chill Flame":[1,250],"Candy Cane":[1,500],"Fresh Socks":[1,600],"Mood Pack":[1,1000],"Snoop Cigar":[2,1360],"Light Sword":[2,1680],"Jelly Bunny":[2,1990],"Love Potion":[2,2280],"Loot Bag":[2,4300],"Astral Shard":[2,4760],"Ion Gem":[2,6640],"Mini Oscar":[3,10300],"Durov's Cap":[3,12000],"Heroic Helmet":[3,17300],"Plush Pepe":[3,89400],"Ginger Cookie":[0,400],"Spy Agaric":[0,600],"Snow Mittens":[0,750],"Scared Cat":[0,1180],"Jingle Bells":[0,1360],"Santa Hat":[0,1840],"Witch Hat":[0,2280],"Hex Pot":[0,3090],"Snow Globe":[0,4530],"Skull Flower":[0,9460]}};
