// Deterministic, data-driven level generation.
// No module-scope randomness: every value derives from a seeded PRNG keyed by levelId.

export type SceneObject = {
  id: string;
  name: string;
  glyph: string;
  /** normalized 0..1 of scene box */
  x: number;
  y: number;
  /** relative scale */
  scale: number;
  rotation: number;
  decoy: boolean;
  camouflage: number;
};

export type Level = {
  id: number;
  chapter: number;
  chapterName: string;
  themeKey: ThemeKey;
  boss: boolean;
  timeLimit: number;
  objectCount: number;
  decoyCount: number;
  camouflageFactor: number;
  movementFactor: number;
  mechanic: string;
  difficultyScore: number;
};

export type ThemeKey =
  | "house"
  | "city"
  | "forest"
  | "reef"
  | "mansion"
  | "space"
  | "temple"
  | "future"
  | "carnival"
  | "vault";

export const CHAPTER_THEMES: {
  key: ThemeKey;
  name: string;
  mechanic: string;
  props: string[];
  emoji: string;
}[] = [
  {
    key: "house",
    name: "Cozy House",
    mechanic: "Tap to find",
    emoji: "🏠",
    props: ["🧸", "🍪", "🕯️", "🔑", "🧦", "☕", "📚", "🪥", "🧶", "🪑", "🍎", "🕰️", "🪆", "🧴", "🪒", "🍯", "🧁", "🥛", "🪟", "🛋️", "🖼️", "🪞", "🧹", "🧺", "🪣", "🧷", "📻", "💡", "🔌", "🪜", "🧊", "🍞", "🥐", "🧀", "🍵", "🥄", "🍴", "🔨", "📎", "✂️", "🖊️", "📒", "🎧", "🪀", "🎲", "🧩", "🪁", "🩴"],
  },
  {
    key: "city",
    name: "City Street",
    mechanic: "Tiny hidden objects",
    emoji: "🌆",
    props: ["🚕", "🚦", "🥨", "📮", "🛴", "🎈", "🗞️", "🕶️", "☂️", "🍔", "🚲", "🪧", "🚌", "🛵", "🏧", "🚏", "🗑️", "🚧", "🅿️", "🏪", "🍟", "🌭", "🥤", "🍕", "💼", "👜", "🧢", "👟", "📱", "💳", "🎫", "🪙", "🚓", "🚑", "🚒", "🛺", "🛹", "🧃", "🥪", "🌮", "📸", "🎸", "🪗", "🧯", "🚪", "🪟", "🕰️", "🐕"],
  },
  {
    key: "forest",
    name: "Enchanted Forest",
    mechanic: "Camouflaged objects",
    emoji: "🌲",
    props: ["🍄", "🦋", "🐿️", "🪶", "🌰", "🦉", "🌻", "🐌", "🍁", "🪵", "🐝", "🪺", "🦌", "🦊", "🐇", "🐸", "🕷️", "🐜", "🪲", "🐛", "🌿", "🍀", "🌷", "🌼", "🌾", "🪴", "🌳", "🪨", "💧", "🕊️", "🦔", "🦇", "🐻", "🐺", "🥚", "🪹", "🍂", "🌱", "🐞", "🦎", "🕸️", "🌸", "🧺", "🪃", "🔥", "⛺", "🎣", "🪤"],
  },
  {
    key: "reef",
    name: "Underwater Reef",
    mechanic: "Drifting objects",
    emoji: "🐠",
    props: ["🐠", "🐚", "🦀", "🪸", "🐙", "⚓", "🐟", "🧜", "🫧", "🦈", "🗝️", "🐢", "🦞", "🦐", "🦑", "🐡", "🐋", "🐳", "🐬", "🌊", "🧭", "🪝", "⛵", "🛶", "🥽", "🩱", "🪼", "🐊", "🦭", "🏝️", "🗺️", "💰", "💎", "🔱", "🪨", "🌴", "🧊", "🎏", "🪣", "🩸", "🥥", "🦆", "🪺", "📦", "🔦", "🧲", "⛓️", "🪀"],
  },
  {
    key: "mansion",
    name: "Haunted Mansion",
    mechanic: "Decoy objects",
    emoji: "🏚️",
    props: ["🕯️", "🕸️", "🦇", "🗝️", "🪞", "💀", "🧪", "🕰️", "🪦", "🐈‍⬛", "📜", "🎩", "👻", "🧛", "🕷️", "🪤", "🩸", "⚰️", "🔮", "🪄", "📕", "🖼️", "🪑", "🚪", "🪟", "🧹", "🦴", "🐀", "🦉", "🧿", "⛓️", "🗡️", "🏺", "🪔", "🍷", "🥀", "🎻", "🎹", "📿", "🧸", "🪆", "🔔", "🪶", "🧴", "🧨", "💍", "🪙"],
  },
  {
    key: "space",
    name: "Space Station",
    mechanic: "Parallax scene",
    emoji: "🛸",
    props: ["🛰️", "👾", "🚀", "🪐", "🔭", "🧑‍🚀", "☄️", "🛠️", "🔋", "🪫", "🧲", "💫", "🌕", "🌎", "⭐", "🌟", "🛸", "📡", "🖥️", "⌨️", "🧯", "🔦", "🧪", "🧬", "💾", "💿", "🔩", "⚙️", "🪛", "🔧", "🧊", "🥫", "🍱", "☕", "🎛️", "🕹️", "📶", "🔌", "🧰", "🪬", "🌌", "🌠", "🛎️", "🪞", "🧤", "🥽", "🚨", "🗜️"],
  },
  {
    key: "temple",
    name: "Ancient Temple",
    mechanic: "Silhouette clues",
    emoji: "🗿",
    props: ["🗿", "🏺", "💎", "🪔", "🐍", "📿", "⚱️", "🦂", "🪙", "🗡️", "🧭", "🕳️", "🐫", "🪶", "🔥", "🕯️", "📜", "🗺️", "⛏️", "🪨", "🦴", "💀", "👑", "🛡️", "🏹", "🪝", "🧱", "🚪", "🔑", "🗝️", "🪞", "🐊", "🦇", "🕸️", "🌵", "🏜️", "🧉", "🥁", "🎭", "🪘", "🪄", "🔮", "💰", "📯", "⚔️", "🧿", "🪤", "🐞"],
  },
  {
    key: "future",
    name: "Futuristic City",
    mechanic: "Depth layers",
    emoji: "🌃",
    props: ["🤖", "🛸", "💠", "🔌", "🪩", "📡", "🧿", "🖥️", "🛵", "🪟", "🔦", "🎛️", "🕹️", "💾", "🔋", "🧬", "🦾", "🦿", "🥽", "🚨", "📱", "⌚", "🎧", "💳", "🔬", "🧪", "⚡", "🌐", "📶", "🛗", "🚡", "🚈", "🏙️", "🪧", "🧯", "🔩", "⚙️", "🪛", "🖲️", "💿", "📀", "🔐", "🎚️", "🛎️", "🧲", "🪫", "🛰️", "👁️"],
  },
  {
    key: "carnival",
    name: "Carnival Night",
    mechanic: "Distractions",
    emoji: "🎡",
    props: ["🎡", "🍭", "🎯", "🤹", "🎈", "🍿", "🎪", "🥁", "🎟️", "🧁", "🎠", "🪅", "🎢", "🎭", "🎨", "🎤", "🎺", "🪗", "🍦", "🍬", "🍩", "🥤", "🌭", "🍕", "🧸", "🏆", "🎁", "🃏", "🎰", "🎳", "🪀", "🪁", "🤡", "🦄", "🐘", "🦁", "🎬", "📸", "🔔", "🕶️", "👑", "🎀", "🧨", "✨", "🎊", "🎉", "🍫"],
  },
  {
    key: "vault",
    name: "Master Vault",
    mechanic: "Everything at once",
    emoji: "🔐",
    props: ["🔐", "👑", "💰", "🪙", "💎", "🗝️", "🧨", "🛡️", "📦", "🔮", "⚙️", "🏆", "💍", "📿", "🥇", "🏅", "💵", "💴", "💶", "💷", "🪬", "🗿", "🏺", "⚱️", "🔒", "🔓", "🔑", "📜", "🖼️", "🕰️", "🪞", "⌚", "💾", "🧿", "🗡️", "⚔️", "🏹", "🧰", "🔦", "🧲", "🪤", "📡", "🛰️", "🪆", "🧴", "🎖️", "🪧", "🃏"],
  },
];

