
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>

      {children && <div className="topbar-actions">{children}</div>}
    </header>
  );
}

export default PageHeader;
