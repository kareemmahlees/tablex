import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import "./index.css"
import { routeTree } from "./routeTree.gen"

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

// if (import.meta.hot) {
//   console.log(true)
//   import.meta.hot.on("vite:beforeUpdate", () => {
//     // unregisterAll()
//     console.log("beforeUpdate")
//   })
//   import.meta.hot.on("vite:beforeFullReload", () => {
//     // unregisterAll()
//     console.log("beforeFullReload")
//   })
// }

const client = new QueryClient()

const rootElement = document.getElementById("app")!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
