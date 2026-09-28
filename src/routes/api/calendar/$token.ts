import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/calendar/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token;
        if (!/^[a-f0-9]{32}$/.test(token)) return new Response("Not found", { status: 404 });
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql<{ body: string }>`select body from calendar_feed where token = ${token}`;
        const body = rows[0]?.body;
        if (!body) return new Response("Not found", { status: 404 });
        return new Response(body, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": "inline; filename=anchor.ics",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
