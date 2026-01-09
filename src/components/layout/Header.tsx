"use client";

import { usePathname } from "next/navigation";
import { useMobileMenu } from "./MobileMenuContext";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/people": "Pessoas",
  "/purchases": "Compras",
  "/installments": "Parcelas",
  "/reports": "Relatórios",
};

export default function Header() {
  const pathname = usePathname();
  const { open } = useMobileMenu();

  // Get title based on current path
  const title =
    Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname.startsWith(path + "/")
    )?.[1] || "Card Manager";

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={open}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
