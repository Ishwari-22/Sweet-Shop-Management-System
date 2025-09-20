import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import sweetsRouter from './routes/sweets';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/sweets', sweetsRouter);

export default app;


