"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <div className="flex items-center justify-between w-full px-6 md:px-12 py-4 border-b">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 relative">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: "rotate(180deg)" }}
            >
              <path
                d="M20 4L36 28H4L20 4Z"
                fill="white"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg">Westworld</span>
        </Link>
      </div>

      {/* Empty space in the middle */}
      <div className="flex-1"></div>

      {/* Login on the right */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">Sign In</Button>
        <Button size="sm">Sign Up</Button>
      </div>
    </div>
  )
}