export const TOTAL_LEVELS = 999;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getLevel(id: number): Level {
  const chapter = Math.ceil(id / 10);
  const theme = CHAPTER_THEMES[(chapter - 1) % CHAPTER_THEMES.length]!;
  const tier = Math.min((chapter - 1) % CHAPTER_THEMES.length, 9);
  const within = ((id - 1) % 10) / 9;
  const loop = Math.floor((chapter - 1) / CHAPTER_THEMES.length);
  const boss = id % 10 === 0;

  const objectCount = Math.min(
    30,
    Math.round(6 + tier * 2.2 + within * 3 + loop * 0.9) + (boss ? 3 : 0),
  );
  const timeLimit = Math.max(35, Math.round(90 - tier * 5 - within * 4 - loop * 2));
  const decoyCount = tier >= 4 ? Math.round(2 + tier * 0.6) : 0;
  const camouflageFactor = Math.min(1, tier / 9 + loop * 0.05);
  const movementFactor = tier >= 3 ? Math.min(1, (tier - 2) / 7) : 0;

  const difficultyScore =
    objectCount * 1.0 +
    camouflageFactor * 10 * 1.5 +
    decoyCount * 2 +
    movementFactor * 10 * 1.8 -
    timeLimit * 0.1;

  return {
    id,
    chapter,
    chapterName: loop > 0 ? `${theme.name} ${loop + 1}` : theme.name,
    themeKey: theme.key,
    boss,
    timeLimit,
    objectCount,
    decoyCount,
    camouflageFactor,
    movementFactor,
    mechanic: theme.mechanic,
    difficultyScore: Math.round(difficultyScore * 10) / 10,
  };
}

