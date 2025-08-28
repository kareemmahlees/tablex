import { KeybindingsContext, KeybindingsManager } from "@/features/keybindings"
import { SettingsProvider } from "@/features/settings/context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { scan } from "react-scan"
import { commands } from "./bindings"
import "./index.css"
import { routeTree } from "./routeTree.gen"

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
          <RouterProvider router={router} />
        </KeybindingsContext.Provider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
