"use client"

import Image from "next/image"

const DashboardPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-2xl font-bold break-words text-gray-500 opacity-50 text-center gap-y-3">
      <Image
        src={"/cube.svg"}
        alt="cube"
        aria-hidden
        width={100}
        height={100}
      />
      Choose a table
      <br />
      to get started
    </div>
  )
}

export default DashboardPage
