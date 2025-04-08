"use client"

import type * as React from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type CustomSwitchProps = React.ComponentPropsWithoutRef<typeof Switch>

export function CustomSwitch(props: CustomSwitchProps) {
  const { className, ...rest } = props

  return (
    <>
      <style jsx global>{`
        .custom-switch {
          background-color: #b38b00 !important;
          border: none;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: background-color 0.3s, box-shadow 0.3s;
        }

        .custom-switch[data-state="checked"] {
          background-color: #111111 !important;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .custom-switch > span {
          background-color: #c0c0c0 !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s, transform 0.3s;
        }

        .custom-switch[data-state="checked"] > span {
          background-color: #edb900 !important;
        }
      `}</style>
      <Switch className={cn("custom-switch", className)} {...rest} />
    </>
  )
}
