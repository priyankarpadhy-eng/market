import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
    increment, arrayUnion, arrayRemove, setDoc, Timestamp
} from 'firebase/firestore';
import { db } from './config';

// ═══════════════════════════════════════════
// ─── POSTS ────────────────────────────────
// ═══════════════════════════════════════════
const postsRef = collection(db, 'posts');

// Helper to auto-delete old posts
async function filterAndCleanupPosts(docsList) {
    const valid = [];
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const d of docsList) {
        const p = { id: d.id, ...d.data() };
        if (p.createdAt && p.createdAt.seconds) {
            const pTime = p.createdAt.seconds * 1000;
            if (now - pTime > SEVEN_DAYS_MS && (p.votes || 0) < 50) {
                deleteDoc(doc(db, 'posts', p.id)).catch(console.error);
                continue;
            }
        }
        valid.push(p);
    }
    return valid;
}


export async function getPosts(filterType = 'trending') {
    let q;
    switch (filterType) {
        case 'new':
            q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
            break;
        case 'top':
            q = query(postsRef, orderBy('votes', 'desc'), limit(20));
            break;
        default: // trending = sorted by votes + newness or just most voted for now
            q = query(postsRef, orderBy('votes', 'desc'), limit(20));
    }
    const snapshot = await getDocs(q);
    return await filterAndCleanupPosts(snapshot.docs);
}

// Admin / Universal Fetcher
export async function getAllPostsForAdmin() {
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })); // Bypass filter for raw view 
}

export async function getCommunityPosts(communityId) {
    const q = query(postsRef, where('communityId', '==', communityId), orderBy('createdAt', 'desc'), limit(15));
    const snapshot = await getDocs(q);
    return await filterAndCleanupPosts(snapshot.docs);
}

export function subscribeToPosts(callback) {
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, async (snapshot) => {
        const validDocs = await filterAndCleanupPosts(snapshot.docs);
        callback(validDocs);
    }, (error) => {
        console.error('Firestore Subscribe Posts Error:', error);
        callback([]);
    });
}

export async function getPost(postId) {
    const snap = await getDoc(doc(db, 'posts', postId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

let lastPostTime = 0;
export async function createPost(postData) {
    const now = Date.now();
    if (now - lastPostTime < 10000) { // Reduced to 10 seconds for better UX, still prevents spam
        throw new Error('Please wait a few seconds before posting again.');
    }

    // Validate tags
    const validTags = ['confession', 'truth', 'spill', 'shit', 'real', 'help', 'opinion', 'freelancing', 'discussion'];
    if (!postData.tag || !validTags.includes(postData.tag)) {
        throw new Error(`Invalid tag: "${postData.tag}". A valid tag is compulsory.`);
    }

    lastPostTime = now;
    return await addDoc(postsRef, {
        ...postData,
        authorId: postData.authorId || 'guest',
        authorName: postData.authorName || 'Anonymous',
        authorAvatar: postData.authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
        votes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
    });
}

export async function votePost(postId, direction) {
    await updateDoc(doc(db, 'posts', postId), {
        votes: increment(direction),
    });
}

export async function deletePost(postId) {
    await deleteDoc(doc(db, 'posts', postId));
}

// ═══════════════════════════════════════════
// ─── COMMENTS ─────────────────────────────
// ═══════════════════════════════════════════
export async function getComments(postId) {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    const comments = [];
    for (const commentDoc of snapshot.docs) {
        const comment = { id: commentDoc.id, ...commentDoc.data(), replies: [] };
        const repliesRef = collection(db, 'posts', postId, 'comments', commentDoc.id, 'replies');
        const repliesSnap = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));
        comment.replies = repliesSnap.docs.map(r => ({ id: r.id, ...r.data() }));
        comments.push(comment);
    }
    return comments;
}

export function subscribeToComments(postId, callback) {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, async (snapshot) => {
        const comments = [];
        for (const commentDoc of snapshot.docs) {
            const comment = { id: commentDoc.id, ...commentDoc.data(), replies: [] };
            const repliesRef = collection(db, 'posts', postId, 'comments', commentDoc.id, 'replies');
            const repliesSnap = await getDocs(query(repliesRef, orderBy('createdAt', 'asc')));
            comment.replies = repliesSnap.docs.map(r => ({ id: r.id, ...r.data() }));
            comments.push(comment);
        }
        callback(comments);
    });
}

