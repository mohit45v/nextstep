import { CardGridSkeleton, Container, ListSkeleton, Skeleton, StatRowSkeleton } from "@/components/ui";

/** Streams the shell while the dashboard's four queries run. */
export default function Loading() {
  return (
    <Container className="max-w-5xl">
      <div className="border-b border-line pb-7">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-80" />
      </div>
      <StatRowSkeleton />
      <CardGridSkeleton count={4} />
      <ListSkeleton count={3} />
    </Container>
  );
}
