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

app.post('/api/transactions', async (req, res) => {
  try {
    const {
      amount,
      type,
      category,
      description,
      date,
      userId
    } = req.body;

    const transaction = await db.orm.public.Transaction
      .create({
        amount,
        type,
        category,
        description,
        date,
        userId
      });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create transaction'
    });
  }
});
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.orm.public.Transaction
      .where({})
      .all();

    res.json({
      message: 'Transactions fetched successfully',
      transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch transactions'
    });
  }
});
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      amount,
      type,
      category,
      description,
      date,
      userId
    } = req.body;

    const transaction = await db.orm.public.Transaction
      .where({ id: Number(id) })
      .update({
        amount,
        type,
        category,
        description,
        date,
        userId
      });

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update transaction'
    });
  }
  
});
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.orm.public.Transaction
      .where({ id: Number(id) })
      .delete();

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete transaction'
    });
  }
});
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.orm.public.Category
      .where({})
      .all();

    res.json({
      message: 'Categories fetched successfully',
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch categories'
    });
  }
});
app.post('/api/categories', async (req, res) => {
  try {
    const {
      name,
      type,
      userId
    } = req.body;

    const category = await db.orm.public.Category
      .create({
        name,
        type,
        userId
      });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create category'
    });
  }
});
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      type,
      userId
    } = req.body;

    const category = await db.orm.public.Category
      .where({ id: Number(id) })
      .update({
        name,
        type,
        userId
      });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update category'
    });
  }
});
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.orm.public.Category
      .where({ id: Number(id) })
      .delete();

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete category'
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});