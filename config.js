// =============================================================================
// ВСЕ НАСТРОЙКИ, АЧИВКИ, ГИПЕР-КОНФЕТА И ФРАЗЫ ФЕИ
// =============================================================================
window.CONFIG = {
  CHEATS: ['страх', 'смерть', 'гипноз', 'муж', 'сдвг', 'можно', 'гросс', 'прокрастинация'],

  TEETH_COORDS: [
    { rx: -0.44, ry: -0.14, hp: 2, upper: true },
    { rx: -0.20, ry: -0.25, hp: 2, upper: true },
    { rx:  0.05, ry: -0.30, hp: 2, upper: true },
    { rx:  0.30, ry: -0.24, hp: 2, upper: true },
    { rx:  0.52, ry: -0.14, hp: 2, upper: true },

    { rx: -0.40, ry:  0.22, hp: 2, upper: false },
    { rx: -0.16, ry:  0.28, hp: 2, upper: false },
    { rx:  0.05, ry:  0.31, hp: 2, upper: false },
    { rx:  0.27, ry:  0.28, hp: 2, upper: false },
    { rx:  0.52, ry:  0.22, hp: 2, upper: false }
  ],

  // 4 БАЗОВЫХ СНАРЯДА + ГИПЕР-КОНФЕТА (ID: 4)
  CANDY_TYPES: [
    { id: 0, name: 'Карамель', weight: 1.0, speedMult: 1.0, damage: 1, special: 'none' },
    { id: 1, name: 'Челюстелом', weight: 1.22, speedMult: 0.95, damage: 2, special: 'heavy' },
    { id: 2, name: 'Чили-Леденец', weight: 0.85, speedMult: 1.35, damage: 1, special: 'chili' },
    { id: 3, name: 'Призрак', weight: 0.9, speedMult: 1.1, damage: 1, special: 'ghost' },
    { id: 4, name: 'Гипер-Конфета', weight: 1.05, speedMult: 1.2, damage: 3, special: 'hyper' }
  ],

  FAIRY_QUOTES: {
    miss: ['МАЗИЛА! 🤡', 'МИМО! 💅', 'ТЕРПИ! 😂', 'НЕ ПОПАЛ! 💨', 'СЛАБАК! 🤏'],
    eat: ['МОЁ! 🍬', 'ВКУСНО! 😋', 'НЯМ! 🍭', 'СПАСИБО! 💖'],
    heal: ['ОТМЕНА! 🪄', 'ОТРАСТАЙ! 🦷', 'НЕ СЕГОДНЯ! 🛡️'],
    hit: ['АЙ! 💢', 'БОЛЬНО ЖЕ! 🪨', 'УРОД! 🤬', 'НЕ ДУШИ! 😵']
  },

  // 14 ПОЛНОЦЕННЫХ ДОСТИЖЕНИЙ
  ACHIEVEMENTS: [
    { id: 'teeth_10', title: '🦷 Первый скол', desc: 'Выбить 10 зубов суммарно' },
    { id: 'teeth_25', title: '⛏️ Зубной старатель', desc: 'Выбить 25 зубов суммарно' },
    { id: 'teeth_50', title: '🪓 Зубодробитель', desc: 'Выбить 50 зубов суммарно' },
    { id: 'teeth_100', title: '💀 Кошмар дантиста', desc: 'Выбить 100 зубов суммарно' },
    { id: 'teeth_200', title: '👑 Повелитель челюстей', desc: 'Выбить 200 зубов суммарно' },
    { id: 'stone_3', title: '🎯 Меткий булыжник', desc: 'Попасть по фее камнем 3 раза' },
    { id: 'stone_10', title: '🪨 Гроза саботажников', desc: 'Попасть по фее камнем 10 раз' },
    { id: 'combo_3', title: '🔥 В ударе', desc: 'Сделать комбо x3' },
    { id: 'combo_5', title: '⚡ Неудержимый', desc: 'Сделать комбо x5' },
    { id: 'hyper_craft', title: '🌟 Сладкий алхимик', desc: 'Собрать гипер-конфету из 3-х одинаковых' },
    { id: 'hyper_strike', title: '💥 Тройной разгром', desc: 'Выбить 3 зуба разом гипер-конфетой' },
    { id: 'speedrun', title: '⏱ Спидраннер', desc: 'Победить быстрее чем за 35 секунд' },
    { id: 'provocateur', title: '😈 Провокатор', desc: 'Разозлить фею тапом 5 раз' },
    { id: 'flawless_combo', title: '💎 Чистая работа', desc: 'Набрать комбо x4 без единого промаха' }
  ],

  DIAGNOSES: [
    {
      title: "Агрессивный Прокрастинатор",
      desc: "Ты тянешь до крайнего срока, а затем бросаешься вперед на морально-волевых. В жизни это путь к выгоранию.",
      pLink: "https://dzen.ru/a/at4er3adql3iM6dh?utm_source=game_diag1", pText: "👉 Читать статью в Дзене",
      sLink: "https://vk.ru/gipnoz_izhevsk?w=wall-150809314_1562", sText: "💬 Обсудить в VK"
    },
    {
      title: "Хронический Гиперконтролер",
      desc: "Фея в твоей голове панически боится ошибок. Ты тратишь колоссальный ресурс на контроль вместо действий.",
      pLink: "https://dzen.ru/a/auJJDd4UXz1JCvJX?utm_source=game_diag2", pText: "👉 Читать статью в Дзене",
      sLink: "https://www.threads.com/@grosshypno/post/DfJe0pEDC3J", sText: "🔍 Наш Threads"
    },
    {
      title: "Иллюзорный Перфекционист",
      desc: "Ты выжидаешь 'идеальный момент', пока зубы страхов отрастают заново. Узнай, как разрубить этот узел.",
      pLink: "https://dzen.ru/a/atvh6GIeai6fgvWP?utm_source=game_diag3", pText: "👉 Читать в Дзене",
      sLink: "https://vk.com/gipnoz_izhevsk", sText: "💬 Вступить в группу ВК"
    },
    {
      title: "Крутой чё",
      desc: "И чтобы стать ещё круче загляни сюда и узнай ты ли это",
      pLink: "https://dzen.ru/a/atChpNDbdTdk0slu?utm_source=game_diag3", pText: "👉 Читать в Дзене",
      sLink: "https://vk.com/gipnoz_izhevsk", sText: "💬 Вступить в группу ВК"
    },
    {
      title: "Как много страха, но ты страшнее )",
      desc: "Узнай как можно переписать реакцию страха при помощи гипноза",
      pLink: "https://dzen.ru/a/at93uJXnO2bSz9EL?utm_source=game_diag3", pText: "👉 Читать в Дзене",
      sLink: "https://vk.com/gipnoz_izhevsk", sText: "💬 Вступить в группу ВК"
    }
  ]
};