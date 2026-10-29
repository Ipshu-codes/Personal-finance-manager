
import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Wallet, X } from 'lucide-react';
import { api, type Budget } from '../services/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import { MONTHS, formatCurrency, isSameMonth } from '../utils/format';

const loadBudgets = () =>
  Promise.all([
    api.budgets.getAll(),
    api.transactions.getAll(),
    api.categories.getAll(),
  ]).then(([budgets, transactions, categories]) => ({ budgets, transactions, categories }));

function Budgets() {
  const { data, loading, error, reload } = useApi(loadBudgets);

  const today = new Date();
  const [period, setPeriod] = useState({ month: today.getMonth() + 1, year: today.getFullYear() });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ category: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const shiftMonth = (delta: number) => {
    const date = new Date(period.year, period.month - 1 + delta, 1);
    setPeriod({ month: date.getMonth() + 1, year: date.getFullYear() });
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ category: '', amount: '' });
    setFormError(null);
  };

  const startEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setForm({ category: budget.category, amount: String(budget.amount) });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const amount = Number(form.amount);
    if (!form.category) {
      setFormError('Choose a category.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter an amount greater than zero.');
      return;
    }
    const duplicate = data?.budgets.some((b) =>
      b.id !== editingId &&
      b.category === form.category &&
      b.month === period.month &&
      b.year === period.year
    );
    if (duplicate) {
      setFormError(`There is already a ${form.category} budget for this month.`);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = { category: form.category, amount, ...period };
      if (editingId) {
        await api.budgets.update(editingId, payload);
      } else {
        await api.budgets.create(payload);
      }
      closeForm();
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budget: Budget) => {
    if (!window.confirm(`Delete the ${budget.category} budget?`)) return;

    try {
      await api.budgets.delete(budget.id);
      reload();
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const header = (
    <PageHeader eyebrow="SPENDING LIMITS" title="Budgets">
      {!showForm && data && (
        <button className="primary-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add budget
        </button>
      )}
    </PageHeader>
  );

  if (!data) {
    return (
      <>
        {header}
        <LoadState loading={loading} error={error} onRetry={reload} />
      </>
    );
  }

  const expenseCategories = data.categories.filter((c) => c.type === 'EXPENSE');
  const monthExpenses = data.transactions.filter(
    (t) => t.type === 'EXPENSE' && isSameMonth(t.date, period.month, period.year)
  );

  const budgets = data.budgets
    .filter((b) => b.month === period.month && b.year === period.year)
    .map((budget) => ({
      ...budget,
      spent: monthExpenses
        .filter((t) => t.category === budget.category)
        .reduce((total, t) => total + t.amount, 0),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const totalBudget = budgets.reduce((total, b) => total + b.amount, 0);
  const totalSpent = budgets.reduce((total, b) => total + b.spent, 0);

  return (
    <>
      {header}

      <section className="panel period-bar">
        <button className="icon-button small" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <strong>{MONTHS[period.month - 1]} {period.year}</strong>
        <button className="icon-button small" onClick={() => shiftMonth(1)} aria-label="Next month">
          <ChevronRight size={16} />
        </button>

        {budgets.length > 0 && (
          <span className="period-summary">
            {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)}
          </span>
        )}
      </section>

      {showForm && (
        <section className="panel form-panel">
          <div className="panel-heading">
            <h3>
              {editingId ? 'Edit budget' : 'New budget'} · {MONTHS[period.month - 1]} {period.year}
            </h3>
            <button className="icon-button small" onClick={closeForm} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="" disabled>Choose a category</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Monthly limit (Rs.)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </label>

            {formError && <p className="form-error full">{formError}</p>}

            <div className="form-actions full">
              <button type="button" className="secondary-button" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add budget'}
              </button>
            </div>
          </form>
        </section>
      )}

      {budgets.length === 0 ? (
        <section className="panel">
          <div className="empty-transactions">
            <Wallet size={28} />
            <p>No budgets for {MONTHS[period.month - 1]} {period.year}.</p>
            <span>Set a monthly limit for a spending category.</span>
          </div>
        </section>
      ) : (
        <section className="card-grid">
          {budgets.map((budget) => {
            const percent = (budget.spent / budget.amount) * 100;
            const over = budget.spent > budget.amount;
            const remaining = budget.amount - budget.spent;

            return (
              <article className="panel item-card" key={budget.id}>
                <div className="panel-heading">
                  <h3>{budget.category}</h3>
                  <div className="row-actions">
                    <button className="icon-button small" onClick={() => startEdit(budget)} aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-button small danger" onClick={() => handleDelete(budget)} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="item-amount">
                  {formatCurrency(budget.spent)}
                  <span> of {formatCurrency(budget.amount)}</span>
                </p>

                <div className="progress">
                  <div
                    className={over ? 'progress-fill over' : 'progress-fill'}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <p className={over ? 'item-note over' : 'item-note'}>
                  {over
                    ? `Over budget by ${formatCurrency(-remaining)}`
                    : `${formatCurrency(remaining)} left · ${Math.round(percent)}% used`}
                </p>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

export default Budgets;
