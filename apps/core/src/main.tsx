import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import "./index.css"
import { KeybindingsContext, KeybindingsManager } from "./keybindings/manager"
import { routeTree } from "./routeTree.gen"
import { SettingsContext, SettingsManager } from "./settings/manager"

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent"
})

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const client = new QueryClient()
const keybindingsManager = new KeybindingsManager()
const settingsManager = new SettingsManager()

const rootElement = document.getElementById("app")!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={client}>
      <SettingsContext.Provider value={settingsManager}>
        <KeybindingsContext.Provider value={keybindingsManager}>
          <RouterProvider router={router} />
        </KeybindingsContext.Provider>
      </SettingsContext.Provider>
    </QueryClientProvider>
  )
}
