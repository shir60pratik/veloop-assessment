import { useId } from 'react';
import {
  Compass,
  Crown,
  Flame,
  Gem,
  Infinity as InfinityIcon,
  Orbit,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { levelMeta } from '../../lib/levels';
import { cx } from '../../lib/format';

const EMBLEMS = {
  spark: Sparkles,
  compass: Compass,
  bolt: Zap,
  rocket: Rocket,
  orbit: Orbit,
  crown: Crown,
  shield: ShieldCheck,
  gem: Gem,
  flame: Flame,
  trophy: Trophy,
  infinity: InfinityIcon,
  star: Star,
};

/** Every level gets its own outer silhouette so the badge reads differently at a glance. */
const FRAMES = {
  1: 'circle',
  2: 'octagon',
  3: 'hex',
  4: 'shield',
  5: 'orbit',
  6: 'laurel',
  7: 'shield',
  8: 'star',
  9: 'wing',
  10: 'star',
  11: 'halo',
  12: 'prism',
};

const PATTERNS = {
  1: 'rays',
  2: 'waves',
  3: 'zigzag',
  4: 'chevron',
  5: 'orbit',
  6: 'rays',
  7: 'grid',
  8: 'nova',
  9: 'streaks',
  10: 'rays',
  11: 'cosmos',
  12: 'prism',
};

function starPoints(cx, cy, outer, inner, count, rotation = 0) {
  const points = [];
  const step = Math.PI / count;
  for (let i = 0; i < count * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotation + i * step;
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return points.join(' ');
}

function polygonPoints(cx, cy, radius, count, rotation = -Math.PI / 2) {
  return Array.from({ length: count }, (_, index) => {
    const angle = rotation + (index / count) * Math.PI * 2;
    return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
}

function tinyStar(cx, cy, size, fill, opacity = 1) {
  return (
    <path
      d={`M${cx} ${cy - size} L${cx + size * 0.28} ${cy - size * 0.28} L${cx + size} ${cy} L${cx + size * 0.28} ${cy + size * 0.28} L${cx} ${cy + size} L${cx - size * 0.28} ${cy + size * 0.28} L${cx - size} ${cy} L${cx - size * 0.28} ${cy - size * 0.28} Z`}
      fill={fill}
      opacity={opacity}
    />
  );
}

function Ornaments({ level, meta }) {
  const { ornament, from, ink } = meta;

  if (ornament === 'orbit' || level === 5) {
    return (
      <g className="badge__ornament">
        <ellipse
          cx="80"
          cy="80"
          rx="78"
          ry="31"
          fill="none"
          stroke={from}
          strokeWidth="1.2"
          opacity="0.5"
          transform="rotate(-24 80 80)"
        />
        <ellipse
          cx="80"
          cy="80"
          rx="72"
          ry="38"
          fill="none"
          stroke={ink}
          strokeWidth="0.8"
          strokeDasharray="1 6"
          opacity="0.42"
          transform="rotate(32 80 80)"
        />
        <circle cx="151" cy="53" r="3" fill={ink} opacity="0.9" />
        <circle cx="10" cy="104" r="2.2" fill={from} opacity="0.8" />
      </g>
    );
  }

  if (ornament === 'laurel' || level === 6) {
    const leaves = [0, 1, 2, 3, 4, 5];
    return (
      <g className="badge__ornament" opacity="0.9">
        {leaves.map((index) => (
          <g key={`l-${index}`}>
            <ellipse
              cx={36 - index * 1.6}
              cy={94 + index * 8}
              rx="7.5"
              ry="3.2"
              fill={from}
              opacity={0.24 + index * 0.07}
              transform={`rotate(${-42 + index * 8} ${36 - index * 1.6} ${94 + index * 8})`}
            />
            <ellipse
              cx={124 + index * 1.6}
              cy={94 + index * 8}
              rx="7.5"
              ry="3.2"
              fill={from}
              opacity={0.24 + index * 0.07}
              transform={`rotate(${42 - index * 8} ${124 + index * 1.6} ${94 + index * 8})`}
            />
          </g>
        ))}
      </g>
    );
  }

  if (ornament === 'wings' || level === 9) {
    return (
      <g className="badge__ornament">
        <path
          d="M36 58c-16 4-27 15-32 31 13-2 22-1 31 3-10 5-17 12-20 22 14-6 25-6 35-2-8 7-12 16-13 26 13-9 24-13 36-13z"
          fill={from}
          opacity="0.2"
          stroke={from}
          strokeWidth="0.9"
        />
        <path
          d="M124 58c16 4 27 15 32 31-13-2-22-1-31 3 10 5 17 12 20 22-14-6-25-6-35-2 8 7 12 16 13 26-13-9-24-13-36-13z"
          fill={from}
          opacity="0.2"
          stroke={from}
          strokeWidth="0.9"
        />
      </g>
    );
  }

  if (ornament === 'halo' || level >= 11) {
    return (
      <g className="badge__ornament">
        <ellipse
          cx="80"
          cy="80"
          rx="76"
          ry="76"
          fill="none"
          stroke={from}
          strokeWidth="0.9"
          strokeDasharray="2 8"
          opacity="0.7"
          className="badge__halo-ring"
        />
        <ellipse
          cx="80"
          cy="80"
          rx="70"
          ry="70"
          fill="none"
          stroke={ink}
          strokeWidth="0.6"
          strokeDasharray="1 12"
          opacity="0.45"
        />
        {tinyStar(80, 4, 4.4, from, 0.9)}
        {tinyStar(13, 52, 2.6, ink, 0.7)}
        {tinyStar(147, 52, 2.6, ink, 0.7)}
      </g>
    );
  }

  return (
    <g className="badge__ornament">
      {tinyStar(26, 38, 2.8, from, 0.82)}
      {tinyStar(134, 38, 2.8, from, 0.82)}
      {tinyStar(18, 108, 1.9, ink, 0.55)}
      {tinyStar(142, 108, 1.9, ink, 0.55)}
    </g>
  );
}

function Frame({ level, meta, id }) {
  const frame = FRAMES[level] || 'circle';
  const stroke = `url(#rim-${id})`;
  const fill = `url(#frame-${id})`;
  const base = {
    fill,
    fillOpacity: 0.13,
    stroke,
    strokeWidth: 2.4,
    strokeLinejoin: 'round',
    className: 'badge__frame',
  };

  if (frame === 'octagon') {
    return (
      <g>
        <polygon points={polygonPoints(80, 80, 71, 8, Math.PI / 8)} {...base} />
        <polygon
          points={polygonPoints(80, 80, 63, 8, Math.PI / 8)}
          fill="none"
          stroke={meta.ink}
          strokeOpacity="0.24"
          strokeWidth="0.8"
          strokeDasharray="2 5"
        />
        {[0, 1, 2, 3].map((index) => {
          const angle = Math.PI / 4 + index * (Math.PI / 2);
          return (
            <circle
              key={`oct-${index}`}
              cx={(80 + Math.cos(angle) * 71).toFixed(2)}
              cy={(80 + Math.sin(angle) * 71).toFixed(2)}
              r="2.2"
              fill={meta.ink}
              opacity="0.75"
            />
          );
        })}
      </g>
    );
  }

  if (frame === 'hex') {
    return (
      <g>
        <polygon points={polygonPoints(80, 80, 73, 6)} {...base} />
        <polygon
          points={polygonPoints(80, 80, 64, 6)}
          fill="none"
          stroke={meta.ink}
          strokeOpacity="0.2"
          strokeWidth="0.8"
        />
        {Array.from({ length: 6 }).map((_, index) => {
          const angle = -Math.PI / 2 + index * (Math.PI / 3);
          return (
            <line
              key={`hex-${index}`}
              x1={(80 + Math.cos(angle) * 58).toFixed(2)}
              y1={(80 + Math.sin(angle) * 58).toFixed(2)}
              x2={(80 + Math.cos(angle) * 64).toFixed(2)}
              y2={(80 + Math.sin(angle) * 64).toFixed(2)}
              stroke={meta.ink}
              strokeWidth="1.2"
              opacity="0.45"
            />
          );
        })}
      </g>
    );
  }

  if (frame === 'shield') {
    return (
      <g>
        <path
          d="M80 9 L142 34 V84 C142 121 115 147 80 164 C45 147 18 121 18 84 V34 Z"
          {...base}
        />
        <path
          d="M80 20 L131 40 V84 C131 114 109 136 80 151 C51 136 29 114 29 84 V40 Z"
          fill="none"
          stroke={meta.ink}
          strokeOpacity="0.22"
          strokeWidth="0.8"
          strokeDasharray="2 6"
        />
        <path d="M80 9 L80 28" stroke={meta.ink} strokeWidth="1" opacity="0.55" />
      </g>
    );
  }

  if (frame === 'star') {
    return (
      <g>
        <polygon points={starPoints(80, 80, 74, 63, level >= 10 ? 12 : 10, Math.PI / 2)} {...base} />
        <circle
          cx="80"
          cy="80"
          r="62"
          fill="none"
          stroke={meta.ink}
          strokeOpacity="0.2"
          strokeWidth="0.8"
          strokeDasharray="1 6"
        />
      </g>
    );
  }

  if (frame === 'prism') {
    return (
      <g>
        <path d="M80 5 L148 80 L80 171 L12 80 Z" {...base} />
        <path
          d="M80 17 L137 80 L80 158 L23 80 Z"
          fill="none"
          stroke={meta.ink}
          strokeOpacity="0.26"
          strokeWidth="0.9"
        />
        <path d="M80 17 V158 M23 80 H137" stroke={meta.from} strokeOpacity="0.25" strokeWidth="0.8" />
        <path d="M80 17 L137 80 L80 158 L23 80 Z" fill={`url(#prism-${id})`} opacity="0.16" />
      </g>
    );
  }

  return (
    <g>
      <circle cx="80" cy="80" r="69" {...base} />
      <circle
        cx="80"
        cy="80"
        r="61"
        fill="none"
        stroke={meta.ink}
        strokeOpacity="0.22"
        strokeWidth="0.8"
        strokeDasharray="1 6"
      />
    </g>
  );
}

function Pattern({ level, meta, id }) {
  const kind = PATTERNS[level] || 'rays';
  const stroke = meta.ink;
  const accent = meta.from;
  const clip = `url(#disc-${id})`;

  if (kind === 'waves') {
    return (
      <g clipPath={clip} opacity="0.4">
        {[0, 1, 2].map((index) => (
          <path
            key={`wave-${index}`}
            d={`M42 ${68 + index * 10} C56 ${58 + index * 10}, 66 ${78 + index * 10}, 80 ${68 + index * 10} S104 ${58 + index * 10}, 118 ${68 + index * 10}`}
            fill="none"
            stroke={index === 1 ? accent : stroke}
            strokeWidth="1.2"
          />
        ))}
      </g>
    );
  }

  if (kind === 'zigzag') {
    return (
      <g clipPath={clip} opacity="0.38">
        {[0, 1, 2].map((index) => (
          <path
            key={`zig-${index}`}
            d={`M44 ${60 + index * 14} L56 ${52 + index * 14} L68 ${60 + index * 14} L80 ${52 + index * 14} L92 ${60 + index * 14} L104 ${52 + index * 14} L116 ${60 + index * 14}`}
            fill="none"
            stroke={index === 1 ? accent : stroke}
            strokeWidth="1.25"
          />
        ))}
      </g>
    );
  }

  if (kind === 'chevron') {
    return (
      <g clipPath={clip} opacity="0.4">
        {[0, 1, 2, 3].map((index) => (
          <path
            key={`chev-${index}`}
            d={`M46 ${72 + index * 12} L80 ${50 + index * 12} L114 ${72 + index * 12}`}
            fill="none"
            stroke={index % 2 === 0 ? accent : stroke}
            strokeWidth="1.2"
          />
        ))}
      </g>
    );
  }

  if (kind === 'orbit') {
    return (
      <g clipPath={clip} opacity="0.5">
        <ellipse cx="80" cy="80" rx="33" ry="13" fill="none" stroke={accent} strokeWidth="1.1" transform="rotate(-28 80 80)" />
        <ellipse cx="80" cy="80" rx="33" ry="13" fill="none" stroke={stroke} strokeWidth="0.9" transform="rotate(32 80 80)" />
        <circle cx="106" cy="60" r="2" fill={accent} />
        <circle cx="53" cy="99" r="1.6" fill={stroke} />
      </g>
    );
  }

  if (kind === 'grid') {
    return (
      <g clipPath={clip} opacity="0.3">
        {Array.from({ length: 5 }).map((_, index) => (
          <line
            key={`gv-${index}`}
            x1={48 + index * 16}
            y1="42"
            x2={36 + index * 16}
            y2="118"
            stroke={index % 2 === 0 ? accent : stroke}
            strokeWidth="0.8"
          />
        ))}
        {Array.from({ length: 4 }).map((_, index) => (
          <line
            key={`gh-${index}`}
            x1="42"
            y1={52 + index * 16}
            x2="118"
            y2={52 + index * 16}
            stroke={stroke}
            strokeWidth="0.7"
          />
        ))}
      </g>
    );
  }

  if (kind === 'nova') {
    return (
      <g clipPath={clip} opacity="0.48">
        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index / 16) * Math.PI * 2;
          const inner = index % 2 === 0 ? 16 : 24;
          return (
            <line
              key={`nova-${index}`}
              x1={(80 + Math.cos(angle) * inner).toFixed(2)}
              y1={(80 + Math.sin(angle) * inner).toFixed(2)}
              x2={(80 + Math.cos(angle) * 42).toFixed(2)}
              y2={(80 + Math.sin(angle) * 42).toFixed(2)}
              stroke={index % 3 === 0 ? accent : stroke}
              strokeWidth={index % 3 === 0 ? 1.3 : 0.7}
            />
          );
        })}
      </g>
    );
  }

  if (kind === 'streaks') {
    return (
      <g clipPath={clip} opacity="0.42">
        {Array.from({ length: 7 }).map((_, index) => (
          <line
            key={`streak-${index}`}
            x1={38 + index * 5}
            y1={116 - index * 3}
            x2={78 + index * 6}
            y2={48 + index * 2}
            stroke={index % 3 === 0 ? accent : stroke}
            strokeWidth={index % 3 === 0 ? 1.4 : 0.8}
          />
        ))}
      </g>
    );
  }

  if (kind === 'cosmos') {
    return (
      <g clipPath={clip} opacity="0.62">
        {Array.from({ length: 22 }).map((_, index) => {
          const angle = (index * 137.5 * Math.PI) / 180;
          const radius = 6 + (index / 22) * 32;
          return (
            <circle
              key={`cosmos-${index}`}
              cx={(80 + Math.cos(angle) * radius).toFixed(2)}
              cy={(80 + Math.sin(angle) * radius).toFixed(2)}
              r={index % 4 === 0 ? 1.5 : 0.8}
              fill={index % 4 === 0 ? accent : stroke}
            />
          );
        })}
      </g>
    );
  }

  if (kind === 'prism') {
    return (
      <g clipPath={clip} opacity="0.34">
        <path d="M80 48 L112 104 L48 104 Z" fill="none" stroke={accent} strokeWidth="1.1" />
        <path d="M80 48 L80 104 M48 104 L96 72" stroke={stroke} strokeWidth="0.7" />
        <path d="M56 56 L104 56 L80 114 Z" fill="none" stroke={stroke} strokeWidth="0.7" />
      </g>
    );
  }

  return (
    <g clipPath={clip} opacity="0.4">
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <line
            key={`ray-${index}`}
            x1={(80 + Math.cos(angle) * 12).toFixed(2)}
            y1={(80 + Math.sin(angle) * 12).toFixed(2)}
            x2={(80 + Math.cos(angle) * 40).toFixed(2)}
            y2={(80 + Math.sin(angle) * 40).toFixed(2)}
            stroke={index % 3 === 0 ? accent : stroke}
            strokeWidth={index % 3 === 0 ? 1.2 : 0.7}
          />
        );
      })}
    </g>
  );
}

