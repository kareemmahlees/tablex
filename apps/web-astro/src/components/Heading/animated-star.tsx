import { motion } from 'framer-motion';

const AnimatedStar = () => {
    return ( <motion.image
            className="absolute -z-10 h-7 w-7"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 100
            }}
          >
            <img
              src="/star.svg"
              alt="star"
              className="transition-transform group-hover:-translate-y-5"
              aria-hidden
            />
          </motion.image>
 );
}
 
export default AnimatedStar;