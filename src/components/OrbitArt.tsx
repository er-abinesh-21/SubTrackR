import { LogoMark } from "@/components/Logo";

// Each ring is a billing rhythm; the dot riding it is the next charge arriving.
// Drawn for the Maroon brand panel, so rings and dots are Cotton and its warm tints.
const RINGS = [
  { radius: 92, seconds: 26, color: "hsl(var(--foreground))", size: 7, start: 20 },
  { radius: 152, seconds: 44, color: "hsl(var(--blush))", size: 6, start: 140 },
  { radius: 212, seconds: 72, color: "hsl(var(--highlight))", size: 5.5, start: 250 },
];

const CENTER = 240;

export function OrbitArt({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 480 480" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id="orbit-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r="236" fill="url(#orbit-glow)" />
        {RINGS.map((ring) => (
          <g key={ring.radius}>
            <circle
              cx={CENTER}
              cy={CENTER}
              r={ring.radius}
              stroke="hsl(var(--foreground) / 0.32)"
              strokeWidth="1.25"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            <g
              style={{
                transformOrigin: `${CENTER}px ${CENTER}px`,
                animation: `orbit ${ring.seconds}s linear infinite`,
                animationDelay: `-${(ring.start / 360) * ring.seconds}s`,
              }}
            >
              <circle cx={CENTER} cy={CENTER - ring.radius} r={ring.size * 2.6} fill={ring.color} opacity="0.16" />
              <circle cx={CENTER} cy={CENTER - ring.radius} r={ring.size} fill={ring.color} />
            </g>
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <LogoMark className="h-16 w-16" />
      </div>
    </div>
  );
}
