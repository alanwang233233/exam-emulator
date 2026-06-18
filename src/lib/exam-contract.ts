export type QuestionType = "choice" | "blank" | "solution";

export type ChoiceOption = {
  key: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  score: number;
  options?: ChoiceOption[];
  correctAnswer: string;
};

export type ExamPayload = {
  examId: string;
  subject: string;
  examTime: string;
  durationMinutes: number;
  questions: ExamQuestion[];
};

export const examDataJsonSpec = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "ExamPayload",
  type: "object",
  required: ["examId", "subject", "examTime", "durationMinutes", "questions"],
  properties: {
    examId: { type: "string", description: "考试唯一ID" },
    subject: { type: "string", description: "考试学科" },
    examTime: { type: "string", format: "date-time", description: "考试时间" },
    durationMinutes: { type: "integer", minimum: 1, description: "考试总时长（分钟）" },
    questions: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "type", "title", "content", "score", "correctAnswer"],
        properties: {
          id: { type: "string" },
          type: { enum: ["choice", "blank", "solution"] },
          title: { type: "string" },
          content: { type: "string" },
          score: { type: "number", minimum: 0 },
          options: {
            type: "array",
            items: {
              type: "object",
              required: ["key", "text"],
              properties: {
                key: { type: "string" },
                text: { type: "string" },
              },
            },
          },
          correctAnswer: { type: "string" },
        },
      },
    },
  },
} as const;
