/**
 * Firebase Authentication Service
 * 
 * Handles Firebase Auth initialization and Google SSO.
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    type User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Add these to your .env file:
// VITE_FIREBASE_API_KEY
// VITE_FIREBASE_AUTH_DOMAIN
// VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_STORAGE_BUCKET
// VITE_FIREBASE_MESSAGING_SENDER_ID
// VITE_FIREBASE_APP_ID

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
    // Basic validation to avoid hard crash if env vars are missing
    if (!firebaseConfig.apiKey) {
        console.warn('Firebase configuration missing (apiKey). Firebase will not be initialized.');
    } else {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (error) {
    console.error('Failed to initialize Firebase:', error);
}

export { app, auth, db };
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using Firebase Auth
 */
export const signInWithGoogle = async (): Promise<User> => {
    try {
        if (!auth) throw new Error('Firebase Auth not initialized');
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

/**
 * Sign out from Firebase
 */
export const signOut = async (): Promise<void> => {
    try {
        if (!auth) return;
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Get current Firebase ID token
 */
export const getIdToken = async (user: User | null): Promise<string | null> => {
    if (!user) return null;
    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Error getting ID token:', error);
        return null;
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
    if (!auth) {
        // If auth is not initialized, we can't listen for changes.
        // Return a no-op unsubscribe function.
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
};

export type { User };

/**
 * Create a new account with email and password via Firebase Auth
 */
export const createAccount = async (email: string, password: string, displayName?: string): Promise<User> => {
    try {
        if (!auth) throw new Error('Firebase Auth not initialized');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Set the display name if provided
        if (displayName) {
            await updateProfile(result.user, { displayName });
        }
        return result.user;
    } catch (error) {
        console.error('Error creating account:', error);
        throw error;
    }
};

/**
 * Sign in with email and password via Firebase Auth
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    try {
        if (!auth) throw new Error('Firebase Auth not initialized');
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Error signing in with email:', error);
        throw error;
    }
};
