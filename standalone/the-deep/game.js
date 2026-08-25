const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ===== 16 ФАРФОРОВЫХ СТАТУЭТОК =====
const STATUETTES = [
    {
        id: 'lyra', name: 'Лира', desc: 'Жемчужная балерина',
        skinBase: '#f5ede4', skinShadow: '#e8d5c4', skinHighlight: '#fffaf5',
        crackColor: '#a8d4e6', crackGlow: '#7ec8e3',
        hairColor: '#f0e6d6', hairShadow: '#d4c4b0',
        eyeColor: '#5ba3d9',
        dress: ['#f8f4f0', '#e8e0d8', '#d4c8bc'],
        accent: '#c9a87c', ribbon: '#b8d4e8', gold: '#d4af72',
        extra: { cape: '#e8f4ff', lace: 'rgba(240,245,255,0.6)' },
        outfit: 'ballgown',
    },
    {
        id: 'meha', name: 'Меха', desc: 'Часовой мастер',
        skinBase: '#f0e8dc', skinShadow: '#d8c8b4', skinHighlight: '#faf4ea',
        crackColor: '#c9a052', crackGlow: '#e0b860',
        hairColor: '#c87832', hairShadow: '#9a5820',
        eyeColor: '#c99040',
        dress: ['#6a5040', '#5a4030', '#4a3428'],
        accent: '#c9a052', ribbon: '#8a6a40', gold: '#d4af72',
        extra: { leather: '#7a5a3a', brass: '#b8943a' },
        outfit: 'tunic',
    },
    {
        id: 'shadow', name: 'Тень', desc: 'Расколотый хранитель',
        skinBase: '#2a2a2a', skinShadow: '#1a1a1a', skinHighlight: '#3a3a3a',
        crackColor: '#d4af37', crackGlow: '#ffd700',
        hairColor: '#0a0a0a', hairShadow: '#050505',
        eyeColor: '#00cc66',
        dress: ['#1a1a2a', '#121220', '#0a0a18'],
        accent: '#d4af37', ribbon: '#2a2a3a', gold: '#ffd700',
        extra: { velvet: '#1a0a1a' },
        outfit: 'robe',
    },
    {
        id: 'roza', name: 'Роза', desc: 'Розовая леди',
        skinBase: '#f8ece6', skinShadow: '#e8d0c4', skinHighlight: '#fff5f0',
        crackColor: '#e8a0b0', crackGlow: '#ff88a0',
        hairColor: '#c06070', hairShadow: '#904050',
        eyeColor: '#d06080',
        dress: ['#f8e0e8', '#f0c8d4', '#e0b0c0'],
        accent: '#d090a0', ribbon: '#f0c0d0', gold: '#e0b0b8',
        extra: { petals: '#f0b0c0' },
        outfit: 'ballgown',
    },
    {
        id: 'lazur', name: 'Лазурь', desc: 'Лазурный рыцарь',
        skinBase: '#e8e4e0', skinShadow: '#d0ccc8', skinHighlight: '#f8f4f0',
        crackColor: '#4090c0', crackGlow: '#60b0e0',
        hairColor: '#3070a0', hairShadow: '#205080',
        eyeColor: '#40a0e0',
        dress: ['#2060a0', '#184880', '#103868'],
        accent: '#80b8d8', ribbon: '#4090c0', gold: '#c0d8e8',
        extra: { armor: '#6090b0' },
        outfit: 'armor',
    },
    {
        id: 'yantar', name: 'Янтарь', desc: 'Янтарный страж',
        skinBase: '#f4e8d0', skinShadow: '#e0d0b0', skinHighlight: '#fff8e8',
        crackColor: '#c08020', crackGlow: '#e0a040',
        hairColor: '#a06820', hairShadow: '#804810',
        eyeColor: '#d09030',
        dress: ['#c08030', '#a06828', '#805020'],
        accent: '#e0b060', ribbon: '#d0a050', gold: '#e8c878',
        extra: { amber: '#d0a040' },
        outfit: 'tunic',
    },
    {
        id: 'izum', name: 'Изумруд', desc: 'Танцовщица',
        skinBase: '#f0ece4', skinShadow: '#d8d4c8', skinHighlight: '#faf8f2',
        crackColor: '#40a060', crackGlow: '#60c880',
        hairColor: '#204830', hairShadow: '#103020',
        eyeColor: '#50b070',
        dress: ['#206840', '#185838', '#104830'],
        accent: '#60b080', ribbon: '#40a060', gold: '#90d0a0',
        extra: { gems: '#50c070' },
        outfit: 'dress',
    },
    {
        id: 'ametist', name: 'Аметист', desc: 'Видящая тень',
        skinBase: '#ece4f0', skinShadow: '#d4c8e0', skinHighlight: '#f8f2fa',
        crackColor: '#8060b0', crackGlow: '#a080d0',
        hairColor: '#6040a0', hairShadow: '#402080',
        eyeColor: '#9070c0',
        dress: ['#6040a0', '#503088', '#402070'],
        accent: '#a080d0', ribbon: '#8060b0', gold: '#c0a8e0',
        extra: { crystal: '#9070c0' },
        outfit: 'robe',
    },
    {
        id: 'korall', name: 'Коралл', desc: 'Коралловый пловец',
        skinBase: '#f8e8e0', skinShadow: '#f0d0c0', skinHighlight: '#fff5f0',
        crackColor: '#e07050', crackGlow: '#ff8860',
        hairColor: '#d06040', hairShadow: '#b04030',
        eyeColor: '#e08060',
        dress: ['#e08060', '#d07050', '#c06040'],
        accent: '#f0a888', ribbon: '#e09070', gold: '#f0c8b0',
        extra: { coral: '#e07050' },
        outfit: 'dress',
    },
    {
        id: 'serebro', name: 'Серебро', desc: 'Серебряный слуга',
        skinBase: '#e8e8e8', skinShadow: '#c8c8c8', skinHighlight: '#f8f8f8',
        crackColor: '#a0a0a8', crackGlow: '#c0c0c8',
        hairColor: '#b0b0b8', hairShadow: '#909098',
        eyeColor: '#c0c0d0',
        dress: ['#a0a0a8', '#909098', '#808088'],
        accent: '#c0c0c8', ribbon: '#b0b0b8', gold: '#e0e0e8',
        extra: { pewter: '#b0b0b8' },
        outfit: 'armor',
    },
    {
        id: 'okhra', name: 'Охра', desc: 'Охристый пастух',
        skinBase: '#f0e0c8', skinShadow: '#e0c8a8', skinHighlight: '#faf0e0',
        crackColor: '#c09040', crackGlow: '#d0a050',
        hairColor: '#906828', hairShadow: '#705018',
        eyeColor: '#b08030',
        dress: ['#c09050', '#a87840', '#906030'],
        accent: '#d0a060', ribbon: '#c09050', gold: '#e0c080',
        extra: { terracotta: '#c09050' },
        outfit: 'tunic',
    },
    {
        id: 'lunit', name: 'Лунит', desc: 'Лунная сирота',
        skinBase: '#f0f0f8', skinShadow: '#d8d8e8', skinHighlight: '#fafaff',
        crackColor: '#8898c0', crackGlow: '#a0b0e0',
        hairColor: '#c0c8e0', hairShadow: '#a0a8c8',
        eyeColor: '#90a8d0',
        dress: ['#c0c8e8', '#a8b0d8', '#9098c8'],
        accent: '#b0c0e0', ribbon: '#a0b0d0', gold: '#d0d8f0',
        extra: { moon: '#c0d0f0' },
        outfit: 'ballgown',
    },
    {
        id: 'slanec', name: 'Сланец', desc: 'Сланцевый воин',
        skinBase: '#d0d0d4', skinShadow: '#b0b0b8', skinHighlight: '#e8e8ec',
        crackColor: '#607078', crackGlow: '#809098',
        hairColor: '#405058', hairShadow: '#304048',
        eyeColor: '#708890',
        dress: ['#506068', '#405058', '#304048'],
        accent: '#708088', ribbon: '#607078', gold: '#a0b0b8',
        extra: { iron: '#607078' },
        outfit: 'armor',
    },
    {
        id: 'perlam', name: 'Перламутр', desc: 'Перламутровая жрица',
        skinBase: '#f4f0f0', skinShadow: '#e0d8d8', skinHighlight: '#faf8f8',
        crackColor: '#c0b0b8', crackGlow: '#e0d0d8',
        hairColor: '#d8c8d0', hairShadow: '#c0b0b8',
        eyeColor: '#d0c0c8',
        dress: ['#e8dce4', '#d8ccd8', '#c8bcc8'],
        accent: '#d0c0c8', ribbon: '#c8b8c0', gold: '#f0e8f0',
        extra: { nacre: '#e0d8e0' },
        outfit: 'dress',
    },
    {
        id: 'oniks', name: 'Оникс', desc: 'Кровавая тень',
        skinBase: '#2a2028', skinShadow: '#1a1018', skinHighlight: '#3a3038',
        crackColor: '#a02020', crackGlow: '#c03030',
        hairColor: '#1a0808', hairShadow: '#0a0404',
        eyeColor: '#c03040',
        dress: ['#2a1018', '#200810', '#180808'],
        accent: '#801818', ribbon: '#601010', gold: '#c04040',
        extra: { blood: '#a02020' },
        outfit: 'robe',
    },
    {
        id: 'zoloto', name: 'Золото', desc: 'Золотая королева',
        skinBase: '#f8f0e0', skinShadow: '#e8d8c0', skinHighlight: '#fffaf0',
        crackColor: '#c8a020', crackGlow: '#e8c040',
        hairColor: '#d0a020', hairShadow: '#b08010',
        eyeColor: '#d8b030',
        dress: ['#d8b030', '#c8a020', '#b89018'],
        accent: '#e8c850', ribbon: '#d8b030', gold: '#f0d868',
        extra: { royal: '#6020a0' },
        outfit: 'ballgown',
    },
];

const KEY_BINDINGS = ['1','2','3','4','5','6','7','8','9','0','-','=','q','w','r','t'];

