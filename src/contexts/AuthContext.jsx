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
import { isNicknameAvailable, getUserByNickname } from '../firebase/services';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create user profile in Firestore
    async function createUserProfile(user, extraData = {}) {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            let name = user.displayName || extraData.displayName || 'User';

            // For Google sign-in or other flows where name wasn't pre-checked
            const available = await isNicknameAvailable(name);
            if (!available) {
                // Append a few random digits if taken
                name = `${name}${Math.floor(Math.random() * 9000) + 1000}`;
            }

            await setDoc(userRef, {
                uid: user.uid,
                displayName: name,
                email: user.email || '',
                photoURL: user.photoURL || extraData.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
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
        // Enforce nickname uniqueness
        const available = await isNicknameAvailable(displayName);
        if (!available) {
            throw new Error('This nickname is already taken. Please choose another one.');
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const photoURL = extraData.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace';
        await updateProfile(result.user, { displayName, photoURL });
        await createUserProfile(result.user, { displayName, photoURL, ...extraData });

        // Trigger verification email with better error capture
        try {
            console.log('Attempting to send verification email to:', result.user.email);
            await sendEmailVerification(result.user);
            console.log('Verification email sent successfully.');
        } catch (emailErr) {
            console.error('Email verification error:', emailErr.code, emailErr.message);
            // We don't throw here so the user is still created/logged in
        }

        return result;
    }

    // Login
    async function login(emailOrNickname, password) {
        let inputStr = emailOrNickname.trim();
        let targetEmail = inputStr;

        // Check if it's an email or a nickname
        if (!inputStr.includes('@')) {
            const userDoc = await getUserByNickname(inputStr);
            if (!userDoc || !userDoc.email) {
                throw new Error('No valid account found with this nickname.');
            }
            targetEmail = userDoc.email;
        }

        const result = await signInWithEmailAndPassword(auth, targetEmail, password);
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
        // Enforce name for guests or fallback
        const name = displayName || `Guest_${Math.floor(Math.random() * 10000)}`;

        // Check availability if user provides name
        if (displayName) {
            const available = await isNicknameAvailable(displayName);
            if (!available) {
                throw new Error('This nickname is already taken by another user.');
            }
        }

        const result = await signInAnonymously(auth);
        await updateProfile(result.user, { displayName: name, photoURL: avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace' });
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
                    photoURL: profile?.photoURL || user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
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
