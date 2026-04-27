"use client";

import type { ElementType, ReactNode } from "react";

// Reveal used to gate content behind motion/react `whileInView` + opacity:0.
// On slow/older laptops, IntersectionObserver could fail to fire (or fire after
// the failsafe never), leaving entire sections permanently invisible — the
// page looked broken below the search bar. We now render content visibly on
// SSR + first paint and drop the JS-driven scroll reveal entirely. Component
// kept as a passthrough so the existing call-sites don't change.

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

const TAGS: Record<Tag, ElementType> = {
  div: "div",
  section: "section",
  article: "article",
  header: "header",
  footer: "footer",
  ul: "ul",
  li: "li",
  p: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  span: "span",
  form: "form",
};

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

export default function Reveal({
  children,
  as = "div",
  className,
}: RevealBase) {
  const Tag = TAGS[as];
  return <Tag className={className}>{children}</Tag>;
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

function Item({ children, as = "div", className }: ItemProps) {
  const Tag = TAGS[as];
  return <Tag className={className}>{children}</Tag>;
}

Reveal.Item = Item;
export { Item as RevealItem };
