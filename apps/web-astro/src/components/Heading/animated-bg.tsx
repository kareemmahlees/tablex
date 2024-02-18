import { motion } from 'framer-motion';

const AnimatedBG = () => {
    return ( <motion.image
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
 );
}
 
export default AnimatedBG;