// ===== УРОВНИ =====
const levels = [
    {
        name: 'Витрина Фабрики',
        bg: ['#1a0a2e', '#0d1b3e', '#0a1628'],
        platforms: [
            { x: 0, y: 550, w: 900, h: 100, type: 'porcelain' },
            { x: 80, y: 460, w: 180, h: 18, type: 'shelf' },
            { x: 320, y: 400, w: 160, h: 18, type: 'shelf' },
            { x: 560, y: 430, w: 200, h: 18, type: 'shelf' },
            { x: 140, y: 320, w: 140, h: 18, type: 'shelf' },
            { x: 460, y: 280, w: 150, h: 18, type: 'shelf' },
            { x: 720, y: 360, w: 120, h: 18, type: 'shelf' },
        ],
        collectibles: [
            { x: 160, y: 430, type: 'pearl' },
            { x: 390, y: 370, type: 'pearl' },
            { x: 640, y: 400, type: 'crack' },
        ],
        enemies: [
            { x: 320, y: 375, type: 'dust', patrol: [320, 470] },
        ],
        bosses: [],
        exit: { x: 830, y: 330, w: 40, h: 60 },
        npcs: [
            { x: 40, y: 500, type: 'keeper', dialog: [
                { speaker: 'Смотритель', text: 'Добро пожаловать в витрину. Пыль оживает в темноте — берегитесь.' },
                { speaker: 'Смотритель', text: 'Собирайте жемчужины, они восстанавливают фарфор.' },
            ]},
        ]
    },
    {
        name: 'Затопленный Цех',
        bg: ['#0a1a0d', '#0d2b1a', '#061210'],
        platforms: [
            { x: 0, y: 550, w: 350, h: 100, type: 'stone' },
            { x: 450, y: 550, w: 450, h: 100, type: 'stone' },
            { x: 180, y: 460, w: 110, h: 18, type: 'pipe' },
            { x: 380, y: 390, w: 100, h: 18, type: 'pipe' },
            { x: 90, y: 330, w: 120, h: 18, type: 'pipe' },
            { x: 320, y: 270, w: 110, h: 18, type: 'pipe' },
            { x: 570, y: 310, w: 130, h: 18, type: 'pipe' },
            { x: 730, y: 430, w: 110, h: 18, type: 'pipe' },
        ],
        collectibles: [
            { x: 230, y: 430, type: 'pearl' },
            { x: 420, y: 360, type: 'pearl' },
            { x: 140, y: 300, type: 'gear' },
            { x: 620, y: 280, type: 'pearl' },
        ],
        enemies: [
            { x: 180, y: 435, type: 'dust', patrol: [180, 280] },
            { x: 570, y: 285, type: 'dust', patrol: [570, 690] },
        ],
        bosses: [],
        exit: { x: 840, y: 400, w: 40, h: 60 },
        npcs: []
    },
    {
        name: 'Глубинная Печь',
        bg: ['#1a0a0a', '#2b1510', '#1a0d08'],
        platforms: [
            { x: 0, y: 550, w: 280, h: 100, type: 'obsidian' },
            { x: 340, y: 500, w: 180, h: 18, type: 'lava' },
            { x: 580, y: 550, w: 320, h: 100, type: 'obsidian' },
            { x: 90, y: 410, w: 120, h: 18, type: 'lava' },
            { x: 280, y: 350, w: 120, h: 18, type: 'lava' },
            { x: 490, y: 390, w: 110, h: 18, type: 'lava' },
            { x: 680, y: 330, w: 130, h: 18, type: 'lava' },
            { x: 180, y: 260, w: 140, h: 18, type: 'lava' },
            { x: 470, y: 210, w: 160, h: 18, type: 'lava' },
        ],
        collectibles: [
            { x: 140, y: 380, type: 'pearl' },
            { x: 330, y: 320, type: 'gold' },
            { x: 540, y: 360, type: 'pearl' },
            { x: 730, y: 300, type: 'gold' },
            { x: 240, y: 230, type: 'pearl' },
        ],
        enemies: [
            { x: 340, y: 475, type: 'ember', patrol: [340, 510] },
            { x: 680, y: 305, type: 'ember', patrol: [680, 800] },
        ],
        bosses: [
            { x: 550, y: 170, type: 'cracked_giant', hp: 30, patrol: [470, 620] },
        ],
        exit: { x: 530, y: 170, w: 40, h: 60 },
        npcs: []
    },
    {
        name: 'Затопленный Собор',
        bg: ['#0a0a20', '#12103a', '#080818'],
        platforms: [
            { x: 0, y: 550, w: 250, h: 100, type: 'marble' },
            { x: 350, y: 550, w: 200, h: 100, type: 'marble' },
            { x: 650, y: 550, w: 250, h: 100, type: 'marble' },
            { x: 120, y: 460, w: 100, h: 16, type: 'arch' },
            { x: 300, y: 400, w: 120, h: 16, type: 'arch' },
            { x: 500, y: 360, w: 100, h: 16, type: 'arch' },
            { x: 80, y: 310, w: 110, h: 16, type: 'arch' },
            { x: 280, y: 260, w: 130, h: 16, type: 'arch' },
            { x: 520, y: 230, w: 100, h: 16, type: 'arch' },
            { x: 700, y: 300, w: 120, h: 16, type: 'arch' },
        ],
        collectibles: [
            { x: 160, y: 430, type: 'pearl' },
            { x: 350, y: 370, type: 'pearl' },
            { x: 540, y: 330, type: 'prism' },
            { x: 130, y: 280, type: 'pearl' },
            { x: 330, y: 230, type: 'gold' },
        ],
        enemies: [
            { x: 300, y: 375, type: 'jellyfish', patrol: [280, 420] },
            { x: 500, y: 205, type: 'jellyfish', patrol: [500, 620] },
            { x: 120, y: 285, type: 'dust', patrol: [80, 180] },
        ],
        bosses: [],
        exit: { x: 750, y: 260, w: 40, h: 60 },
        npcs: [
            { x: 50, y: 500, type: 'keeper', dialog: [
                { speaker: 'Хранитель Собора', text: 'Эти стены помнят века. Призмы хранят свет ушедших эпох.' },
                { speaker: 'Хранитель Собора', text: 'Направьте фонарик на призму — и она покажет путь к секретам.' },
            ]},
        ],
        currents: [
            { x: 250, y: 200, w: 150, h: 300, vx: 0, vy: -1.2 },
        ],
        seaweed: [
            { x: 30, y: 550, h: 60, phase: 0 },
            { x: 230, y: 550, h: 45, phase: 1 },
            { x: 640, y: 550, h: 55, phase: 2 },
        ],
        secret: { x: 600, y: 180, w: 60, h: 50, hidden: true },
    },
    {
        name: 'Коралловые Сады',
        bg: ['#0a1820', '#0d2828', '#081818'],
        platforms: [
            { x: 0, y: 550, w: 200, h: 100, type: 'coral' },
            { x: 280, y: 550, w: 150, h: 100, type: 'coral' },
            { x: 520, y: 550, w: 180, h: 100, type: 'coral' },
            { x: 780, y: 550, w: 120, h: 100, type: 'coral' },
            { x: 100, y: 470, w: 90, h: 14, type: 'coral' },
            { x: 280, y: 420, w: 100, h: 14, type: 'coral' },
            { x: 470, y: 380, w: 80, h: 14, type: 'coral' },
            { x: 640, y: 340, w: 110, h: 14, type: 'coral' },
            { x: 150, y: 320, w: 90, h: 14, type: 'coral' },
            { x: 350, y: 270, w: 100, h: 14, type: 'coral' },
            { x: 570, y: 240, w: 80, h: 14, type: 'coral' },
            { x: 750, y: 280, w: 100, h: 14, type: 'coral' },
        ],
        collectibles: [
            { x: 130, y: 440, type: 'pearl' },
            { x: 320, y: 390, type: 'pearl' },
            { x: 500, y: 350, type: 'pearl' },
            { x: 680, y: 310, type: 'gold' },
            { x: 180, y: 290, type: 'pearl' },
            { x: 380, y: 240, type: 'prism' },
        ],
        enemies: [
            { x: 280, y: 395, type: 'crab', patrol: [280, 370] },
            { x: 640, y: 315, type: 'crab', patrol: [640, 740] },
            { x: 470, y: 300, type: 'jellyfish', patrol: [450, 550] },
            { x: 150, y: 250, type: 'fish', patrol: [100, 300] },
        ],
        bosses: [
            { x: 750, y: 240, type: 'coral_leviathan', hp: 40, patrol: [700, 850] },
        ],
        exit: { x: 400, y: 200, w: 40, h: 60 },
        npcs: [],
        currents: [
            { x: 400, y: 100, w: 200, h: 400, vx: 0.8, vy: 0 },
            { x: 600, y: 200, w: 100, h: 300, vx: 0, vy: -0.8 },
        ],
        seaweed: [
            { x: 10, y: 550, h: 80, phase: 0 },
            { x: 60, y: 550, h: 60, phase: 0.5 },
            { x: 270, y: 550, h: 70, phase: 1 },
            { x: 510, y: 550, h: 50, phase: 1.5 },
            { x: 770, y: 550, h: 65, phase: 2 },
        ],
    },
    {
        name: 'Ледяная Пещера',
        bg: ['#081020', '#0a1830', '#060c18'],
        platforms: [
            { x: 0, y: 550, w: 300, h: 100, type: 'ice' },
            { x: 400, y: 550, w: 250, h: 100, type: 'ice' },
            { x: 750, y: 550, w: 150, h: 100, type: 'ice' },
            { x: 150, y: 470, w: 110, h: 14, type: 'ice' },
            { x: 350, y: 410, w: 100, h: 14, type: 'ice' },
            { x: 550, y: 370, w: 120, h: 14, type: 'ice' },
            { x: 100, y: 330, w: 100, h: 14, type: 'ice' },
            { x: 300, y: 280, w: 110, h: 14, type: 'ice' },
            { x: 520, y: 240, w: 100, h: 14, type: 'ice' },
            { x: 700, y: 320, w: 90, h: 14, type: 'ice' },
            { x: 400, y: 170, w: 120, h: 14, type: 'ice' },
        ],
        collectibles: [
            { x: 200, y: 440, type: 'pearl' },
            { x: 400, y: 380, type: 'pearl' },
            { x: 590, y: 340, type: 'prism' },
            { x: 140, y: 300, type: 'pearl' },
            { x: 340, y: 250, type: 'gold' },
            { x: 560, y: 210, type: 'pearl' },
        ],
        enemies: [
            { x: 150, y: 445, type: 'crab', patrol: [150, 250] },
            { x: 550, y: 345, type: 'jellyfish', patrol: [540, 660] },
            { x: 300, y: 220, type: 'fish', patrol: [280, 480] },
            { x: 700, y: 295, type: 'dust', patrol: [700, 780] },
        ],
        bosses: [
            { x: 450, y: 130, type: 'frost_guardian', hp: 35, patrol: [380, 520] },
        ],
        exit: { x: 440, y: 130, w: 40, h: 60 },
        npcs: [],
        currents: [
            { x: 0, y: 300, w: 900, h: 100, vx: 0.5, vy: 0 },
        ],
        seaweed: [
            { x: 35, y: 550, h: 40, phase: 0 },
            { x: 390, y: 550, h: 35, phase: 1 },
            { x: 745, y: 550, h: 30, phase: 2 },
        ],
    },
    {
        name: 'Кузница Глубин',
        bg: ['#1a0808', '#2b1010', '#180606'],
        platforms: [
            { x: 0, y: 550, w: 200, h: 100, type: 'obsidian' },
            { x: 280, y: 500, w: 140, h: 16, type: 'lava' },
            { x: 500, y: 550, w: 200, h: 100, type: 'obsidian' },
            { x: 780, y: 550, w: 120, h: 100, type: 'obsidian' },
            { x: 100, y: 440, w: 100, h: 14, type: 'lava' },
            { x: 300, y: 380, w: 110, h: 14, type: 'lava' },
            { x: 500, y: 340, w: 100, h: 14, type: 'lava' },
            { x: 700, y: 380, w: 90, h: 14, type: 'lava' },
            { x: 200, y: 300, w: 100, h: 14, type: 'lava' },
            { x: 400, y: 250, w: 120, h: 14, type: 'lava' },
            { x: 600, y: 210, w: 100, h: 14, type: 'lava' },
            { x: 350, y: 160, w: 110, h: 14, type: 'lava' },
        ],
        collectibles: [
            { x: 140, y: 410, type: 'pearl' },
            { x: 340, y: 350, type: 'gold' },
            { x: 540, y: 310, type: 'pearl' },
            { x: 730, y: 350, type: 'gold' },
            { x: 240, y: 270, type: 'prism' },
            { x: 440, y: 220, type: 'gold' },
            { x: 630, y: 180, type: 'pearl' },
        ],
        enemies: [
            { x: 280, y: 475, type: 'ember', patrol: [280, 410] },
            { x: 500, y: 315, type: 'ember', patrol: [500, 590] },
            { x: 200, y: 250, type: 'ember', patrol: [200, 290] },
            { x: 700, y: 355, type: 'crab', patrol: [700, 770] },
        ],
        bosses: [
            { x: 400, y: 120, type: 'furnace_golem', hp: 50, patrol: [340, 460] },
        ],
        exit: { x: 390, y: 120, w: 40, h: 60 },
        npcs: [],
        currents: [
            { x: 0, y: 0, w: 200, h: 550, vx: 0, vy: 0.6 },
        ],
        seaweed: [],
    },
    {
        name: 'Тайная Витрина',
        bg: ['#10081a', '#181030', '#0a0810'],
        platforms: [
            { x: 0, y: 550, w: 450, h: 100, type: 'porcelain' },
            { x: 500, y: 550, w: 400, h: 100, type: 'porcelain' },
            { x: 100, y: 460, w: 140, h: 16, type: 'shelf' },
            { x: 320, y: 400, w: 120, h: 16, type: 'shelf' },
            { x: 550, y: 430, w: 130, h: 16, type: 'shelf' },
            { x: 750, y: 380, w: 110, h: 16, type: 'shelf' },
            { x: 200, y: 330, w: 100, h: 16, type: 'shelf' },
            { x: 430, y: 280, w: 120, h: 16, type: 'shelf' },
            { x: 650, y: 260, w: 100, h: 16, type: 'shelf' },
            { x: 350, y: 200, w: 130, h: 16, type: 'shelf' },
            { x: 600, y: 160, w: 120, h: 16, type: 'shelf' },
        ],
        collectibles: [
            { x: 160, y: 430, type: 'pearl' },
            { x: 370, y: 370, type: 'pearl' },
            { x: 600, y: 400, type: 'pearl' },
            { x: 790, y: 350, type: 'gold' },
            { x: 240, y: 300, type: 'pearl' },
            { x: 480, y: 250, type: 'prism' },
            { x: 690, y: 230, type: 'gold' },
            { x: 400, y: 170, type: 'pearl' },
        ],
        enemies: [
            { x: 320, y: 375, type: 'jellyfish', patrol: [310, 430] },
            { x: 550, y: 405, type: 'jellyfish', patrol: [540, 670] },
            { x: 200, y: 305, type: 'fish', patrol: [180, 350] },
            { x: 430, y: 255, type: 'crab', patrol: [430, 540] },
            { x: 650, y: 235, type: 'dust', patrol: [640, 740] },
        ],
        bosses: [
            { x: 550, y: 120, type: 'cracked_mother', hp: 60, patrol: [500, 700] },
        ],
        exit: { x: 650, y: 120, w: 40, h: 60 },
        npcs: [
            { x: 40, y: 500, type: 'keeper', dialog: [
                { speaker: 'Древний Смотритель', text: 'Добро пожаловать в Тайную Витрину. Здесь хранятся самые хрупкие создания.' },
                { speaker: 'Древний Смотритель', text: 'Осторожно — Расколотая Мать не спит. Она чувствует каждый треск.' },
            ]},
        ],
        currents: [
            { x: 400, y: 100, w: 100, h: 400, vx: 0, vy: -1 },
        ],
        seaweed: [
            { x: 5, y: 550, h: 50, phase: 0 },
            { x: 490, y: 550, h: 40, phase: 1 },
        ],
    }
];

