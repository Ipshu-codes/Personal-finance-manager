
import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, Pencil, Plus, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import { api, type Category, type TransactionType } from '../services/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';

function Categories() {
  const { data: categories, loading, error, reload } = useApi(api.categories.getAll);

  const [newNames, setNewNames] = useState<Record<TransactionType, string>>({ INCOME: '', EXPENSE: '' });
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
      reload();
      return true;
    } catch (err) {
      setActionError((err as Error).message);
      return false;
    }
  };

  const nameTaken = (name: string, type: TransactionType, exceptId?: number) =>
    categories?.some((c) =>
      c.id !== exceptId && c.type === type && c.name.toLowerCase() === name.toLowerCase()
    );

  const handleAdd = async (event: FormEvent, type: TransactionType) => {
    event.preventDefault();
    const name = newNames[type].trim();
    if (!name) return;
    if (nameTaken(name, type)) {
      setActionError(`"${name}" already exists.`);
      return;
    }

    if (await run(() => api.categories.create({ name, type }))) {
      setNewNames({ ...newNames, [type]: '' });
    }
  };

  const handleRename = async (event: FormEvent, category: Category) => {
    event.preventDefault();
    const name = editing?.name.trim();
    if (!name || name === category.name) {
      setEditing(null);
      return;
    }
    if (nameTaken(name, category.type, category.id)) {
      setActionError(`"${name}" already exists.`);
      return;
    }

    if (await run(() => api.categories.update(category.id, { name }))) {
      setEditing(null);
    }
  };

  const handleDelete = (category: Category) => {
    const message =
      `Delete the "${category.name}" category?\n` +
      'Existing transactions keep their category name.';
    if (window.confirm(message)) {
      run(() => api.categories.delete(category.id));
    }
  };

  const header = <PageHeader eyebrow="ORGANIZE" title="Categories" />;

  if (!categories) {
    return (
      <>
        {header}
        <LoadState loading={loading} error={error} onRetry={reload} />
      </>
    );
  }

  const columns: { type: TransactionType; title: string; icon: ReactNode; color: string }[] = [
    { type: 'EXPENSE', title: 'Expense categories', icon: <TrendingDown size={18} />, color: 'orange' },
    { type: 'INCOME', title: 'Income categories', icon: <TrendingUp size={18} />, color: 'green' },
  ];

  return (
    <>
      {header}

      {actionError && <p className="form-error banner">{actionError}</p>}

      <section className="content-grid even">
        {columns.map(({ type, title, icon, color }) => {
          const list = categories
            .filter((c) => c.type === type)
            .sort((a, b) => a.name.localeCompare(b.name));

          return (
            <article className="panel" key={type}>
              <div className="panel-heading">
                <div>
                  <h3>{title}</h3>
                  <p>{list.length} {list.length === 1 ? 'category' : 'categories'}</p>
                </div>
                <div className={`insight-icon ${color}`}>{icon}</div>
              </div>

              <form className="deposit-row" onSubmit={(e) => handleAdd(e, type)}>
                <input
                  type="text"
                  placeholder="New category name"
                  value={newNames[type]}
                  onChange={(e) => setNewNames({ ...newNames, [type]: e.target.value })}
                />
                <button type="submit" className="secondary-button">
                  <Plus size={14} /> Add
                </button>
              </form>

              <ul className="category-list">
                {list.map((category) => (
                  <li key={category.id}>
                    {editing?.id === category.id ? (
                      <form className="category-edit" onSubmit={(e) => handleRename(e, category)}>
                        <input
                          autoFocus
                          value={editing.name}
                          onChange={(e) => setEditing({ id: category.id, name: e.target.value })}
                        />
                        <button type="submit" className="icon-button small" aria-label="Save">
                          <Check size={14} />
                        </button>
                        <button type="button" className="icon-button small" onClick={() => setEditing(null)} aria-label="Cancel">
                          <X size={14} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className={`badge ${color}`}>{category.name}</span>
                        <div className="row-actions">
                          <button
                            className="icon-button small"
                            onClick={() => setEditing({ id: category.id, name: category.name })}
                            aria-label="Rename"
                          >
                            <Pencil size={14} />
                          </button>
                          <button className="icon-button small danger" onClick={() => handleDelete(category)} aria-label="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default Categories;
