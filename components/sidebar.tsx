/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, FileText, Globe, Hash, Home, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Text Notes", href: "/notes", icon: FileText },
    { name: "PDF Documents", href: "/documents", icon: BookOpen },
    { name: "Web Links", href: "/links", icon: Globe },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Tags", href: "/tags", icon: Hash },
    { name: "Study Groups", href: "/groups", icon: Users },
  ]

  return (
    <div className={cn("flex h-full flex-col bg-white transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      <div className="p-4">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && <h1 className="text-2xl font-bold text-[#2D3748]">StudPal</h1>}
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn("w-full justify-start gap-2", isActive && "bg-gray-100", isCollapsed && "justify-center")}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="w-4 h-4" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </Button>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <Button className={cn("gap-2 bg-[#319795] hover:bg-[#2C7A7B] w-full", isCollapsed && "px-0")}>
          <Plus className="w-4 h-4" />
          {!isCollapsed && "Add Resource"}
        </Button>
      </div>
    </div>
  )
}