// ===== ЗВУКОВАЯ СИСТЕМА (Web Audio API) =====
let audioCtx = null;
let musicPlaying = false;
let masterGain = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
}

function playTone(freq, duration, type, vol) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function sfxCollect() {
    playTone(880, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(1100, 0.12, 'sine', 0.1), 60);
    setTimeout(() => playTone(1320, 0.2, 'sine', 0.08), 120);
}

function sfxDamage() {
    playTone(150, 0.2, 'sawtooth', 0.1);
    playTone(120, 0.25, 'square', 0.06);
}

function sfxBubble() {
    playTone(400 + Math.random() * 300, 0.08, 'sine', 0.04);
}

function sfxStep() {
    playTone(200 + Math.random() * 80, 0.04, 'triangle', 0.03);
}

function sfxJump() {
    playTone(300, 0.1, 'sine', 0.06);
    setTimeout(() => playTone(500, 0.08, 'sine', 0.04), 50);
}

function sfxBossHit() {
    playTone(80, 0.3, 'sawtooth', 0.15);
    playTone(60, 0.4, 'square', 0.08);
}

function sfxMuseumEnter() {
    playTone(440, 0.3, 'sine', 0.08);
    setTimeout(() => playTone(550, 0.25, 'sine', 0.06), 150);
    setTimeout(() => playTone(660, 0.4, 'sine', 0.05), 300);
}

// Музыка — эмбиент подводный
let musicNodes = [];
function startMusic() {
    if (!audioCtx || musicPlaying) return;
    musicPlaying = true;

    function droneNote(freq, dur, delay) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + delay + dur * 0.3);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + dur);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + dur);
    }

    function playLoop() {
        if (!musicPlaying) return;
        const base = [110, 130, 98, 123];
        const note = base[Math.floor(Math.random() * base.length)];
        droneNote(note, 4 + Math.random() * 3, 0);
        droneNote(note * 1.5, 3 + Math.random() * 2, 1);
        droneNote(note * 2, 2 + Math.random() * 2, 2);
        // Высокие переливы
        if (Math.random() > 0.5) {
            droneNote(note * 4, 1.5, 0.5 + Math.random());
        }
        setTimeout(playLoop, 3000 + Math.random() * 2000);
    }
    playLoop();
}

// ===== ИГРОК =====
let currentIdx = 0;
let player = {
    x: 100, y: 500,
    vx: 0, vy: 0,
    w: 24, h: 44,
    oxygen: 100, health: 100,
    grounded: false, flashlight: false,
    facing: 1, animFrame: 0, animTimer: 0,
    invincible: 0, inventory: [], pearls: 0,
    stepTimer: 0,
};

let currentLevel = 0;
let gameState = 'play';
let dialogQueue = [];
let particles = [];
let bubbles = [];
let screenShake = 0;

let museumMode = false;
let museumZoom = 1;
let museumZoomTarget = 1.2;
let museumAngle = 0;
let museumAutoRotate = true;
let museumRotateDir = 1;

// Сетка выбора
let charSelectOpen = false;

// Боссы на уровне
let bosses = [];

// Спутник-фонарик
let companion = { x: 0, y: 0, targetX: 0, targetY: 0, glow: 0 };

// Течения
let currentFlow = { x: 0, y: 0 };

// Кастомизация
let customizeOpen = false;
let customizeTarget = null; // 'crack', 'eye', 'gold'
const CRACK_COLORS = ['#a8d4e6','#e8a0b0','#4090c0','#d4af37','#8060b0','#e07050','#40a060','#c03030'];
const EYE_COLORS = ['#5ba3d9','#d06080','#40a0e0','#c99040','#00cc66','#9070c0','#e08060','#c03040'];
const GOLD_COLORS = ['#d4af72','#c9a052','#ffd700','#e0b0b8','#c0d8e8','#90d0a0','#f0c8b0','#d8b030'];

// Призмы (световые головоломки)
let prisms = [];

// Секретная комната
let secretRevealed = false;

const keys = {};
let lastTime = 0;
let deltaTime = 0;

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    buildCharBar();
    buildInventoryUI();
    loadGame();
    loadLevel(currentLevel);
    requestAnimationFrame(gameLoop);

    // Запуск аудио по клику
    document.addEventListener('click', () => {
        initAudio();
        if (!musicPlaying) startMusic();
    }, { once: false });
}

function buildCharBar() {
    const bar = document.getElementById('charBar');
    bar.innerHTML = '';
    STATUETTES.forEach((s, i) => {
        const btn = document.createElement('div');
        btn.className = 'char-btn' + (i === currentIdx ? ' active' : '');
        btn.id = 'cbtn' + i;
        btn.onclick = () => { initAudio(); selectChar(i); };
        // Мини-холст с превью
        const mc = document.createElement('canvas');
        mc.width = 38;
        mc.height = 38;
        drawMiniPreview(mc, s);
        btn.appendChild(mc);
        const keyLabel = document.createElement('span');
        keyLabel.className = 'char-key';
        keyLabel.textContent = KEY_BINDINGS[i].toUpperCase();
        btn.appendChild(keyLabel);
        bar.appendChild(btn);
    });
}

function drawMiniPreview(cvs, s) {
    const c = cvs.getContext('2d');
    c.save();
    c.translate(19, 22);
    c.scale(0.55, 0.55);
    // Мини-силуэт
    // Платье
    const g = c.createLinearGradient(0, -5, 0, 18);
    g.addColorStop(0, s.dress[0]);
    g.addColorStop(1, s.dress[2]);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-10, -5);
    c.bezierCurveTo(-16, 4, -15, 14, -12, 19);
    c.lineTo(12, 19);
    c.bezierCurveTo(15, 14, 16, 4, 10, -5);
    c.closePath();
    c.fill();
    // Корсаж
    c.fillStyle = s.dress[0];
    c.fillRect(-8, -15, 16, 11);
    // Голова
    c.fillStyle = s.skinBase;
    c.beginPath();
    c.arc(0, -22, 10, 0, Math.PI * 2);
    c.fill();
    // Волосы
    c.fillStyle = s.hairColor;
    c.beginPath();
    c.ellipse(0, -28, 11, 6, 0, Math.PI + 0.2, -0.2);
    c.fill();
    // Глаза
    c.fillStyle = s.eyeColor;
    c.beginPath();
    c.arc(-3.5, -22, 2.5, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(3.5, -22, 2.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#111';
    c.beginPath();
    c.arc(-3.5, -22, 1.2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(3.5, -22, 1.2, 0, Math.PI * 2);
    c.fill();
    // Трещина
    c.strokeStyle = s.crackColor;
    c.lineWidth = 0.8;
    c.globalAlpha = 0.6;
    c.beginPath();
    c.moveTo(-3, -28);
    c.lineTo(-1, -24);
    c.stroke();
    c.globalAlpha = 1;
    c.restore();
}

function selectChar(idx) {
    currentIdx = idx;
    document.getElementById('charLabel').textContent = STATUETTES[idx].name;
    document.querySelectorAll('.char-btn').forEach((b, i) => {
        b.className = 'char-btn' + (i === idx ? ' active' : '');
    });
}

function buildInventoryUI() {
    const el = document.getElementById('invSlots');
    el.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.textContent = player.inventory[i] || '';
        el.appendChild(slot);
    }
}

function loadLevel(idx) {
    const lvl = levels[idx];
    player.x = 100;
    player.y = 500;
    player.vx = 0;
    player.vy = 0;
    particles = [];
    bubbles = [];
    bosses = lvl.bosses.map(b => ({ ...b, hp: b.hp || 20, maxHp: b.hp || 20, dir: 1, animTimer: 0, hitFlash: 0 }));

    const nameEl = document.getElementById('levelName');
    nameEl.textContent = lvl.name;
    nameEl.style.opacity = '1';
    setTimeout(() => { nameEl.style.opacity = '0'; }, 2500);
    for (let i = 0; i < 25; i++) particles.push(makeParticle());
}

function makeParticle() {
    return {
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        wobble: Math.random() * Math.PI * 2,
    };
}

function makeBubble(x, y) {
    return {
        x: x + (Math.random() - 0.5) * 12, y,
        size: Math.random() * 3 + 1.5,
        speedY: Math.random() * 1.5 + 0.8,
        opacity: Math.random() * 0.6 + 0.4,
        wobble: Math.random() * Math.PI * 2,
    };
}

// ===== УПРАВЛЕНИЕ =====
document.addEventListener('keydown', (e) => {
    initAudio();
    keys[e.code] = true;

    if (e.code === 'Tab') {
        e.preventDefault();
        toggleMuseum();
        return;
    }
    if (e.code === 'KeyX') {
        charSelectOpen = !charSelectOpen;
        document.getElementById('charBar').style.display = charSelectOpen ? 'flex' : 'none';
        return;
    }
    if (e.code === 'KeyC') {
        toggleCustomize();
        return;
    }

    if (museumMode) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') { museumAutoRotate = false; museumRotateDir = -1; }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') { museumAutoRotate = false; museumRotateDir = 1; }
        if (e.code === 'ArrowUp' || e.code === 'KeyW') museumZoomTarget = Math.min(5, museumZoomTarget + 0.5);
        if (e.code === 'ArrowDown' || e.code === 'KeyS') museumZoomTarget = Math.max(0.8, museumZoomTarget - 0.5);
        if (e.code === 'Space') museumAutoRotate = !museumAutoRotate;
        return;
    }

    // Выбор номером
    const numIdx = KEY_BINDINGS.indexOf(e.key.toLowerCase());
    if (numIdx >= 0 && numIdx < STATUETTES.length) {
        selectChar(numIdx);
    }

    if (e.code === 'Space') { e.preventDefault(); player.flashlight = !player.flashlight; }
    if (e.code === 'KeyE') interact();
});

document.addEventListener('keyup', (e) => { keys[e.code] = false; });

function toggleMuseum() {
    museumMode = !museumMode;
    if (museumMode) {
        gameState = 'museum';
        museumZoom = 1;
        museumZoomTarget = 1.5;
        museumAngle = 0;
        museumAutoRotate = true;
        sfxMuseumEnter();
    } else {
        gameState = 'play';
    }
}

function interact() {
    const lvl = levels[currentLevel];
    for (const npc of lvl.npcs) {
        if (Math.abs(player.x - npc.x) < 50 && Math.abs(player.y - npc.y) < 60) {
            dialogQueue = [...npc.dialog];
            showDialog();
            return;
        }
    }
    for (let i = lvl.collectibles.length - 1; i >= 0; i--) {
        const c = lvl.collectibles[i];
        if (Math.abs(player.x - c.x) < 30 && Math.abs(player.y - c.y) < 40) {
            collectItem(c, i);
            return;
        }
    }
    // Босс — удар
    for (const b of bosses) {
        if (Math.abs(player.x - b.x) < 40 && Math.abs(player.y - b.y) < 40) {
            b.hp--;
            b.hitFlash = 300;
            sfxBossHit();
            spawnCollectEffect(b.x, b.y, '#ff8060');
            if (b.hp <= 0) {
                spawnCollectEffect(b.x, b.y, '#ffd700');
                bosses = bosses.filter(bb => bb !== b);
            }
            return;
        }
    }
    const ex = lvl.exit;
    if (player.x > ex.x - 20 && player.x < ex.x + ex.w + 20 &&
        player.y > ex.y - 20 && player.y < ex.y + ex.h + 20) {
        nextLevel();
    }
}

function collectItem(item, idx) {
    const lvl = levels[currentLevel];
    lvl.collectibles.splice(idx, 1);
    sfxCollect();
    if (item.type === 'pearl') {
        player.pearls++;
        player.health = Math.min(100, player.health + 15);
        spawnCollectEffect(item.x, item.y, '#e0f0ff');
    } else if (item.type === 'gold') {
        player.inventory.push('✦');
        spawnCollectEffect(item.x, item.y, '#ffd700');
    } else if (item.type === 'gear') {
        player.inventory.push('⚙');
        spawnCollectEffect(item.x, item.y, '#c0c0c0');
    } else if (item.type === 'crack') {
        player.inventory.push('◈');
        spawnCollectEffect(item.x, item.y, '#7ec8e3');
    }
    buildInventoryUI();
    saveGame();
}

