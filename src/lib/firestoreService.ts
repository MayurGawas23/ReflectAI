import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { Interaction, Message } from '../types';

/**
 * Utility to strip undefined values from payload before sending to Firestore
 * to guarantee zero-crash payload hygiene.
 */
export function sanitizeFirestorePayload<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

export async function fetchUserInteractions(userId: string): Promise<Interaction[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'interactions');
  const q = query(colRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as Interaction));
}

export async function saveUserInteraction(
  userId: string, 
  interaction: Interaction
): Promise<void> {
  if (!userId || !interaction.id) {
    throw new Error('User ID and Interaction ID are required for persistence');
  }
  const docRef = doc(db, 'users', userId, 'interactions', interaction.id);
  const cleanData = sanitizeFirestorePayload({
    ...interaction,
    userId,
    updatedAt: Date.now()
  });
  await setDoc(docRef, cleanData, { merge: true });
}

export async function deleteUserInteraction(userId: string, interactionId: string): Promise<void> {
  if (!userId || !interactionId) return;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(docRef);
}
