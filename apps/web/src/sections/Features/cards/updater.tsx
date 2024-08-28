import { CheckCircle } from "lucide-react"

const Updater = () => {
  return (
    <div className="dark:bg-dot-white/[0.6] bg-dot-black/[0.6] relative flex h-[130px] w-full items-center justify-center gap-2 bg-white md:h-[160px] md:gap-y-8 lg:h-full dark:bg-black">
      <CheckCircle className="h-9 w-9" />
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-white transition-all [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black)] dark:bg-black"></div>
    </div>
  )
}

export default Updater
