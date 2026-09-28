import { createFileRoute } from "@tanstack/react-router";
import { Practice } from "@/components/anchor/practice";
import { Shell } from "@/components/anchor/shell";

export const Route = createFileRoute("/practice")({
  component: () => (
    <Shell>
      <Practice />
    </Shell>
  ),
});
