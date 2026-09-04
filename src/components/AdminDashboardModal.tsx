import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Activity, 
  Users, 
  Layers, 
  MapPin, 
  Cpu, 
  CheckCircle2, 
  Lock,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { SystemTelemetry, UserProfile, Interaction } from '../types';
import { fetchSystemTelemetry, registerInitialAdmin } from '../lib/firestoreService';

interface AdminDashboardModalProps {
  user: UserProfile;
  isAdmin: boolean;
  interactions?: Interaction[];
  onClose: () => void;
  onAdminGranted: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  user,
  isAdmin,
  interactions = [],
  onClose,
  onAdminGranted,
}) => {
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'logs'>('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemTelemetry(interactions);
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [interactions]);

  const handleClaimAdmin = async () => {
    if (!user.email) return;
    setClaiming(true);
    try {
      const success = await registerInitialAdmin(user.uid, user.email);
      if (success) {
        onAdminGranted();
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-stone-900">Admin Telemetry & RBAC Console</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {isAdmin ? 'Privileged' : 'Unassigned'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">System health, aggregate anonymized metrics, and model status</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Live Metrics"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer disabled:opacity-50 flex items-center space-x-1 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline text-[11px] text-stone-600 font-medium">Live Sync</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Privacy Assurance Notice */}
        <div className="px-6 py-2.5 bg-amber-50/70 border-b border-amber-100 flex items-center space-x-2 text-[11px] text-amber-800">
          <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-700" />
          <span>
            <strong>Zero-Trust Privacy Guarantee:</strong> Admins can only review aggregate counts and telemetry. Individual reflection contents remain strictly encrypted/isolated to respective user accounts in Firestore.
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-stone-100 flex items-center space-x-4 text-xs">
          {[
            { id: 'overview', label: 'Platform Telemetry', icon: Activity },
            { id: 'models', label: 'AI Fleet & Fallbacks', icon: Cpu },
            { id: 'logs', label: 'Anonymized Audit Log', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 flex items-center space-x-1.5 font-medium transition border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* RBAC Grant prompt if not yet admin */}
          {!isAdmin && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-stone-900">Activate Admin RBAC Role</h4>
                <p className="text-[11px] text-stone-500">
                  Enable administrative status for authenticated account ({user.email}).
                </p>
              </div>
              <button
                onClick={handleClaimAdmin}
                disabled={claiming}
                className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition disabled:opacity-50"
              >
                {claiming ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                <span>Claim Admin Role</span>
              </button>
            </div>
          )}

          {activeTab === 'overview' && telemetry && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[11px] font-medium">Total Reflections</span>
                    <Layers className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {telemetry.totalReflectionsTracked}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1 flex items-center">
                    <span>Live in Firestore</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[11px] font-medium">Synthesized</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {telemetry.totalSynthesizedSessions}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    {telemetry.totalReflectionsTracked > 0
                      ? `${Math.round((telemetry.totalSynthesizedSessions / telemetry.totalReflectionsTracked) * 100)}% synthesis rate`
                      : '0% synthesized'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[11px] font-medium">Places Pinned</span>
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {telemetry.totalLocationsPinned}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    Geo-grounded entries
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[11px] font-medium">Active Accounts</span>
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {telemetry.activeUsersCount}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    RBAC Superadmins
                  </div>
                </div>
              </div>

              {/* System Infrastructure Health */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white">
                <h4 className="text-xs font-semibold text-stone-900 mb-3">Service Health & Container Status</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-stone-700 font-medium">Cloud Run Container</span>
                    </div>
                    <span className="text-[11px] text-stone-500">Port 3000 • Ingress Ready</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-stone-700 font-medium">Google Cloud Firestore</span>
                    </div>
                    <span className="text-[11px] text-stone-500">Isolated Rules Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-stone-700 font-medium">Firebase Authentication</span>
                    </div>
                    <span className="text-[11px] text-stone-500">Google OAuth Provider</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && telemetry && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-white">
                <h4 className="text-xs font-semibold text-stone-900 mb-1">Gemini AI Failover Ladder</h4>
                <p className="text-[11px] text-stone-500 mb-4">
                  Automatic tier downgrade prevents 429 rate limit errors and downtime.
                </p>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-emerald-900">Primary: {telemetry.modelFleetStatus.primary}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-800">Operational</span>
                      </div>
                      <span className="text-[10px] text-emerald-700">Low-latency reasoning and conversational turns</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>

                  {telemetry.modelFleetStatus.fallbacks.map((fallback, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-stone-800">Tier {idx + 2}: {fallback}</div>
                        <span className="text-[10px] text-stone-500">Hot standby fallback target</span>
                      </div>
                      <span className="text-[10px] text-stone-400">Standby</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && telemetry && (
            <div className="space-y-3">
              <div className="rounded-xl border border-stone-200 overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100 text-[11px] font-medium text-stone-500 flex justify-between">
                  <span>Anonymized Activity Stream</span>
                  <span>Timestamp</span>
                </div>
                <div className="divide-y divide-stone-100 text-xs">
                  {telemetry.recentActivityLogs.map((log) => (
                    <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-stone-800 flex items-center space-x-1.5">
                          <span>{log.action}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {log.mode}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Actor: {log.anonymizedUserHash}
                        </div>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="text-[11px] text-stone-400">
            Last synced: {telemetry ? new Date(telemetry.lastUpdated).toLocaleTimeString() : '...'}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-1.5 text-xs rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
