import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("w-full rounded-lg border border-border bg-input px-3 py-2 text-sm", className)}
      {...props}
    />
  )
}

export { Textarea }
