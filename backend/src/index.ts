import express from 'express';
import cors from 'cors';
import pdfRouter from './routes/pdf';
import authRouter from './routes/auth';
import resumesRouter from './routes/resumes';
import emailRouter from './routes/email';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', pdfRouter);
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/email', emailRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
