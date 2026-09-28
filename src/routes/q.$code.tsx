import { createFileRoute } from "@tanstack/react-router";
import { SharedQuiz } from "@/components/anchor/shared-quiz";
import { Shell } from "@/components/anchor/shell";

export const Route = createFileRoute("/q/$code")({
  component: QuizLink,
});

function QuizLink() {
  const { code } = Route.useParams();
  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
        <p className="text-xs font-medium tracking-widest text-copper uppercase">Class quiz</p>
        <h1 className="mt-2 font-display text-4xl">Join the quiz.</h1>
        <SharedQuiz initialCode={code} />
      </main>
    </Shell>
  );
}
