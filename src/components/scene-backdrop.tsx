import type { ThemeKey } from "@/lib/game-data";

/**
 * Hand-drawn style 2D cartoon backdrops — one unique scene per chapter theme,
 * plus a friendly character that lives in the scene. Purely decorative: the
 * whole layer is pointer-events-none so it never steals a tap from an object.
 */

type Scene = {
  sky: [string, string];
  character: string;
  characterPos: { left: string; bottom: string };
  art: JSX.Element;
};

const SCENES: Record<ThemeKey, Scene> = {
  house: {
    sky: ["#ffe8c9", "#ffd0b0"],
    character: "🐱",
    characterPos: { left: "8%", bottom: "6%" },
    art: (
      <g>
        <rect x="0" y="64" width="100" height="36" fill="#c98b5e" />
        <rect x="0" y="62" width="100" height="4" fill="#a86a42" />
        <rect x="6" y="18" width="30" height="26" rx="3" fill="#ffe9a8" stroke="#a86a42" strokeWidth="1.5" />
        <line x1="21" y1="18" x2="21" y2="44" stroke="#a86a42" strokeWidth="1.2" />
        <line x1="6" y1="31" x2="36" y2="31" stroke="#a86a42" strokeWidth="1.2" />
        <rect x="58" y="26" width="36" height="38" rx="3" fill="#e6d6c2" stroke="#a86a42" strokeWidth="1.5" />
        <rect x="62" y="30" width="28" height="10" fill="#cbb8a1" />
        <rect x="62" y="44" width="28" height="10" fill="#cbb8a1" />
        <path d="M18 64v-14h26v14Z" fill="#f3a683" stroke="#a86a42" strokeWidth="1.5" />
        <rect x="26" y="46" width="10" height="6" rx="2" fill="#ffd6a5" />
        <ellipse cx="52" cy="72" rx="26" ry="6" fill="#b2724a" opacity="0.5" />
      </g>
    ),
  },
  city: {
    sky: ["#bfe6ff", "#8fd0f7"],
    character: "🐕",
    characterPos: { left: "72%", bottom: "5%" },
    art: (
      <g>
        <rect x="0" y="70" width="100" height="30" fill="#8d8d9e" />
        <rect x="0" y="86" width="100" height="3" fill="#f0f0f4" opacity="0.7" />
        <rect x="4" y="24" width="18" height="46" fill="#6c7a94" />
        <rect x="26" y="14" width="16" height="56" fill="#5b6a85" />
        <rect x="46" y="30" width="20" height="40" fill="#78889f" />
        <rect x="70" y="20" width="22" height="50" fill="#63728c" />
        {[8, 30, 50, 74].map((x) =>
          [30, 40, 50, 60].map((y) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="#ffe9a8" opacity="0.85" />
          )),
        )}
        <rect x="40" y="56" width="4" height="14" fill="#4a4a5a" />
        <circle cx="42" cy="52" r="5" fill="#ef476f" />
      </g>
    ),
  },
  forest: {
    sky: ["#d8f3c8", "#a8dda1"],
    character: "🦊",
    characterPos: { left: "10%", bottom: "5%" },
    art: (
      <g>
        <ellipse cx="50" cy="94" rx="70" ry="16" fill="#6aa84f" />
        <rect x="0" y="76" width="100" height="24" fill="#7cb45c" />
        {[10, 28, 68, 88].map((x, i) => (
          <g key={x}>
            <rect x={x - 2} y={58 - i * 2} width="4" height="20" fill="#7a5230" />
            <path d={`M${x} ${20 - i * 3}L${x + 14} ${60 - i * 2}H${x - 14}Z`} fill="#3f8f4f" />
            <path d={`M${x} ${30 - i * 3}L${x + 11} ${52 - i * 2}H${x - 11}Z`} fill="#4fa35c" />
          </g>
        ))}
        <ellipse cx="50" cy="80" rx="14" ry="5" fill="#5d9945" />
        <circle cx="80" cy="20" r="8" fill="#fff3b0" opacity="0.8" />
      </g>
    ),
  },
  reef: {
    sky: ["#bdefff", "#5cc9e8"],
    character: "🐬",
    characterPos: { left: "66%", bottom: "42%" },
    art: (
      <g>
        <rect x="0" y="0" width="100" height="100" fill="#5cc9e8" opacity="0.25" />
        <path d="M0 84q14-12 26 0t26 0 26 0 22 0v16H0Z" fill="#f2d6a2" />
        {[14, 34, 58, 82].map((x, i) => (
          <path
            key={x}
            d={`M${x} 86c-6-10 4-16 0-26 6 8 12 10 8 26Z`}
            fill={["#ef7fa0", "#ffb703", "#8ecae6", "#c77dff"][i]}
            opacity="0.9"
          />
        ))}
        {[[20, 30], [46, 18], [74, 34], [60, 52]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#ffffff" opacity="0.55" />
        ))}
      </g>
    ),
  },
  mansion: {
    sky: ["#4b4468", "#2c2743"],
    character: "👻",
    characterPos: { left: "76%", bottom: "48%" },
    art: (
      <g>
        <rect x="0" y="72" width="100" height="28" fill="#3a3352" />
        <path d="M14 72V34l36-22 36 22v38Z" fill="#5a527a" stroke="#241f38" strokeWidth="1.5" />
        <path d="M8 36 50 8l42 28Z" fill="#372f52" />
        <rect x="42" y="52" width="16" height="20" fill="#241f38" />
        <rect x="24" y="42" width="12" height="12" fill="#ffd166" opacity="0.8" />
        <rect x="64" y="42" width="12" height="12" fill="#ffd166" opacity="0.55" />
        <circle cx="18" cy="16" r="7" fill="#f4f1ff" opacity="0.85" />
        {[10, 30, 62, 88].map((x) => (
          <circle key={x} cx={x} cy={(x % 17) + 8} r="1.2" fill="#fff" opacity="0.7" />
        ))}
      </g>
    ),
  },
  space: {
    sky: ["#1d1b3a", "#3b2a63"],
    character: "🧑‍🚀",
    characterPos: { left: "8%", bottom: "44%" },
    art: (
      <g>
        {Array.from({ length: 26 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 100}
            cy={(i * 53) % 96}
            r={i % 4 === 0 ? 1.4 : 0.8}
            fill="#fff"
            opacity={0.5 + ((i % 3) * 0.2)}
          />
        ))}
        <circle cx="74" cy="26" r="14" fill="#f4a261" />
        <ellipse cx="74" cy="26" rx="22" ry="5" fill="none" stroke="#ffd166" strokeWidth="1.6" />
        <rect x="10" y="66" width="52" height="16" rx="8" fill="#8d99ae" />
        <rect x="20" y="58" width="16" height="10" rx="3" fill="#adb5bd" />
        <circle cx="30" cy="74" r="4" fill="#4cc9f0" />
        <circle cx="46" cy="74" r="4" fill="#4cc9f0" />
      </g>
    ),
  },
  temple: {
    sky: ["#ffe0a3", "#f7c08a"],
    character: "🐍",
    characterPos: { left: "78%", bottom: "8%" },
    art: (
      <g>
        <rect x="0" y="74" width="100" height="26" fill="#d9a066" />
        <path d="M6 74V40h88v34Z" fill="#c98b5e" />
        <path d="M2 40 50 14l48 26Z" fill="#b3743f" />
        {[14, 30, 46, 62, 78].map((x) => (
          <rect key={x} x={x} y="44" width="8" height="30" fill="#e0b382" />
        ))}
        <rect x="42" y="56" width="16" height="18" fill="#7a5230" />
        <circle cx="50" cy="30" r="4" fill="#ffd166" />
      </g>
    ),
  },
  future: {
    sky: ["#2b1b4d", "#5b2a86"],
    character: "🤖",
    characterPos: { left: "10%", bottom: "6%" },
    art: (
      <g>
        <rect x="0" y="76" width="100" height="24" fill="#1f1436" />
        <rect x="6" y="30" width="14" height="46" fill="#3b2a63" />
        <rect x="26" y="18" width="18" height="58" fill="#4a3480" />
        <rect x="50" y="36" width="14" height="40" fill="#3b2a63" />
        <rect x="70" y="24" width="22" height="52" fill="#4a3480" />
        {[8, 28, 52, 72].map((x) =>
          [34, 44, 54, 64].map((y) => (
            <rect key={`${x}-${y}`} x={x + 2} y={y} width="6" height="3" fill="#4cc9f0" opacity="0.9" />
          )),
        )}
        <ellipse cx="50" cy="86" rx="34" ry="5" fill="#8338ec" opacity="0.6" />
      </g>
    ),
  },
  carnival: {
    sky: ["#ffd6f0", "#c9b6ff"],
    character: "🤡",
    characterPos: { left: "74%", bottom: "6%" },
    art: (
      <g>
        <rect x="0" y="78" width="100" height="22" fill="#7b5ea7" />
        <circle cx="26" cy="46" r="22" fill="none" stroke="#ef476f" strokeWidth="3" />
        <circle cx="26" cy="46" r="4" fill="#ffd166" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1="26"
            y1="46"
            x2={26 + Math.cos((a * Math.PI) / 180) * 22}
            y2={46 + Math.sin((a * Math.PI) / 180) * 22}
            stroke="#ffb703"
            strokeWidth="1.6"
          />
        ))}
        <path d="M58 78V54l18-16 18 16v24Z" fill="#ffffff" />
        {[58, 64, 70, 76, 82, 88].map((x, i) => (
          <rect key={x} x={x} y="54" width="6" height="24" fill={i % 2 ? "#ef476f" : "#ffe8f3"} />
        ))}
        <path d="M52 54 76 34l24 20Z" fill="#ef476f" />
      </g>
    ),
  },
  vault: {
    sky: ["#f6e6b4", "#d8b25f"],
    character: "🦝",
    characterPos: { left: "8%", bottom: "6%" },
    art: (
      <g>
        <rect x="0" y="70" width="100" height="30" fill="#8b6b2e" />
        <rect x="0" y="0" width="100" height="70" fill="#b99544" opacity="0.5" />
        <circle cx="50" cy="42" r="24" fill="#a2802f" stroke="#6f5620" strokeWidth="2" />
        <circle cx="50" cy="42" r="9" fill="#f6e6b4" />
        {[0, 45, 90, 135].map((a) => (
          <line
            key={a}
            x1={50 - Math.cos((a * Math.PI) / 180) * 18}
            y1={42 - Math.sin((a * Math.PI) / 180) * 18}
            x2={50 + Math.cos((a * Math.PI) / 180) * 18}
            y2={42 + Math.sin((a * Math.PI) / 180) * 18}
            stroke="#6f5620"
            strokeWidth="2"
          />
        ))}
        {[16, 30, 70, 84].map((x) => (
          <rect key={x} x={x} y="76" width="12" height="8" rx="2" fill="#ffd166" />
        ))}
      </g>
    ),
  },
};

export function SceneBackdrop({ theme }: { theme: ThemeKey }) {
  const scene = SCENES[theme];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${scene.sky[0]}, ${scene.sky[1]})` }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {scene.art}
      </svg>
      <span
        className="animate-wiggle absolute text-4xl drop-shadow"
        style={{ left: scene.characterPos.left, bottom: scene.characterPos.bottom }}
      >
        {scene.character}
      </span>
    </div>
  );
}
