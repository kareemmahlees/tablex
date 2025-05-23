import { Toaster } from "@/components/ui/sonner"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
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
                  "group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto "
              }
            }}
          />
          <Outlet />
          <Suspense>
            <TanStackRouterDevtools
              position="top-right"
              toggleButtonProps={{
                className: "mr-[70px]"
              }}
            />
            <ReactQueryDevtools buttonPosition="top-right" />
          </Suspense>
        </main>
      )
    }
  }
)
