import Image from "next/image"

const DashboardPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-y-3 break-words text-center text-2xl font-bold text-gray-500 opacity-50">
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
