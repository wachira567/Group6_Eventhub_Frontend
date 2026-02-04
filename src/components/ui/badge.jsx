import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva,  } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg],box-shadow] overflow-hidden",
  {
    variants{
      variant{
        default
          "border-transparent bg-primary text-primary-foreground [a&],
        secondary
          "border-transparent bg-secondary text-secondary-foreground [a&],
        destructive
          "border-transparent bg-destructive text-white [a&],
        outline
          "text-foreground [a&],
      }, },
    defaultVariants{
      variant,
    }, }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
} &
  VariantProps<typeof badgeVariants> & { asChild? }) {
  const Comp = asChild ? Slot 

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
