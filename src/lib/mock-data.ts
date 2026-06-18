import { ExamPayload } from "@/lib/exam-contract";

export const mockExam: ExamPayload = {
  examId: "gaokao-physics-2026-05",
  subject: "物理",
  examTime: "2026-06-07T09:00:00+08:00",
  durationMinutes: 120,
  questions: [
    {
      id: "q1",
      type: "choice",
      title: "一、选择题（每题5分）",
      content: "在匀速圆周运动中，以下说法正确的是：",
      score: 5,
      options: [
        { key: "A", text: "速度大小和方向都不变" },
        { key: "B", text: "加速度方向始终指向圆心" },
        { key: "C", text: "加速度大小一定为0" },
        { key: "D", text: "受力一定平衡" },
      ],
      correctAnswer: "B",
    },
    {
      id: "q2",
      type: "choice",
      title: "一、选择题（每题5分）",
      content: "理想变压器中，若原线圈匝数增加，则副线圈电压变化是：",
      score: 5,
      options: [
        { key: "A", text: "增大" },
        { key: "B", text: "减小" },
        { key: "C", text: "不变" },
        { key: "D", text: "先增大后减小" },
      ],
      correctAnswer: "B",
    },
    {
      id: "q3",
      type: "blank",
      title: "二、填空题（每题8分）",
      content: "一辆汽车由静止开始做匀加速直线运动，4s内速度达到20m/s，则加速度大小为___m/s²。",
      score: 8,
      correctAnswer: "5",
    },
    {
      id: "q4",
      type: "blank",
      title: "二、填空题（每题8分）",
      content: "电阻R两端电压为12V，通过电流为2A，则电阻R为___Ω。",
      score: 8,
      correctAnswer: "6",
    },
    {
      id: "q5",
      type: "solution",
      title: "三、解答题（14分）",
      content: "某同学将质量为0.5kg的小球竖直上抛，初速度20m/s。忽略空气阻力，求上升最大高度并说明能量变化过程。",
      score: 14,
      correctAnswer: "h=20m 动能转化为重力势能",
    },
    {
      id: "q6",
      type: "solution",
      title: "三、解答题（20分）",
      content: "设计一个实验，测量未知电阻并分析误差来源。写出关键步骤与数据处理方法。",
      score: 20,
      correctAnswer: "伏安法",
    },
  ],
};

export const mockSubjectStats = [
  { subject: "语文", score: 118 },
  { subject: "数学", score: 131 },
  { subject: "英语", score: 126 },
  { subject: "物理", score: 92 },
  { subject: "化学", score: 87 },
];

export const rankingSeed = [
  { userName: "李楷", subject: "物理", score: 56, totalScore: 728, date: "2026-05-14" },
  { userName: "周岚", subject: "物理", score: 54, totalScore: 706, date: "2026-05-14" },
  { userName: "陈越", subject: "物理", score: 53, totalScore: 698, date: "2026-05-14" },
  { userName: "赵宁", subject: "数学", score: 146, totalScore: 692, date: "2026-05-14" },
  { userName: "王冉", subject: "英语", score: 138, totalScore: 675, date: "2026-05-14" },
];
