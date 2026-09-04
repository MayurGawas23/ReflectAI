import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  ListTodo,
  MapPin,
  Bell
} from 'lucide-react';
import { Interaction, Message, ReflectionMode, JournalLocation } from '../types';
import { LocationPickerModal } from './LocationPickerModal';
import { NotificationDispatchModal } from './NotificationDispatchModal';

interface InteractionWorkspaceProps {
  interaction: Interaction | null;
  onSendMessage: (text: string, mode: ReflectionMode) => Promise<void>;
  onSummarizeCurrent: () => Promise<void>;
  onUpdateLocation: (location: JournalLocation | null) => Promise<void>;
  loadingAI: boolean;
  error: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onRetrySave: () => void;
}

export const InteractionWorkspace: React.FC<InteractionWorkspaceProps> = ({
  interaction,
  onSendMessage,
  onSummarizeCurrent,
  onUpdateLocation,
  loadingAI,
  error,
  saveStatus,
  onRetrySave,
}) => {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<ReflectionMode>('general');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interaction?.messages, loadingAI]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loadingAI) return;

    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header bar for current reflection */}
      <div className="h-16 border-b border-stone-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-stone-900 truncate">
                {interaction ? interaction.title : 'New Reflection & Dialogue'}
              </h2>
              {/* Location Badge if attached */}
              {interaction?.location && (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="cursor-pointer inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 hover:bg-emerald-100 transition"
                  title={`Location: ${interaction.location.placeName}`}
                >
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{interaction.location.placeName}</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-stone-500">
              {saveStatus === 'saving' && (
                <span className="flex items-center text-stone-400">
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" /> Saving to Firestore...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Cloud Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center text-rose-600">
                  <AlertCircle className="w-3 h-3 mr-1" /> Save failed
                  <button 
                    onClick={onRetrySave} 
                    className="ml-2 underline hover:text-rose-700 cursor-pointer"
                  >
                    Retry
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Attach Location & Synthesize */}
        <div className="flex items-center space-x-2">
          <button
            id="pin-location-btn"
            type="button"
            onClick={() => setShowLocationModal(true)}
            className={`cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              interaction?.location
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
            title="Attach or edit Google Maps reflection pin"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">
              {interaction?.location ? 'Location Pinned' : 'Pin Location'}
            </span>
          </button>

          {interaction && (interaction.summary || interaction.messages.length > 0) && (
            <button
              id="notify-dispatch-btn"
              type="button"
              onClick={() => setShowNotifyModal(true)}
              className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-medium text-stone-700 hover:bg-stone-100 transition"
              title="Dispatch synthesis or action items to Slack, Discord, or Webhook"
            >
              <Bell className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Dispatch</span>
            </button>
          )}

          {interaction && interaction.messages.length > 0 && (
            <button
              id="summarize-btn"
              onClick={onSummarizeCurrent}
              disabled={loadingAI}
              className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-medium text-stone-700 hover:bg-stone-100 transition disabled:opacity-50"
              title="Generate AI structured synthesis and action tags"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Synthesize Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary / Themes Header Card if present */}
      {interaction?.summary && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-800 mb-1">
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>Session Synthesis</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {interaction.summary}
              </p>
            </div>
          </div>

          {/* Tags & Action items */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
            {interaction.themes?.map((t, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium">
                <Tag className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
            {interaction.location && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100">
                <MapPin className="w-2.5 h-2.5" />
                {interaction.location.placeName}
              </span>
            )}
            {interaction.actionItems && interaction.actionItems.length > 0 && (
              <div className="w-full mt-2 space-y-1">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">Action Items & Prompts</span>
                {interaction.actionItems.map((item, i) => (
                  <div key={i} className="text-xs text-stone-700 flex items-start gap-1.5">
                    <ListTodo className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {(!interaction || interaction.messages.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-stone-500 py-12">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-4 text-stone-600">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-stone-800 mb-2">
              Begin your reflection
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-6">
              Write down what's on your mind—a challenging decision, daily gratitude, creative idea, or setting. Gemini will unpack and reflect with you.
            </p>

            {/* Quick Inspiration Starters */}
            <div className="w-full space-y-2 text-left">
              {[
                "Reflecting on the mental clarity I felt during my morning walk.",
                "What's a current dilemma that feels difficult to resolve?",
                "Brainstorming the architecture and next steps for my new project."
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(starter)}
                  className="cursor-pointer w-full p-2.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-xs text-stone-700 text-left transition"
                >
                  &ldquo;{starter}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          interaction.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1 text-[11px] text-stone-400">
                  <span>{isUser ? 'You' : 'Gemini'}</span>
                  <span>&bull;</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-2xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-stone-900 text-stone-50 rounded-tr-sm'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="markdown-body prose prose-stone prose-sm max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {loadingAI && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-amber-600">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-stone-500 flex items-center space-x-2 shadow-sm">
              <span>Gemini is synthesizing insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="mx-6 mb-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => onRetrySave()}
            className="text-rose-800 font-semibold underline ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Composer */}
      <div className="p-4 bg-white border-t border-stone-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Reflection Mode Selectors */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-400 font-medium text-[11px]">Mode:</span>
            {[
              { id: 'general', label: 'Reflection', icon: Sparkles },
              { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb },
              { id: 'summary', label: 'Synthesize', icon: FileText },
              { id: 'coaching', label: 'Coach', icon: HelpCircle },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as ReflectionMode)}
                  className={`cursor-pointer inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-stone-900 text-stone-50 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <textarea
              id="reflection-input"
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your journal entry, thought, or setting... (Cmd/Ctrl + Enter to send)"
              className="flex-1 w-full p-3 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none transition leading-relaxed"
            />

            <button
              id="send-reflection-btn"
              type="submit"
              disabled={!inputText.trim() || loadingAI}
              className="cursor-pointer h-11 px-4 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center hover:bg-stone-800 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Send to Gemini"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px]">Enter</kbd> to submit</span>
            <span>All entries saved to Cloud Firestore</span>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <LocationPickerModal
          currentLocation={interaction?.location}
          onSaveLocation={onUpdateLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {/* External Notification Dispatch Modal */}
      {showNotifyModal && interaction && (
        <NotificationDispatchModal
          interaction={interaction}
          onClose={() => setShowNotifyModal(false)}
        />
      )}
    </div>
  );
};
