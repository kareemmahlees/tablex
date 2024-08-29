import CreateConnectionBtn from "@/components/create-connection-btn"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index
})

function Index() {
  return (
    <div className="dark:bg-dot-white/[0.4] bg-dot-black/[0.4] relative flex h-full flex-col items-center justify-center gap-y-20 bg-white dark:bg-black">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="flex items-end">
        <h1 className="z-10 text-6xl font-bold text-white lg:text-[100px]">
          Table
        </h1>
        <img
          src={"/logo.svg"}
          alt="logo"
          aria-hidden
          className="mb-1 h-[50px] w-[50px] lg:mb-2 lg:h-[70px] lg:w-[70px]"
        />
      </div>
      <CreateConnectionBtn />
    </div>
  )
}
