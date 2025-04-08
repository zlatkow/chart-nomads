"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface CustomSwitchProps extends React.ComponentPropsWithoutRef<typeof Switch> {}

export function CustomSwitch({ className, ...props }: CustomSwitchProps) {
  return (
    <>
      <style jsx global>{`
        /* Target the switch root */
        .custom-switch {
          background-color: white !important;
          border: 2px solid #edb900 !important;
        }
        
        /* Target the switch thumb */
        .custom-switch [data-state] {
          background-color: #edb900 !important;
        }
      `}</style>
      <Switch className={cn("custom-switch", className)} {...props} />
    </>
  )
}
