import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    signInAnonymously,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Demo user removed

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create user profile in Firestore
    async function createUserProfile(user, extraData = {}) {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        if (!snapshot.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName || extraData.displayName || 'User',
                email: user.email || '',
                photoURL: user.photoURL || extraData.photoURL || '/images/avatar.png',
                major: extraData.major || '',
                classYear: extraData.classYear || '',
                location: '',
                bio: '',
                role: 'user',
                university: 'IGIT Sarang',
                postsCount: 0,
                commentsCount: 0,
                createdAt: serverTimestamp(),
            });
        }
    }

    // Sign up
    async function signup(email, password, displayName, extraData = {}) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const photoURL = extraData.photoURL || '/images/avatar.png';
        await updateProfile(result.user, { displayName, photoURL });
        await createUserProfile(result.user, { displayName, photoURL, ...extraData });
        await sendEmailVerification(result.user);
        return result;
    }

    // Login
    async function login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result;
    }

    // Google sign-in
    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await createUserProfile(result.user);
        return result;
    }

    // Password reset
    async function resetPassword(email) {
        return await sendPasswordResetEmail(auth, email);
    }

    // Guest login
    async function loginAsGuest(displayName, avatar) {
        const result = await signInAnonymously(auth);
        const name = displayName || `Guest_${Math.floor(Math.random() * 10000)}`;
        await updateProfile(result.user, { displayName: name, photoURL: avatar || '/images/avatar.png' });
        await createUserProfile(result.user, { displayName: name, classYear: 'Guest Explorer', photoURL: avatar });
        return result;
    }

    // Logout
    async function logout() {
        await signOut(auth);
        setCurrentUser(null);
        setAuthUser(null);
    }

    // Update profile
    async function updateUserProfile(data) {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, data, { merge: true });
        setCurrentUser(prev => ({ ...prev, ...data }));
    }

    // Get user profile from Firestore
    async function fetchUserProfile(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
                return { uid, ...snapshot.data() };
            }
        } catch (err) {
            console.log('Profile fetch error:', err.message);
        }
        return null;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthUser(user);
            if (user) {
                // Fetch Firestore profile
                const profile = await fetchUserProfile(user.uid);

                // Merge profile data with relevant auth metadata
                setCurrentUser({
                    ...(profile || {}),
                    uid: user.uid,
                    displayName: profile?.displayName || user.displayName || 'User',
                    email: user.email,
                    photoURL: profile?.photoURL || user.photoURL || '/images/avatar.png',
                    emailVerified: user.emailVerified,
                    isAnonymous: user.isAnonymous
                });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        isAdmin: currentUser?.role === 'admin' || currentUser?.role === 'founder',
        isFounder: currentUser?.role === 'founder',
        authUser,
        signup,
        login,
        loginWithGoogle,
        resetPassword,
        loginAsGuest,
        logout,
        updateUserProfile,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
