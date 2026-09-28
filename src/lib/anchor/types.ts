export type Plan = "preview" | "year" | "degree";

export type Kind = "assignment" | "exam" | "quiz" | "reading";

export type Meeting = {
  id: string;
  days: number[];
  start: string;
  end: string;
  place: string;
};

export type GradePart = {
  id: string;
  name: string;
  weight: number;
  score: number | null;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  officeHours: string;
  attendance: string;
  latePolicy: string;
  absencePenalty: number | null;
  meetings: Meeting[];
  grading: GradePart[];
  missed: number;
};

export type WorkItem = {
  id: string;
  courseId: string;
  title: string;
  kind: Kind;
  due: string;
  done: boolean;
  score?: number | null;
};

export type GpaRow = {
  id: string;
  name: string;
  credits: number;
  grade: string;
};

export type StudyCard = {
  id: string;
  courseId: string;
  question: string;
  answer: string;
};

export type SavedQuiz = {
  id: string;
  name: string;
  questions: { id: string; question: string; answer: string }[];
};

export type Draft = {
  course: Omit<Course, "missed">;
  items: Omit<WorkItem, "done">[];
  source: "grok" | "parser";
};
