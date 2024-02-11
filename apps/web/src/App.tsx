import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import Heading from "@/sections/Heading"
import Nav from "@/sections/Nav"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { ThemeProvider } from "./components/providers/theme-provider"
import BundleSizeCard from "./sections/BundleSizeCard"
import Download from "./sections/Download"
import Footer from "./sections/Footer"
import KbdShortcutsCard from "./sections/KbdShortcutsCard"
import MetaXCard from "./sections/MetaXCard"
import ToolsCard from "./sections/ToolsCard"

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
          <MetaXCard />
          <BundleSizeCard />
          <KbdShortcutsCard />
          <Download />
          <Footer />
        </MaxWidthWrapper>
      </main>
    </ThemeProvider>
  )
}

export default App
