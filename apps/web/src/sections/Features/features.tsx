import { Check, Globe2, Keyboard, Palette, SettingsIcon } from "lucide-react"
import { BentoGrid, BentoGridItem } from "./components/bento-grid"
import CommandPalette from "./components/command-palette"
import CrossPlatform from "./components/cross-platform"
import Keybindings from "./components/keybindings"
import Settings from "./components/settings"
import Updater from "./components/updater"

const items = [
  {
    title: "Cross-Platform, runs everywhere.",
    description:
      "Powered by Rust & Tauri, TableX supports Windows, MacOS and Linux.",
    header: <CrossPlatform />,
    icon: <Globe2 className="h-5 w-5" />,
    className: "md:col-span-3"
  },
  {
    title: "Your App, your Settings.",
    description:
      "Change how TableX behaves with configurable settings inspired by VSCode.",
    header: <Settings />,
    icon: <SettingsIcon className="h-5 w-5" />,
    className: "md:col-span-2"
  },
  {
    title: "Leverage the full power of your Keyboard.",
    description:
      "A configurable keybindings system that meets your needs. Inspired by VSCode.",
    header: <Keybindings />,
    icon: <Keyboard className="h-5 w-5" />,
    className: "md:col-span-2 "
  },
  {
    title: "Quick access to available commands.",
    description: "Invoke functionality from a central command palette.",
    header: <CommandPalette />,
    icon: <Palette className="h-5 w-5" />,
    className: "md:col-span-2 "
  },
  {
    title: "Staying up-to-date always.",
    description: "TableX can self-update with our built in updater.",
    header: <Updater />,
    icon: <Check className="h-5 w-5" />,
    className: "md:col-span-1"
  }
]

const Features = () => {
  return (
    <BentoGrid className="mt-40 grid max-w-5xl grid-cols-1 md:auto-rows-[20rem] md:grid-cols-3 lg:grid-cols-5">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={item.className}
        />
      ))}
    </BentoGrid>
  )
}

export default Features
