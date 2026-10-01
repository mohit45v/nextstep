import { Container, ListSkeleton, PageHeaderSkeleton, StatRowSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Container>
      <PageHeaderSkeleton />
      <StatRowSkeleton count={4} />
      <ListSkeleton count={5} />
    </Container>
  );
}
