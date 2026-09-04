import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { Interaction } from '../types';

interface NotificationDispatchModalProps {
  interaction: Interaction;
  onClose: () => void;
}

export const NotificationDispatchModal: React.FC<NotificationDispatchModalProps> = ({
  interaction,
  onClose,
}) => {
  const [targetService, setTargetService] = useState<'slack' | 'discord' | 'webhook'>('slack');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDispatch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: interaction.title,
          summary: interaction.summary || interaction.messages[0]?.text.slice(0, 120),
          actionItems: interaction.actionItems || [],
          themes: interaction.themes || [],
          targetService,
          customWebhookUrl: webhookUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Dispatch failed (${res.status})`);
      }

      const responseData = await res.json();
      setResult(responseData);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch notification.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPayload = () => {
    if (!result?.payloadPreview) return;
    navigator.clipboard.writeText(JSON.stringify(result.payloadPreview, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Dispatch External Notification</h3>
              <p className="text-[11px] text-stone-500">Send reflection summary & action items to your channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Sanitation Info */}
        <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center space-x-2 text-[11px] text-stone-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>HMAC Signed & Sanitized:</strong> Only synthesized summaries & action items are dispatched. Private dialogue text is never transmitted.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Channel selector */}
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1.5">
              Destination Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slack', name: 'Slack BlockKit' },
                { id: 'discord', name: 'Discord Embed' },
                { id: 'webhook', name: 'Generic Webhook' },
              ].map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setTargetService(svc.id as any)}
                  className={`cursor-pointer py-2 px-3 text-xs font-medium rounded-xl border text-center transition ${
                    targetService === svc.id
                      ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {svc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Webhook input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-stone-600">
                Webhook URL
              </label>
              <button
                type="button"
                onClick={() => setWebhookUrl('https://httpbin.org/post')}
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium cursor-pointer"
              >
                Use Test Endpoint (httpbin.org)
              </button>
            </div>
            <input
              type="url"
              placeholder="https://hooks.slack.com/... or https://discord.com/api/webhooks/... or https://httpbin.org/post"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Enter your Slack/Discord webhook, or click "Use Test Endpoint" to test delivery right now.
            </p>
          </div>

          {/* Summary Preview */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
              Outgoing Payload Summary
            </span>
            <div className="text-xs font-medium text-stone-900">{interaction.title}</div>
            <p className="text-xs text-stone-600 line-clamp-2">
              {interaction.summary || 'Summary generated by Gemini'}
            </p>
            {interaction.actionItems && interaction.actionItems.length > 0 && (
              <div className="text-[11px] text-emerald-700 pt-1">
                {interaction.actionItems.length} action items attached
              </div>
            )}
          </div>

          {/* Result or Error Status */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Payload Formatted & Dispatched</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <div className="text-[11px] space-y-0.5 text-emerald-700">
                <div>Status: <span className="font-mono">{result.externalStatus}</span></div>
                <div>Signature: <span className="font-mono">{result.signature}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-1.5 text-xs rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            disabled={loading}
            className="cursor-pointer inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Dispatching...' : 'Dispatch Notification'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