/** Builds the scene layout for a level. Pure + deterministic. */
export function buildScene(level: Level): { targets: SceneObject[]; clutter: SceneObject[] } {
  const theme = CHAPTER_THEMES[(level.chapter - 1) % CHAPTER_THEMES.length]!;
  const rand = mulberry32(level.id * 7919 + 13);
  const placed: { x: number; y: number }[] = [];

  const place = () => {
    for (let i = 0; i < 40; i++) {
      const x = 0.07 + rand() * 0.86;
      const y = 0.09 + rand() * 0.82;
      if (placed.every((p) => Math.hypot(p.x - x, (p.y - y) * 0.8) > 0.095)) {
        placed.push({ x, y });
        return { x, y };
      }
    }
    const fallback = { x: 0.07 + rand() * 0.86, y: 0.09 + rand() * 0.82 };
    placed.push(fallback);
    return fallback;
  };

  // Unique glyph pool: every object on screen is one-of-a-kind, so a checklist
  // entry can never match two different sprites at the same time.
  const pool = [...new Set(theme.props)];
  // Fisher-Yates with the seeded PRNG.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  const targetCount = Math.min(level.objectCount, pool.length);
  const targets: SceneObject[] = [];
  for (let i = 0; i < targetCount; i++) {
    const glyph = pool[i]!;
    const pos = place();
    targets.push({
      id: `t${i}`,
      name: glyph,
      glyph,
      x: pos.x,
      y: pos.y,
      scale: 0.85 + rand() * 0.5 - level.camouflageFactor * 0.25,
      rotation: (rand() - 0.5) * 40,
      decoy: false,
      camouflage: level.camouflageFactor * rand(),
    });
  }

  // Remaining unused glyphs become clutter — denser scenes, still no repeats.
  const rest = pool.slice(targetCount);
  const clutterCount = Math.min(
    rest.length,
    12 + Math.round(level.objectCount * 1.4) + level.decoyCount,
  );
  const clutter: SceneObject[] = [];
  for (let i = 0; i < clutterCount; i++) {
    const glyph = rest[i]!;
    const pos = place();
    clutter.push({
      id: `c${i}`,
      name: glyph,
      glyph,
      x: pos.x,
      y: pos.y,
      scale: 0.7 + rand() * 0.5,
      rotation: (rand() - 0.5) * 50,
      decoy: i < level.decoyCount,
      camouflage: level.camouflageFactor * rand(),
    });
  }

  return { targets, clutter };
}

export function makePlayerId(rand: () => number = Math.random) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(rand() * alphabet.length)];
  return `OF-${out}`;
}
