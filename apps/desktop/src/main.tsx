import { KeybindingsContext, KeybindingsManager } from "@/features/keybindings"
import { SettingsProvider } from "@/features/settings/context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { scan } from "react-scan"
import { commands } from "./bindings"
import "@tablex/ui/design-system.css"
import { routeTree } from "./routeTree.gen"
import { Toaster } from "@tablex/ui/components/sonner"
import { TooltipProvider } from "@tablex/ui/components/tooltip"

const client = new QueryClient()
scan({ enabled: import.meta.env.DEV })

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    queryClient: client
  }
})

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const keybindingsManager = new KeybindingsManager()

const rootElement = document.getElementById("app")!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  const settings = await commands.loadSettingsFile()

  root.render(
    <QueryClientProvider client={client}>
      <SettingsProvider value={settings}>
        <KeybindingsContext.Provider value={keybindingsManager}>
          <TooltipProvider>
            <RouterProvider router={router} />
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
          </TooltipProvider>
        </KeybindingsContext.Provider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
