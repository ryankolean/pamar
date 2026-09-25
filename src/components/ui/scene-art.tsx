/**
 * On-brand construction illustrations used wherever a photo hasn't been supplied yet.
 * Flat, duotone (charcoal + safety amber) scenes drawn on a 400×300 canvas that scales to fill
 * any frame. Decorative: the wrapping element carries the accessible label.
 */
export const scenes = [
  "excavator",
  "pipes",
  "emergency",
  "road",
  "site",
  "demolition",
  "crane",
  "hardhat",
  "person",
] as const;

export type Scene = (typeof scenes)[number];

const C = {
  sky: "#1b2026",
  skyDeep: "#14181d",
  hills: "#232a31",
  ground: "#2b333b",
  groundEdge: "#39424c",
  trench: "#111418",
  rock: "#3a434d",
  rockLight: "#4a5460",
  steel: "#9aa3ad",
  white: "#e7e9ec",
  amber: "#f2a900",
  amberDark: "#c98a00",
  amberDeep: "#9a6700",
};

function Backdrop({ sun = true }: { sun?: boolean }) {
  return (
    <>
      <rect width="400" height="300" fill={C.sky} />
      <rect width="400" height="90" fill={C.skyDeep} />
      {sun && <circle cx="322" cy="74" r="28" fill={C.amber} opacity="0.16" />}
      <path
        d="M0 205 L60 176 L120 195 L190 160 L262 190 L330 168 L400 184 V300 H0Z"
        fill={C.hills}
      />
      <rect y="215" width="400" height="85" fill={C.ground} />
      <rect y="215" width="400" height="3" fill={C.groundEdge} />
    </>
  );
}

/** Excavator facing left, anchored with its tracks at y≈244. */
function Excavator() {
  return (
    <g>
      <rect x="150" y="222" width="122" height="22" rx="11" fill={C.trench} />
      {[163, 186, 209, 232, 256].map((cx) => (
        <circle key={cx} cx={cx} cy="233" r="6" fill={C.rock} />
      ))}
      <rect x="166" y="208" width="90" height="15" fill={C.amberDark} />
      <path d="M170 170 H252 V208 H170Z" fill={C.amber} />
      <rect x="236" y="176" width="24" height="28" rx="3" fill={C.amberDark} />
      <path d="M175 138 H214 L222 170 H175Z" fill={C.amber} />
      <path d="M181 144 H210 L216 165 H181Z" fill={C.sky} opacity="0.9" />
      <path d="M212 180 L224 170 L150 102 L137 113Z" fill={C.amber} />
      <line
        x1="202"
        y1="178"
        x2="160"
        y2="122"
        stroke={C.steel}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M137 113 L150 102 L112 162 L101 155Z" fill={C.amberDark} />
      <path d="M95 150 L120 158 L116 182 L94 178 L86 163Z" fill={C.amberDeep} />
      <path
        d="M94 178 L90 186 M101 179 L98 187 M108 180 L106 188"
        stroke={C.steel}
        strokeWidth="3"
      />
    </g>
  );
}

