"use client";

import { Icon } from "../Icon";
import type { SearchField } from "./constants";

export default function SearchSegment({
  field,
  activeField,
  isExpanded,
  icon,
  label,
  displayValue,
  placeholder,
  placeholderClassName,
  onClick,
}: {
  field: SearchField;
  activeField: SearchField;
  isExpanded: boolean;
  icon: string;
  label: string;
  displayValue: string;
  placeholder: string;
  placeholderClassName?: string;
  onClick: () => void;
}) {
  const isActive = activeField === field;
  return (
    <button
      type="button"
      data-field={field}
      onClick={onClick}
      className={`flex-1 w-full min-w-0 flex items-center px-6 py-3 rounded-full transition-all duration-300 text-left cursor-pointer relative z-10 ${
        isActive
          ? "bg-surface-container-lowest shadow-lg shadow-on-surface/[0.08]"
          : isExpanded
          ? "hover:bg-surface-container/60"
          : "hover:bg-surface-container/30"
      }`}
    >
      <Icon
        name={icon}
        className={`mr-4 text-[20px] transition-colors ${
          isActive ? "text-primary" : "text-primary/40"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-0.5">
          {label}
        </div>
        <div
          className={`text-[0.9rem] font-semibold truncate ${
            displayValue ? "text-on-surface" : "text-on-surface/30"
          } ${!displayValue && placeholderClassName ? placeholderClassName : ""}`}
        >
          {displayValue || placeholder}
        </div>
      </div>
    </button>
  );
}
