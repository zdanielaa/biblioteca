"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Users, FileText, Calendar } from "lucide-react"

const navItems = [
  { href: "/", label: "Libros", icon: BookOpen },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/prestamos", label: "Préstamos", icon: FileText },
  { href: "/reservas", label: "Reservas", icon: Calendar },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-primary-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <span className="text-xl font-bold">Biblioteca</span>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-primary-700 text-white" : "text-gray-300 hover:bg-primary-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
