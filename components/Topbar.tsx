import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Topbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* Se você tiver <Brand />, pode usar no lugar do texto */}
          <span className="text-base font-semibold">GUIEDUC</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-700 hover:text-blue-600">Dashboard</Link>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
