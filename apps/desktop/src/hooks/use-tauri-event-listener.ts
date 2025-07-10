import { events } from "@/bindings"
import React, { useEffect } from "react"

export const useTauriEventListener = (
  event: keyof typeof events,
  cp: () => void,
  deps: React.DependencyList
) => {
  useEffect(() => {
    const unlisten = events[event].listen(cp)

    return () => {
      unlisten.then((f) => f())
    }
  }, deps)
}
