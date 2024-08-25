import { Globe2, SettingsIcon } from "lucide-react"
import { BentoGrid, BentoGridItem } from "./components/bento-grid"
import CrossPlatform from "./components/cross-platform"
import Settings from "./components/settings"

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