export async function addComment(postId, commentData) {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const result = await addDoc(commentsRef, {
        ...commentData,
        likes: 0,
        createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'posts', postId), { comments: increment(1) });
    return result;
}

export async function addReply(postId, commentId, replyData) {
    const repliesRef = collection(db, 'posts', postId, 'comments', commentId, 'replies');
    return await addDoc(repliesRef, {
        ...replyData,
        likes: 0,
        createdAt: serverTimestamp(),
    });
}

export async function likeComment(postId, commentId) {
    const ref = doc(db, 'posts', postId, 'comments', commentId);
    await updateDoc(ref, { likes: increment(1) });
}

export async function deleteComment(postId, commentId) {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    await updateDoc(doc(db, 'posts', postId), { comments: increment(-1) });
}

export async function deleteReply(postId, commentId, replyId) {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId, 'replies', replyId));
}

// ═══════════════════════════════════════════
// ─── COMMUNITIES ──────────────────────────
// ═══════════════════════════════════════════
const communitiesRef = collection(db, 'communities');

export async function getCommunities(category = 'All') {
    let q;
    if (category === 'All') {
        q = query(communitiesRef, orderBy('members', 'desc'));
    } else {
        q = query(communitiesRef, where('category', '==', category), orderBy('members', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCommunity(communityId) {
    const snap = await getDoc(doc(db, 'communities', communityId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function subscribeToCommunity(communityId, callback) {
    return onSnapshot(doc(db, 'communities', communityId), (snap) => {
        callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
}

export async function joinCommunity(communityId, userId) {
    await updateDoc(doc(db, 'communities', communityId), {
        members: increment(1),
        memberIds: arrayUnion(userId),
    });
}

export async function leaveCommunity(communityId, userId) {
    await updateDoc(doc(db, 'communities', communityId), {
        members: increment(-1),
        memberIds: arrayRemove(userId),
    });
}

export async function createCommunity(data) {
    return await addDoc(communitiesRef, {
        ...data,
        members: 1,
        online: 1,
        memberIds: [data.creatorId],
        createdAt: serverTimestamp(),
    });
}

// ═══════════════════════════════════════════
// ─── MARKETPLACE ──────────────────────────
// ═══════════════════════════════════════════
const listingsRef = collection(db, 'listings');

export function subscribeToListings(category, searchQuery, callback) {
    let q;
    if (category === 'All') {
        q = query(listingsRef, orderBy('createdAt', 'desc'));
    } else {
        q = query(listingsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    return onSnapshot(q, (snapshot) => {
        let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            results = results.filter(item =>
                item.title?.toLowerCase().includes(lowerQ) ||
                item.description?.toLowerCase().includes(lowerQ)
            );
        }
        callback(results);
    });
}

export async function getAllListingsForAdmin() {
    const q = query(listingsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

let lastListingTime = 0;
export async function createListing(listingData) {
    const now = Date.now();
    if (now - lastListingTime < 60000) { // 60 seconds limit
        throw new Error('Please wait 1 minute before listing another item to prevent spam.');
    }
    lastListingTime = now;
    return await addDoc(listingsRef, {
        ...listingData,
        favorites: 0,
        createdAt: serverTimestamp(),
    });
}

export async function updateListing(listingId, data) {
    await updateDoc(doc(db, 'listings', listingId), data);
}

export async function deleteListing(listingId) {
    await deleteDoc(doc(db, 'listings', listingId));
}

export async function favoriteListing(listingId) {
    await updateDoc(doc(db, 'listings', listingId), {
        favorites: increment(1),
    });
}

// Listing Comments
export async function getListingComments(listingId) {
    const commentsRef = collection(db, 'listings', listingId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToListingComments(listingId, callback) {
    const commentsRef = collection(db, 'listings', listingId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}

export async function addListingComment(listingId, commentData) {
    const commentsRef = collection(db, 'listings', listingId, 'comments');
    await addDoc(commentsRef, {
        ...commentData,
        createdAt: serverTimestamp(),
        replies: []
    });
}

export async function addListingReply(listingId, commentId, replyData) {
    const commentRef = doc(db, 'listings', listingId, 'comments', commentId);
    await updateDoc(commentRef, {
        replies: arrayUnion({
            ...replyData,
            createdAt: new Date().toISOString() // Using client date for array elements (standard pattern for sub-objects)
        })
    });
}

export async function deleteListingComment(listingId, commentId) {
    const commentRef = doc(db, 'listings', listingId, 'comments', commentId);
    await deleteDoc(commentRef);
}

// ═══════════════════════════════════════════
// ─── CONVERSATIONS & MESSAGES ─────────────
// ═══════════════════════════════════════════
const conversationsRef = collection(db, 'conversations');

export async function getConversations(userId) {
    const q = query(conversationsRef, where('participantIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToConversations(userId, callback) {
    const q = query(conversationsRef, where('participantIds', 'array-contains', userId));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}

export async function getMessages(conversationId) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToMessages(conversationId, callback) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}

export async function sendMessage(conversationId, messageData) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
        ...messageData,
        createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: `${messageData.sender}: ${messageData.content.slice(0, 40)}...`,
        lastTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        updatedAt: serverTimestamp(),
    });
}

export async function createConversation(data) {
    return await addDoc(conversationsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

// ═══════════════════════════════════════════
// ─── USER PROFILES ────────────────────────
// ═══════════════════════════════════════════
export async function getUserProfile(userId) {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

let lastProfileUpdate = 0;
export async function updateUserProfile(userId, data) {
    const now = Date.now();
    if (now - lastProfileUpdate < 5000) {
        throw new Error('Please wait before updating your profile again (Rate Limit).');
    }
    lastProfileUpdate = now;

    // If nickname is changing, check uniqueness
    if (data.displayName) {
        const isAvailable = await isNicknameAvailable(data.displayName, userId);
        if (!isAvailable) {
            throw new Error('This nickname is already taken. Please choose another one.');
        }
    }

    await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Checks if a nickname is available.
 * @param {string} nickname The nickname to check.
 * @param {string} excludeUserId Optional user ID to exclude (e.g., current user when updating).
 */
export async function isNicknameAvailable(nickname, excludeUserId = null) {
    if (!nickname || nickname.length < 3) return false;
    const q = query(collection(db, 'users'), where('displayName', '==', nickname.trim()));
    const snap = await getDocs(q);

    if (snap.empty) return true;

    // If not empty, check if the only user found is the one being excluded
    if (excludeUserId) {
        return snap.docs.every(d => d.id === excludeUserId);
    }

    return false;
}

export async function getUserByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { uid: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getUserByNickname(nickname) {
    if (!nickname) return null;
    const q = query(collection(db, 'users'), where('displayName', '==', nickname.trim()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { uid: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getUserPosts(userId) {
    const q = query(postsRef, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllUsers() {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════
// ─── SEARCH & SIDEBAR ─────────────────────
// ═══════════════════════════════════════════
export async function globalSearch(searchTerm) {
    const term = searchTerm.toLowerCase();

    // Search posts
    const postSnap = await getDocs(query(postsRef, limit(20)));
    const posts = postSnap.docs
        .map(d => ({ id: d.id, ...d.data(), type: 'post' }))
        .filter(p => p.title?.toLowerCase().includes(term) || p.content?.toLowerCase().includes(term));

    // Search communities
    const commSnap = await getDocs(query(communitiesRef, limit(20)));
    const communities = commSnap.docs
        .map(d => ({ id: d.id, ...d.data(), type: 'community' }))
        .filter(c => c.name?.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term));

    // Search marketplace
    const listSnap = await getDocs(query(listingsRef, limit(20)));
    const listings = listSnap.docs
        .map(d => ({ id: d.id, ...d.data(), type: 'marketplace' }))
        .filter(l => l.title?.toLowerCase().includes(term) || l.description?.toLowerCase().includes(term));

    return [...posts, ...communities, ...listings];
}


export async function getUserJoinedCommunities(userId) {
    const q = query(communitiesRef, where('memberIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ═══════════════════════════════════════════
// ─── USER SETTINGS ────────────────────────
// ═══════════════════════════════════════════
export async function getUserSettings(userId) {
    const snap = await getDoc(doc(db, 'settings', userId));
    return snap.exists() ? snap.data() : null;
}

export async function saveUserSettings(userId, settings) {
    await setDoc(doc(db, 'settings', userId), {
        ...settings,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

// ═══════════════════════════════════════════
// ─── SEED DATABASE ────────────────────────
// ═══════════════════════════════════════════
export async function seedDatabase(communities, posts, listings, conversations) {
    const check = await getDocs(query(communitiesRef, limit(1)));
    if (!check.empty) return false;

    for (const community of communities) {
        await setDoc(doc(db, 'communities', community.id), {
            ...community,
            memberIds: [],
            createdAt: serverTimestamp(),
        });
    }

    for (const post of posts) {
        await setDoc(doc(db, 'posts', post.id), {
            ...post,
            authorId: 'demo-user-1',
            createdAt: serverTimestamp(),
        });
    }

    for (const listing of listings) {
        await setDoc(doc(db, 'listings', listing.id), {
            ...listing,
            sellerId: 'demo-user-1',
            createdAt: serverTimestamp(),
        });
    }

    if (conversations) {
        for (const conv of conversations) {
            const { messages, ...convData } = conv;
            await setDoc(doc(db, 'conversations', conv.id), {
                ...convData,
                participantIds: ['demo-user-1'],
                updatedAt: serverTimestamp(),
            });
            if (messages) {
                for (const msg of messages) {
                    await addDoc(collection(db, 'conversations', conv.id, 'messages'), {
                        ...msg,
                        createdAt: serverTimestamp(),
                    });
                }
            }
        }
    }

    // Seed demo user profile
    await setDoc(doc(db, 'users', 'demo-user-1'), {
        uid: 'demo-user-1',
        displayName: 'Alex Johnson',
        email: 'alex.j@igitsarang.ac.in',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
        major: 'Computer Science Major',
        classYear: 'Class of 2025',
        gpa: '8.5',
        location: 'Sarang, Odisha',
        bio: 'Passionate about AI and late-night coding sessions. Currently working on projects for IGIT technical fest. Always looking for study buddies at the library or someone to grab chai with! ☕ 💻',
        university: 'IGIT Sarang',
        postsCount: 12,
        commentsCount: 48,
        createdAt: serverTimestamp(),
    });

    // Seed default settings
    await setDoc(doc(db, 'settings', 'demo-user-1'), {
        pushNotifications: true,
        emailDigest: false,
        publicProfile: true,
        theme: 'light',
        contentDensity: 'comfortable',
    });


    return true;
}

// ═══════════════════════════════════════════
// ─── REPORTS ──────────────────────────────
// ═══════════════════════════════════════════
export async function reportPost(postId, reportData) {
    await addDoc(collection(db, 'reports'), {
        postId,
        reason: reportData.reason,
        description: reportData.description || '',
        reportedBy: reportData.reportedBy,
        reporterName: reportData.reporterName,
        postTitle: reportData.postTitle || '',
        postAuthor: reportData.postAuthor || '',
        status: 'pending',
        createdAt: serverTimestamp(),
    });
}

export async function getReportedPosts() {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function resolveReport(reportId) {
    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
}

export async function dismissReport(reportId) {
    await deleteDoc(doc(db, 'reports', reportId));
}

// ═══════════════════════════════════════════
// ─── EVENTS ───────────────────────────────
// ═══════════════════════════════════════════
const eventsRef = collection(db, 'events');

export async function getEvents() {
    const q = query(eventsRef, orderBy('eventDate', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToEvents(callback) {
    const q = query(eventsRef, orderBy('eventDate', 'asc'));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
        console.error('Events subscription error:', err);
        callback([]);
    });
}

export async function createEvent(eventData) {
    return await addDoc(eventsRef, {
        title: eventData.title,
        caption: eventData.caption || '',
        description: eventData.description || '',
        bannerUrl: eventData.bannerUrl || '',
        location: eventData.location || '',
        eventDate: eventData.eventDate,      // ISO string or Timestamp
        eventTime: eventData.eventTime || '',
        category: eventData.category || 'general',
        registrationLink: eventData.registrationLink || '',
        createdBy: eventData.createdBy,
        createdAt: serverTimestamp(),
    });
}

export async function updateEvent(eventId, eventData) {
    await updateDoc(doc(db, 'events', eventId), {
        ...eventData,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteEvent(eventId) {
    await deleteDoc(doc(db, 'events', eventId));
}

// ═══════════════════════════════════════════
// ─── FOUNDER / ROLE MANAGEMENT ────────────
// ═══════════════════════════════════════════

export async function searchUserByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
}

export async function setUserRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role });
}
