
import { useState, type FormEvent } from 'react';
import { CheckCircle2, Pencil, PiggyBank, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { api, type SavingsGoal } from '../services/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import { formatCurrency, formatDate, fromDateInput, toDateInput } from '../utils/format';

const emptyForm = { name: '', targetAmount: '', savedAmount: '0', deadline: '' };

function SavingsGoals() {
  const { data: goals, loading, error, reload } = useApi(api.savingsGoals.getAll);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<Record<number, string>>({});

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const startEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
      deadline: goal.deadline ? toDateInput(goal.deadline) : '',
    });
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const targetAmount = Number(form.targetAmount);
    const savedAmount = Number(form.savedAmount || 0);

    if (!form.name.trim()) {
      setFormError('Give your goal a name.');
      return;
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setFormError('Enter a target greater than zero.');
      return;
    }
    if (!Number.isFinite(savedAmount) || savedAmount < 0 || savedAmount > targetAmount) {
      setFormError('Saved amount must be between zero and the target.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      targetAmount,
      savedAmount,
      deadline: form.deadline ? fromDateInput(form.deadline) : null,
      completed: savedAmount >= targetAmount,
    };

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await api.savingsGoals.update(editingId, payload);
      } else {
        await api.savingsGoals.create(payload);
      }
      closeForm();
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      reload();
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const addMoney = (goal: SavingsGoal) => {
    const amount = Number(deposits[goal.id]);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const savedAmount = Math.min(goal.targetAmount, goal.savedAmount + amount);
    setDeposits({ ...deposits, [goal.id]: '' });
    runAction(() =>
      api.savingsGoals.update(goal.id, {
        savedAmount,
        completed: savedAmount >= goal.targetAmount,
      })
    );
  };

  const toggleCompleted = (goal: SavingsGoal) =>
    runAction(() => api.savingsGoals.update(goal.id, { completed: !goal.completed }));

  const handleDelete = (goal: SavingsGoal) => {
    if (window.confirm(`Delete the goal "${goal.name}"?`)) {
      runAction(() => api.savingsGoals.delete(goal.id));
    }
  };

  const header = (
    <PageHeader eyebrow="BUILD YOUR FUTURE" title="Savings Goals">
      {!showForm && (
        <button className="primary-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add goal
        </button>
      )}
    </PageHeader>
  );

  if (!goals) {
    return (
      <>
        {header}
        <LoadState loading={loading} error={error} onRetry={reload} />
      </>
    );
  }

  const sorted = [...goals].sort(
    (a, b) => Number(a.completed) - Number(b.completed) || a.id - b.id
  );

  return (
    <>
      {header}

      {showForm && (
        <section className="panel form-panel">
          <div className="panel-heading">
            <h3>{editingId ? 'Edit goal' : 'New savings goal'}</h3>
            <button className="icon-button small" onClick={closeForm} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Goal name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. New laptop"
                required
              />
            </label>

            <label className="field">
              <span>Target amount (Rs.)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                required
              />
            </label>

            <label className="field">
              <span>Already saved (Rs.)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.savedAmount}
                onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Deadline (optional)</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </label>

            {formError && <p className="form-error full">{formError}</p>}

            <div className="form-actions full">
              <button type="button" className="secondary-button" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add goal'}
              </button>
            </div>
          </form>
        </section>
      )}

      {sorted.length === 0 ? (
        <section className="panel">
          <div className="empty-transactions">
            <PiggyBank size={28} />
            <p>No savings goals yet.</p>
            <span>Create a goal and track your progress toward it.</span>
          </div>
        </section>
      ) : (
        <section className="card-grid">
          {sorted.map((goal) => {
            const percent = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);

            return (
              <article className={goal.completed ? 'panel item-card done' : 'panel item-card'} key={goal.id}>
                <div className="panel-heading">
                  <div>
                    <h3>{goal.name}</h3>
                    <p>
                      {goal.completed
                        ? 'Completed'
                        : goal.deadline
                          ? `Due ${formatDate(goal.deadline)}`
                          : 'No deadline'}
                    </p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-button small"
                      onClick={() => toggleCompleted(goal)}
                      aria-label={goal.completed ? 'Mark as in progress' : 'Mark as completed'}
                      title={goal.completed ? 'Mark as in progress' : 'Mark as completed'}
                    >
                      {goal.completed ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                    </button>
                    <button className="icon-button small" onClick={() => startEdit(goal)} aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-button small danger" onClick={() => handleDelete(goal)} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="item-amount">
                  {formatCurrency(goal.savedAmount)}
                  <span> of {formatCurrency(goal.targetAmount)}</span>
                </p>

                <div className="progress">
                  <div className="progress-fill saving" style={{ width: `${percent}%` }} />
                </div>
                <p className="item-note">{Math.round(percent)}% saved</p>

                {!goal.completed && (
                  <form
                    className="deposit-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addMoney(goal);
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Add amount"
                      value={deposits[goal.id] ?? ''}
                      onChange={(e) => setDeposits({ ...deposits, [goal.id]: e.target.value })}
                    />
                    <button type="submit" className="secondary-button">
                      <Plus size={14} /> Add
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}

export default SavingsGoals;
