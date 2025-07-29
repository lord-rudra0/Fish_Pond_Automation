import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from '@/lib/utils.js'
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
     (
          
        ),
        IconRight: ({ className, ...props }) => (
          
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
