interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Skeleton = ({ className = "", rounded = "md" }: SkeletonProps) => {
  const r = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-2xl", xl: "rounded-3xl", full: "rounded-full" }[rounded];
  return <div className={`animate-shimmer ${r} ${className}`} />;
};

export const SkeletonListItem = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}>
    <Skeleton className="w-11 h-11 shrink-0" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="space-y-2 flex flex-col items-end shrink-0">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-3xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}>
    <Skeleton className="h-32 w-full" rounded="sm" />
    <div className="p-4 space-y-2.5">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  </div>
);

export const SkeletonSettlementItem = () => (
  <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}>
    <Skeleton className="w-10 h-10 shrink-0" rounded="full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-3 w-32" />
    </div>
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <Skeleton className="h-5 w-16" rounded="full" />
    </div>
  </div>
);
