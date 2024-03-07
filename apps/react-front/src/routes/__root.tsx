import { createRootRoute, Outlet } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/tauri"
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

document.addEventListener("DOMContentLoaded", () => {
  invoke("close_splashscreen")
})

export const Route = createRootRoute({
  component: () => (
    <main>
      <div className="">
        <h1 className="bg-red-200">Hello world</h1>
      </div>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </main>
  )
})