function spawnCollectEffect(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        particles.push({
            x, y, size: Math.random() * 3 + 1,
            speedX: Math.cos(angle) * (Math.random() * 2 + 1),
            speedY: Math.sin(angle) * (Math.random() * 2 + 1),
            opacity: 1, color, life: 1, wobble: 0,
        });
    }
}

function nextLevel() {
    currentLevel = (currentLevel + 1) % levels.length;
    loadLevel(currentLevel);
    saveGame();
}

function showDialog() {
    gameState = 'dialog';
    const box = document.getElementById('dialogBox');
    box.style.display = 'block';
    const d = dialogQueue[0];
    document.getElementById('dialogSpeaker').textContent = d.speaker;
    document.getElementById('dialogText').textContent = d.text;
}

function nextDialog() {
    dialogQueue.shift();
    if (dialogQueue.length > 0) {
        const d = dialogQueue[0];
        document.getElementById('dialogSpeaker').textContent = d.speaker;
        document.getElementById('dialogText').textContent = d.text;
    } else {
        document.getElementById('dialogBox').style.display = 'none';
        gameState = 'play';
    }
}

// ===== ФИЗИКА =====
function update(dt) {
    if (gameState !== 'play') return;

    const lvl = levels[currentLevel];
    const accel = 0.6, friction = 0.82, gravity = 0.35, jumpForce = -8.5;

    if (keys['ArrowLeft'] || keys['KeyA']) { player.vx -= accel; player.facing = -1; }
    if (keys['ArrowRight'] || keys['KeyD']) { player.vx += accel; player.facing = 1; }
    if ((keys['ArrowUp'] || keys['KeyW']) && player.grounded) { player.vy = jumpForce; player.grounded = false; sfxJump(); }

    player.vx *= friction;
    player.vy += gravity;
    if (player.vy > 12) player.vy = 12;
    player.x += player.vx;
    player.y += player.vy;

    // Шаги
    if (Math.abs(player.vx) > 1 && player.grounded) {
        player.stepTimer += dt;
        if (player.stepTimer > 250) { player.stepTimer = 0; sfxStep(); }
    }

    // Анимация
    if (Math.abs(player.vx) > 0.5) {
        player.animTimer += dt;
        if (player.animTimer > 150) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }
    } else { player.animFrame = 0; }

    // Коллизия
    player.grounded = false;
    for (const p of lvl.platforms) {
        if (player.x + player.w / 2 > p.x && player.x - player.w / 2 < p.x + p.w) {
            if (player.y + player.h / 2 > p.y && player.y + player.h / 2 < p.y + 30 && player.vy >= 0) {
                player.y = p.y - player.h / 2;
                player.vy = 0;
                player.grounded = true;
            }
        }
    }

    player.x = Math.max(player.w / 2, Math.min(canvas.width - player.w / 2, player.x));
    player.y = Math.max(0, Math.min(canvas.height - 30, player.y));

    // Течения воды
    currentFlow = { x: 0, y: 0 };
    if (lvl.currents) {
        for (const c of lvl.currents) {
            if (player.x > c.x && player.x < c.x + c.w && player.y > c.y && player.y < c.y + c.h) {
                currentFlow.x += c.vx;
                currentFlow.y += c.vy;
            }
        }
        player.vx += currentFlow.x * 0.05;
        player.vy += currentFlow.y * 0.05;
    }

    // Спутник-фонарик
    companion.targetX = player.x + 30 * player.facing;
    companion.targetY = player.y - 25;
    companion.x += (companion.targetX - companion.x) * 0.08;
    companion.y += (companion.targetY - companion.y) * 0.06;
    companion.glow = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;

    // Кислород
    player.oxygen -= 0.015;
    if (player.oxygen < 0) { player.oxygen = 100; player.health -= 5; screenShake = 10; sfxDamage(); }
    if (player.invincible > 0) player.invincible -= dt;

    // Враги
    for (const e of lvl.enemies) {
        updateEnemy(e, dt);
        if (Math.abs(player.x - e.x) < 20 && Math.abs(player.y - e.y) < 25 && player.invincible <= 0) {
            player.health -= 10;
            player.invincible = 800;
            screenShake = 8;
            sfxDamage();
            spawnCollectEffect(player.x, player.y, '#ff6b6b');
        }
    }

    // Боссы
    for (const b of bosses) {
        updateBoss(b, dt);
        if (Math.abs(player.x - b.x) < 30 && Math.abs(player.y - b.y) < 35 && player.invincible <= 0) {
            player.health -= 20;
            player.invincible = 1200;
            screenShake = 12;
            sfxDamage();
            spawnCollectEffect(player.x, player.y, '#ff4040');
        }
    }

    // Пузыри
    if (Math.random() < 0.06) { bubbles.push(makeBubble(player.x, player.y - 20)); sfxBubble(); }

    bubbles = bubbles.filter(b => {
        b.y -= b.speedY;
        b.x += Math.sin(b.wobble) * 0.3;
        b.wobble += 0.1;
        return b.y > -10;
    });

    // Частицы
    particles = particles.filter(p => {
        if (p.life !== undefined) {
            p.life -= dt * 0.002;
            p.opacity = p.life;
            p.x += p.speedX;
            p.y += p.speedY;
            return p.life > 0;
        }
        p.x += p.speedX; p.y += p.speedY;
        p.wobble += 0.02;
        p.x += Math.sin(p.wobble) * 0.15;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        return true;
    });

    if (screenShake > 0) screenShake -= 0.5;

    document.getElementById('oxygenBar').style.width = player.oxygen + '%';
    document.getElementById('healthBar').style.width = player.health + '%';
    document.getElementById('depth').textContent = Math.floor((canvas.height - player.y) / 4);

    if (player.health <= 0) {
        player.health = 100; player.oxygen = 100;
        sfxDamage();
        loadLevel(currentLevel);
    }
}

function updateEnemy(e, dt) {
    const speed = e.type === 'ember' ? 1.5 : e.type === 'crab' ? 1.2 : e.type === 'fish' ? 2.0 : 0.8;
    if (!e.dir) e.dir = 1;
    if (e.x < e.patrol[0]) e.dir = 1;
    if (e.x > e.patrol[1]) e.dir = -1;
    e.x += speed * e.dir;
    e.animTimer = (e.animTimer || 0) + dt;
    // Медузы — вверх-вниз
    if (e.type === 'jellyfish') {
        if (!e.floatDir) e.floatDir = 1;
        if (!e.baseY) e.baseY = e.y;
        e.y += e.floatDir * 0.3;
        if (Math.abs(e.y - e.baseY) > 30) e.floatDir *= -1;
    }
}

function updateBoss(b, dt) {
    const speed = 0.6;
    if (!b.dir) b.dir = 1;
    if (b.x < b.patrol[0]) b.dir = 1;
    if (b.x > b.patrol[1]) b.dir = -1;
    b.x += speed * b.dir;
    b.animTimer = (b.animTimer || 0) + dt;
    if (b.hitFlash > 0) b.hitFlash -= dt;
}

// ===== ОТРИСОВКА =====
function render() {
    const lvl = levels[currentLevel];
    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }
    if (museumMode) {
        renderMuseum();
    } else {
        drawBackground(lvl);
        drawEnvironment(lvl);
        drawParticles();
        drawPlatforms(lvl);
        drawCollectibles(lvl);
        drawPrisms(lvl);
        drawEnemies(lvl);
        drawBosses(lvl);
        drawNPCs(lvl);
        drawExit(lvl);
        drawFlashlight();
        drawCompanion();
        const s = STATUETTES[currentIdx];
        drawStatuette(s, player.x, player.y, player.facing, player.animFrame, 1.4);
        drawBubbles();
        drawCurrentIndicator();
        drawHUD();
        if (customizeOpen) drawCustomizeUI();
    }
    ctx.restore();
}

