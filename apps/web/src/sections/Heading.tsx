import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button, buttonVariants } from "../components/ui/button"

const Heading = () => {
  return (
    <header className="relative mt-24 flex flex-col items-center gap-y-6 break-keep md:mt-32 md:gap-y-8">
      <motion.image
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.2
        }}
        aria-hidden
        transition={{ duration: 3 }}
        className="absolute -top-20 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] md:-top-32 md:opacity-10 md:[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      >
        <img src="/grid.svg" alt="bg" />
      </motion.image>
      <h1 className="text-center text-4xl font-bold md:text-5xl lg:text-6xl">
        Table viewer for modern developers
      </h1>
      <p className="text-muted-foreground text-center md:text-lg lg:text-xl">
        Database browsing experience like never before
      </p>
      <div className="flex items-center gap-x-7">
        <Button
          className="font-semi"
          onClick={() =>
            document
              .getElementById("download")
              ?.scrollIntoView({ block: "center" })
          }
        >
          Download Now
        </Button>
        <a
          href="https://github.com/kareemmahlees/tablex"
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({
              variant: "secondary"
            }),
            "hover:bg-secondary group relative"
          )}
        >
          <img src="/icons/github.svg" alt="github icon" className="h-5 w-5" />
          <motion.image
            className="absolute -z-10 h-7 w-7"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 100
            }}
          >
            <img
              src="/icons/start.svg"
              alt="star"
              className="transition-transform group-hover:-translate-y-5"
              aria-hidden
            />
          </motion.image>
        </a>
      </div>
      <img
        src="/overview.png"
        alt="overview"
        className="mt-5 w-[400px] rounded-sm brightness-[80%] [mask-image:linear-gradient(black,gray,transparent_75%)] md:w-[600px] lg:w-[850px]"
      />
    </header>
  )
}

export default Heading
