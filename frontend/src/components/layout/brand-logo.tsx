import Link from "next/link";
import { Layers } from "lucide-react";

export function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <Layers className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight text-ink">
        escora<span className="text-brand-600">mento</span>
      </span>
    </Link>
  );
}
