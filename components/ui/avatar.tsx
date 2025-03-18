"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full border border-gray-800",
        className
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends Omit<React.ComponentProps<typeof AvatarPrimitive.Image>, 'src'> {
  src?: string | null;
}

function AvatarImage({
  className,
  src,
  ...props
}: AvatarImageProps) {
  const isVideo = typeof src === "string" && src.endsWith(".mp4")

  return isVideo ? (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className={cn("aspect-square size-full object-cover scale-[1.3]", className)}
    />
  ) : (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      src={src || undefined}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
