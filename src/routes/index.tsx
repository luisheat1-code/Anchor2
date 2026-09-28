import { createFileRoute } from "@tanstack/react-router";
import { Schedule } from "@/components/anchor/schedule";
import { Shell } from "@/components/anchor/shell";

export const Route = createFileRoute("/")({
  component: () => (
    <Shell>
      <Schedule />
    </Shell>
  ),
});
