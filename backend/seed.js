import 'dotenv/config';
import { db } from './src/prisma/db.ts';

const defaultCategories = [
  { name: 'Food', type: 'EXPENSE' },
  { name: 'Transport', type: 'EXPENSE' },
  { name: 'Entertainment', type: 'EXPENSE' },
  { name: 'Health', type: 'EXPENSE' },
  { name: 'Shopping', type: 'EXPENSE' },
  { name: 'Utilities', type: 'EXPENSE' },
  { name: 'Other', type: 'EXPENSE' },
  { name: 'Salary', type: 'INCOME' },
  { name: 'Freelance', type: 'INCOME' },
  { name: 'Business', type: 'INCOME' },
  { name: 'Other', type: 'INCOME' }
];

async function seed() {
  try {
    for (const category of defaultCategories) {
      await db.orm.public.Category.create({
        ...category,
        userId: 1
      });
    }

    console.log('Default categories seeded successfully');
  } catch (error) {
    console.error('Failed to seed categories:', error);
  }
}

seed();