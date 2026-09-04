import React from 'react';
import { Sparkles, Shield, LogIn, BookOpen, Lock } from 'lucide-react';

interface AuthViewProps {
  onSignIn: () => void;
  loading: boolean;
  error: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSignIn, loading, error }) => {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between text-stone-800">
      {/* Top Header */}
      <header className="w-full border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-medium">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-semibold tracking-tight text-lg text-stone-900">
              ReflectAI
            </span>
          </div>
          <div className="flex items-center text-xs text-stone-500 space-x-1">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>End-to-end isolated storage</span>
          </div>
        </div>
      </header>

      {/* Hero & Login Section */}
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-600 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Intelligent Journaling & Multi-Turn Cognitive Reframing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-stone-900 mb-6 leading-tight max-w-2xl">
          A private sanctuary to think, write, and converse with Gemini.
        </h1>

        <p className="text-stone-600 text-lg leading-relaxed max-w-xl mb-10">
          Unpack complex thoughts, brainstorm solutions, and synthesize breakthroughs.
          Your reflections are stored securely in Cloud Firestore, strictly isolated to your verified identity.
        </p>

        {error && (
          <div className="w-full max-w-md mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm text-left">
            <p className="font-medium mb-1">Authentication Notice</p>
            <p>{error}</p>
          </div>
        )}

        <button
          id="google-signin-btn"
          onClick={onSignIn}
          disabled={loading}
          className="cursor-pointer inline-flex items-center space-x-3 px-8 py-3.5 rounded-xl bg-stone-900 text-stone-50 font-medium hover:bg-stone-800 active:scale-[0.98] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin"></span>
              <span>Authenticating...</span>
            </span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Feature Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="font-medium text-stone-900 text-sm mb-1">User Isolation</h2>
            <p className="text-stone-500 text-xs leading-relaxed">
              Every document path is bound to your user ID via Firestore security rules.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-medium text-stone-900 text-sm mb-1">Gemini AI Partner</h2>
            <p className="text-stone-500 text-xs leading-relaxed">
              Multi-turn discussions for brainstorming, synthesis, and deep introspective coaching.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="font-medium text-stone-900 text-sm mb-1">Persistent History</h2>
            <p className="text-stone-500 text-xs leading-relaxed">
              Past sessions and generated action plans are readily accessible anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ReflectAI &bull; Cloud Run &amp; Firestore Architecture</span>
          <span className="text-stone-400">Powered by Gemini 2.5/3.6 Flash</span>
        </div>
      </footer>
    </div>
  );
};
