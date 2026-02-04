"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}{
  buttonVariant?
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size,
        String.raw`rtl,
        String.raw`rtl,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown
          date.toLocaleString("default", { month}),
        ...formatters,
      }}
      classNames={{
        root, defaultClassNames.root),
        months
          "flex gap-4 flex-col md,
          defaultClassNames.months
        ),
        month, defaultClassNames.month),
        nav
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous
          buttonVariants({ variant}),
          "size-(--cell-size) aria-disabled,
          defaultClassNames.button_previous
        ),
        button_next
          buttonVariants({ variant}),
          "size-(--cell-size) aria-disabled,
          defaultClassNames.button_next
        ),
        month_caption
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root
          "relative has-focus,
          defaultClassNames.dropdown_root
        ),
        dropdown
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            ,
          defaultClassNames.caption_label
        ),
        table,
        weekdays, defaultClassNames.weekdays),
        weekday
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week, defaultClassNames.week),
        week_number_header
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day
          "relative w-full h-full p-0 text-center [&,
          props.showWeekNumber
            ? "[&
            ,
          defaultClassNames.day
        ),
        range_start
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle, defaultClassNames.range_middle),
        range_end, defaultClassNames.range_end),
        today
          "bg-accent text-accent-foreground rounded-md data-[selected=true],
          defaultClassNames.today
        ),
        outside
          "text-muted-foreground aria-selected,
          defaultClassNames.outside
        ),
        disabled
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden, defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root{)=> {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron{)=> {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton,
        WeekNumber{ children, ...props })=> {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}{
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(()=> {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true],
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
