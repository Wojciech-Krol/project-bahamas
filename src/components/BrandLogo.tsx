import Image from "next/image";

export default function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        src="/logo.svg"
        alt="Hakuna Logo"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
      <span
        className="font-headline font-bold tracking-tighter text-on-surface"
        style={{ fontSize: size * 0.6 }}
      >
        hakuna
      </span>
    </span>
  );
}