function drawBackground(lvl) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, lvl.bg[0]);
    grad.addColorStop(0.5, lvl.bg[1]);
    grad.addColorStop(1, lvl.bg[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color || '#d0e8ff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawBubbles() {
    ctx.strokeStyle = 'rgba(180, 230, 255, 0.4)';
    ctx.lineWidth = 0.8;
    for (const b of bubbles) {
        ctx.globalAlpha = b.opacity;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200, 240, 255, 0.15)';
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawPlatforms(lvl) {
    for (const p of lvl.platforms) {
        const isDark = p.type === 'obsidian' || p.type === 'stone';
        const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
        if (isDark) {
            grad.addColorStop(0, '#3a3028');
            grad.addColorStop(1, '#2a1a10');
        } else {
            grad.addColorStop(0, '#4a3a2a');
            grad.addColorStop(1, '#3a2818');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let bx = p.x; bx < p.x + p.w; bx += 36) {
            ctx.beginPath(); ctx.moveTo(bx, p.y); ctx.lineTo(bx, p.y + p.h); ctx.stroke();
        }
        if (p.type === 'lava') {
            ctx.fillStyle = 'rgba(255, 70, 15, 0.25)';
            ctx.fillRect(p.x, p.y - 3, p.w, 5);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(p.x, p.y, p.w, 2);
    }
}

function drawCollectibles(lvl) {
    const t = Date.now() * 0.003;
    for (const c of lvl.collectibles) {
        const bob = Math.sin(t + c.x) * 3;
        ctx.save();
        ctx.translate(c.x, c.y + bob);
        if (c.type === 'pearl') {
            const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
            g.addColorStop(0, '#fff'); g.addColorStop(0.3, '#f0f0ff');
            g.addColorStop(0.7, '#c8d8f0'); g.addColorStop(1, '#90a8c8');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath(); ctx.arc(-2, -3, 2, 0, Math.PI * 2); ctx.fill();
        } else if (c.type === 'gold') {
            ctx.fillStyle = '#d4af37';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const r = i % 2 === 0 ? 9 : 5;
                i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        } else if (c.type === 'gear') {
            ctx.fillStyle = '#a0a0b0';
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#606070';
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
        } else if (c.type === 'crack') {
            ctx.strokeStyle = '#7ec8e3'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(0, -2); ctx.lineTo(3, -4); ctx.lineTo(1, 3); ctx.lineTo(5, 8); ctx.stroke();
        }
        ctx.restore();
    }
}

function drawEnemies(lvl) {
    const t = Date.now() * 0.005;
    for (const e of lvl.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        if (e.type === 'dust') {
            const w = Math.sin((e.animTimer || 0) * 0.005) * 3;
            ctx.fillStyle = 'rgba(180,160,140,0.6)';
            ctx.beginPath(); ctx.arc(w, 0, 10 + Math.sin(t) * 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(200,180,160,0.4)';
            ctx.beginPath(); ctx.arc(w, 0, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4a3020';
            ctx.beginPath(); ctx.arc(w - 3, -2, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(w + 3, -2, 1.5, 0, Math.PI * 2); ctx.fill();
        } else if (e.type === 'ember') {
            const gl = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
            gl.addColorStop(0, 'rgba(255,120,20,0.7)');
            gl.addColorStop(1, 'rgba(255,30,0,0)');
            ctx.fillStyle = gl;
            ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff4400';
            ctx.beginPath(); ctx.arc(0, 0, 6 + Math.sin(t) * 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
        } else if (e.type === 'jellyfish') {
            // Медуза — купол + щупальца
            const pulse = Math.sin(t * 2) * 2;
            const glow = ctx.createRadialGradient(0, -4, 2, 0, -4, 14);
            glow.addColorStop(0, 'rgba(180,120,255,0.5)');
            glow.addColorStop(0.6, 'rgba(140,80,220,0.3)');
            glow.addColorStop(1, 'rgba(100,40,180,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(0, -4, 14, 0, Math.PI * 2); ctx.fill();
            // Купол
            ctx.fillStyle = 'rgba(180,140,240,0.5)';
            ctx.beginPath();
            ctx.ellipse(0, -4, 10 + pulse, 8, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = 'rgba(200,170,255,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, -4, 6, 5, 0, Math.PI, 0);
            ctx.fill();
            // Глаза
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath(); ctx.arc(-3, -5, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, -5, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2a1040';
            ctx.beginPath(); ctx.arc(-3, -5, 0.7, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, -5, 0.7, 0, Math.PI * 2); ctx.fill();
            // Щупальца
            ctx.strokeStyle = 'rgba(160,100,230,0.4)';
            ctx.lineWidth = 1;
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 2.5, 2);
                ctx.quadraticCurveTo(i * 2.5 + Math.sin(t + i) * 3, 10, i * 2.5, 18);
                ctx.stroke();
            }
        } else if (e.type === 'crab') {
            // Краб
            const dir = e.dir || 1;
            ctx.scale(dir, 1);
            // Панцирь
            ctx.fillStyle = '#c05030';
            ctx.beginPath();
            ctx.ellipse(0, -2, 10, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a04028';
            ctx.beginPath();
            ctx.ellipse(0, -2, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Узор панциря
            ctx.strokeStyle = 'rgba(255,200,150,0.3)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(-4, -4); ctx.lineTo(0, -6); ctx.lineTo(4, -4);
            ctx.stroke();
            // Клешни
            ctx.fillStyle = '#c05030';
            const clawOpen = Math.sin(t * 3) * 2;
            ctx.beginPath();
            ctx.ellipse(-12, -3, 5, 3, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(12, -3, 5, 3, 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Пальцы клешней
            ctx.strokeStyle = '#c05030'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-16, -3); ctx.lineTo(-18, -6 + clawOpen); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-16, -3); ctx.lineTo(-18, -1 - clawOpen); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(18, -6 + clawOpen); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(18, -1 - clawOpen); ctx.stroke();
            // Ножки
            ctx.strokeStyle = '#a04028'; ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(-6 + i * 2, 3);
                ctx.lineTo(-10 + i * 3, 8);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(6 - i * 2, 3);
                ctx.lineTo(10 - i * 3, 8);
                ctx.stroke();
            }
            // Глазки на стебельках
            ctx.fillStyle = '#1a0a08';
            ctx.beginPath(); ctx.arc(-4, -8, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(4, -8, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#a04028'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(-3, -5); ctx.lineTo(-4, -8); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(3, -5); ctx.lineTo(4, -8); ctx.stroke();
            ctx.scale(dir, 1);
        } else if (e.type === 'fish') {
            // Рыба
            const dir = e.dir || 1;
            ctx.scale(dir, 1);
            const tailWag = Math.sin(t * 4) * 0.3;
            // Тело
            const fishGrad = ctx.createRadialGradient(-2, 0, 2, 0, 0, 12);
            fishGrad.addColorStop(0, '#60c0e0');
            fishGrad.addColorStop(0.6, '#4090b0');
            fishGrad.addColorStop(1, '#206080');
            ctx.fillStyle = fishGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Хвост
            ctx.fillStyle = '#4090b0';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-18, -6 + Math.sin(tailWag) * 3);
            ctx.lineTo(-18, 6 + Math.sin(tailWag) * 3);
            ctx.closePath();
            ctx.fill();
            // Плавник
            ctx.fillStyle = 'rgba(80,180,220,0.5)';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.quadraticCurveTo(3, -12, 6, -7);
            ctx.closePath();
            ctx.fill();
            // Чешуя
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 0.4;
            for (let i = -4; i <= 4; i += 3) {
                ctx.beginPath(); ctx.arc(i, 0, 3, 0, Math.PI * 2); ctx.stroke();
            }
            // Глаз
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(6, -1, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(6.5, -1, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath(); ctx.arc(5.8, -1.5, 0.6, 0, Math.PI * 2); ctx.fill();
            // Полоска
            ctx.strokeStyle = 'rgba(255,200,80,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.quadraticCurveTo(0, -3, 10, 0);
            ctx.stroke();
            ctx.scale(dir, 1);
        }
        ctx.restore();
    }
}

function drawBosses() {
    for (const b of bosses) {
        ctx.save();
        ctx.translate(b.x, b.y);
        const sc = b.dir || 1;
        ctx.scale(sc, 1);
        const flash = b.hitFlash > 0;

        if (b.type === 'cracked_giant') {
            // Расколотый Гигант — уже был
            const g = ctx.createLinearGradient(-20, -30, 20, 30);
            g.addColorStop(0, flash ? '#ff8080' : '#2a2028');
            g.addColorStop(1, flash ? '#ff6060' : '#180808');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(-20, -10); ctx.bezierCurveTo(-28, 5, -25, 25, -18, 35);
            ctx.lineTo(18, 35); ctx.bezierCurveTo(25, 25, 28, 5, 20, -10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = flash ? '#ffaaaa' : '#3a3038';
            ctx.beginPath(); ctx.arc(0, -25, 16, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-8, -38); ctx.lineTo(-4, -28); ctx.lineTo(-10, -18); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(6, -35); ctx.lineTo(10, -25); ctx.stroke();
            ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 6;
            ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(-8, -38); ctx.lineTo(-4, -28); ctx.lineTo(-10, -18); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#c03030';
            ctx.beginPath(); ctx.arc(-5, -25, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -25, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#200000';
            ctx.beginPath(); ctx.arc(-5, -25, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -25, 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1a1018';
            ctx.beginPath(); ctx.moveTo(-12, -40); ctx.lineTo(-10, -50); ctx.lineTo(-5, -44);
            ctx.lineTo(0, -52); ctx.lineTo(5, -44); ctx.lineTo(10, -50); ctx.lineTo(12, -40); ctx.closePath(); ctx.fill();
        } else if (b.type === 'coral_leviathan') {
            // Коралловый Левиафан
            const bodyColor = flash ? '#ff8888' : '#e06040';
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.moveTo(-25, 0); ctx.bezierCurveTo(-30, -15, -15, -35, 0, -30);
            ctx.bezierCurveTo(15, -35, 30, -15, 25, 0);
            ctx.bezierCurveTo(20, 15, 10, 25, 0, 30);
            ctx.bezierCurveTo(-10, 25, -20, 15, -25, 0);
            ctx.closePath(); ctx.fill();
            // Ветви коралла
            ctx.strokeStyle = flash ? '#ffaaaa' : '#f08060'; ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const r = 28;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                ctx.stroke();
                ctx.fillStyle = flash ? '#ffcccc' : '#f08060';
                ctx.beginPath();
                ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            // Глаз
            ctx.fillStyle = flash ? '#fff' : '#ff4040';
            ctx.beginPath(); ctx.arc(-6, -10, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, -10, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#200000';
            ctx.beginPath(); ctx.arc(-6, -10, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, -10, 2, 0, Math.PI * 2); ctx.fill();
            // Полоски
            ctx.strokeStyle = 'rgba(255,200,150,0.3)'; ctx.lineWidth = 0.8;
            for (let i = -15; i <= 15; i += 5) {
                ctx.beginPath(); ctx.moveTo(i, -20); ctx.quadraticCurveTo(i + 2, 0, i, 20); ctx.stroke();
            }
        } else if (b.type === 'frost_guardian') {
            // Ледяной Страж
            const iceColor = flash ? '#ffcccc' : '#a0c8e8';
            ctx.fillStyle = iceColor;
            // Кристаллическое тело — угловатое
            ctx.beginPath();
            ctx.moveTo(0, -35); ctx.lineTo(15, -20); ctx.lineTo(20, 0);
            ctx.lineTo(12, 20); ctx.lineTo(0, 30); ctx.lineTo(-12, 20);
            ctx.lineTo(-20, 0); ctx.lineTo(-15, -20); ctx.closePath();
            ctx.fill();
            // Грани
            ctx.fillStyle = flash ? '#ffaaaa' : '#c0e0f8';
            ctx.beginPath();
            ctx.moveTo(0, -35); ctx.lineTo(15, -20); ctx.lineTo(0, -15); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = flash ? '#ff8888' : '#80b0d0';
            ctx.beginPath();
            ctx.moveTo(0, -35); ctx.lineTo(-15, -20); ctx.lineTo(0, -15); ctx.closePath();
            ctx.fill();
            // Сияние
            ctx.shadowColor = '#a0d0f0'; ctx.shadowBlur = 8;
            ctx.strokeStyle = '#c0e0f8'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(15, -20); ctx.lineTo(20, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(-15, -20); ctx.lineTo(-20, 0); ctx.stroke();
            ctx.shadowBlur = 0;
            // Глаз
            ctx.fillStyle = '#4090c0';
            ctx.beginPath(); ctx.arc(-5, -10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-5, -10, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -10, 1.5, 0, Math.PI * 2); ctx.fill();
        } else if (b.type === 'furnace_golem') {
            // Каменный Горн
            const moltenColor = flash ? '#ff8844' : '#4a2018';
            ctx.fillStyle = moltenColor;
            ctx.beginPath();
            ctx.moveTo(-18, -10); ctx.bezierCurveTo(-25, 0, -22, 20, -15, 28);
            ctx.lineTo(15, 28); ctx.bezierCurveTo(22, 20, 25, 0, 18, -10); ctx.closePath();
            ctx.fill();
            // Голова
            ctx.fillStyle = flash ? '#ff6644' : '#3a1810';
            ctx.beginPath(); ctx.arc(0, -22, 14, 0, Math.PI * 2); ctx.fill();
            // Лавовые трещины
            ctx.strokeStyle = flash ? '#ffaa66' : '#ff4400';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 4;
            ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(-3, -24); ctx.lineTo(-8, -16); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(5, -30); ctx.lineTo(8, -22); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-5, 10); ctx.lineTo(-12, 20); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(5, 10); ctx.lineTo(12, 20); ctx.stroke();
            ctx.shadowBlur = 0;
            // Глаза-печки
            ctx.fillStyle = '#ff6600';
            ctx.beginPath(); ctx.arc(-5, -22, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -22, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath(); ctx.arc(-5, -22, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -22, 1.5, 0, Math.PI * 2); ctx.fill();
            // Дым
            ctx.fillStyle = 'rgba(100,80,60,0.2)';
            for (let i = 0; i < 3; i++) {
                const dx = Math.sin(Date.now() * 0.002 + i * 2) * 5;
                ctx.beginPath();
                ctx.arc(dx + i * 5 - 5, -38 - i * 8, 4 + i * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (b.type === 'cracked_mother') {
            // Расколотая Мать — гигантская кукла
            const motherColor = flash ? '#ffaaaa' : '#3a2a3a';
            // Платье — широкая юбка
            const mg = ctx.createLinearGradient(-30, -10, 30, 35);
            mg.addColorStop(0, flash ? '#ffcccc' : '#2a1a2a');
            mg.addColorStop(1, flash ? '#ffaaaa' : '#1a0a1a');
            ctx.fillStyle = mg;
            ctx.beginPath();
            ctx.moveTo(-12, -10);
            ctx.bezierCurveTo(-35, 5, -30, 25, -25, 35);
            ctx.lineTo(25, 35);
            ctx.bezierCurveTo(30, 25, 35, 5, 12, -10);
            ctx.closePath(); ctx.fill();
            // Корсаж
            ctx.fillStyle = flash ? '#ffcccc' : '#3a2a3a';
            ctx.fillRect(-10, -22, 20, 14);
            // Голова — огромная фарфоровая
            const motherHead = ctx.createRadialGradient(-4, -38, 3, 0, -35, 18);
            motherHead.addColorStop(0, flash ? '#ffe0e0' : '#e8d8d0');
            motherHead.addColorStop(1, flash ? '#ffcccc' : '#c0b0a8');
            ctx.fillStyle = motherHead;
            ctx.beginPath(); ctx.ellipse(0, -35, 16, 18, 0, 0, Math.PI * 2); ctx.fill();
            // Трещины — золотые
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2;
            ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.moveTo(-10, -48); ctx.lineTo(-6, -40); ctx.lineTo(-12, -32); ctx.lineTo(-8, -25); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8, -46); ctx.lineTo(12, -38); ctx.lineTo(6, -30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-2, -50); ctx.lineTo(0, -42); ctx.lineTo(-4, -35); ctx.stroke();
            ctx.shadowBlur = 0;
            // Глаза — огромные, стеклянные
            [-6, 6].forEach(ex => {
                const eg = ctx.createRadialGradient(ex, -36, 2, ex, -36, 5);
                eg.addColorStop(0, '#fff'); eg.addColorStop(0.3, '#a04060');
                eg.addColorStop(0.7, '#803050'); eg.addColorStop(1, '#200010');
                ctx.fillStyle = eg;
                ctx.beginPath(); ctx.ellipse(ex, -36, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#100008';
                ctx.beginPath(); ctx.arc(ex, -36, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.beginPath(); ctx.arc(ex - 1, -37.5, 1.2, 0, Math.PI * 2); ctx.fill();
            });
            // Ресницы
            ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-12, -40); ctx.quadraticCurveTo(-9, -44, -6, -42); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(12, -40); ctx.quadraticCurveTo(9, -44, 6, -42); ctx.stroke();
            // Волосы
            ctx.fillStyle = flash ? '#ffcccc' : '#1a0a10';
            ctx.beginPath(); ctx.ellipse(0, -45, 18, 8, 0, Math.PI + 0.2, -0.2); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-16, -40); ctx.quadraticCurveTo(-22, -28, -18, -18);
            ctx.quadraticCurveTo(-16, -24, -14, -30); ctx.quadraticCurveTo(-14, -36, -16, -40);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(16, -40); ctx.quadraticCurveTo(22, -28, 18, -18);
            ctx.quadraticCurveTo(16, -24, 14, -30); ctx.quadraticCurveTo(14, -36, 16, -40);
            ctx.fill();
            // Руки
            ctx.fillStyle = flash ? '#ffe0e0' : '#e0d0c8';
            ctx.beginPath(); ctx.roundRect(-14, -18, 6, 16, 3); ctx.fill();
            ctx.beginPath(); ctx.roundRect(8, -18, 6, 16, 3); ctx.fill();
            // Корона
            ctx.fillStyle = '#1a0a10';
            ctx.beginPath();
            ctx.moveTo(-10, -52); ctx.lineTo(-8, -62); ctx.lineTo(-4, -56);
            ctx.lineTo(0, -65); ctx.lineTo(4, -56); ctx.lineTo(8, -62); ctx.lineTo(10, -52);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(0, -65, 2, 0, Math.PI * 2); ctx.fill();
        }

        // HP bar (общий для всех)
        ctx.fillStyle = '#1a0a0a';
        ctx.fillRect(-20, -58, 40, 4);
        ctx.fillStyle = b.type === 'frost_guardian' ? '#60a0d0' : b.type === 'furnace_golem' ? '#ff6600' : b.type === 'coral_leviathan' ? '#e06040' : '#c03030';
        ctx.fillRect(-20, -58, 40 * (b.hp / b.maxHp), 4);
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 0.5;
        ctx.strokeRect(-20, -58, 40, 4);

        ctx.restore();
    }
}

function drawNPCs(lvl) {
    const t = Date.now() * 0.002;
    for (const npc of lvl.npcs) {
        const bob = Math.sin(t) * 2;
        const s = STATUETTES[1]; // meha
        drawStatuette(s, npc.x, npc.y + bob, 1, 0, 1.0);
        ctx.fillStyle = '#80d0ff';
        ctx.font = '18px Georgia';
        ctx.fillText('?', npc.x - 5, npc.y - 55 + Math.sin(t * 2) * 3);
    }
}

function drawExit(lvl) {
    const ex = lvl.exit;
    const t = Date.now() * 0.002;
    ctx.save();
    ctx.translate(ex.x + ex.w / 2, ex.y + ex.h / 2);
    const gl = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
    gl.addColorStop(0, 'rgba(100,200,255,0.35)');
    gl.addColorStop(1, 'rgba(100,200,255,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(0, 0, 40 + Math.sin(t) * 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5aa0c8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 5, 18, Math.PI, 0); ctx.lineTo(18, 25); ctx.lineTo(-18, 25); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = 'rgba(80,160,200,0.12)'; ctx.fill();
    ctx.restore();
}

function drawFlashlight() {
    if (!player.flashlight) return;
    const g = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 160);
    g.addColorStop(0, 'rgba(255,250,220,0.12)');
    g.addColorStop(0.5, 'rgba(255,250,220,0.04)');
    g.addColorStop(1, 'rgba(255,250,220,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(player.x, player.y, 160, 0, Math.PI * 2); ctx.fill();
}

// ===== СРЕДА =====
function drawEnvironment(lvl) {
    const t = Date.now() * 0.001;
    // Водоросли
    if (lvl.seaweed) {
        for (const sw of lvl.seaweed) {
            ctx.strokeStyle = 'rgba(40,120,60,0.4)';
            ctx.lineWidth = 2;
            const segments = 6;
            for (let s = 0; s < 3; s++) {
                ctx.beginPath();
                ctx.moveTo(sw.x + s * 8, sw.y);
                for (let i = 1; i <= segments; i++) {
                    const py = sw.y - (sw.h / segments) * i;
                    const px = sw.x + s * 8 + Math.sin(t + sw.phase + i * 0.5) * (3 + i * 0.5);
                    ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
            // Листочки
            ctx.fillStyle = 'rgba(50,140,70,0.3)';
            for (let i = 2; i < segments; i += 2) {
                const py = sw.y - (sw.h / segments) * i;
                const px = sw.x + Math.sin(t + sw.phase + i * 0.5) * (3 + i * 0.5);
                ctx.beginPath();
                ctx.ellipse(px + 4, py, 4, 2, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    // Песок на дне
    if (lvl.bg[2] === '#0a1628' || lvl.bg[2] === '#081818' || lvl.bg[2] === '#060c18') {
        ctx.fillStyle = 'rgba(180,160,120,0.08)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 15);
        for (let x = 0; x <= canvas.width; x += 20) {
            ctx.lineTo(x, canvas.height - 15 + Math.sin(x * 0.02) * 3);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
    // Ржавчина на платформах
    if (lvl.platforms.some(p => p.type === 'pipe')) {
        ctx.fillStyle = 'rgba(160,80,30,0.15)';
        for (const p of lvl.platforms) {
            if (p.type === 'pipe') {
                for (let i = 0; i < 3; i++) {
                    const rx = p.x + Math.random() * p.w;
                    const ry = p.y + Math.random() * p.h;
                    ctx.beginPath();
                    ctx.arc(rx, ry, 2 + Math.random() * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    // Витражи на соборе
    if (lvl.bg[0] === '#0a0a20') {
        ctx.globalAlpha = 0.08;
        const colors = ['#e04040', '#4060e0', '#40c040', '#e0c040'];
        for (let i = 0; i < 4; i++) {
            const vx = 100 + i * 200;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(vx, 0); ctx.lineTo(vx - 40, 200); ctx.lineTo(vx + 40, 200); ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(vx, 60, 25, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    // Ледяные кристаллы
    if (lvl.bg[0] === '#081020') {
        ctx.strokeStyle = 'rgba(160,200,240,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const ix = 80 + i * 140;
            const iy = 50 + Math.sin(i) * 30;
            ctx.beginPath();
            ctx.moveTo(ix, iy); ctx.lineTo(ix - 8, iy + 20); ctx.lineTo(ix + 8, iy + 20); ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ix, iy); ctx.lineTo(ix - 5, iy + 15); ctx.lineTo(ix + 5, iy + 15); ctx.closePath();
            ctx.stroke();
        }
    }
}

// ===== КОРАБЛЬ-ФОНАРИК =====
function drawCompanion() {
    ctx.save();
    ctx.translate(companion.x, companion.y);
    // Свечение
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    glow.addColorStop(0, `rgba(255,240,180,${companion.glow * 0.3})`);
    glow.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    // Фонарик
    ctx.fillStyle = '#8a7050';
    ctx.beginPath();
    ctx.roundRect(-3, -4, 6, 8, 2);
    ctx.fill();
    ctx.fillStyle = '#d4af72';
    ctx.beginPath();
    ctx.roundRect(-4, -5, 8, 3, 1);
    ctx.fill();
    // Стекло
    ctx.fillStyle = `rgba(255,240,180,${companion.glow})`;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Луч
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

// ===== ПРИЗМЫ =====
function drawPrisms(lvl) {
    if (!lvl.collectibles) return;
    const t = Date.now() * 0.002;
    for (const c of lvl.collectibles) {
        if (c.type !== 'prism') continue;
        const bob = Math.sin(t + c.x * 0.1) * 2;
        ctx.save();
        ctx.translate(c.x, c.y + bob);
        // Призма — треугольник
        ctx.fillStyle = 'rgba(200,220,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(-8, 6); ctx.lineTo(8, 6);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(200,220,255,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(-8, 6); ctx.lineTo(8, 6); ctx.closePath();
        ctx.stroke();
        // Радуга
        const rainbow = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff'];
        for (let i = 0; i < rainbow.length; i++) {
            const angle = (Math.PI / rainbow.length) * i + t * 0.5;
            const r = 14;
            ctx.fillStyle = rainbow[i];
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Блик
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(-2, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ===== УКАЗАТЕЛЬ ТЕЧЕНИЯ =====
function drawCurrentIndicator() {
    if (Math.abs(currentFlow.x) < 0.1 && Math.abs(currentFlow.y) < 0.1) return;
    const t = Date.now() * 0.003;
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#80c0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const ox = Math.sin(t + i * 1.2) * 8;
        const oy = Math.cos(t + i * 0.8) * 6;
        ctx.beginPath();
        ctx.moveTo(player.x + ox - 15, player.y + oy + 10);
        ctx.lineTo(player.x + ox + 15, player.y + oy + 10);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// ===== КАСТОМИЗАЦИЯ =====
function drawCustomizeUI() {
    const cx = canvas.width / 2 - 160;
    const cy = canvas.height / 2 - 120;
    const cw = 320, ch = 240;

    ctx.fillStyle = 'rgba(8,16,30,0.95)';
    ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 8); ctx.fill();
    ctx.strokeStyle = STATUETTES[currentIdx].gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 8); ctx.stroke();

    ctx.fillStyle = '#e0d0c0';
    ctx.font = 'bold 14px Georgia';
    ctx.fillText('Кастомизация: ' + STATUETTES[currentIdx].name, cx + 15, cy + 25);

    const s = STATUETTES[currentIdx];

    // Цвет трещин
    ctx.fillStyle = '#8090a0'; ctx.font = '11px Georgia';
    ctx.fillText('Цвет трещин:', cx + 15, cy + 55);
    for (let i = 0; i < CRACK_COLORS.length; i++) {
        const bx = cx + 15 + i * 28;
        const by = cy + 65;
        ctx.fillStyle = CRACK_COLORS[i];
        ctx.beginPath(); ctx.arc(bx + 8, by + 8, 8, 0, Math.PI * 2); ctx.fill();
        if (s.crackColor === CRACK_COLORS[i]) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(bx + 8, by + 8, 10, 0, Math.PI * 2); ctx.stroke();
        }
    }

    // Цвет глаз
    ctx.fillStyle = '#8090a0'; ctx.font = '11px Georgia';
    ctx.fillText('Цвет глаз:', cx + 15, cy + 110);
    for (let i = 0; i < EYE_COLORS.length; i++) {
        const bx = cx + 15 + i * 28;
        const by = cy + 120;
        ctx.fillStyle = EYE_COLORS[i];
        ctx.beginPath(); ctx.arc(bx + 8, by + 8, 8, 0, Math.PI * 2); ctx.fill();
        if (s.eyeColor === EYE_COLORS[i]) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(bx + 8, by + 8, 10, 0, Math.PI * 2); ctx.stroke();
        }
    }

    // Цвет каймы
    ctx.fillStyle = '#8090a0'; ctx.font = '11px Georgia';
    ctx.fillText('Цвет каймы:', cx + 15, cy + 165);
    for (let i = 0; i < GOLD_COLORS.length; i++) {
        const bx = cx + 15 + i * 28;
        const by = cy + 175;
        ctx.fillStyle = GOLD_COLORS[i];
        ctx.beginPath(); ctx.arc(bx + 8, by + 8, 8, 0, Math.PI * 2); ctx.fill();
        if (s.gold === GOLD_COLORS[i]) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(bx + 8, by + 8, 10, 0, Math.PI * 2); ctx.stroke();
        }
    }

    ctx.fillStyle = 'rgba(200,230,255,0.4)'; ctx.font = '10px Georgia';
    ctx.fillText('Клик по кружку = применить  |  C = закрыть', cx + 15, cy + ch - 10);
}

// Клик по кастомизации
canvas.addEventListener('click', (e) => {
    if (!customizeOpen) return;
    initAudio();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2 - 160;
    const cy = canvas.height / 2 - 120;
    const s = STATUETTES[currentIdx];

    // Кнопки кастомизации
    // Трещины: cy+55..+90
    for (let i = 0; i < CRACK_COLORS.length; i++) {
        const bx = cx + 15 + i * 28 + 8;
        const by = cy + 73;
        if (Math.hypot(mx - bx, my - by) < 10) { s.crackColor = CRACK_COLORS[i]; s.crackGlow = CRACK_COLORS[i]; return; }
    }
    // Глаза: cy+110..+145
    for (let i = 0; i < EYE_COLORS.length; i++) {
        const bx = cx + 15 + i * 28 + 8;
        const by = cy + 128;
        if (Math.hypot(mx - bx, my - by) < 10) { s.eyeColor = EYE_COLORS[i]; return; }
    }
    // Кайма: cy+165..+200
    for (let i = 0; i < GOLD_COLORS.length; i++) {
        const bx = cx + 15 + i * 28 + 8;
        const by = cy + 183;
        if (Math.hypot(mx - bx, my - by) < 10) { s.gold = GOLD_COLORS[i]; s.accent = GOLD_COLORS[i]; return; }
    }
});

function toggleCustomize() {
    customizeOpen = !customizeOpen;
    if (customizeOpen) gameState = 'customize';
    else gameState = 'play';
}

function drawHUD() {
    // Босс HP внизу если есть
    for (const b of bosses) {
        const bw = 120;
        const bx = canvas.width / 2 - bw / 2;
        const by = canvas.height - 40;
        ctx.fillStyle = 'rgba(10,5,10,0.8)';
        ctx.fillRect(bx - 2, by - 2, bw + 4, 12);
        ctx.fillStyle = '#c03030';
        ctx.fillRect(bx, by, bw * (b.hp / b.maxHp), 8);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, 8);
        ctx.fillStyle = '#e0d0c0';
        ctx.font = '9px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText('Расколотый Гигант', canvas.width / 2, by - 4);
        ctx.textAlign = 'left';
    }
}

// ===== ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ СТАТУЭТКИ =====
function drawStatuette(s, x, y, facing, frame, scale) {
    const sc = scale || 1;
    const f = facing;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f * sc, sc);

    const t = Date.now() * 0.003;
    const breathe = Math.sin(t) * 0.5;
    const legSwing = Math.sin(frame * Math.PI / 2) * 4;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Вызов костюма по типу
    const outfitFn = {
        ballgown: drawOutfitBallgown,
        tunic: drawOutfitTunic,
        robe: drawOutfitRobe,
        armor: drawOutfitArmor,
        dress: drawOutfitDress,
    }[s.outfit] || drawOutfitBallgown;
    outfitFn(s, legSwing, breathe);

    // === ГОЛОВА ===
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.roundRect(-3, -20, 6, 6, 2); ctx.fill();

    const hg = ctx.createRadialGradient(-3, -30, 2, 0, -27, 14);
    hg.addColorStop(0, s.skinHighlight); hg.addColorStop(0.5, s.skinBase); hg.addColorStop(1, s.skinShadow);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(0, -27, 12, 13, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.ellipse(-4, -30, 6, 8, -0.2, 0, Math.PI * 2); ctx.fill();

    // Трещины
    ctx.strokeStyle = s.crackColor; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(-5, -33); ctx.lineTo(-3, -29); ctx.lineTo(-6, -25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -30); ctx.lineTo(7, -26); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = s.crackGlow; ctx.shadowBlur = 4;
    ctx.strokeStyle = s.crackGlow; ctx.lineWidth = 0.4; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(-5, -33); ctx.lineTo(-3, -29); ctx.lineTo(-6, -25); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    // Глаза
    const ey = -28;
    [-4.5, 4.5].forEach(ex => {
        const eg = ctx.createRadialGradient(ex, ey, 1, ex, ey, 3.5);
        eg.addColorStop(0, '#fff'); eg.addColorStop(0.3, s.eyeColor);
        eg.addColorStop(0.8, s.eyeColor); eg.addColorStop(1, '#222');
        ctx.fillStyle = eg;
        ctx.beginPath(); ctx.ellipse(ex, ey, 3.5, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(ex, ey, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(ex - (ex > 0 ? 1 : -1), ey - 1.5, 1, 0, Math.PI * 2); ctx.fill();
    });

    // Ресницы
    ctx.strokeStyle = '#333'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-8.2, ey - 2.5); ctx.quadraticCurveTo(-7, ey - 5.5, -4.5, ey - 4.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8.2, ey - 2.5); ctx.quadraticCurveTo(7, ey - 5.5, 4.5, ey - 4.2); ctx.stroke();

    // Брови
    ctx.strokeStyle = 'rgba(80,60,50,0.3)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-7, ey - 6.5); ctx.quadraticCurveTo(-4.5, ey - 8, -2, ey - 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, ey - 6.5); ctx.quadraticCurveTo(4.5, ey - 8, 2, ey - 7); ctx.stroke();

    // Румянец
    ctx.fillStyle = 'rgba(220,150,140,0.18)';
    ctx.beginPath(); ctx.ellipse(-7, -23.5, 3.5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -23.5, 3.5, 2.2, 0, 0, Math.PI * 2); ctx.fill();

    // Нос
    ctx.strokeStyle = 'rgba(200,180,170,0.25)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(1, -24, 0, -23); ctx.stroke();

    // Рот
    ctx.strokeStyle = 'rgba(180,100,100,0.4)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, -22, 2.2, 0.15, Math.PI - 0.15); ctx.stroke();

    // Волосы
    drawHairGeneric(s);

    ctx.restore();
}

function drawHairGeneric(s) {
    ctx.fillStyle = s.hairShadow;
    ctx.beginPath(); ctx.ellipse(0, -33, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.hairColor;
    ctx.beginPath(); ctx.ellipse(0, -36, 13, 8, 0, Math.PI + 0.2, -0.2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-11, -32); ctx.quadraticCurveTo(-8, -38, -2, -36);
    ctx.quadraticCurveTo(3, -38, 8, -36); ctx.quadraticCurveTo(10, -34, 11, -32);
    ctx.quadraticCurveTo(6, -35, 0, -34); ctx.quadraticCurveTo(-6, -35, -11, -32);
    ctx.fill();
    // Пряди
    ctx.beginPath();
    ctx.moveTo(-11, -32); ctx.quadraticCurveTo(-15, -24, -13, -16);
    ctx.quadraticCurveTo(-12, -18, -10, -22); ctx.quadraticCurveTo(-10, -28, -11, -32);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(11, -32); ctx.quadraticCurveTo(15, -24, 13, -16);
    ctx.quadraticCurveTo(12, -18, 10, -22); ctx.quadraticCurveTo(10, -28, 11, -32);
    ctx.fill();
    // Блик
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.ellipse(-3, -38, 5, 2.5, -0.15, 0, Math.PI * 2); ctx.fill();
}

// ===== УНИВЕРСАЛЬНЫЕ ТИПЫ ОДЕЖДЫ =====
function drawOutfitBallgown(s, legSwing, breathe) {
    // Чулки
    ctx.fillStyle = 'rgba(240,235,228,0.6)';
    ctx.beginPath(); ctx.roundRect(-7, 8, 5, 14, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, 8, 5, 14, 2); ctx.fill();
    // Туфли
    ctx.fillStyle = s.accent;
    ctx.beginPath(); ctx.roundRect(-8, 19, 7, 4, [0,0,3,3]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1, 19, 7, 4, [0,0,3,3]); ctx.fill();
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-8, 22); ctx.lineTo(-1, 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, 22); ctx.lineTo(8, 22); ctx.stroke();
    // Юбка
    const sg = ctx.createLinearGradient(0, -5, 0, 20);
    sg.addColorStop(0, s.dress[0]); sg.addColorStop(0.5, s.dress[1]); sg.addColorStop(1, s.dress[2]);
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(-10, -5);
    ctx.bezierCurveTo(-16, 4, -15, 14, -12, 19); ctx.lineTo(12, 19);
    ctx.bezierCurveTo(15, 14, 16, 4, 10, -5); ctx.closePath(); ctx.fill();
    // Складки
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 0.6;
    for (let i = -8; i <= 8; i += 3) { ctx.beginPath(); ctx.moveTo(i, -3); ctx.quadraticCurveTo(i - 1, 8, i - 2, 18); ctx.stroke(); }
    // Кайма
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.8;
    ctx.beginPath(); for (let i = -11; i <= 11; i += 4) { ctx.moveTo(i, 17); ctx.quadraticCurveTo(i + 2, 15, i + 4, 17); } ctx.stroke();
    // Корсаж
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.roundRect(-9, -16, 18, 12, 3); ctx.fill();
    // Шнуровка
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) { const cy = -14 + i * 2.5; ctx.beginPath(); ctx.moveTo(-1, cy); ctx.lineTo(1, cy + 1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1, cy); ctx.lineTo(-1, cy + 1); ctx.stroke(); }
    // Рукава
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.moveTo(-10, -15); ctx.quadraticCurveTo(-17, -10, -15, -4); ctx.quadraticCurveTo(-13, 0, -11, 2); ctx.quadraticCurveTo(-10, 0, -10, -4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -15); ctx.quadraticCurveTo(17, -10, 15, -4); ctx.quadraticCurveTo(13, 0, 11, 2); ctx.quadraticCurveTo(10, 0, 10, -4); ctx.closePath(); ctx.fill();
    // Руки
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.roundRect(-12, -2, 4, 10, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(8, -2, 4, 10, 2); ctx.fill();
    // Пелерина
    ctx.globalAlpha = 0.5; ctx.fillStyle = s.ribbon;
    ctx.beginPath(); ctx.moveTo(-10, -16); ctx.quadraticCurveTo(-18, -6, -14, 4); ctx.quadraticCurveTo(-8, 2, -10, -10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -16); ctx.quadraticCurveTo(18, -6, 14, 4); ctx.quadraticCurveTo(8, 2, 10, -10); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    // Ожерелье
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, -17, 5, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.fillStyle = '#f0f0ff'; ctx.beginPath(); ctx.arc(0, -12, 1.8, 0, Math.PI * 2); ctx.fill();
}

function drawOutfitTunic(s, legSwing) {
    // Штаны
    ctx.fillStyle = s.dress[2];
    ctx.beginPath(); ctx.roundRect(-8, 8, 6, 14, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, 8, 6, 14, 2); ctx.fill();
    // Ботинки
    ctx.fillStyle = s.extra.leather || s.accent;
    ctx.beginPath(); ctx.roundRect(-9, 20, 8, 5, [0,0,3,3]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1, 20, 8, 5, [0,0,3,3]); ctx.fill();
    // Рубаха
    ctx.fillStyle = '#e8ddd0';
    ctx.beginPath(); ctx.roundRect(-10, -16, 20, 18, 2); ctx.fill();
    // Планка
    ctx.fillStyle = s.dress[1];
    ctx.beginPath(); ctx.roundRect(-1.5, -14, 3, 14, 1); ctx.fill();
    ctx.fillStyle = s.extra.brass || s.gold;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, -12 + i * 3.5, 1, 0, Math.PI * 2); ctx.fill(); }
    // Жилет
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.moveTo(-10, -16); ctx.lineTo(-9, -2); ctx.lineTo(-3, 0); ctx.lineTo(-1, -4); ctx.lineTo(1, -4); ctx.lineTo(3, 0); ctx.lineTo(9, -2); ctx.lineTo(10, -16); ctx.closePath(); ctx.fill();
    // Пояс
    ctx.fillStyle = s.extra.leather || s.accent;
    ctx.beginPath(); ctx.roundRect(-10, -3, 20, 4, 1); ctx.fill();
    ctx.fillStyle = s.extra.brass || s.gold;
    ctx.beginPath(); ctx.roundRect(-2.5, -3, 5, 4, 1); ctx.fill();
    // Рукава
    ctx.fillStyle = '#e8ddd0';
    ctx.beginPath(); ctx.roundRect(-13, -14, 6, 10, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(7, -14, 6, 10, 2); ctx.fill();
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.ellipse(-10, -2, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -2, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Шарф
    ctx.fillStyle = s.ribbon;
    ctx.beginPath(); ctx.moveTo(-5, -17); ctx.quadraticCurveTo(0, -15, 5, -17); ctx.quadraticCurveTo(6, -14, 4, -13); ctx.quadraticCurveTo(0, -12, -4, -13); ctx.quadraticCurveTo(-6, -14, -5, -17); ctx.fill();
}

function drawOutfitRobe(s, legSwing) {
    // Плащ
    const w1 = Math.sin(Date.now() * 0.002) * 3;
    ctx.fillStyle = s.dress[1];
    ctx.beginPath(); ctx.moveTo(-10, -14); ctx.bezierCurveTo(-18, -4, -20, 8, -16 + w1, 22); ctx.lineTo(-8, 20); ctx.bezierCurveTo(-10, 10, -10, -2, -10, -14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -14); ctx.bezierCurveTo(18, -4, 20, 8, 16 - w1, 22); ctx.lineTo(8, 20); ctx.bezierCurveTo(10, 10, 10, -2, 10, -14); ctx.closePath(); ctx.fill();
    // Ноги
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.roundRect(-7, 8, 5, 14, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, 8, 5, 14, 2); ctx.fill();
    // Сапоги
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.roundRect(-8, 18, 7, 7, [0,0,3,3]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1, 18, 7, 7, [0,0,3,3]); ctx.fill();
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-8, 19); ctx.lineTo(-1, 19); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, 19); ctx.lineTo(8, 19); ctx.stroke();
    // Жилет
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.moveTo(-9, -16); ctx.lineTo(-8, -2); ctx.lineTo(8, -2); ctx.lineTo(9, -16); ctx.closePath(); ctx.fill();
    // Пуговицы
    ctx.fillStyle = '#e8e0d0';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-1, -14 + i * 3, 1.2, 0, Math.PI * 2); ctx.fill(); }
    // Рукава
    ctx.fillStyle = s.dress[2];
    ctx.beginPath(); ctx.roundRect(-13, -14, 6, 12, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(7, -14, 6, 12, 2); ctx.fill();
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.ellipse(-10, -1, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -1, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Цепь
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, -17, 5, 0.3, Math.PI - 0.3); ctx.stroke();
}

function drawOutfitArmor(s, legSwing) {
    // Ноги в латах
    ctx.fillStyle = s.dress[2];
    ctx.beginPath(); ctx.roundRect(-8, 8, 6, 14, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, 8, 6, 14, 2); ctx.fill();
    // Сапоги-латы
    ctx.fillStyle = s.extra.armor || s.accent;
    ctx.beginPath(); ctx.roundRect(-9, 18, 8, 6, [0,0,3,3]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1, 18, 8, 6, [0,0,3,3]); ctx.fill();
    // Нагрудник
    const ag = ctx.createLinearGradient(-10, -16, 10, -2);
    ag.addColorStop(0, s.dress[0]); ag.addColorStop(0.5, s.dress[1]); ag.addColorStop(1, s.dress[0]);
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.roundRect(-10, -16, 20, 16, 3); ctx.fill();
    // Узор лат
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, -1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(10, -8); ctx.stroke();
    // Пояс
    ctx.fillStyle = s.extra.leather || s.accent;
    ctx.beginPath(); ctx.roundRect(-10, -2, 20, 4, 1); ctx.fill();
    ctx.fillStyle = s.gold;
    ctx.beginPath(); ctx.roundRect(-3, -2, 6, 4, 1); ctx.fill();
    // Плечи
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.ellipse(-12, -14, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -14, 5, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    // Рукавы под латами
    ctx.fillStyle = s.dress[1];
    ctx.beginPath(); ctx.roundRect(-13, -12, 5, 10, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(8, -12, 5, 10, 2); ctx.fill();
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.ellipse(-10, -1, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -1, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
}

function drawOutfitDress(s, legSwing) {
    // Чулки
    ctx.fillStyle = 'rgba(240,235,228,0.5)';
    ctx.beginPath(); ctx.roundRect(-7, 8, 5, 14, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(2, 8, 5, 14, 2); ctx.fill();
    // Туфли
    ctx.fillStyle = s.accent;
    ctx.beginPath(); ctx.roundRect(-8, 19, 7, 4, [0,0,3,3]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1, 19, 7, 4, [0,0,3,3]); ctx.fill();
    // Платье А-силуэт
    const dg = ctx.createLinearGradient(0, -8, 0, 20);
    dg.addColorStop(0, s.dress[0]); dg.addColorStop(0.4, s.dress[1]); dg.addColorStop(1, s.dress[2]);
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.bezierCurveTo(-14, 4, -13, 14, -11, 19);
    ctx.lineTo(11, 19); ctx.bezierCurveTo(13, 14, 14, 4, 8, -8); ctx.closePath(); ctx.fill();
    // Рюши
    ctx.strokeStyle = s.ribbon; ctx.lineWidth = 0.7;
    for (let j = 0; j < 3; j++) {
        const ry = 5 + j * 5;
        ctx.beginPath();
        for (let i = -10; i <= 10; i += 2) { ctx.moveTo(i, ry); ctx.quadraticCurveTo(i + 1, ry - 1.5, i + 2, ry); }
        ctx.stroke();
    }
    // Корсет
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.roundRect(-8, -15, 16, 10, 2); ctx.fill();
    ctx.strokeStyle = s.gold; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(0, -10, 1.5, 0, Math.PI * 2); ctx.stroke();
    // Рукава — бабочки
    ctx.fillStyle = s.dress[0];
    ctx.beginPath(); ctx.moveTo(-9, -13); ctx.quadraticCurveTo(-16, -8, -14, -3); ctx.quadraticCurveTo(-11, 0, -9, -4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, -13); ctx.quadraticCurveTo(16, -8, 14, -3); ctx.quadraticCurveTo(11, 0, 9, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = s.skinBase;
    ctx.beginPath(); ctx.roundRect(-11, -1, 4, 9, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(7, -1, 4, 9, 2); ctx.fill();
    // Пояс-бант
    ctx.fillStyle = s.ribbon;
    ctx.beginPath(); ctx.ellipse(-4, -7, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -7, 3, 2, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.gold; ctx.beginPath(); ctx.arc(0, -7, 1.2, 0, Math.PI * 2); ctx.fill();
}

// ===== СОХРАНЕНИЯ =====
function saveGame() {
    const data = {
        currentIdx, currentLevel,
        pearls: player.pearls,
        inventory: player.inventory,
        health: player.health,
        oxygen: player.oxygen,
    };
    try { localStorage.setItem('glubina_save', JSON.stringify(data)); } catch(e) {}
}
function loadGame() {
    try {
        const raw = localStorage.getItem('glubina_save');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.currentIdx !== undefined) { currentIdx = data.currentIdx; selectChar(data.currentIdx); }
        if (data.currentLevel !== undefined) currentLevel = data.currentLevel;
        if (data.pearls !== undefined) player.pearls = data.pearls;
        if (data.inventory) player.inventory = data.inventory;
        if (data.health !== undefined) player.health = data.health;
        if (data.oxygen !== undefined) player.oxygen = data.oxygen;
        buildInventoryUI();
    } catch(e) {}
}

// ===== МУЗЕЙНЫЙ РЕЖИМ =====
function renderMuseum() {
    museumZoom += (museumZoomTarget - museumZoom) * 0.08;
    if (museumAutoRotate) museumAngle += 0.012 * museumRotateDir;
    else if (keys['ArrowLeft'] || keys['KeyA']) museumAngle -= 0.03;
    else if (keys['ArrowRight'] || keys['KeyD']) museumAngle += 0.03;

    // Фон
    const bg = ctx.createRadialGradient(450, 325, 50, 450, 325, 500);
    bg.addColorStop(0, '#0d1b2a'); bg.addColorStop(0.6, '#080f18'); bg.addColorStop(1, '#020508');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Луч
    ctx.save(); ctx.globalAlpha = 0.1;
    const spot = ctx.createRadialGradient(450, 0, 10, 450, 200, 250);
    spot.addColorStop(0, '#ffeaa7'); spot.addColorStop(1, 'transparent');
    ctx.fillStyle = spot;
    ctx.beginPath(); ctx.moveTo(420, 0); ctx.lineTo(350, 350); ctx.lineTo(550, 350); ctx.lineTo(480, 0); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Пылинки
    ctx.fillStyle = 'rgba(255,250,200,0.25)';
    for (let i = 0; i < 12; i++) {
        const dx = 350 + Math.sin(Date.now() * 0.001 + i * 0.7) * 80;
        const dy = 50 + ((Date.now() * 0.02 + i * 40) % 300);
        ctx.beginPath(); ctx.arc(dx, dy, 1 + Math.sin(Date.now() * 0.003 + i) * 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // Постамент
    drawPedestal(450, 470);

    const s = STATUETTES[currentIdx];
    const fd = Math.cos(museumAngle) > 0 ? 1 : -1;
    const ds = museumZoom * 3.5;

    ctx.save();
    ctx.translate(450, 400);
    ctx.scale(fd * ds, ds);
    // Тень
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 28, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
    const outFn = { ballgown: drawOutfitBallgown, tunic: drawOutfitTunic, robe: drawOutfitRobe, armor: drawOutfitArmor, dress: drawOutfitDress }[s.outfit] || drawOutfitBallgown;
    outFn(s, 0, 0);
    // Голова
    ctx.fillStyle = s.skinBase; ctx.beginPath(); ctx.roundRect(-3, -20, 6, 6, 2); ctx.fill();
    const hg = ctx.createRadialGradient(-3, -30, 2, 0, -27, 14);
    hg.addColorStop(0, s.skinHighlight); hg.addColorStop(0.5, s.skinBase); hg.addColorStop(1, s.skinShadow);
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, -27, 12, 13, 0, 0, Math.PI * 2); ctx.fill();
    // Трещины
    ctx.strokeStyle = s.crackColor; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(-5, -33); ctx.lineTo(-3, -29); ctx.lineTo(-6, -25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -30); ctx.lineTo(7, -26); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = s.crackGlow; ctx.shadowBlur = 4;
    ctx.strokeStyle = s.crackGlow; ctx.lineWidth = 0.4; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(-5, -33); ctx.lineTo(-3, -29); ctx.lineTo(-6, -25); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    // Глаза
    const ey = -28;
    [-4.5, 4.5].forEach(ex => {
        const eg = ctx.createRadialGradient(ex, ey, 1, ex, ey, 3.5);
        eg.addColorStop(0, '#fff'); eg.addColorStop(0.3, s.eyeColor);
        eg.addColorStop(0.8, s.eyeColor); eg.addColorStop(1, '#222');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(ex, ey, 3.5, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex, ey, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ex - (ex > 0 ? 1 : -1), ey - 1.5, 1, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = '#333'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-8.2, ey - 2.5); ctx.quadraticCurveTo(-7, ey - 5.5, -4.5, ey - 4.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8.2, ey - 2.5); ctx.quadraticCurveTo(7, ey - 5.5, 4.5, ey - 4.2); ctx.stroke();
    ctx.fillStyle = 'rgba(220,150,140,0.18)';
    ctx.beginPath(); ctx.ellipse(-7, -23.5, 3.5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -23.5, 3.5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(180,100,100,0.4)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(0, -22, 2.2, 0.15, Math.PI - 0.15); ctx.stroke();
    drawHairGeneric(s);
    ctx.restore();

    // Карточка
    drawInfoCard();

    ctx.fillStyle = 'rgba(200,230,255,0.4)';
    ctx.font = '11px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('← → вращение  |  ↑ ↓ зум  |  SPC авто  |  TAB выход  |  1-0,QWT выбор', 450, canvas.height - 15);
    ctx.textAlign = 'left';
}

function drawPedestal(x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(x, y + 30, 60, 12, 0, 0, Math.PI * 2); ctx.fill();
    const pg = ctx.createLinearGradient(x - 40, y, x + 40, y + 28);
    pg.addColorStop(0, '#c8bfb0'); pg.addColorStop(0.5, '#e0d8cc'); pg.addColorStop(1, '#b0a898');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.moveTo(x - 45, y); ctx.lineTo(x + 45, y); ctx.lineTo(x + 50, y + 28); ctx.lineTo(x - 50, y + 28); ctx.closePath(); ctx.fill();
    const tg = ctx.createLinearGradient(x - 45, y - 5, x + 45, y);
    tg.addColorStop(0, '#e8e0d4'); tg.addColorStop(0.5, '#f0e8dc'); tg.addColorStop(1, '#d8d0c4');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(x - 45, y); ctx.lineTo(x - 35, y - 8); ctx.lineTo(x + 35, y - 8); ctx.lineTo(x + 45, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9a87c'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - 45, y); ctx.lineTo(x + 45, y); ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.roundRect(x - 30, y + 10, 60, 14, 2); ctx.fill();
    ctx.fillStyle = '#c9a87c'; ctx.font = '8px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(STATUETTES[currentIdx].name.toUpperCase(), x, y + 20);
    ctx.textAlign = 'left';
}

function drawInfoCard() {
    const s = STATUETTES[currentIdx];
    const cx = canvas.width - 240, cy = 25, cw = 210, ch = 150;
    ctx.fillStyle = 'rgba(8,16,30,0.92)';
    ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 6); ctx.fill();
    ctx.strokeStyle = s.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 6); ctx.stroke();
    ctx.fillStyle = '#e0d0c0'; ctx.font = 'bold 15px Georgia';
    ctx.fillText(s.name, cx + 12, cy + 24);
    ctx.fillStyle = '#8090a0'; ctx.font = '10px Georgia';
    ctx.fillText(s.desc, cx + 12, cy + 40);
    ctx.strokeStyle = 'rgba(200,168,124,0.2)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx + 12, cy + 50); ctx.lineTo(cx + cw - 12, cy + 50); ctx.stroke();
    ctx.fillStyle = '#708090'; ctx.font = '9px Georgia';
    const labels = { ballgown: 'Бальное платье', tunic: 'Рубаха и жилет', robe: 'Плащ и мантия', armor: 'Латы и нагрудник', dress: 'Платье А-силуэт' };
    ctx.fillText('Наряд: ' + (labels[s.outfit] || s.outfit), cx + 12, cy + 66);
    ctx.fillText('Поза: ' + s.desc, cx + 12, cy + 80);
    ctx.fillText('Трещины: ' + s.crackColor, cx + 12, cy + 94);
    ctx.fillStyle = s.crackGlow;
    ctx.beginPath(); ctx.arc(cx + 16, cy + 106, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#708090';
    ctx.fillText('Свечение: ' + s.crackGlow, cx + 24, cy + 110);
    ctx.fillStyle = s.gold; ctx.font = '10px Georgia';
    ctx.fillText('×' + museumZoom.toFixed(1), cx + cw - 35, cy + ch - 10);
}

// ===== ИГРОВОЙ ЦИКЛ =====
function gameLoop(timestamp) {
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (deltaTime > 100) deltaTime = 16;
    update(deltaTime);
    render();
    requestAnimationFrame(gameLoop);
}

init();
document.getElementById('charBar').style.display = 'none';