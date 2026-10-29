
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface LoadStateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Shows a loading or error panel; renders nothing once data is ready.
function LoadState({ loading, error, onRetry }: LoadStateProps) {
  if (error) {
    return (
      <section className="panel state-panel">
        <AlertTriangle size={30} />
        <p>Unable to load your data</p>
        <span>{error}</span>
        <button className="secondary-button" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </button>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="panel state-panel">
        <p>Loading your finances...</p>
      </section>
    );
  }

  return null;
}

export default LoadState;
