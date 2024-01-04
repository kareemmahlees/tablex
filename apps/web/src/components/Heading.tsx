import { motion } from "framer-motion"
import { Button } from "./ui/button"

const Heading = () => {
  return (
    <header className="mt-16 break-keep gap-y-6 relative flex flex-col items-center">
      <motion.image
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.2
        }}
        aria-hidden
        transition={{ duration: 3 }}
        className="absolute -top-20 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      >
        <img src="/grid.svg" alt="bg" />
      </motion.image>
      <h1 className="font-bold text-4xl text-center md:text-5xl lg:text-6xl">
        Table viewer for modern developers
      </h1>
      <p className="text-center text-muted-foreground ">
        Database browsing experience like never before
      </p>
      <div className="flex items-center gap-x-7">
        <Button size={"sm"}>Get Started</Button>
        <Button variant={"secondary"} size={"sm"} className="relative group">
          <div className="absolute -z-10 -inset-1 bg-gradient-to-r from-amber-300 to-amber-300 rounded-lg blur opacity-30 hidden group-hover:block transition-colors" />
          <img src="/icons/github.svg" alt="github icon" className="w-5 h-5" />
          {/* <img
            src="/icons/start.svg"
            alt="star"
            className="absolute w-7 h-7 group-hover:-translate-y-5 transition-transform"
            aria-hidden
          /> */}
        </Button>
      </div>
      <img
        src="/overview.png"
        alt="overview"
        className="w-[400px] rounded-sm mt-5 [mask-image:linear-gradient(black,transparent_80%)]"
      />
    </header>
  )
}

export default Heading
