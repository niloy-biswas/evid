import * as React from "react"

import { cn } from "@/lib/utils"

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn("h-10 w-full rounded-lg border border-border bg-input px-3 text-sm", className)}
      {...props}
    />
  )
}

export { NativeSelect }
