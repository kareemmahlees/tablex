import { Toaster } from "@tablex/ui/components/sonner"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/router-devtools"

const Devtools = () => {
  if (import.meta.env.PROD) return

  return (
    <TanStackDevtools
      config={{
        openHotkey: ["Alt", "d"],
        triggerHidden: true
      }}
      plugins={[
        {
          name: "Tanstack Query",
          render: <ReactQueryDevtoolsPanel />
        },
        {
          name: "Tanstack Router",
          render: <TanStackRouterDevtoolsPanel />
        }
      ]}
    />
  )
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: () => {
      return (
        <main className="dark h-full w-full">
          <Toaster
            closeButton
            richColors
            position="bottom-center"
            pauseWhenPageIsHidden
            toastOptions={{
              classNames: {
                toast:
                  "group toast group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto "
              }
            }}
          />
          <Outlet />
          <Devtools />
        </main>
      )
    }
  }
)
