"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings2,
  Sparkles,
} from "lucide-react"
import { useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground data-[state=open]:ring-2 data-[state=open]:ring-offset-background transition-all hover:cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">EH</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "top"}
              align="end"
              sideOffset={8}
            >
              
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)} className="hover:cursor-pointer">
                  <Settings2 />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="hover:cursor-pointer">
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer">
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:cursor-pointer">
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:cursor-pointer">
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="anthropic" className="w-full">
              <TabsList className="mb-4 bg-background border">
                <TabsTrigger value="anthropic" className="data-[state=active]:bg-background">Anthropic</TabsTrigger>
                <TabsTrigger value="openai" className="data-[state=active]:bg-background">OpenAI</TabsTrigger>
                <TabsTrigger value="grok" className="data-[state=active]:bg-background">Grok</TabsTrigger>
                <TabsTrigger value="local" className="data-[state=active]:bg-background">Local</TabsTrigger>
              </TabsList>
              <TabsContent value="anthropic">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">Make changes to your account here.</TabsContent>
                  <TabsContent value="password">Change your password here.</TabsContent>
                </Tabs>
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="text" 
                    placeholder="Your API Key" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Save
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="openai">OpenAI settings</TabsContent>
              <TabsContent value="grok">Grok settings</TabsContent>
              <TabsContent value="local">Local settings</TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 