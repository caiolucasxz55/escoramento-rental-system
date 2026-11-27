import Link from "next/link";
import { Layers } from "lucide-react";

export function BrandLogo() {
  return (
    <Link href="/" className="flex h-10 shrink-0 items-center gap-2 rounded-lg sm:gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40">
      <span className="flex size-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm sm:size-9">
        <Layers className="size-5" aria-hidden />
      </span>
      <span className="text-base font-semibold tracking-tight text-ink max-[359px]:sr-only sm:text-lg">
        escora<span className="text-brand-600">mento</span>
      </span>
    </Link>
  );
}
