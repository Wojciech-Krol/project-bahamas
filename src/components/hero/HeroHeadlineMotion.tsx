"use client";

import { motion } from "motion/react";

export default function HeroHeadlineMotion({
  start,
  middle,
  end,
}: {
  start: string;
  middle: string;
  end: string;
}) {
  return (
    <h1
      data-hero-headline
      className="font-headline font-extrabold text-[2.25rem] md:text-[6rem] leading-[1.1] md:leading-[1.05] tracking-tight text-on-surface mb-6 md:mb-12"
    >
      {start}
      <br />
      <motion.span
        className="inline-block text-primary italic"
        initial={false}
        animate={{
          textShadow: [
            "0 0 0px rgba(180,15,85,0)",
            "0 0 24px rgba(180,15,85,0.35)",
            "0 0 0px rgba(180,15,85,0)",
          ],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      >
        {middle}
      </motion.span>{" "}
      {end}
    </h1>
  );
}
