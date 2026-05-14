"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import type { ExamPayload, ExamQuestion } from "@/lib/exam-contract";
import { mockSubjectStats } from "@/lib/mock-data";

type AuthMode = "login" | "register";

type RankingsResponse = {
  todayRank: Array<{ userName: string; subject: string; score: number; totalScore: number }>;
  totalRank: Array<{ userName: string; totalScore: number }>;
};

type ExamRecord = {
  date: string;
  subject: string;
  score: number;
  total: number;
};

const ANNOUNCE_POINTS = [3600, 1800, 900];

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const h = String(Math.floor(safe / 3600)).padStart(2, "0");
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function scoreQuestion(question: ExamQuestion, value: string) {
  const answer = value.trim();
  if (!answer) return 0;

  if (question.type === "choice") {
    return answer.toUpperCase() === question.correctAnswer.toUpperCase() ? question.score : 0;
  }

  if (question.type === "blank") {
    return normalizeText(answer) === normalizeText(question.correctAnswer) ? question.score : 0;
  }

  const keywords = question.correctAnswer
    .split(/\s+/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
  const hit = keywords.some((word) => answer.toLowerCase().includes(word));
  if (answer.length > 24 && hit) return question.score;
  if (answer.length > 12) return Math.round(question.score * 0.4);
  return 0;
}

function currentMonthDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: lastDate }, (_, i) => i + 1);
}

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [message, setMessage] = useState("请先登录，进入考试模拟。");

  const [exam, setExam] = useState<ExamPayload | null>(null);
  const [examSpec, setExamSpec] = useState<Record<string, unknown> | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [rankings, setRankings] = useState<RankingsResponse>({ todayRank: [], totalRank: [] });
  const [records, setRecords] = useState<ExamRecord[]>([]);

  const [teacherNearby, setTeacherNearby] = useState(false);
  const [blurVision, setBlurVision] = useState(false);
  const [nervous, setNervous] = useState(false);

  const announcedRef = useRef(new Set<number>());

  const totalScore = useMemo(() => exam?.questions.reduce((sum, q) => sum + q.score, 0) ?? 0, [exam]);
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim().length > 0).length,
    [answers],
  );

  const progress = useMemo(() => {
    if (!exam) return 0;
    return 1 - remainingSeconds / (exam.durationMinutes * 60);
  }, [exam, remainingSeconds]);

  const submitExam = useCallback(async () => {
    if (!exam || !activeUser || submitted) return;

    const raw = exam.questions.reduce((sum, question) => sum + scoreQuestion(question, answers[question.id] ?? ""), 0);
    setScore(raw);
    setSubmitted(true);

    const date = new Date().toISOString().slice(0, 10);
    const nextRecord = { date, subject: exam.subject, score: raw, total: totalScore };
    const nextRecords = [nextRecord, ...records].slice(0, 30);
    setRecords(nextRecords);
    localStorage.setItem(`records:${activeUser}`, JSON.stringify(nextRecords));

    await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: activeUser, subject: exam.subject, score: raw, totalScore: raw + 620 }),
    });

    const rankResp = await fetch("/api/rankings");
    if (rankResp.ok) {
      const rankData = (await rankResp.json()) as RankingsResponse;
      setRankings(rankData);
    }
  }, [activeUser, answers, exam, records, submitted, totalScore]);

  useEffect(() => {
    if (!activeUser) return;

    Promise.all([fetch("/api/exams/active"), fetch("/api/exams/schema"), fetch("/api/rankings")]).then(
      async ([examResp, schemaResp, rankResp]) => {
        if (examResp.ok) {
          const examData = (await examResp.json()) as ExamPayload;
          setExam(examData);
          setRemainingSeconds(examData.durationMinutes * 60);
          setAnswers({});
          setSubmitted(false);
          announcedRef.current.clear();
        }

        if (schemaResp.ok) {
          setExamSpec((await schemaResp.json()) as Record<string, unknown>);
        }

        if (rankResp.ok) {
          setRankings((await rankResp.json()) as RankingsResponse);
        }
      },
    );
  }, [activeUser]);

  useEffect(() => {
    if (!exam || submitted || !activeUser) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          void submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeUser, exam, submitExam, submitted]);

  useEffect(() => {
    if (!exam || submitted) return;
    if (!("speechSynthesis" in window)) return;

    for (const point of ANNOUNCE_POINTS) {
      if (remainingSeconds === point && !announcedRef.current.has(point)) {
        announcedRef.current.add(point);
        const minute = point / 60;
        const text = `距离考试结束还有${minute >= 60 ? `${minute / 60}小时` : `${minute}分钟`}，请合理安排答题时间。`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        utterance.rate = 0.98;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [exam, remainingSeconds, submitted]);

  useEffect(() => {
    if (!exam || submitted) return;

    const randomEvent = window.setInterval(() => {
      setTeacherNearby(false);
      setBlurVision(false);
      setNervous(false);

      const roll = Math.random();
      if (roll < 0.34) {
        setTeacherNearby(true);
      } else if (roll < 0.67) {
        setBlurVision(true);
      } else {
        setNervous(true);
      }

      window.setTimeout(() => {
        setTeacherNearby(false);
        setBlurVision(false);
        setNervous(false);
      }, 8000);
    }, 18000);

    return () => window.clearInterval(randomEvent);
  }, [exam, submitted]);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    const data = (await response.json()) as { message?: string; userName?: string };
    if (!response.ok || !data.userName) {
      setMessage(data.message ?? "请求失败，请重试");
      return;
    }

    const saved = localStorage.getItem(`records:${data.userName}`);
    if (saved) {
      try {
        setRecords(JSON.parse(saved) as ExamRecord[]);
      } catch {
        setRecords([]);
      }
    } else {
      setRecords([]);
    }

    setActiveUser(data.userName);
    setMessage(`欢迎 ${data.userName}，考试已就绪。`);
  }

  if (!activeUser) {
    return (
      <div className={styles.page}>
        <div className={styles.authCard}>
          <h1>Exam Emulator 考试模拟器</h1>
          <p>沉浸式还原学校考试场景，开始前请{authMode === "login" ? "登录" : "注册"}。</p>
          <form onSubmit={handleAuthSubmit} className={styles.authForm}>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="用户名"
              required
              minLength={2}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码（至少6位）"
              required
              minLength={6}
            />
            <button type="submit">{authMode === "login" ? "登录" : "注册"}</button>
          </form>
          <button className={styles.switchBtn} onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
            切换为{authMode === "login" ? "注册" : "登录"}
          </button>
          <p className={styles.message}>{message}</p>
          {examSpec ? (
            <details className={styles.schemaCard}>
              <summary>考试数据 JSON 规范（服务端对接）</summary>
              <pre>{JSON.stringify(examSpec, null, 2)}</pre>
            </details>
          ) : null}
        </div>
      </div>
    );
  }

  if (!exam) {
    return <div className={styles.loading}>正在加载考试数据...</div>;
  }

  const shakeLevel = Math.min(6, Math.floor(progress * 6) + (nervous ? 4 : 0));

  return (
    <div
      className={`${styles.page} ${teacherNearby ? styles.teacherNearby : ""} ${blurVision ? styles.blurVision : ""}`}
      style={{ ["--shake-level" as string]: `${shakeLevel}px` }}
    >
      <header className={styles.header}>
        <div>
          <h2>{exam.subject} 模拟考试</h2>
          <p>{new Date(exam.examTime).toLocaleString("zh-CN", { hour12: false })}</p>
        </div>
        <div className={styles.timerWrap}>
          <span>倒计时</span>
          <strong>{formatTime(remainingSeconds)}</strong>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.paper}>
          <h3>试卷区</h3>
          {exam.questions.map((question, index) => (
            <article key={question.id} className={styles.question} id={`question-${question.id}`}>
              <h4>
                {index + 1}. {question.title}（{question.score}分）
              </h4>
              <p>{question.content}</p>

              {question.type === "choice" && question.options ? (
                <div className={styles.options}>
                  {question.options.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={answers[question.id] === option.key ? styles.optionActive : ""}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.key }))}
                    >
                      {option.key}. {option.text}
                    </button>
                  ))}
                </div>
              ) : null}

              {question.type === "blank" ? (
                <input
                  className={styles.blankInput}
                  value={answers[question.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                  placeholder="点击填空并输入答案"
                />
              ) : null}

              {question.type === "solution" ? (
                <textarea
                  className={styles.solutionInput}
                  value={answers[question.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                  placeholder="点击作答，输入解题过程"
                />
              ) : null}
            </article>
          ))}

          <button type="button" className={styles.submitBtn} onClick={() => void submitExam()} disabled={submitted}>
            {submitted ? "已交卷" : "提交试卷"}
          </button>
        </section>

        <aside className={`${styles.answerSheet} ${nervous ? styles.heavyShake : ""}`}>
          <h3>答题卡</h3>
          <p>
            已作答 {answeredCount}/{exam.questions.length}
          </p>
          {exam.questions.map((question, index) => (
            <div key={question.id} className={styles.sheetRow}>
              <span>{index + 1}</span>
              {question.type === "choice" && question.options ? (
                <div className={styles.bubbles}>
                  {question.options.map((option) => (
                    <button
                      key={`${question.id}-${option.key}`}
                      type="button"
                      className={`${styles.bubble} ${answers[question.id] === option.key ? styles.bubbleFilled : ""}`}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [question.id]: option.key }));
                        document.getElementById(`question-${question.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    >
                      {option.key}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  className={`${styles.textSlot} ${answers[question.id] ? styles.textSlotDone : ""}`}
                  onClick={() => document.getElementById(`question-${question.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                >
                  {question.type === "blank" ? "填" : "答"}
                </button>
              )}
            </div>
          ))}
          <div className={styles.sweatLayer} aria-hidden="true" />
        </aside>
      </main>

      {submitted ? (
        <section className={styles.dashboard}>
          <h3>考试记录与成绩统计</h3>
          <p>
            本次得分：<strong>{score}</strong> / {totalScore}
          </p>

          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <h4>打卡日历</h4>
              <div className={styles.calendar}>
                {currentMonthDays().map((day) => {
                  const today = new Date().toISOString().slice(0, 10);
                  const keyDate = `${today.slice(0, 8)}${String(day).padStart(2, "0")}`;
                  const hit = records.some((record) => record.date === keyDate);
                  return (
                    <span key={day} className={hit ? styles.calendarHit : ""}>
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className={styles.card}>
              <h4>科目统计图</h4>
              <div className={styles.chart}>
                {mockSubjectStats.map((item) => (
                  <div key={item.subject} className={styles.barRow}>
                    <span>{item.subject}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${Math.min(100, item.score)}%` }} />
                    </div>
                    <strong>{item.score}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.card}>
              <h4>全服当日各学科成绩榜</h4>
              <ol>
                {rankings.todayRank.map((item) => (
                  <li key={`${item.userName}-${item.subject}-${item.score}`}>
                    {item.userName} · {item.subject} · {item.score}
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.card}>
              <h4>累计总分榜</h4>
              <ol>
                {rankings.totalRank.map((item) => (
                  <li key={`${item.userName}-${item.totalScore}`}>
                    {item.userName} · {item.totalScore}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className={styles.certificateList}>
            {rankings.totalRank.slice(0, 3).map((item, index) => (
              <article key={`${item.userName}-certificate`} className={styles.certificate}>
                <p>优秀学习奖状</p>
                <h4>
                  第{index + 1}名：{item.userName}
                </h4>
                <span>累计总分 {item.totalScore}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
