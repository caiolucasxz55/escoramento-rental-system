import { cn } from "@/lib/utils";

const PROPS_X = [92, 172, 252, 332];

// laje sustentada por escoras metalicas: base, tubo, pino de regulagem e forcado
export function ShoringIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 280"
      role="img"
      aria-label="Escoras metálicas sustentando uma laje"
      className={cn("h-auto w-full", className)}
    >
      <circle cx="210" cy="150" r="118" className="fill-brand-50" />
      <circle cx="210" cy="150" r="86" className="fill-surface" opacity="0.6" />

      {/* laje e vigas */}
      <rect x="40" y="52" width="340" height="24" rx="4" className="fill-brand-600" />
      <rect x="40" y="52" width="340" height="6" rx="3" className="fill-brand-700" opacity="0.5" />
      <rect x="54" y="76" width="312" height="12" rx="2" className="fill-brand-100" />

      {PROPS_X.map((x) => (
        <g key={x}>
          {/* forcado */}
          <rect x={x - 12} y="88" width="24" height="5" rx="1.5" className="fill-ink-muted" />
          <rect x={x - 12} y="88" width="3" height="10" className="fill-ink-muted" />
          <rect x={x + 9} y="88" width="3" height="10" className="fill-ink-muted" />
          {/* tubo externo e interno */}
          <rect x={x - 6} y="93" width="12" height="92" rx="2" className="fill-[#8a9a8c]" />
          <rect x={x - 4} y="185" width="8" height="56" rx="1.5" className="fill-[#b3bfb4]" />
          {/* pino/rosca de regulagem */}
          <rect x={x - 9} y="180" width="18" height="8" rx="2" className="fill-brand-500" />
          {/* base */}
          <rect x={x - 16} y="241" width="32" height="6" rx="2" className="fill-ink-muted" />
        </g>
      ))}

      {/* piso */}
      <rect x="24" y="247" width="372" height="3" rx="1.5" className="fill-line" />
      <rect x="60" y="256" width="300" height="2" rx="1" className="fill-line" opacity="0.6" />
    </svg>
  );
}
