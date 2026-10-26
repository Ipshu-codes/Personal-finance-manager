
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  Settings,
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react'
import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">MeroKosh</h2>

        <p className="menu-label">MENU</p>
        <nav>
          <a className="nav-link active" href="#">
            <LayoutDashboard size={19} /> Dashboard
          </a>
          <a className="nav-link" href="#">
            <ArrowLeftRight size={19} /> Transactions
          </a>
          <a className="nav-link" href="#">
            <Wallet size={19} /> Budgets
          </a>
          <a className="nav-link" href="#">
            <PiggyBank size={19} /> Savings Goals
          </a>
          <a className="nav-link" href="#">
            <Tags size={19} /> Categories
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-link" href="#">
            <Settings size={19} /> Settings
          </a>
          <div className="profile">
            <div className="avatar">I</div>
            <div>
              <strong>My Account</strong>
              <p>Mero Kosh</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <button className="primary-button">
              <Plus size={18} /> Add transaction
            </button>
          </div>
        </header>

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
          <article className="summary-card">
            <div className="card-heading">
              <span>Total Balance</span>
              <div className="card-icon purple"><Wallet size={20} /></div>
            </div>
            <h2>Rs. 0.00</h2>
            <p className="muted">Your current balance</p>
          </article>

          <article className="summary-card">
            <div className="card-heading">
              <span>Total Income</span>
              <div className="card-icon green"><TrendingUp size={20} /></div>
            </div>
            <h2>Rs. 0.00</h2>
            <p className="positive">Income this month</p>
          </article>

          <article className="summary-card">
            <div className="card-heading">
              <span>Total Expenses</span>
              <div className="card-icon orange"><TrendingDown size={20} /></div>
            </div>
            <h2>Rs. 0.00</h2>
            <p className="muted">Expenses this month</p>
          </article>

          <article className="summary-card">
            <div className="card-heading">
              <span>Savings Goals</span>
              <div className="card-icon blue"><PiggyBank size={20} /></div>
            </div>
            <h2>0 goals</h2>
            <p className="muted">Keep building your future</p>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <h3>Financial overview</h3>
                <p>Understand your money at a glance</p>
              </div>
              <span className="period-label">This month</span>
            </div>
            <div className="empty-chart">
              <TrendingUp size={35} />
              <p>Your financial overview will appear here.</p>
              <span>Connect your transactions to see your trends.</span>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <h3>Quick insights</h3>
                <p>Your financial snapshot</p>
              </div>
              <ArrowUpRight size={20} />
            </div>
            <div className="insight-row">
              <div className="insight-icon green"><TrendingUp size={18} /></div>
              <div><strong>Income</strong><p>Money coming in</p></div>
              <span>Rs. 0</span>
            </div>
            <div className="insight-row">
              <div className="insight-icon orange"><TrendingDown size={18} /></div>
              <div><strong>Expenses</strong><p>Money going out</p></div>
              <span>Rs. 0</span>
            </div>
            <div className="insight-row">
              <div className="insight-icon purple"><PiggyBank size={18} /></div>
              <div><strong>Savings</strong><p>Goals in progress</p></div>
              <span>0 goals</span>
            </div>
          </article>
        </section>

        <section className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent transactions</h3>
              <p>Your latest financial activity</p>
            </div>
            <button className="text-button">View all <ArrowUpRight size={16} /></button>
          </div>
          <div className="empty-transactions">
            <ArrowLeftRight size={28} />
            <p>No transactions to display yet.</p>
            <span>Your transactions will appear here once connected to your API.</span>
          </div>
        </section>

        <footer>Made for better financial habits. <span>MeroKosh</span></footer>
      </main>
    </div>
  )
}

export default App
