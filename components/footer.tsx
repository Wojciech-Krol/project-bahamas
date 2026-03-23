import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

interface FooterProps {
  variant?: "default" | "kids" | "teens" | "adults";
}

const variantStyles = {
  default: {
    bg: "bg-[var(--color-gray-800)]",
    text: "text-white/70",
    heading: "text-white",
    link: "text-white/70 hover:text-white",
  },
  kids: {
    bg: "bg-orange-900",
    text: "text-orange-100/70",
    heading: "text-white",
    link: "text-orange-100/70 hover:text-white",
  },
  teens: {
    bg: "bg-slate-950",
    text: "text-white/60",
    heading: "text-[var(--color-teens-neon-green)]",
    link: "text-white/60 hover:text-[var(--color-teens-neon-green)]",
  },
  adults: {
    bg: "bg-emerald-900",
    text: "text-emerald-100/70",
    heading: "text-white",
    link: "text-emerald-100/70 hover:text-white",
  },
};

const footerLinks = {
  explore: [
    { label: "Kids Classes", href: "/kids" },
    { label: "Teen Programs", href: "/teens" },
    { label: "Adult Workshops", href: "/adults" },
    { label: "All Categories", href: "/categories" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Partners", href: "/partners" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: "globe", href: "#" },
  { name: "Instagram", icon: "photo_camera", href: "#" },
  { name: "Twitter", icon: "tag", href: "#" },
];

export function Footer({ variant = "default" }: FooterProps) {
  const styles = variantStyles[variant];

  return (
    <footer className={cn("py-16", styles.bg)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon
                  name="explore"
                  className={styles.heading}
                  size="md"
                  filled
                />
              </div>
              <span className={cn("text-xl font-bold", styles.heading)}>
                Hakuna
              </span>
            </Link>
            <p className={cn("text-sm mb-6 max-w-sm leading-relaxed", styles.text)}>
              Discover amazing classes and activities for all ages in The Bahamas.
              Learn, grow, and connect with your community.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={cn(
                    "w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-colors hover:bg-white/20",
                    styles.link
                  )}
                  aria-label={social.name}
                >
                  <Icon name={social.icon} size="sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className={cn("font-semibold mb-4", styles.heading)}>Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn("text-sm transition-colors", styles.link)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className={cn("font-semibold mb-4", styles.heading)}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn("text-sm transition-colors", styles.link)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className={cn("font-semibold mb-4", styles.heading)}>Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn("text-sm transition-colors", styles.link)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className={cn(
          "mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4",
          styles.text
        )}>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Hakuna. All rights reserved.
          </p>
          <p className="text-sm">
            Made with love in The Bahamas
          </p>
        </div>
      </div>
    </footer>
  );
}
