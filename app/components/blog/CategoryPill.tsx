export default function CategoryPill({
  label,
  variant = "solid",
  className = "",
}: {
  label: string;
  variant?: "solid" | "overlay";
  className?: string;
}) {
  const styles =
    variant === "overlay"
      ? "bg-primary-fixed/95 text-primary backdrop-blur-sm"
      : "bg-primary-fixed text-primary";
  return (
    <span
      className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.2em] ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
