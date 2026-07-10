import { motion } from 'framer-motion';

export function BouncingDots() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 }
  };
  
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <motion.div 
      className="flex gap-2 items-center h-6"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          variants={dotVariants}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
}
