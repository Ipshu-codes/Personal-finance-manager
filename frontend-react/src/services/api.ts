
const API_BASE_URL = '/api';

// There is no login yet, so every record belongs to the seeded user.
export const CURRENT_USER_ID = 1;

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string | null;
  date: string;
  userId: number;
}

export interface Budget {
  id: number;
  category: string;
  amount: number;
  month: number;
  year: number;
  userId: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string | null;
  completed: boolean;
  userId: number;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  userId: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

type NewRecord<T> = Omit<T, 'id' | 'userId'>;

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data as T;
}

function jsonBody(body: unknown): RequestInit {
  return { body: JSON.stringify(body) };
}

// Postgres returns timestamps like "2026-10-29 21:13:32.08+05:45";
// the space is not valid ISO 8601 in every browser.
function toIsoDate(value: string): string;
function toIsoDate(value: string | null | undefined): string | null;
function toIsoDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value.replace(' ', 'T')).toISOString();
}

// Decimal columns come back as strings.
const normalizeTransaction = (t: Transaction): Transaction => ({
  ...t,
  amount: Number(t.amount),
  date: toIsoDate(t.date),
});

const normalizeBudget = (b: Budget): Budget => ({
  ...b,
  amount: Number(b.amount),
});

const normalizeGoal = (g: SavingsGoal): SavingsGoal => ({
  ...g,
  targetAmount: Number(g.targetAmount),
  savedAmount: Number(g.savedAmount),
  deadline: toIsoDate(g.deadline),
});

export const api = {
  users: {
    getAll: () =>
      request<{ users: User[] }>('/test-db').then((r) => r.users),
  },

  transactions: {
    getAll: () =>
      request<{ transactions: Transaction[] }>('/transactions')
        .then((r) => r.transactions.map(normalizeTransaction)),

    create: (data: NewRecord<Transaction>) =>
      request<{ transaction: Transaction }>('/transactions', {
        method: 'POST',
        ...jsonBody({ ...data, userId: CURRENT_USER_ID }),
      }),

    update: (id: number, data: Partial<NewRecord<Transaction>>) =>
      request<{ transaction: Transaction }>(`/transactions/${id}`, {
        method: 'PUT',
        ...jsonBody(data),
      }),

    delete: (id: number) =>
      request<{ message: string }>(`/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  budgets: {
    getAll: () =>
      request<{ budgets: Budget[] }>('/budgets')
        .then((r) => r.budgets.map(normalizeBudget)),

    create: (data: NewRecord<Budget>) =>
      request<{ budget: Budget }>('/budgets', {
        method: 'POST',
        ...jsonBody({ ...data, userId: CURRENT_USER_ID }),
      }),

    update: (id: number, data: Partial<NewRecord<Budget>>) =>
      request<{ budget: Budget }>(`/budgets/${id}`, {
        method: 'PUT',
        ...jsonBody(data),
      }),

    delete: (id: number) =>
      request<{ message: string }>(`/budgets/${id}`, {
        method: 'DELETE',
      }),
  },

  savingsGoals: {
    getAll: () =>
      request<{ goals: SavingsGoal[] }>('/savings-goals')
        .then((r) => r.goals.map(normalizeGoal)),

    create: (data: NewRecord<SavingsGoal>) =>
      request<{ goal: SavingsGoal }>('/savings-goals', {
        method: 'POST',
        ...jsonBody({ ...data, userId: CURRENT_USER_ID }),
      }),

    update: (id: number, data: Partial<NewRecord<SavingsGoal>>) =>
      request<{ goal: SavingsGoal }>(`/savings-goals/${id}`, {
        method: 'PUT',
        ...jsonBody(data),
      }),

    delete: (id: number) =>
      request<{ message: string }>(`/savings-goals/${id}`, {
        method: 'DELETE',
      }),
  },

  categories: {
    getAll: () =>
      request<{ categories: Category[] }>('/categories')
        .then((r) => r.categories),

    create: (data: NewRecord<Category>) =>
      request<{ category: Category }>('/categories', {
        method: 'POST',
        ...jsonBody({ ...data, userId: CURRENT_USER_ID }),
      }),

    update: (id: number, data: Partial<NewRecord<Category>>) =>
      request<{ category: Category }>(`/categories/${id}`, {
        method: 'PUT',
        ...jsonBody(data),
      }),

    delete: (id: number) =>
      request<{ message: string }>(`/categories/${id}`, {
        method: 'DELETE',
      }),
  },
};
