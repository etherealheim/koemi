"use client"

import * as React from "react"
import { motion } from "framer-motion"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronRight,
  Pin,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

function NavMainComponent({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              {item.items?.length ? (
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} className="hover:cursor-pointer">
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url} className="hover:cursor-pointer">
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90 hover:cursor-pointer">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        bounce: 0.1,
                        duration: 0.2
                      }}
                    >
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title} className="group/menu-sub-hover relative">
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url} className="hover:cursor-pointer relative pr-7">
                                <span className="text-muted-foreground">{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction 
                                  className="!opacity-0 group-hover/menu-sub-hover:!opacity-100 data-[state=open]:!opacity-100 top-1 right-1.5"
                                >
                                  <MoreHorizontal />
                                  <span className="sr-only">More</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-48"
                                side="right"
                                align="start"
                              >
                                <DropdownMenuItem>
                                  <Pin className="text-muted-foreground" />
                                  <span>Pin</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash2 className="text-muted-foreground" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </motion.div>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

// Export a memoized version of the component
export const NavMain = React.memo(NavMainComponent)
