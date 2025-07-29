import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from '@/lib/utils.js'
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps) => (
  
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef
>(({ className, ...props }, ref) => (
  
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef
>(({ className, ...props }, ref) => (
  
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?, "size"> &
  React.ComponentProps

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}) => (

    Previous
  
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}) => (
  
    Next

)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps) => (

    More pages
  
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
