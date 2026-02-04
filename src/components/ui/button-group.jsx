import { Slot } from "@radix-ui/react-slot"
import { cva,  } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*],
  {
    variants{
      orientation{
        horizontal
          "[&>*,
        vertical
          "flex-col [&>*,
      }, },
    defaultVariants{
      orientation,
    }, }
)

function ButtonGroup({
  className,
  orientation,
  ...props
} & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
} & {
  asChild?
}) {
  const Comp = asChild ? Slot 

  return (
    <Comp
      className={cn(
        "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg],
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}{
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative !m-0 self-stretch data-[orientation=vertical],
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
