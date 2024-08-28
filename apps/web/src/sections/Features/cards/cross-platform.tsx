const tools: { src: string; alt: string }[] = [
  {
    src: "https://cdn.simpleicons.org/react/white",
    alt: "react"
  },
  {
    src: "https://cdn.simpleicons.org/rust/white",
    alt: "rust"
  },
  {
    src: "https://cdn.simpleicons.org/bun/white",
    alt: "bun"
  },
  {
    src: "https://cdn.simpleicons.org/tauri/white",
    alt: "tauri"
  },
  {
    src: "https://cdn.simpleicons.org/tailwindcss/white",
    alt: "tailwind"
  },
  {
    src: "https://cdn.simpleicons.org/go/white",
    alt: "go"
  },
  {
    src: "https://cdn.simpleicons.org/shadcnui/white",
    alt: "shadcn/ui"
  }
]

const CrossPlatform = () => {
  return (
    <div className="dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative mx-auto grid h-full w-full grid-cols-4 gap-2 gap-y-6 bg-white pt-7 md:gap-y-8 dark:bg-black">
      {tools.map(({ src, alt }) => (
        <img
          src={src}
          alt={alt}
          className="z-10 h-9 w-9 justify-self-center md:h-10 md:w-10"
        />
      ))}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-white transition-all [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
    </div>
  )
}

export default CrossPlatform
