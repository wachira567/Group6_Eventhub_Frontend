"use client"

import * as React from "react"
import { cva,  } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group border-input dark,box-shadow] outline-none",
        "h-9 min-w-0 has-[>textarea],

        // Variants based on alignment.
        "has-[>[data-align=inline-start]],
        "has-[>[data-align=inline-end]],
        "has-[>[data-align=block-start]],
        "has-[>[data-align=block-end]],

        // Focus state.
        "has-[[data-slot=input-group-control],

        // Error state.
        "has-[[data-slot][aria-invalid=true]],

        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg,
  {
    variants{
      align{
        "inline-start"
          "order-first pl-3 has-[>button],
        "inline-end"
          "order-last pr-3 has-[>button],
        "block-start"
          "order-first w-full justify-start px-3 pt-3 [.border-b],
        "block-end"
          "order-last w-full justify-start px-3 pb-3 [.border-t],
      }, },
    defaultVariants{
      align,
    }, }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
} & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e)=> {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants{
      size{
        xs,
        sm,
        "icon-xs"
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg],
        "icon-sm",
      }, },
    defaultVariants{
      size,
    }, }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg],
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible,
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible,
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
