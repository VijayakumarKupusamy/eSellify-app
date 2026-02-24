import React, { useState, useEffect, useRef } from 'react';
import { Report } from '../../../types';

const Spinner = () => (
  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ActionBanner: React.FC<{ type: 'success' | 'error'; message: string; onClose: () => void }> = ({ type, message, onClose }) => (
  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border ${
    type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
  }`}>
    {type === 'success'
      ? <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      : <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    }
    <span className="flex-1">{message}</span>
    <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1">✕</button>
  </div>
);

interface AdminReportsProps {
  reports: Report[];
  onResolve: (id: string, status: 'resolved' | 'dismissed') => Promise<{ success: boolean; error?: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  product: 'bg-amber-100 text-amber-700',
  seller:  'bg-red-100 text-red-700',
  user:    'bg-purple-100 text-purple-700',
  review:  'bg-gray-100 text-gray-600',
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  resolved:  'bg-emerald-100 text-emerald-700',
  dismissed: 'bg-gray-100 text-gray-500',
};

const AdminReports: React.FC<AdminReportsProps> = ({ reports, onResolve }) => {
  const [statusFilter, setSF] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [busy, setBusy]       = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ type, message });
    timerRef.current = setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const filtered = statusFilter === 'all' ? reports : reports.filter((r) => r.status === statusFilter);

  const counts = {
    pending:   reports.filter((r) => r.status === 'pending').length,
    resolved:  reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  };

  const handleAction = async (id: string, status: 'resolved' | 'dismissed', targetName: string) => {
    setBusy(id);
    const result = await onResolve(id, status);
    setBusy(null);
    result.success
      ? notify('success', `Report for "${targetName}" ${status}.`)
      : notify('error', result.error ?? `Failed to ${status} report.`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {notification && <ActionBanner type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

      {/* Summary Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'resolved', 'dismissed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSF(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && (
              <span className={`ml-1.5 text-[10px] rounded-full px-1.5 ${statusFilter === s ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div className="space-y-3">
        {filtered.map((report) => (
          <div key={report.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className={`mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase flex-shrink-0 ${TYPE_COLORS[report.type]}`}>
                  {report.type}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{report.targetName}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{report.reason}</p>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Reported by <strong className="text-gray-600">{report.reportedByName}</strong></span>
                    <span>·</span>
                    <span>{new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {report.resolvedAt && (
                      <>
                        <span>·</span>
                        <span>Resolved {new Date(report.resolvedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status]}`}>
                  {report.status}
                </span>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(report.id, 'resolved', report.targetName)}
                      disabled={busy === report.id}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition-colors disabled:opacity-50"
                    >
                      {busy === report.id ? <Spinner /> : null}
                      Resolve
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'dismissed', report.targetName)}
                      disabled={busy === report.id}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                    >
                      {busy === report.id ? <Spinner /> : null}
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card py-16 text-center">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-gray-400">No {statusFilter === 'all' ? '' : statusFilter} reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
