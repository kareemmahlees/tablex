import { Globe2 } from "lucide-react"
import { BentoGrid, BentoGridItem } from "./components/bento-grid"
import CrossPlatform from "./components/cross-platform"

const items = [
  {
    title: "Cross-Platform, runs everywhere.",
    description:
      "Powered by Rust & Tauri, TableX supports Windows, MacOS and Linux.",
    header: <CrossPlatform />,
    icon: <Globe2 className="h-5 w-5" />,
    className: "md:col-span-2 group"
  }
]

const Features = () => {
  return (
    <BentoGrid className="mx-auto mt-40 max-w-4xl md:auto-rows-[20rem]">
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
