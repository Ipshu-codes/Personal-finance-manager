
import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  color: string;
  descriptionClass?: string;
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  color,
  descriptionClass = 'muted',
}: SummaryCardProps) {
  return (
    <article className="summary-card">
      <div className="card-heading">
        <span>{title}</span>
        <div className={`card-icon ${color}`}>{icon}</div>
      </div>

      <h2>{value}</h2>
      <p className={descriptionClass}>{description}</p>
    </article>
  );
}

export default SummaryCard;
