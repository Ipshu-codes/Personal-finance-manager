import express from 'express';
import { db } from './prisma/db.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env['PORT']) || 5000;

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'];

function isValidTransaction(t: {
  amount: unknown;
  type: unknown;
  category: unknown;
  date?: unknown;
  userId: unknown;
}) {
  return (
    Number.isFinite(Number(t.amount)) &&
    Number(t.amount) > 0 &&
    TRANSACTION_TYPES.includes(t.type as string) &&
    typeof t.category === 'string' &&
    t.category.trim() !== '' &&
    (t.date == null || !Number.isNaN(Date.parse(t.date as string))) &&
    Number.isInteger(Number(t.userId)) &&
    Number(t.userId) > 0
  );
}

function isValidCategory(c: { name: unknown; type: unknown; userId: unknown }) {
  return (
    typeof c.name === 'string' &&
    c.name.trim() !== '' &&
    TRANSACTION_TYPES.includes(c.type as string) &&
    Number.isInteger(Number(c.userId)) &&
    Number(c.userId) > 0
  );
}

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

    if (!isValidTransaction({ amount, type, category, date, userId })) {
      return res.status(400).json({
        message: 'Please provide valid transaction details'
      });
    }

    const transaction = await db.orm.public.Transaction
      .create({
        amount: String(Number(amount)),
        type,
        category: category.trim(),
        description: description || null,
        date: date || new Date().toISOString(),
        userId: Number(userId)
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
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid transaction ID'
      });
    }

    const existingTransactions = await db.orm.public.Transaction
      .where({ id })
      .all();

    if (existingTransactions.length === 0) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    const existing = existingTransactions[0];
    const next = {
      amount: req.body.amount ?? existing.amount,
      type: req.body.type ?? existing.type,
      category: req.body.category ?? existing.category,
      description: req.body.description === undefined
        ? existing.description
        : req.body.description || null,
      date: req.body.date ?? existing.date,
      userId: req.body.userId ?? existing.userId
    };

    if (!isValidTransaction(next)) {
      return res.status(400).json({
        message: 'Please provide valid transaction details'
      });
    }

    const transaction = await db.orm.public.Transaction
      .where({ id })
      .update({
        ...next,
        amount: String(Number(next.amount)),
        category: next.category.trim(),
        userId: Number(next.userId)
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

    if (!isValidCategory({ name, type, userId })) {
      return res.status(400).json({
        message: 'Please provide valid category details'
      });
    }

    const category = await db.orm.public.Category
      .create({
        name: name.trim(),
        type,
        userId: Number(userId)
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
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid category ID'
      });
    }

    const existingCategories = await db.orm.public.Category
      .where({ id })
      .all();

    if (existingCategories.length === 0) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    const existing = existingCategories[0];
    const next = {
      name: req.body.name ?? existing.name,
      type: req.body.type ?? existing.type,
      userId: req.body.userId ?? existing.userId
    };

    if (!isValidCategory(next)) {
      return res.status(400).json({
        message: 'Please provide valid category details'
      });
    }

    const category = await db.orm.public.Category
      .where({ id })
      .update({
        name: next.name.trim(),
        type: next.type,
        userId: Number(next.userId)
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

app.post('/api/savings-goals', async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      savedAmount = 0,
      deadline,
      completed = false,
      userId
    } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      !Number.isFinite(Number(targetAmount)) ||
      Number(targetAmount) <= 0 ||
      !Number.isFinite(Number(savedAmount)) ||
      Number(savedAmount) < 0 ||
      Number(savedAmount) > Number(targetAmount) ||
      typeof completed !== 'boolean' ||
      !Number.isInteger(Number(userId)) ||
      Number(userId) <= 0
    ) {
      return res.status(400).json({
        message: 'Please provide valid savings goal details'
      });
    }

    const now = new Date().toISOString();

    const goal = await db.orm.public.SavingsGoal.create({
      name: name.trim(),
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount),
      deadline: deadline || null,
      completed,
      createdAt: now,
      updatedAt: now,
      userId: Number(userId)
    });

    res.status(201).json({
      message: 'Savings goal created successfully',
      goal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create savings goal'
    });
  }
});

app.get('/api/savings-goals', async (req, res) => {
  try {
    const goals = await db.orm.public.SavingsGoal
      .where({})
      .all();

    res.json({
      message: 'Savings goals fetched successfully',
      goals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch savings goals'
    });
  }
});

app.put('/api/savings-goals/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid savings goal ID'
      });
    }

    const existingGoals = await db.orm.public.SavingsGoal
      .where({ id })
      .all();

    if (existingGoals.length === 0) {
      return res.status(404).json({
        message: 'Savings goal not found'
      });
    }

    const existing = existingGoals[0];
    const {
      name,
      targetAmount,
      savedAmount,
      deadline,
      completed
    } = req.body;

    const nextName = name ?? existing.name;
    const nextTarget = Number(targetAmount ?? existing.targetAmount);
    const nextSaved = Number(savedAmount ?? existing.savedAmount);
    const nextCompleted = completed ?? existing.completed;

    if (
      typeof nextName !== 'string' ||
      !nextName.trim() ||
      !Number.isFinite(nextTarget) ||
      nextTarget <= 0 ||
      !Number.isFinite(nextSaved) ||
      nextSaved < 0 ||
      nextSaved > nextTarget ||
      typeof nextCompleted !== 'boolean'
    ) {
      return res.status(400).json({
        message: 'Please provide valid savings goal details'
      });
    }

    const goal = await db.orm.public.SavingsGoal
      .where({ id })
      .update({
        name: nextName.trim(),
        targetAmount: nextTarget,
        savedAmount: nextSaved,
        deadline: deadline === undefined
          ? existing.deadline
          : deadline || null,
        completed: nextCompleted,
        updatedAt: new Date().toISOString()
      });

    res.json({
      message: 'Savings goal updated successfully',
      goal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update savings goal'
    });
  }
});
   
app.delete('/api/savings-goals/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid savings goal ID'
      });
    }

    const existing = await db.orm.public.SavingsGoal
      .where({ id })
      .all();

    if (existing.length === 0) {
      return res.status(404).json({
        message: 'Savings goal not found'
      });
    }

    await db.orm.public.SavingsGoal
      .where({ id })
      .delete();

    res.json({
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting savings goal:', error);

    res.status(500).json({
      message: 'Failed to delete savings goal'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
