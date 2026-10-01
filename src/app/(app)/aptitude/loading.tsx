import { CardGridSkeleton, Container, PageHeaderSkeleton, StatRowSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container>
      <PageHeaderSkeleton />
      <StatRowSkeleton />
      <CardGridSkeleton />
    </Container>
  );
}
