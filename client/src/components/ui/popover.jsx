import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from '@/lib/utils.js'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (

))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
