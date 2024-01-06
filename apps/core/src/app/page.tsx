"use client"
import CreateConnectionBtn from "@/components/create-connection-btn"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLayoutEffect } from "react"
import { checkConsExist } from "./actions"

export default function Home() {
  const router = useRouter()

  useLayoutEffect(() => {
    checkConsExist().then((exist) =>
      exist ? router.push("/connections") : null
    )
  })

  return (
    <main className="relative flex h-full flex-col items-center justify-center gap-y-20">
      <div className="flex items-center">
        <h1 className="z-20 text-6xl font-bold text-white ">Table</h1>
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
        className="-z-10 h-full w-full object-cover"
      />
    </main>
  )
}
