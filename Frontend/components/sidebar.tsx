"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Heart, Library, ShoppingCart, Settings, LogOut, User, Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Watchlist", href: "/watchlist", icon: Heart },
  { name: "Library", href: "/library", icon: Library },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isOpen, toggle } = useSidebar()
  const { itemCount } = useCart()

  if (!user) return null

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={toggle} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-black border-r border-gray-800 flex flex-col z-50 transition-all duration-200",
          isOpen ? "w-60" : "w-0 lg:w-14",
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-gray-800">
          {isOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
              <span className="text-white font-bold">ARC</span>
            </div>
          ) : (
            <div className="hidden lg:block w-6 h-6 bg-purple-600 rounded"></div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.name === "Cart" && itemCount > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center h-12 mx-2 rounded-lg transition-colors relative group",
                  isActive ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                <div className="flex items-center justify-center w-12 h-12 relative">
                  <item.icon className="w-5 h-5" />
                  {showBadge && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{itemCount}</span>
                    </div>
                  )}
                </div>
                {isOpen && <span className="ml-3 font-medium">{item.name}</span>}

                {/* Tooltip */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.name}
                    {showBadge && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">{itemCount}</span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="border-t border-gray-800">
          {/* Profile */}
          {isOpen && (
            <Link
              href="/profile"
              className="flex items-center h-12 mx-2 my-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12">
                <User className="w-5 h-5" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center h-12 mx-2 mb-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors w-full group"
          >
            <div className="flex items-center justify-center w-12 h-12">
              <LogOut className="w-5 h-5" />
            </div>
            {isOpen && <span className="ml-3 font-medium">Logout</span>}

            {/* Logout Tooltip */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-6 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors lg:flex hidden"
        >
          <Menu className="w-3 h-3 text-gray-400" />
        </button>

        {/* Mobile Toggle */}
        <button onClick={toggle} className="lg:hidden absolute top-4 right-4 p-1 text-gray-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </>
  )
}
