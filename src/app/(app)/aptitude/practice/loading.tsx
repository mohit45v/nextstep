import { Container, PageHeaderSkeleton, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container>
      <PageHeaderSkeleton />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-32 rounded-full" />
        ))}
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[19rem_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] rounded-card" />
          ))}
        </div>
        <Skeleton className="h-[30rem] rounded-card" />
      </div>
    </Container>
  );
}
