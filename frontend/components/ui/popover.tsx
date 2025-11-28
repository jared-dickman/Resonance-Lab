'use client'

import { cn } from '@/lib/utils'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

interface PopoverContextValue {
  openDelay?: number
  closeDelay?: number
  onOpenChange?: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue>({})

interface PopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  openDelay?: number
  closeDelay?: number
}

function Popover({
                   openDelay,
                   closeDelay,
                   ...props
                 }: PopoverProps) {
  const [open, setOpen] = React.useState(false)
  const openTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    // Clear any pending timeouts
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)

    if (newOpen) {
      if (openDelay) {
        openTimeoutRef.current = setTimeout(() => setOpen(true), openDelay)
      } else {
        setOpen(true)
      }
    } else {
      if (closeDelay) {
        closeTimeoutRef.current = setTimeout(() => setOpen(false), closeDelay)
      } else {
        setOpen(false)
      }
    }
  }, [openDelay, closeDelay])

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const contextValue = React.useMemo(
    () => ({ openDelay, closeDelay, onOpenChange: handleOpenChange }),
    [openDelay, closeDelay, handleOpenChange]
  )

  // If delays are provided, use controlled mode with hover support
  if (openDelay !== undefined || closeDelay !== undefined) {
    return (
      <PopoverContext.Provider value={contextValue}>
        <PopoverPrimitive.Root
          data-slot="popover"
          open={open}
          onOpenChange={handleOpenChange}
          {...props}
        />
      </PopoverContext.Provider>
    )
  }

  // Otherwise use uncontrolled mode
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
                          asChild,
                          children,
                          ...props
                        }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const context = React.useContext(PopoverContext)

  // If delays are configured, add hover handlers
  if (context && (context.openDelay !== undefined || context.closeDelay !== undefined)) {
    const handleMouseEnter = () => {
      context.onOpenChange?.(true)
    }

    const handleMouseLeave = () => {
      context.onOpenChange?.(false)
    }

    if (asChild && React.isValidElement(children)) {
      // Clone child and merge hover handlers
      const childElement = children as React.ReactElement<{
        onMouseEnter?: (e: React.MouseEvent) => void
        onMouseLeave?: (e: React.MouseEvent) => void
      }>

      return (
        <PopoverPrimitive.Trigger asChild data-slot="popover-trigger" {...props}>
          {React.cloneElement(childElement, {
            onMouseEnter: (e: React.MouseEvent) => {
              handleMouseEnter()
              childElement.props?.onMouseEnter?.(e)
            },
            onMouseLeave: (e: React.MouseEvent) => {
              handleMouseLeave()
              childElement.props?.onMouseLeave?.(e)
            }
          })}
        </PopoverPrimitive.Trigger>
      )
    }

    return (
      <PopoverPrimitive.Trigger
        data-slot="popover-trigger"
        asChild={asChild}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </PopoverPrimitive.Trigger>
    )
  }

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      asChild={asChild}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  )
}

function PopoverContent({
                          className,
                          align = 'center',
                          sideOffset = 4,
                          ...props
                        }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const context = React.useContext(PopoverContext)

  const handleMouseEnter = React.useCallback(() => {
    if (context && (context.openDelay !== undefined || context.closeDelay !== undefined)) {
      context.onOpenChange?.(true)
    }
  }, [context])

  const handleMouseLeave = React.useCallback(() => {
    if (context && (context.openDelay !== undefined || context.closeDelay !== undefined)) {
      context.onOpenChange?.(false)
    }
  }, [context])

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-98 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-lg outline-hidden transition-all duration-300 ease-out',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
                         ...props
                       }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export {Popover, PopoverTrigger, PopoverContent, PopoverAnchor}
