import Heading from "@/components/Heading"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import Nav from "@/components/Nav"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { ThemeProvider } from "./components/providers/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SpeedInsights />
      <main className="font-[Rubik]">
        <Nav />
        <MaxWidthWrapper>
          <Heading />
        </MaxWidthWrapper>
      </main>
    </ThemeProvider>
  )
}

export default App
