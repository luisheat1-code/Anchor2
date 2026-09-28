import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/grades")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
