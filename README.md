# exam-emulator

基于 Next.js + TypeScript 的考试模拟器（Mock 版本）。

## 功能

- 注册/登录鉴权（Mock API）
- 拉取考试数据并展示考试数据 JSON 规范（`/api/exams/schema`）
- 题型支持：选择题、填空题、解答题
- 试卷 + 答题卡双栏考试界面，支持点击作答与填涂动画
- 倒计时、紧张氛围动画（屏幕颤抖、汗水、监考老师/犯困/紧张随机状态）
- Web Speech API 时间播报（剩余 1 小时 / 30 分钟 / 15 分钟）
- 成绩上报（Mock API）与打卡日历、统计图、当日榜/总分榜、前三奖状

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## Mock API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/exams/active`
- `GET /api/exams/schema`
- `POST /api/results`
- `GET /api/rankings`
