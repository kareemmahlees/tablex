import CreateConnectionBtn from "@/components/create-connection-btn"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index
})

function Index() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-y-20">
      <div className="flex items-end">
        <h1 className="z-20 text-6xl font-bold text-white">Table</h1>
        <img
          src={"/logo.svg"}
          alt="logo"
          width={50}
          height={50}
          aria-hidden
          className="mb-1"
        />
      </div>
      <CreateConnectionBtn />
      <img
        src={"/landing.svg"}
        alt="bg"
        aria-hidden
        className="absolute -z-10 h-full w-full object-cover"
      />
    </div>
  )
}
