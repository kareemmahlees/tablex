import { Toaster } from "@/components/ui/sonner"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import React, { Suspense } from "react"

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools
        }))
      )

export const Route = createRootRoute({
  component: () => {
    return (
      <main className="dark h-full w-full">
        <Toaster
          closeButton
          richColors
          position="top-right"
          pauseWhenPageIsHidden
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto "
            }
          }}
        />
        <Outlet />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
      </main>
    )
  }
})
