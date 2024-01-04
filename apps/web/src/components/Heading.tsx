import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button, buttonVariants } from "./ui/button"

const Heading = () => {
  return (
    <header className="mt-24 md:mt-32 break-keep gap-y-6 md:gap-y-8 relative flex flex-col items-center">
      <motion.image
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.2
        }}
        aria-hidden
        transition={{ duration: 3 }}
        className="absolute -top-20 md:-top-32 -z-10 opacity-20 md:opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] md:[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      >
        <img src="/grid.svg" alt="bg" />
      </motion.image>
      <h1 className="font-bold text-4xl text-center md:text-5xl lg:text-6xl">
        Table viewer for modern developers
      </h1>
      <p className="text-center text-muted-foreground md:text-lg lg:text-xl">
        Database browsing experience like never before
      </p>
      <div className="flex items-center gap-x-7">
        <Button className="font-semi">Download Now</Button>
        <a
          href="https://github.com/kareemmahlees/tablex"
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({
              variant: "secondary"
            }),
            "relative group hover:bg-secondary"
          )}
        >
          <img src="/icons/github.svg" alt="github icon" className="w-5 h-5" />
          <motion.image
            className="absolute w-7 h-7 -z-10"
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
              className="group-hover:-translate-y-5 transition-transform"
              aria-hidden
            />
          </motion.image>
        </a>
      </div>
      <img
        src="/overview.png"
        alt="overview"
        className="w-[400px] md:w-[600px] rounded-sm mt-5 [mask-image:linear-gradient(black,gray,transparent_75%)] brightness-[80%]"
      />
    </header>
  )
}

export default Heading
