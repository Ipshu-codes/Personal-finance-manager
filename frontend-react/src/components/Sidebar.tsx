
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Tags,
  Settings,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/savings', label: 'Savings Goals', icon: PiggyBank },
  { to: '/categories', label: 'Categories', icon: Tags },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="brand">MeroKosh</h2>

      <p className="menu-label">MENU</p>

      <nav>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={navClass}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink className={navClass} to="/settings">
          <Settings size={19} /> Settings
        </NavLink>

        <div className="profile">
          <div className="avatar">I</div>
          <div>
            <strong>My Account</strong>
            <p>Mero Kosh</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
