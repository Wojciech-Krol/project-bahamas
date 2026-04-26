"use client";

import { motion, type Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 0.9,
    },
  },
};

function Word({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      variants={wordVariants}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}

export default function HeroHeadlineMotion({
  start,
  middle,
  end,
}: {
  start: string;
  middle: string;
  end: string;
}) {
  const startWords = start.split(" ");
  const endWords = end.split(" ");

  return (
    <motion.h1
      className="font-headline font-extrabold text-[2.25rem] md:text-[6rem] leading-[1.1] md:leading-[1.05] tracking-tight text-on-surface mb-6 md:mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {startWords.map((w, i) => (
        <Word key={`s-${i}`}>
          {w}
          {i < startWords.length - 1 ? " " : ""}
        </Word>
      ))}
      <br />
      <motion.span
        className="inline-block text-primary italic"
        variants={wordVariants}
        animate={{
          textShadow: [
            "0 0 0px rgba(180,15,85,0)",
            "0 0 24px rgba(180,15,85,0.35)",
            "0 0 0px rgba(180,15,85,0)",
          ],
        }}
        transition={{
          textShadow: {
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          },
        }}
      >
        {middle}
      </motion.span>{" "}
      {endWords.map((w, i) => (
        <Word key={`e-${i}`}>
          {w}
          {i < endWords.length - 1 ? " " : ""}
        </Word>
      ))}
    </motion.h1>
  );
}
