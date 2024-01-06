import Heading from "@/components/Heading"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import Nav from "@/components/Nav"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import BundleSizeCard from "./components/BundleSizeCard"
import KbdShortcutsCard from "./components/KbdShortcutsCard"
import ToolsCard from "./components/ToolsCard"
import { ThemeProvider } from "./components/providers/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Analytics />
      <SpeedInsights />
      <main className="font-[Rubik] ">
        <Nav />
        <MaxWidthWrapper>
          <Heading />
          <ToolsCard />
          <BundleSizeCard />
          <KbdShortcutsCard />
        </MaxWidthWrapper>
      </main>
    </ThemeProvider>
  )
}

export default App
