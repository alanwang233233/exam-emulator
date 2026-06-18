import { rankingSeed } from "@/lib/mock-data";

type AuthUser = {
  userName: string;
  password: string;
};

type ScoreRecord = {
  userName: string;
  subject: string;
  score: number;
  totalScore: number;
  date: string;
};

type MockStore = {
  users: AuthUser[];
  scores: ScoreRecord[];
};

const globalStore = globalThis as typeof globalThis & { __examMockStore?: MockStore };

if (!globalStore.__examMockStore) {
  globalStore.__examMockStore = {
    users: [{ userName: "demo", password: "123456" }],
    scores: [...rankingSeed],
  };
}

export const mockStore = globalStore.__examMockStore;

export type { AuthUser, ScoreRecord };
