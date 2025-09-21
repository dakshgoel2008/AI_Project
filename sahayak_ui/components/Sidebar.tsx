"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  MenuIcon, 
  HomeIcon, 
  BookIcon, 
  SettingsIcon, 
  HelpIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from "@/components/icons"

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true) // Changed default to true (collapsed)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigationItems = [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: BookIcon, label: "My Chats", href: "/chats" },
    { icon: SettingsIcon, label: "Settings", href: "/settings" },
    { icon: HelpIcon, label: "Help", href: "/help" },
  ]

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">Sahayak</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="p-2"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={`w-full justify-start h-10 ${
                isCollapsed ? 'px-2' : 'px-4'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Sahayak</h2>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start h-10 px-4"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="ml-3 truncate">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

        <main className="flex-1 flex flex-col ml-0 md:ml-0">
          {children}
        </main>
    </div>
  )
}