import { motion } from "framer-motion";

const variants = {
  enter: { x: "8%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: "-8%", opacity: 0 },
};

export default function AnimatedView({ viewKey, children }) {
  return (
    <motion.div
      key={viewKey}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}