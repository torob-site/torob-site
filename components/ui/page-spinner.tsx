import { Spinner } from "./spinner";

/**
 * Full-page loading spinner
 * @param size - Spinner size class (default: "size-8")
 * @param color - Spinner color class (default: "text-[#d73948]")
 * @param className - Additional classes for the container
 */
export function PageSpinner({
  size = "size-8",
  color = "text-[#d73948]",
  className = "",
}: {
  size?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center w-full justify-center py-20 ${className}`}
    >
      <Spinner className={`${size} ${color}`} />
    </div>
  );
}

/**
 * Full-screen loading spinner (fills viewport)
 * @param color - Spinner color class (default: "text-[#d73948]")
 * @param className - Additional classes for the container
 */
export function ScreenSpinner({
  color = "text-[#d73948]",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-screen w-full items-center justify-center ${className}`}
    >
      <Spinner className={`size-8 ${color}`} />
    </div>
  );
}

/**
 * Compact/inline loading spinner (less padding)
 * @param size - Spinner size class (default: "size-7")
 * @param color - Spinner color class (default: "text-[#d73948]")
 * @param className - Additional classes for the container
 */
export function InlineSpinner({
  size = "size-7",
  color = "text-[#d73948]",
  className = "",
}: {
  size?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <Spinner className={`${size} ${color}`} />
    </div>
  );
}
