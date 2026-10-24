
import { Leaf, ArrowUpRight } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/5 bg-[#f6f9f4]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#176a43] text-white shadow-lg shadow-green-900/10">
            <Leaf size={23} />
          </div>

          <span className="text-xl font-extrabold tracking-tight text-[#173f2b]">
            PlantCare <span className="text-[#279b5e]">AI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#597565] md:flex">
          <a href="#home" className="hover:text-green-700">
            Home
          </a>

          <a href="#analyze" className="hover:text-green-700">
            Analyze
          </a>

          <a href="#how-it-works" className="hover:text-green-700">
            How it works
          </a>
        </nav>

        <a
          href="#analyze"
          className="inline-flex items-center gap-2 rounded-full bg-[#176a43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#105135]"
        >
          Try AI
          <ArrowUpRight size={16} />
        </a>
      </div>
    </header>
  );
}
