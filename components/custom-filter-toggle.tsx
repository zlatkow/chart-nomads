import type React from "react"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

interface CustomFilterToggleProps extends React.ComponentProps<typeof Toggle> {
  label: string
  selected?: boolean
}

export function CustomFilterToggle({ label, selected = false, className, ...props }: CustomFilterToggleProps) {
  return (
    <Toggle
      {...props}
      pressed={selected}
      className={cn(
        "px-3 py-1 rounded-full border text-xs",
        selected
          ? "bg-[#edb900] text-[#0f0f0f] border-[#edb900] shadow-md"
          : "bg-transparent border-[#edb900] text-[#edb900] hover:text-[#edb900] hover:bg-[#edb900]/10",
        className,
      )}
    >
      {label}
    </Toggle>
  )
}
