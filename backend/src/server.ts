import express from 'express';
import { db } from './prisma/db.js';

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Personal Finance Manager API is running' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const users = await db.orm.public.User
      .where({})
      .all();

    res.json({
      message: 'Database connection successful',
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Database connection failed'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});