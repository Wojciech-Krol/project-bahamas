"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

type Tag =
  | "div"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "ul"
  | "li"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "span"
  | "form";

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
  ul: motion.ul,
  li: motion.li,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  span: motion.span,
  form: motion.form,
} as const;

type RevealBase = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  direction?: Direction;
  blur?: number;
  amount?: number;
  margin?: string;
  once?: boolean;
  as?: Tag;
  stagger?: number;
  className?: string;
};

const DEFAULT_DURATION = 0.7;
const DEFAULT_OFFSET = 24;
const DEFAULT_BLUR = 4;
const DEFAULT_AMOUNT = 0.25;
const DEFAULT_MARGIN = "0px 0px -10% 0px";

function offsets(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance, x: 0 };
    case "down":
      return { y: -distance, x: 0 };
    case "left":
      return { y: 0, x: distance };
    case "right":
      return { y: 0, x: -distance };
  }
}

function buildVariants(
  direction: Direction,
  distance: number,
  blur: number,
  duration: number,
  delay: number,
): Variants {
  const { x, y } = offsets(direction, distance);
  return {
    hidden: {
      opacity: 0,
      x,
      y,
      filter: blur > 0 ? `blur(${blur}px)` : "blur(0px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, delay, ease: "easeOut" },
    },
  };
}

export default function Reveal({
  children,
  delay = 0,
  duration = DEFAULT_DURATION,
  y = DEFAULT_OFFSET,
  direction = "up",
  blur = DEFAULT_BLUR,
  amount = DEFAULT_AMOUNT,
  margin = DEFAULT_MARGIN,
  once = false,
  as = "div",
  stagger,
  className,
}: RevealBase) {
  const reduce = useReducedMotion();
  const MotionTag = TAGS[as];

  if (reduce) {
    return (
      <MotionTag className={className} initial={false}>
        {children}
      </MotionTag>
    );
  }

  if (typeof stagger === "number") {
    const parentVariants: Variants = {
      hidden: {},
      visible: {
        transition: { staggerChildren: stagger, delayChildren: delay },
      },
    };
    return (
      <MotionTag
        className={className}
        initial="hidden"
        whileInView="visible"
        exit="hidden"
        viewport={{ once, amount, margin: margin as never }}
        variants={parentVariants}
      >
        {children}
      </MotionTag>
    );
  }

  const variants = buildVariants(direction, y, blur, duration, delay);
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      exit="hidden"
      viewport={{ once, amount, margin: margin as never }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

type ItemProps = {
  children: ReactNode;
  as?: Tag;
  className?: string;
  duration?: number;
  y?: number;
  direction?: Direction;
  blur?: number;
};

function Item({
  children,
  as = "div",
  className,
  duration = DEFAULT_DURATION,
  y = DEFAULT_OFFSET,
  direction = "up",
  blur = DEFAULT_BLUR,
}: ItemProps) {
  const reduce = useReducedMotion();
  const MotionTag = TAGS[as];

  if (reduce) {
    return (
      <MotionTag className={className} initial={false}>
        {children}
      </MotionTag>
    );
  }

  const { x, y: ty } = offsets(direction, y);
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x,
      y: ty,
      filter: blur > 0 ? `blur(${blur}px)` : "blur(0px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: "easeOut" },
    },
  };

  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  );
}

Reveal.Item = Item;
export { Item as RevealItem };
