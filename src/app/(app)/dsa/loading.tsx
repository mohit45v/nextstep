import { Container, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container>
      <PageHeaderSkeleton />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-36 rounded-full" />
        ))}
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] rounded-card" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-input" />
          ))}
        </div>
      </div>
    </Container>
  );
}
