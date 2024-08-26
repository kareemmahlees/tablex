import {
  Check,
  GitBranch,
  Globe2,
  Keyboard,
  Palette,
  SettingsIcon,
  Terminal,
  Webhook
} from "lucide-react"
import APIDocs from "./cards/api-docs"
import CLI from "./cards/cli"
import CommandPalette from "./cards/command-palette"
import CrossPlatform from "./cards/cross-platform"
import Keybindings from "./cards/keybindings"
import OpenSource from "./cards/open-source"
import Settings from "./cards/settings"
import Updater from "./cards/updater"
import { BentoGrid, BentoGridItem } from "./components/bento-grid"

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
  },
  {
    title: "Terminal friendly.",
    description:
      "You can use TableX from right within your terminal thanks to our shipped-by-default CLI.",
    header: <CLI />,
    icon: <Terminal className="h-5 w-5" />,
    className: "md:col-span-2"
  },

  {
    title: "Automatically generated endpoints for your database.",
    description: (
      <p>
        With the power of{" "}
        <a href="" className="font-semibold text-white hover:underline">
          MetaX
        </a>
        , we autogenerate RESTfull & GraphQL endpoints for your database without
        any effort from you
      </p>
    ),
    header: <APIDocs />,
    icon: <Webhook className="h-5 w-5" />,
    className: "md:col-span-3"
  },
  {
    title: "100% Open-Source and Free.",
    description:
      "We believe in open source philosophy, that's why TableX is completely open-source and free with no login or sign-up required. ",
    header: <OpenSource />,
    icon: <GitBranch className="h-5 w-5" />,
    className: "md:col-span-full"
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
