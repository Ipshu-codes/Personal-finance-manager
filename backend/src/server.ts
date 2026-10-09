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

app.post('/api/budgets', async (req, res) => {
  try {
    const { category, amount, month, year, userId } = req.body;

    if (
      !category ||
      amount == null ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !Number.isInteger(Number(month)) ||
      Number(month) < 1 ||
      Number(month) > 12 ||
      !Number.isInteger(Number(year)) ||
      !Number.isInteger(Number(userId))
    ) {
      return res.status(400).json({
        message: 'Please provide valid budget details'
      });
    }

    const budget = await db.orm.public.Budget.create({
      category,
      amount,
      month: Number(month),
      year: Number(year),
      userId: Number(userId)
    });

    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create budget'
    });
  }
});

app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await db.orm.public.Budget
      .where({})
      .all();

    res.json({
      message: 'Budgets fetched successfully',
      budgets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch budgets'
    });
  }
});

app.put('/api/budgets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid budget ID'
      });
    }

    const { category, amount, month, year, userId } = req.body;

    const existing = await db.orm.public.Budget
      .where({ id })
      .all();

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    const budget = await db.orm.public.Budget
      .where({ id })
      .update({
        category: category ?? existing[0].category,
        amount: amount ?? existing[0].amount,
        month: month == null
          ? existing[0].month
          : Number(month),
        year: year == null
          ? existing[0].year
          : Number(year),
        userId: userId == null
          ? existing[0].userId
          : Number(userId)
      });

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update budget'
    });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid budget ID'
      });
    }

    const existing = await db.orm.public.Budget
      .where({ id })
      .all();

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    await db.orm.public.Budget
      .where({ id })
      .delete();

    res.json({
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete budget'
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});