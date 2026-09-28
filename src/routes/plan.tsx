import { createFileRoute } from "@tanstack/react-router";
import { Plans } from "@/components/anchor/plans";
import { Shell } from "@/components/anchor/shell";

export const Route = createFileRoute("/plan")({
  validateSearch: (search: Record<string, unknown>): { checkout: string } => ({
    checkout: typeof search.checkout === "string" && /^cs_[A-Za-z0-9_]+$/.test(search.checkout) ? search.checkout : "",
  }),
  component: PlanPage,
});

function PlanPage() {
  const { checkout } = Route.useSearch();
  return (
    <Shell>
      <Plans checkout={checkout} />
    </Shell>
  );
}