export function LevelBadge({
  level = 1,
  size = 'md',
  status = 'locked',
  className,
  showLabel = true,
}) {
  const meta = levelMeta(level);
  const Icon = EMBLEMS[meta.emblem] || Sparkles;
  const rawId = useId();
  const id = `${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}-${level}`;
  const rosetteCount = level <= 3 ? 14 : level <= 6 ? 18 : level <= 9 ? 22 : 26;
  const rosette = starPoints(80, 80, 66, 59, rosetteCount, Math.PI / rosetteCount);
  const gemCount = Math.min(7, Math.max(3, Math.ceil(level / 2)));

  return (
    <span
      className={cx(
        'level-badge',
        `level-badge--${size}`,
        `level-badge--${status}`,
        `level-badge--tone-${meta.tone}`,
        className,
      )}
    >
      <svg
        viewBox="-4 -8 168 196"
        className="level-badge__svg"
        role="img"
        aria-label={`Level ${level} badge, ${meta.name}${status === 'locked' ? ', locked' : ''}`}
      >
        <defs>
          <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={meta.from} />
            <stop offset="0.4" stopColor={meta.ink} stopOpacity="0.92" />
            <stop offset="0.62" stopColor={meta.to} />
            <stop offset="1" stopColor={meta.from} />
          </linearGradient>
          <linearGradient id={`frame-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={meta.from} />
            <stop offset="0.5" stopColor={meta.to} stopOpacity="0.65" />
            <stop offset="1" stopColor={meta.from} stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`plate-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={meta.to} />
            <stop offset="0.42" stopColor={meta.from} />
            <stop offset="0.65" stopColor={meta.ink} stopOpacity="0.92" />
            <stop offset="1" stopColor={meta.to} />
          </linearGradient>
          <radialGradient id={`core-${id}`} cx="50%" cy="30%" r="76%">
            <stop offset="0" stopColor="#2a3157" />
            <stop offset="0.52" stopColor="#141930" />
            <stop offset="1" stopColor="#070912" />
          </radialGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={meta.glow} stopOpacity="0.55" />
            <stop offset="0.62" stopColor={meta.glow} stopOpacity="0.16" />
            <stop offset="1" stopColor={meta.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.36" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`prism-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={meta.ink} stopOpacity="0.5" />
            <stop offset="1" stopColor={meta.from} stopOpacity="0.05" />
          </linearGradient>
          <filter id={`blur-${id}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id={`disc-${id}`}>
            <circle cx="80" cy="80" r="37" />
          </clipPath>
        </defs>

        <circle cx="80" cy="82" r="78" fill={`url(#glow-${id})`} className="badge__glow" />
        <Ornaments level={level} meta={meta} />

        <polygon
          points={rosette}
          fill={meta.from}
          fillOpacity="0.08"
          stroke={meta.from}
          strokeOpacity="0.3"
          strokeWidth="0.8"
        />

        <Frame level={level} meta={meta} id={id} />

        <circle cx="80" cy="80" r="58" fill="#0a0d1a" opacity="0.9" />
        <circle cx="80" cy="80" r="57" fill={`url(#core-${id})`} stroke={`url(#rim-${id})`} strokeWidth="4.2" />
        <circle
          cx="80"
          cy="80"
          r="49.5"
          fill="none"
          stroke={meta.ink}
          strokeOpacity="0.3"
          strokeWidth="0.8"
          strokeDasharray="1 4.5"
        />

        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index / 16) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={`tick-${index}`}
              x1={(80 + Math.cos(angle) * 52).toFixed(2)}
              y1={(80 + Math.sin(angle) * 52).toFixed(2)}
              x2={(80 + Math.cos(angle) * 55.5).toFixed(2)}
              y2={(80 + Math.sin(angle) * 55.5).toFixed(2)}
              stroke={meta.ink}
              strokeWidth={index % 4 === 0 ? 1.4 : 0.9}
              opacity={index % 4 === 0 ? 0.8 : 0.28}
            />
          );
        })}

        <circle cx="80" cy="80" r="42" fill="#080b17" opacity="0.94" stroke={`url(#rim-${id})`} strokeWidth="1.2" />
        <circle cx="80" cy="80" r="38.5" fill={`url(#core-${id})`} />
        <Pattern level={level} meta={meta} id={id} />
        <circle cx="80" cy="80" r="40" fill="none" stroke={meta.ink} strokeOpacity="0.18" strokeWidth="0.7" />
        <ellipse cx="80" cy="50" rx="33" ry="15" fill={`url(#shine-${id})`} opacity="0.6" />

        <g className="badge__emblem" filter={`url(#blur-${id})`} opacity="0.32">
          <circle cx="80" cy="80" r="21" fill={meta.glow} />
        </g>
        <g className="badge__emblem">
          <circle cx="80" cy="80" r="26" fill="none" stroke={meta.from} strokeOpacity="0.28" strokeWidth="0.8" />
          <Icon
            x="55"
            y="55"
            width="50"
            height="50"
            color={meta.ink}
            strokeWidth="1.4"
            absoluteStrokeWidth
          />
        </g>

        {Array.from({ length: gemCount }).map((_, index) => {
          const spread = gemCount === 1 ? 0 : (index / (gemCount - 1) - 0.5) * 76;
          return (
            <path
              key={`gem-${index}`}
              d={`M${80 + spread} 121 l3.4 3.4 -3.4 3.4 -3.4 -3.4 z`}
              fill={meta.ink}
              opacity={0.5 + (index / gemCount) * 0.4}
            />
          );
        })}

        {level >= 10 && (
          <g className="badge__crown">
            <path
              d="M60 29l7-12 6 8 7-14 7 14 6-8 7 12-10 4H70z"
              fill={`url(#plate-${id})`}
              stroke={meta.ink}
              strokeWidth="0.6"
            />
            <circle cx="67" cy="17" r="1.8" fill={meta.ink} />
            <circle cx="80" cy="11" r="2.1" fill={meta.ink} />
            <circle cx="93" cy="17" r="1.8" fill={meta.ink} />
            {level >= 12 && (
              <g>
                <path d="M80 2 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4z" fill={meta.ink} opacity="0.95" />
              </g>
            )}
          </g>
        )}

        {showLabel && (
          <g className="badge__plate">
            <path d="M40 144 l-9 7 9 7z" fill={meta.to} opacity="0.85" />
            <path d="M120 144 l9 7 -9 7z" fill={meta.to} opacity="0.85" />
            <path
              d="M46 136h68c3.3 0 6 2.7 6 6v18c0 3.3-2.7 6-6 6H46c-3.3 0-6-2.7-6-6v-18c0-3.3 2.7-6 6-6z"
              fill={`url(#plate-${id})`}
              stroke={meta.ink}
              strokeOpacity="0.5"
              strokeWidth="0.7"
            />
            <path d="M46 140h68" stroke={meta.ink} strokeOpacity="0.4" strokeWidth="0.6" />
            <text
              x="80"
              y="157"
              textAnchor="middle"
              fill={meta.ink}
              fontFamily="Inter, Segoe UI, sans-serif"
              fontSize="9"
              fontWeight="800"
              letterSpacing="1.7"
            >
              LEVEL {String(level).padStart(2, '0')}
            </text>
          </g>
        )}
      </svg>
    </span>
  );
}
