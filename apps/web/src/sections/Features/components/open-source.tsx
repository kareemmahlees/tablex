const OpenSource = () => {
  return (
    <div className="dark:bg-dot-white/[0.6] bg-dot-black/[0.6] relative mx-auto flex h-full w-full grid-cols-4 items-center justify-center gap-2 bg-white md:gap-y-8 dark:bg-black">
      <div className="flex flex-col items-center gap-y-3">
        <p className="text-4xl font-bold">Open Source & Free</p>
        <a href="https://github.com/kareemmahlees/tablex">
          <img
            src="https://cdn.simpleicons.org/github/white"
            alt="github"
            className="h-6 w-6"
          />
        </a>
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-white transition-all [mask-image:radial-gradient(ellipse_at_center,transparent_15%,black)] dark:bg-black"></div>
    </div>
  )
}

export default OpenSource
