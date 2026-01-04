"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/people": "Pessoas",
  "/purchases": "Compras",
  "/installments": "Parcelas",
  "/reports": "Relatórios",
};

export default function Header() {
  const pathname = usePathname();
  
  // Get title based on current path
  const title = Object.entries(pageTitles).find(([path]) => 
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] || "Card Manager";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        <div className="flex items-center gap-4">
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

