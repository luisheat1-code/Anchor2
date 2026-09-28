import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, GpaRow, Plan, SavedQuiz, StudyCard, WorkItem } from "./types";

type State = {
  plan: Plan;
  courses: Course[];
  items: WorkItem[];
  cards: StudyCard[];
  quizzes: SavedQuiz[];
  gpaRows: GpaRow[];
  priorCredits: number;
  priorGpa: number | null;
  trialStart: number | null;
  added: number;
  setPlan: (plan: Plan) => void;
  startTrial: () => void;
  subscribe: (plan: Exclude<Plan, "preview">) => void;
  addBundle: (course: Course, items: WorkItem[]) => void;
  mergeFeed: (groups: { code: string; title: string; items: { id: string; title: string; kind: WorkItem["kind"]; due: string }[] }[]) => void;
  toggleDone: (id: string) => void;
  updateItem: (id: string, patch: Partial<Pick<WorkItem, "title" | "due" | "done" | "score">>) => void;
  removeItem: (id: string) => void;
  addCard: (card: StudyCard) => void;
  updateCard: (id: string, patch: Partial<Pick<StudyCard, "question" | "answer" | "courseId">>) => void;
  removeCard: (id: string) => void;
  saveQuiz: (quiz: SavedQuiz) => void;
  removeQuiz: (id: string) => void;
  addGpaRow: (row: GpaRow) => void;
  addGpaRows: (rows: GpaRow[]) => void;
  updateGpaRow: (id: string, patch: Partial<Pick<GpaRow, "name" | "credits" | "grade">>) => void;
  removeGpaRow: (id: string) => void;
  setPrior: (credits: number, gpa: number | null) => void;
  setScore: (courseId: string, partId: string, score: number | null) => void;
  setMissed: (courseId: string, missed: number) => void;
  reset: () => void;
};

const initial = {
  plan: "preview" as Plan,
  courses: [] as Course[],
  items: [] as WorkItem[],
  cards: [] as StudyCard[],
  quizzes: [] as SavedQuiz[],
  gpaRows: [] as GpaRow[],
  priorCredits: 0,
  priorGpa: null as number | null,
  trialStart: null as number | null,
  added: 0,
};

export const useAnchor = create<State>()(
  persist(
    (set) => ({
      ...initial,
      setPlan: (plan) => set({ plan }),
      startTrial: () => set((state) => (state.trialStart ? state : { trialStart: Date.now() })),
      subscribe: (plan) => set({ plan }),
      addBundle: (course, items) =>
        set((state) => ({
          added: state.added + 1,
          courses: [course, ...state.courses.filter((row) => row.id !== course.id)],
          items: [...items, ...state.items.filter((row) => row.courseId !== course.id)],
        })),
      mergeFeed: (groups) =>
        set((state) => {
          let courses = state.courses;
          let items = state.items;
          for (const group of groups) {
            const code = group.code.trim().slice(0, 24) || "Canvas";
            const existing = courses.find((course) => course.code.toLowerCase() === code.toLowerCase());
            const id = existing?.id ?? `cv-${code.toLowerCase().replace(/[^a-z0-9]+/g, "") || "canvas"}`;
            if (!existing) {
              courses = [
                {
                  id,
                  code,
                  title: group.title.trim().slice(0, 120) || "From Canvas",
                  instructor: "",
                  officeHours: "",
                  attendance: "",
                  latePolicy: "",
                  absencePenalty: null,
                  meetings: [],
                  grading: [],
                  missed: 0,
                },
                ...courses,
              ];
            }
            const incoming = group.items.map((item) => {
              const prev = items.find((row) => row.id === item.id);
              return { ...item, courseId: id, done: prev?.done ?? false, score: prev?.score ?? null };
            });
            const ids = new Set(incoming.map((item) => item.id));
            items = [...incoming, ...items.filter((row) => row.courseId !== id || (!ids.has(row.id) && !row.id.startsWith("cv-")))];
          }
          return { courses, items, added: state.added + 1 };
        }),
      toggleDone: (id) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
        })),
      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      addCard: (card) => set((state) => ({ cards: [card, ...(state.cards ?? [])] })),
      updateCard: (id, patch) =>
        set((state) => ({
          cards: (state.cards ?? []).map((card) => (card.id === id ? { ...card, ...patch } : card)),
        })),
      removeCard: (id) => set((state) => ({ cards: (state.cards ?? []).filter((card) => card.id !== id) })),
      saveQuiz: (quiz) =>
        set((state) => ({
          quizzes: [quiz, ...(state.quizzes ?? []).filter((row) => row.id !== quiz.id)],
        })),
      removeQuiz: (id) => set((state) => ({ quizzes: (state.quizzes ?? []).filter((row) => row.id !== id) })),
      addGpaRow: (row) => set((state) => ({ gpaRows: [...(state.gpaRows ?? []), row] })),
      addGpaRows: (rows) => set((state) => ({ gpaRows: [...(state.gpaRows ?? []), ...rows] })),
      updateGpaRow: (id, patch) =>
        set((state) => ({
          gpaRows: (state.gpaRows ?? []).map((row) => (row.id === id ? { ...row, ...patch } : row)),
        })),
      removeGpaRow: (id) => set((state) => ({ gpaRows: (state.gpaRows ?? []).filter((row) => row.id !== id) })),
      setPrior: (credits, gpa) => set({ priorCredits: credits, priorGpa: gpa }),
      setScore: (courseId, partId, score) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id !== courseId
              ? course
              : {
                  ...course,
                  grading: course.grading.map((part) => (part.id === partId ? { ...part, score } : part)),
                },
          ),
        })),
      setMissed: (courseId, missed) =>
        set((state) => ({
          courses: state.courses.map((course) => (course.id === courseId ? { ...course, missed } : course)),
        })),
      reset: () => set((state) => ({ ...initial, trialStart: state.trialStart })),
    }),
    { name: "anchor-schedule-v2", skipHydration: true, merge: (persisted, current) => {
      const saved = (persisted ?? {}) as Partial<typeof initial>;
      return {
        ...current,
        ...saved,
        cards: saved.cards ?? [],
        quizzes: saved.quizzes ?? [],
        gpaRows: saved.gpaRows ?? [],
        priorCredits: saved.priorCredits ?? 0,
        priorGpa: saved.priorGpa ?? null,
        trialStart: saved.trialStart ?? null,
      };
    } },
  ),
);

export const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export function trialDaysLeft(start: number | null, now = Date.now()) {
  if (start == null) return 7;
  const left = start + TRIAL_MS - now;
  if (left <= 0) return 0;
  return Math.ceil(left / (24 * 60 * 60 * 1000));
}

export function hasAccess(plan: Plan, trialStart: number | null, now = Date.now()) {
  if (plan === "year" || plan === "degree") return true;
  if (trialStart == null) return true;
  return now < trialStart + TRIAL_MS;
}

export function canAdd(plan: Plan, trialStart: number | null) {
  return hasAccess(plan, trialStart);
}