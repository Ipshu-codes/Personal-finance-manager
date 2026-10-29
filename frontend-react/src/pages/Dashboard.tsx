
import { Link } from 'react-router-dom';
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import SummaryCard from '../components/SummaryCard';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';
import { MONTHS, formatCurrency, formatDate, isSameMonth } from '../utils/format';

const loadDashboard = () =>
  Promise.all([
    api.transactions.getAll(),
    api.savingsGoals.getAll(),
    api.budgets.getAll(),
  ]).then(([transactions, goals, budgets]) => ({ transactions, goals, budgets }));

function Dashboard() {
  const { data, loading, error, reload } = useApi(loadDashboard);

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="OVERVIEW" title="Dashboard" />
        <LoadState loading={loading} error={error} onRetry={reload} />
      </>
    );
  }

  const { transactions, goals, budgets } = data;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const thisMonth = transactions.filter((t) => isSameMonth(t.date, month, year));
  const sumOf = (type: 'INCOME' | 'EXPENSE', list = thisMonth) =>
    list.filter((t) => t.type === type).reduce((total, t) => total + t.amount, 0);

  const income = sumOf('INCOME');
  const expenses = sumOf('EXPENSE');
  const balance = sumOf('INCOME', transactions) - sumOf('EXPENSE', transactions);
  const activeGoals = goals.filter((goal) => !goal.completed);
  const totalSaved = goals.reduce((total, goal) => total + goal.savedAmount, 0);

  // Income vs expenses for the last six months, oldest first.
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(year, now.getMonth() - 5 + i, 1);
    const inMonth = transactions.filter((t) =>
      isSameMonth(t.date, date.getMonth() + 1, date.getFullYear())
    );

    return {
      month: MONTHS[date.getMonth()].slice(0, 3),
      Income: sumOf('INCOME', inMonth),
      Expenses: sumOf('EXPENSE', inMonth),
    };
  });

  const monthBudgets = budgets
    .filter((b) => b.month === month && b.year === year)
    .map((budget) => {
      const spent = thisMonth
        .filter((t) => t.type === 'EXPENSE' && t.category === budget.category)
        .reduce((total, t) => total + t.amount, 0);

      return { ...budget, spent };
    });

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      <PageHeader eyebrow="OVERVIEW" title="Dashboard">
        <Link className="primary-button" to="/transactions?new=1">
          <Plus size={18} /> Add transaction
        </Link>
      </PageHeader>

      <section className="welcome">
        <div>
          <p className="eyebrow">YOUR FINANCES AT A GLANCE</p>
          <h2>Take control of your money.</h2>
          <p>Track your spending, build your savings, and stay on budget.</p>
        </div>
        <div className="welcome-icon">
          <Wallet size={36} />
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(balance)}
          description="All income minus all expenses"
          icon={<Wallet size={20} />}
          color="purple"
        />
        <SummaryCard
          title="Total Income"
          value={formatCurrency(income)}
          description={`Income in ${MONTHS[month - 1]}`}
          icon={<TrendingUp size={20} />}
          color="green"
          descriptionClass="positive"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(expenses)}
          description={`Expenses in ${MONTHS[month - 1]}`}
          icon={<TrendingDown size={20} />}
          color="orange"
        />
        <SummaryCard
          title="Savings Goals"
          value={`${activeGoals.length} ${activeGoals.length === 1 ? 'goal' : 'goals'}`}
          description={`${formatCurrency(totalSaved)} saved so far`}
          icon={<PiggyBank size={20} />}
          color="blue"
        />
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Financial overview</h3>
              <p>Income and expenses over the last six months</p>
            </div>
            <span className="period-label">6 months</span>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-chart">
              <TrendingUp size={35} />
              <p>Your financial overview will appear here.</p>
              <span>Add a transaction to see your trends.</span>
            </div>
          ) : (
            <div className="chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid vertical={false} stroke="#EEE5D0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={60} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    cursor={{ fill: '#F5EDD7' }}
                  />
                  <Bar dataKey="Income" fill="#556B2F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#C2410C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Quick insights</h3>
              <p>Your financial snapshot this month</p>
            </div>
            <ArrowUpRight size={20} />
          </div>

          <div className="insight-row">
            <div className="insight-icon green"><TrendingUp size={18} /></div>
            <div><strong>Income</strong><p>Money coming in</p></div>
            <span>{formatCurrency(income)}</span>
          </div>
          <div className="insight-row">
            <div className="insight-icon orange"><TrendingDown size={18} /></div>
            <div><strong>Expenses</strong><p>Money going out</p></div>
            <span>{formatCurrency(expenses)}</span>
          </div>
          <div className="insight-row">
            <div className="insight-icon purple"><PiggyBank size={18} /></div>
            <div><strong>Savings</strong><p>Goals in progress</p></div>
            <span>{activeGoals.length} {activeGoals.length === 1 ? 'goal' : 'goals'}</span>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent transactions</h3>
              <p>Your latest financial activity</p>
            </div>
            <Link className="text-button" to="/transactions">
              View all <ArrowUpRight size={16} />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="empty-transactions">
              <ArrowLeftRight size={28} />
              <p>No transactions to display yet.</p>
              <span>Your transactions will appear here once you add them.</span>
            </div>
          ) : (
            recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'INCOME';

              return (
                <div className="insight-row" key={transaction.id}>
                  <div className={`insight-icon ${isIncome ? 'green' : 'orange'}`}>
                    {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <strong>{transaction.description || transaction.category}</strong>
                    <p>{transaction.category} · {formatDate(transaction.date)}</p>
                  </div>
                  <span className={isIncome ? 'amount-income' : 'amount-expense'}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              );
            })
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h3>Budgets</h3>
              <p>Spending against this month's limits</p>
            </div>
            <Link className="text-button" to="/budgets">
              Manage <ArrowUpRight size={16} />
            </Link>
          </div>

          {monthBudgets.length === 0 ? (
            <div className="empty-transactions">
              <Wallet size={28} />
              <p>No budgets for {MONTHS[month - 1]}.</p>
              <span>Set a budget to keep your spending in check.</span>
            </div>
          ) : (
            monthBudgets.map((budget) => (
              <div className="budget-mini" key={budget.id}>
                <div className="budget-mini-heading">
                  <strong>{budget.category}</strong>
                  <span>{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                </div>
                <div className="progress">
                  <div
                    className={budget.spent > budget.amount ? 'progress-fill over' : 'progress-fill'}
                    style={{ width: `${Math.min(100, (budget.spent / budget.amount) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </article>
      </section>
    </>
  );
}

export default Dashboard;
