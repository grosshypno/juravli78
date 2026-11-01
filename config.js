// =============================================================================
// ВСЕ НАСТРОЙКИ, КООРДИНАТЫ И МАРКЕТИНГОВЫЕ ДАННЫЕ
// =============================================================================
window.CONFIG = {
  // Список промокодов (регистр не важен)
  CHEATS: ['страх', 'смерть', 'гипноз', 'муж', 'сдвг', 'можно', 'гросс', 'прокрастинация'],

  // Твои координаты зубов, выверенные под спрайт
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

  // Характеристики 4 видов снарядов
  CANDY_TYPES: [
    { id: 0, name: 'Карамель', weight: 1.0, speedMult: 1.0, damage: 1, special: 'none' },
    { id: 1, name: 'Челюстелом', weight: 1.22, speedMult: 0.95, damage: 2, special: 'heavy' },
    { id: 2, name: 'Чили-Леденец', weight: 0.85, speedMult: 1.35, damage: 1, special: 'chili' },
    { id: 3, name: 'Призрак', weight: 0.9, speedMult: 1.1, damage: 1, special: 'ghost' }
  ],

  // Психологические диагнозы и реальные ссылки
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