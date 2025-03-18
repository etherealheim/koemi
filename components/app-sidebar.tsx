"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "etherealheim",
    email: "etherealheim@proton.me",
    avatar: "/avatars/avatar.mp4",
  },
  navMain: [
    {
      title: "Today",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Project brainstorming",
          url: "#",
        },
        {
          title: "Code review help",
          url: "#",
        },
        {
          title: "Debugging session",
          url: "#",
        },
      ],
    },
    {
      title: "Yesterday",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "AI Model Training",
          url: "#",
        },
        {
          title: "Host Behavior Analysis",
          url: "#",
        },
        {
          title: "Narrative Design",
          url: "#",
        },
      ],
    },
    {
      title: "2 Days Ago",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "System Architecture",
          url: "#",
        },
        {
          title: "User Interface Design",
          url: "#",
        },
        {
          title: "API Documentation",
          url: "#",
        },
        {
          title: "Testing Protocol",
          url: "#",
        },
      ],
    },
    {
      title: "1 Week Ago",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Project Setup",
          url: "#",
        },
        {
          title: "Team Onboarding",
          url: "#",
        },
        {
          title: "Resource Allocation",
          url: "#",
        },
        {
          title: "Milestone Planning",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                  <img src="/avatars/acme.png" alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}