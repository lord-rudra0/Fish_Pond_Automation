import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from '@/lib/utils.js'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, ...props }, ref) => (
  
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, ...props }, ref) => (
  
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef,
  React.ComponentPropsWithoutRef
>(({ className, ...props }, ref) => (
  
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
