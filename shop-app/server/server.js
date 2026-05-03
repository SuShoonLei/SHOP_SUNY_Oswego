import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import itemsRouter from './routes/items.js';
import studentsRouter from './routes/students.js';
import transactionsRouter from './routes/transactions.js';
import requestsRouter from './routes/requests.js';
import donationsRouter from './routes/donations.js';
import donorsRouter from './routes/donors.js';
import reportsRouter from './routes/reports.js';
import volunteersRouter, {
  volunteerShiftsRouter,
} from './routes/volunteers.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'SHOP API' });
});

app.use('/api/items', itemsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/donors', donorsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/volunteer-shifts', volunteerShiftsRouter);

export default app;
