// Game registry. Metadata here so the hub renders without loading game code.
// Each game file default-exports: { id, title, mount(el, ctx) => unmount }
// `color` is a token name from tokens.css (--kid-1..6). `icon` is a file in assets/icons/.
export const GAMES = [
  { id: 'memory',   title: 'Знайди пару',      age: '3+', color: '--kid-6', icon: 'game-memory.svg',   skill: "Пам'ять",      load: () => import('./memory.js') },
  { id: 'counting', title: 'Рахуємо разом',    age: '3+', color: '--kid-2', icon: 'game-counting.svg', skill: 'Лічба',        load: () => import('./counting.js') },
  { id: 'letters',  title: 'Абетка',           age: '4+', color: '--kid-1', icon: 'game-letters.svg',  skill: 'Букви',        load: () => import('./letters.js') },
  { id: 'coloring', title: 'Розмальовка',      age: '2+', color: '--kid-4', icon: 'game-coloring.svg', skill: 'Творчість',    load: () => import('./coloring.js') },
  { id: 'puzzle',   title: 'Пазл',             age: '4+', color: '--kid-5', icon: 'game-puzzle.svg',   skill: 'Логіка',       load: () => import('./puzzle.js') },
  { id: 'stars',    title: 'Злови зірочку',    age: '3+', color: '--kid-3', icon: 'game-stars.svg',    skill: 'Реакція',      load: () => import('./stars.js') },
  { id: 'piano',    title: 'Чарівне піаніно',  age: '2+', color: '--kid-6', icon: 'game-piano.svg',    skill: 'Музика',       load: () => import('./piano.js') },
  { id: 'shapes',   title: 'Фігури й кольори', age: '2+', color: '--kid-4', icon: 'game-shapes.svg',   skill: 'Форми',        load: () => import('./shapes.js') },
];
export const gameById = (id) => GAMES.find((g) => g.id === id);
