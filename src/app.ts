import express from 'express';
import helmet from 'helmet';
import validationRouter from './routes/validation';

const app = express();

// ── 보안 헤더 ──────────────────────────────────────────
app.use(helmet());

// ── Body Parser ────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── 원스토어 웹샵 라우트 ───────────────────────────────
// 원스토어에서 호출: POST /gameuser/check
app.use('/gameuser', validationRouter);

// ── 헬스체크 ───────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── 404 ────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
