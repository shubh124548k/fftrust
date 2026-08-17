import { CatalogueSkeleton } from "@/components/visual/catalogue-skeleton";

export default function Loading() {
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <CatalogueSkeleton cards={4} />
      </div>
    </main>
  );
}
