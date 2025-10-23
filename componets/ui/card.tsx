import * as React from "react";
import { cn } from "@/lib/utils"; // helper to merge Tailwind classes (create if not already available)

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props} />
  );
}
