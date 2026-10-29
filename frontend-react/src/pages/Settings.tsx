
import { CheckCircle2, Database } from 'lucide-react';
import { api, CURRENT_USER_ID } from '../services/api';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/PageHeader';
import LoadState from '../components/LoadState';

function Settings() {
  const { data: users, loading, error, reload } = useApi(api.users.getAll);
  const user = users?.find((u) => u.id === CURRENT_USER_ID);

  return (
    <>
      <PageHeader eyebrow="PREFERENCES" title="Settings" />

      {!users ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : (
        <section className="content-grid even">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <h3>Account</h3>
                <p>The profile your records are saved under</p>
              </div>
            </div>
            <div className="insight-row">
              <div className="avatar">{user?.name.charAt(0) ?? '?'}</div>
              <div>
                <strong>{user?.name ?? 'No user found'}</strong>
                <p>{user?.email ?? `User #${CURRENT_USER_ID} does not exist in the database.`}</p>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <h3>Connection</h3>
                <p>Backend API and database status</p>
              </div>
              <div className="insight-icon green"><Database size={18} /></div>
            </div>
            <div className="insight-row">
              <div className="insight-icon green"><CheckCircle2 size={18} /></div>
              <div>
                <strong>Connected</strong>
                <p>The API at /api is reachable and the database responded.</p>
              </div>
            </div>
          </article>
        </section>
      )}
    </>
  );
}

export default Settings;
