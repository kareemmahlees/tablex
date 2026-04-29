import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: () => {
      return (
        <main className="dark h-full w-full">
          <Outlet />
          <TanStackDevtools
            config={{
              openHotkey: ["Control", "d"],
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
        </main>
      )
    }
  }
)
