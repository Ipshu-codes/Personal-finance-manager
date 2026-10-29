
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, type Transaction, type TransactionType } from '../services/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import { formatCurrency, formatDate, fromDateInput, toDateInput } from '../utils/format';

interface FormState {
  amount: string;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

const emptyForm = (): FormState => ({
  amount: '',
  type: 'EXPENSE',
  category: '',
  description: '',
  date: toDateInput(),
});

const loadTransactions = () =>
  Promise.all([api.transactions.getAll(), api.categories.getAll()])
    .then(([transactions, categories]) => ({ transactions, categories }));

function Transactions() {
  const { data, loading, error, reload } = useApi(loadTransactions);
  const [searchParams, setSearchParams] = useSearchParams();

  const [showForm, setShowForm] = useState(searchParams.get('new') === '1');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [search, setSearch] = useState('');

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    if (searchParams.has('new')) setSearchParams({});
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description ?? '',
      date: toDateInput(transaction.date),
    });
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter an amount greater than zero.');
      return;
    }
    if (!form.category) {
      setFormError('Choose a category.');
      return;
    }

    const payload = {
      amount,
      type: form.type,
      category: form.category,
      description: form.description.trim() || null,
      date: fromDateInput(form.date),
    };

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await api.transactions.update(editingId, payload);
      } else {
        await api.transactions.create(payload);
      }
      closeForm();
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    const label = transaction.description || transaction.category;
    if (!window.confirm(`Delete "${label}"?`)) return;

    try {
      await api.transactions.delete(transaction.id);
      reload();
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const header = (
    <PageHeader eyebrow="MONEY IN & OUT" title="Transactions">
      {!showForm && (
        <button className="primary-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add transaction
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

  const categoryOptions = data.categories.filter((c) => c.type === form.type);
  const query = search.trim().toLowerCase();

  const visible = data.transactions
    .filter((t) => typeFilter === 'ALL' || t.type === typeFilter)
    .filter((t) =>
      !query ||
      t.category.toLowerCase().includes(query) ||
      (t.description ?? '').toLowerCase().includes(query)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      {header}

      {showForm && (
        <section className="panel form-panel">
          <div className="panel-heading">
            <h3>{editingId ? 'Edit transaction' : 'New transaction'}</h3>
            <button className="icon-button small" onClick={closeForm} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field full">
              <span>Type</span>
              <div className="segmented">
                {(['EXPENSE', 'INCOME'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={form.type === type ? 'active' : ''}
                    onClick={() => setForm({ ...form, type, category: '' })}
                  >
                    {type === 'EXPENSE' ? 'Expense' : 'Income'}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span>Amount (Rs.)</span>
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

            <label className="field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="" disabled>Choose a category</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                {/* Keep an old category selectable when editing. */}
                {form.category && !categoryOptions.some((c) => c.name === form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </label>

            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>

            <label className="field">
              <span>Description (optional)</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Groceries at Bhatbhateni"
              />
            </label>

            {formError && <p className="form-error full">{formError}</p>}

            <div className="form-actions full">
              <button type="button" className="secondary-button" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add transaction'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="toolbar">
          <div className="segmented">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
              <button
                key={type}
                className={typeFilter === type ? 'active' : ''}
                onClick={() => setTypeFilter(type)}
              >
                {type === 'ALL' ? 'All' : type === 'INCOME' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Search category or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {visible.length === 0 ? (
          <div className="empty-transactions">
            <ArrowLeftRight size={28} />
            <p>
              {data.transactions.length === 0
                ? 'No transactions yet.'
                : 'No transactions match your filters.'}
            </p>
            <span>Use “Add transaction” to record income or spending.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="align-right">Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.description || <span className="muted-text">—</span>}</td>
                    <td>
                      <span className={`badge ${t.type === 'INCOME' ? 'green' : 'orange'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className={`align-right ${t.type === 'INCOME' ? 'amount-income' : 'amount-expense'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="row-actions">
                      <button className="icon-button small" onClick={() => startEdit(t)} aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="icon-button small danger" onClick={() => handleDelete(t)} aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default Transactions;
