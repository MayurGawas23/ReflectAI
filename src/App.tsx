import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { 
  fetchUserInteractions, 
  saveUserInteraction, 
  deleteUserInteraction 
} from './lib/firestoreService';
import { Interaction, Message, ReflectionMode, UserProfile } from './types';
import { AuthView } from './components/AuthView';
import { Sidebar } from './components/Sidebar';
import { InteractionWorkspace } from './components/InteractionWorkspace';
import { BookOpen, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firestore Interactions State
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // AI Generation State
  const [loadingAI, setLoadingAI] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        await loadInteractions(user.uid);
      } else {
        setInteractions([]);
        setCurrentId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadInteractions = async (uid: string) => {
    try {
      setLoadingHistory(true);
      const data = await fetchUserInteractions(uid);
      setInteractions(data);
      if (data.length > 0) {
        setCurrentId((prev) => (prev && data.some(d => d.id === prev) ? prev : data[0].id));
      } else {
        setCurrentId(null);
      }
    } catch (err: any) {
      console.error('Error fetching interactions:', err);
      setAppError('Failed to load reflection history from Firestore.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Create a new reflection session
  const handleNewReflection = () => {
    if (!currentUser) return;
    const newSession: Interaction = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: currentUser.uid,
      title: 'New Reflection',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setInteractions((prev) => [newSession, ...prev]);
    setCurrentId(newSession.id);
  };

  const currentInteraction = interactions.find((i) => i.id === currentId) || null;

  // Send message and converse with Gemini
  const handleSendMessage = async (text: string, mode: ReflectionMode) => {
    if (!currentUser) return;

    let targetInteraction = currentInteraction;

    // Create session on the fly if none selected
    if (!targetInteraction) {
      targetInteraction = {
        id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: currentUser.uid,
        title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setInteractions((prev) => [targetInteraction!, ...prev]);
      setCurrentId(targetInteraction.id);
    }

    const userMessage: Message = {
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...targetInteraction.messages, userMessage];
    
    // Auto-update title if it was a generic default
    const updatedTitle = targetInteraction.title === 'New Reflection' 
      ? text.slice(0, 32) + (text.length > 32 ? '...' : '') 
      : targetInteraction.title;

    const workingInteraction: Interaction = {
      ...targetInteraction,
      title: updatedTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    // Update UI optimistically
    setInteractions((prev) =>
      prev.map((item) => (item.id === workingInteraction.id ? workingInteraction : item))
    );

    // Call server-side Gemini API
    setLoadingAI(true);
    setAppError(null);
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: workingInteraction.messages,
          mode,
          currentEntry: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const modelMessage: Message = {
        role: 'model',
        text: data.reply || 'No response received.',
        timestamp: Date.now(),
      };

      const finalInteraction: Interaction = {
        ...workingInteraction,
        messages: [...updatedMessages, modelMessage],
        updatedAt: Date.now(),
      };

      // Persist to Firestore
      await saveUserInteraction(currentUser.uid, finalInteraction);
      setInteractions((prev) =>
        prev.map((item) => (item.id === finalInteraction.id ? finalInteraction : item))
      );
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Error in handleSendMessage:', err);
      setAppError(err.message || 'Error communicating with Gemini or saving to Firestore.');
      setSaveStatus('error');
    } finally {
      setLoadingAI(false);
    }
  };

  // Summarize and extract themes
  const handleSummarizeCurrent = async () => {
    if (!currentUser || !currentInteraction || currentInteraction.messages.length === 0) return;

    setLoadingAI(true);
    setAppError(null);
    setSaveStatus('saving');

    try {
      // Concatenate context
      const fullText = currentInteraction.messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Gemini'}: ${m.text}`)
        .join('\n\n');

      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize session.');
      }

      const summaryData = await response.json();

      const updatedInteraction: Interaction = {
        ...currentInteraction,
        title: summaryData.title || currentInteraction.title,
        summary: summaryData.summary,
        themes: summaryData.themes || [],
        actionItems: summaryData.actionItems || [],
        updatedAt: Date.now(),
      };

      await saveUserInteraction(currentUser.uid, updatedInteraction);

      setInteractions((prev) =>
        prev.map((i) => (i.id === updatedInteraction.id ? updatedInteraction : i))
      );
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Error synthesizing session:', err);
      setAppError(err.message || 'Failed to synthesize session.');
      setSaveStatus('error');
    } finally {
      setLoadingAI(false);
    }
  };

  // Delete an interaction
  const handleDeleteInteraction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (!window.confirm('Delete this reflection permanently?')) return;

    try {
      await deleteUserInteraction(currentUser.uid, id);
      setInteractions((prev) => prev.filter((i) => i.id !== id));
      if (currentId === id) {
        const remaining = interactions.filter((i) => i.id !== id);
        setCurrentId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setAppError('Failed to delete reflection from Firestore.');
    }
  };

  const handleRetrySave = async () => {
    if (!currentUser || !currentInteraction) return;
    setSaveStatus('saving');
    try {
      await saveUserInteraction(currentUser.uid, currentInteraction);
      setSaveStatus('saved');
      setAppError(null);
    } catch (err: any) {
      setSaveStatus('error');
      setAppError(err.message || 'Retry save failed.');
    }
  };

  // Initial loading state
  if (authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-6 h-6 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin"></div>
          <span className="text-xs font-medium tracking-wide">Initializing secure session...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated view
  if (!currentUser) {
    return <AuthView onSignIn={handleSignIn} loading={authLoading} error={authError} />;
  }

  // Authenticated Private Dashboard
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col h-screen text-stone-800 overflow-hidden">
      {/* Top App Navbar */}
      <header className="h-14 border-b border-stone-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-900 tracking-tight">ReflectAI</h1>
          </div>
          <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>User Isolated</span>
          </span>
        </div>

        {/* User profile & Sign out */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User avatar'}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-stone-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="font-medium text-stone-900 leading-tight">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <span className="text-[10px] text-stone-400 leading-tight">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            id="signout-btn"
            onClick={handleSignOut}
            className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Sidebar (History) + Dialogue Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          interactions={interactions}
          currentInteractionId={currentId}
          onSelectInteraction={(id) => setCurrentId(id)}
          onNewReflection={handleNewReflection}
          onDeleteInteraction={handleDeleteInteraction}
          loading={loadingHistory}
        />

        <InteractionWorkspace
          interaction={currentInteraction}
          onSendMessage={handleSendMessage}
          onSummarizeCurrent={handleSummarizeCurrent}
          loadingAI={loadingAI}
          error={appError}
          saveStatus={saveStatus}
          onRetrySave={handleRetrySave}
        />
      </div>
    </div>
  );
}