function Scenes({ scene }: { scene: Scene }) {
  switch (scene) {
    case "excavator":
      return (
        <>
          <Backdrop />
          <path d="M34 216 H132 L122 252 H46Z" fill={C.trench} />
          <path d="M272 216 Q322 168 372 216Z" fill={C.rock} />
          <path d="M300 216 Q330 190 356 216Z" fill={C.rockLight} />
          <Excavator />
        </>
      );
    case "pipes":
    case "emergency":
      return (
        <>
          <Backdrop sun={scene === "pipes"} />
          <path d="M40 216 H372 L352 272 H60Z" fill={C.trench} />
          <rect x="118" y="214" width="6" height="50" fill={C.steel} />
          <rect x="290" y="214" width="6" height="50" fill={C.steel} />
          <rect x="70" y="244" width="266" height="18" rx="9" fill={C.amber} />
          {[120, 170, 220, 270].map((x) => (
            <rect key={x} x={x} y="244" width="4" height="18" fill={C.amberDark} />
          ))}
          <rect x="186" y="196" width="36" height="66" fill={C.rock} />
          <rect x="180" y="192" width="48" height="8" rx="2" fill={C.rockLight} />
          {[
            [58, 202],
            [88, 202],
            [73, 176],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="14" fill={C.amberDark} />
              <circle cx={cx} cy={cy} r="8" fill={C.sky} />
            </g>
          ))}
          {scene === "emergency" && (
            <g>
              <path d="M320 216 V186" stroke={C.steel} strokeWidth="4" />
              <rect x="312" y="176" width="16" height="12" rx="3" fill={C.amber} />
              {[
                "M302 170 L272 150",
                "M320 166 L320 132",
                "M338 170 L368 150",
                "M300 184 L266 186",
                "M340 184 L374 186",
              ].map((d) => (
                <path
                  key={d}
                  d={d}
                  stroke={C.amber}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              ))}
              <path
                d="M246 214 C246 196 262 188 268 178 C274 188 290 196 290 214Z"
                fill={C.steel}
                opacity="0.35"
              />
            </g>
          )}
        </>
      );
    case "road":
      return (
        <>
          <Backdrop />
          <path d="M165 215 H235 L400 300 H0Z" fill={C.trench} />
          <path
            d="M165 215 L0 300 M235 215 L400 300"
            stroke={C.white}
            strokeWidth="3"
            opacity="0.7"
          />
          {[
            "M198 222 H202 L203 232 H197Z",
            "M196 242 H204 L206 258 H194Z",
            "M193 270 H207 L210 296 H190Z",
          ].map((d) => (
            <path key={d} d={d} fill={C.amber} />
          ))}
          {[
            [70, 268],
            [110, 246],
            [320, 262],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <path
                d={`M${x - 12} ${y + 22} L${x} ${y - 10} L${x + 12} ${y + 22}Z`}
                fill={C.amber}
              />
              <path d={`M${x - 6} ${y + 6} H${x + 6}`} stroke={C.white} strokeWidth="4" />
              <rect x={x - 15} y={y + 21} width="30" height="4" fill={C.amberDark} />
            </g>
          ))}
          <g transform="translate(0 12)">
            <rect x="286" y="190" width="58" height="20" fill={C.amber} />
            <rect x="296" y="170" width="28" height="22" fill={C.amber} />
            <rect x="301" y="175" width="18" height="12" fill={C.sky} opacity="0.9" />
            <circle cx="276" cy="212" r="16" fill={C.rock} />
            <circle cx="276" cy="212" r="6" fill={C.amberDark} />
            <circle cx="344" cy="214" r="12" fill={C.rock} />
          </g>
        </>
      );
    case "site":
      return (
        <>
          <Backdrop />
          <path d="M0 238 H130 L156 222 H262 L290 206 H400 V300 H0Z" fill={C.ground} />
          <path
            d="M0 238 H130 L156 222 H262 L290 206 H400"
            stroke={C.amber}
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          <path d="M0 262 H400 V300 H0Z" fill={C.hills} opacity="0.6" />
          {[
            [178, 222],
            [236, 222],
            [312, 206],
            [372, 206],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <path d={`M${x} ${y} V${y - 22}`} stroke={C.white} strokeWidth="3" />
              <path d={`M${x} ${y - 22} L${x + 12} ${y - 18} L${x} ${y - 14}Z`} fill={C.amber} />
            </g>
          ))}
          <g stroke={C.rockLight} strokeWidth="4" fill="none">
            <path d="M300 206 V130 H380 V206 M300 168 H380 M340 130 V206" />
          </g>
          <g>
            <rect x="34" y="236" width="78" height="16" rx="8" fill={C.trench} />
            <rect x="44" y="212" width="56" height="26" fill={C.amber} />
            <rect x="56" y="190" width="28" height="23" fill={C.amber} />
            <rect x="61" y="195" width="18" height="13" fill={C.sky} opacity="0.9" />
            <path d="M100 222 L118 214 L122 252 L106 252Z" fill={C.amberDark} />
          </g>
        </>
      );
    case "demolition":
      return (
        <>
          <Backdrop />
          <rect x="222" y="104" width="130" height="112" fill={C.rock} />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={234 + col * 30}
                y={116 + row * 24}
                width="16"
                height="14"
                fill={C.hills}
              />
            )),
          )}
          <path d="M222 104 H286 L262 136 L244 132 L236 168 L222 176Z" fill={C.sky} />
          <path d="M150 216 Q200 176 250 202 Q290 186 330 216Z" fill={C.rockLight} />
          <path
            d="M184 206 L196 196 L204 208Z M232 204 L244 190 L252 206Z M280 208 L290 198 L298 210Z"
            fill={C.rock}
          />
          <g transform="translate(360 0) scale(-1 1)">
            <Excavator />
          </g>
        </>
      );
    case "crane":
      return (
        <>
          <rect width="400" height="300" fill={C.sky} />
          <rect width="400" height="90" fill={C.skyDeep} />
          <circle cx="80" cy="70" r="28" fill={C.amber} opacity="0.16" />
          {[
            [0, 170, 60],
            [58, 140, 50],
            [106, 188, 44],
            [146, 120, 58],
            [300, 150, 52],
            [350, 176, 50],
          ].map(([x, y, w]) => (
            <rect key={x} x={x} y={y} width={w} height={300 - y} fill={C.hills} />
          ))}
          <rect y="236" width="400" height="64" fill={C.ground} />
          <g>
            <rect x="238" y="58" width="12" height="178" fill={C.amber} />
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M238 ${66 + i * 19} L250 ${80 + i * 19}`}
                stroke={C.amberDeep}
                strokeWidth="2"
              />
            ))}
            <rect x="130" y="52" width="210" height="8" fill={C.amber} />
            <rect x="262" y="60" width="26" height="14" fill={C.amberDark} />
            <path
              d="M244 52 L244 30 L150 52 M244 30 L330 52"
              stroke={C.amber}
              strokeWidth="2"
              fill="none"
            />
            <rect x="232" y="60" width="24" height="16" fill={C.amberDark} />
            <path d="M160 60 V132" stroke={C.steel} strokeWidth="2" />
            <rect x="140" y="132" width="40" height="22" fill={C.rockLight} />
          </g>
          <rect x="200" y="176" width="92" height="60" fill={C.rock} />
          <path
            d="M200 176 V236 M230 176 V236 M260 176 V236 M292 176 V236 M200 206 H292"
            stroke={C.rockLight}
            strokeWidth="3"
          />
        </>
      );
    case "hardhat":
      return (
        <>
          <rect width="400" height="300" fill={C.sky} />
          <g stroke={C.hills} strokeWidth="1.5">
            {Array.from({ length: 11 }, (_, i) => (
              <path key={`v${i}`} d={`M${i * 40} 0 V300`} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <path key={`h${i}`} d={`M0 ${i * 40} H400`} />
            ))}
          </g>
          <path d="M112 196 C112 128 150 96 200 96 C250 96 288 128 288 196Z" fill={C.amber} />
          <path
            d="M188 98 C184 130 184 164 186 196 H214 C216 164 216 130 212 98Z"
            fill={C.amberDark}
          />
          <path
            d="M92 196 H308 C308 210 300 216 288 216 H112 C100 216 92 210 92 196Z"
            fill={C.amberDark}
          />
          <path
            d="M140 150 C146 128 160 114 176 108"
            stroke={C.white}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
        </>
      );
    case "person":
      return (
        <>
          <rect width="400" height="300" fill={C.hills} />
          <path d="M104 300 C104 236 146 208 200 208 C254 208 296 236 296 300Z" fill={C.rock} />
          <circle cx="200" cy="150" r="46" fill={C.rock} />
          <path d="M150 140 C150 108 172 90 200 90 C228 90 250 108 250 140Z" fill={C.amber} />
          <path
            d="M140 140 H260 C260 148 256 151 250 151 H150 C144 151 140 148 140 140Z"
            fill={C.amberDark}
          />
        </>
      );
  }
}

export function SceneArt({ scene, className }: { scene: Scene; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <Scenes scene={scene} />
    </svg>
  );
}

const keywordScenes: Array<[RegExp, Scene]> = [
  [/headshot|portrait|leader/i, "person"],
  [/emergency|bypass|break|collapse/i, "emergency"],
  [/sewer|water|pipe|utilit|interceptor|storm/i, "pipes"],
  [/road|paving|highway|culvert|traffic/i, "road"],
  [/demoli|retail/i, "demolition"],
  [/grad|site|pad|basin|aerial|industrial|subdivision/i, "site"],
  [/crew|safety|briefing|team/i, "hardhat"],
  [/excavat|earthwork|equipment|trench/i, "excavator"],
];

/** Pick a fitting scene from an image's descriptive label. */
export function sceneForLabel(label: string): Scene {
  return keywordScenes.find(([pattern]) => pattern.test(label))?.[1] ?? "crane";
}
