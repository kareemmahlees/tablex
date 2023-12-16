"use client"
import CreateConnectionBtn from "@/components/create-connection-btn"
import LoadingSpinner from "@/components/loading-spinner"
import { useQuery } from "@tanstack/react-query"
import { unregisterAll } from "@tauri-apps/api/globalShortcut"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLayoutEffect } from "react"
import { checkConsExist } from "./actions"

export default function Home() {
  const router = useRouter()
  const { isLoading } = useQuery({
    queryKey: [],
    queryFn: async () =>
      (await checkConsExist()) ? router.push("/connections") : null
  })

  useLayoutEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Unregistering so that changes in shortcut handlers can take effect.
      // Only useful during development.
      unregisterAll()
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <main className="relative flex flex-col items-center justify-center gap-y-20 h-full">
      <div className="flex items-center">
        <h1 className="text-6xl font-bold text-white z-20 ">Table</h1>
        <Image
          src={"/icons/icon.svg"}
          alt="logo"
          width={45}
          height={45}
          aria-hidden
        />
      </div>
      <CreateConnectionBtn />
      <Image
        src={"/splashscreen_bg.svg"}
        alt="bg"
        aria-hidden
        fill
        className="w-full h-full object-cover -z-10"
      />
    </main>
  )
}
