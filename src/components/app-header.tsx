"use client";
import Link from "next/link";
import Logo from "./logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/app/dashboard" },
  { name: "Account", href: "/app/account" },
];

export default function AppHeader() {
  const activePathnme = usePathname();

  return (
    <header className="flex justify-between items-center border-b border-white/10 py-2 px-2">
      <Logo />
      <nav>
        <ul className="flex gap-2 text-xs">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "text-white/70 rounded-sm py-1 px-2 hover:text-white focus:text-white transition",
                  { "bg-black/10 text-white": activePathnme === item.href }
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
