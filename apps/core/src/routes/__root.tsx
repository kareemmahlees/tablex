import { closeSplashscreen } from "@/bindings"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import React, { Suspense } from "react"
import { Toaster } from "react-hot-toast"

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
  onEnter: closeSplashscreen,
  component: () => {
    return (
      <main className="dark h-full w-full">
        <Toaster position="top-right" />
        <Outlet />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
      </main>
    )
  }
})
