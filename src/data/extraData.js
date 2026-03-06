const userProfile = {
    displayName: '',
    major: '',
    bio: '',
    location: '',
    classYear: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
    postsCount: 0,
    commentsCount: 0,
    userPosts: [],
    savedPosts: []
};

const defaultSettings = {
    theme: 'light',
    contentDensity: 'comfortable',
    pushNotifications: true,
    emailDigest: false,
    publicProfile: true
};

const comments = [];
const marketplaceListings = [];
const inboxData = [];
const messagesData = {};
const conversations = [];

export {
    userProfile,
    defaultSettings,
    comments,
    marketplaceListings,
    inboxData,
    messagesData,
    conversations
};
