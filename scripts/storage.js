/**
 * Batform Storage Module
 * Simulated database using localStorage
 * All data operations go through this module
 */

const Storage = (function() {
    // Storage keys
    const KEYS = {
        USERS: 'batform_users',
        CURRENT_USER: 'batform_currentUser',
        POSTS: 'batform_posts',
        COMMENTS: 'batform_comments',
        LIKES: 'batform_likes',
        FOLLOWS: 'batform_follows',
        NOTIFICATIONS: 'batform_notifications',
        SAVED_POSTS: 'batform_savedPosts'
    };

    // Generate unique ID
    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ==================== USERS ====================
    
    function getUsers() {
        const data = localStorage.getItem(KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    function saveUsers(users) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    function getUserById(userId) {
        const users = getUsers();
        return users.find(u => u.id === userId) || null;
    }

    function getUserByUsername(username) {
        const users = getUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    }

    function getUserByEmail(email) {
        const users = getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    function createUser(userData) {
        const users = getUsers();
        const newUser = {
            id: generateId(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName || userData.username,
            avatar: userData.avatar || null,
            coverPhoto: null,
            bio: '',
            location: '',
            website: '',
            createdAt: Date.now()
        };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    }

    function updateUser(userId, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            saveUsers(users);
            
            // Update currentUser if it's the same user
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                setCurrentUser(users[index]);
            }
            return users[index];
        }
        return null;
    }

    // ==================== CURRENT USER (SESSION) ====================

    function getCurrentUser() {
        const data = localStorage.getItem(KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    }

    function setCurrentUser(user) {
        // Store without password for security
        const safeUser = { ...user };
        delete safeUser.password;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(safeUser));
    }

    function logoutUser() {
        localStorage.removeItem(KEYS.CURRENT_USER);
    }

    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    // ==================== POSTS ====================

    function getPosts() {
        const data = localStorage.getItem(KEYS.POSTS);
        return data ? JSON.parse(data) : [];
    }

    function savePosts(posts) {
        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }

    function getPostById(postId) {
        const posts = getPosts();
        return posts.find(p => p.id === postId) || null;
    }

    function getPostsByUser(userId) {
        const posts = getPosts();
        return posts.filter(p => p.authorId === userId).sort((a, b) => b.createdAt - a.createdAt);
    }

    function createPost(postData) {
        const posts = getPosts();
        const newPost = {
            id: generateId(),
            authorId: postData.authorId,
            content: postData.content,
            image: postData.image || null,
            createdAt: Date.now()
        };
        posts.unshift(newPost); // Add to beginning
        savePosts(posts);
        return newPost;
    }

    function deletePost(postId) {
        let posts = getPosts();
        posts = posts.filter(p => p.id !== postId);
        savePosts(posts);
        
        // Also delete related comments and likes
        let comments = getComments();
        comments = comments.filter(c => c.postId !== postId);
        saveComments(comments);
        
        let likes = getLikes();
        likes = likes.filter(l => l.postId !== postId);
        saveLikes(likes);
    }

    function getFeedPosts() {
        const posts = getPosts();
        return posts.sort((a, b) => b.createdAt - a.createdAt);
    }

    // ==================== COMMENTS ====================

    function getComments() {
        const data = localStorage.getItem(KEYS.COMMENTS);
        return data ? JSON.parse(data) : [];
    }

    function saveComments(comments) {
        localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
    }

    function getCommentsByPost(postId) {
        const comments = getComments();
        return comments.filter(c => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
    }

    function getCommentCount(postId) {
        const comments = getComments();
        return comments.filter(c => c.postId === postId).length;
    }

    function createComment(commentData) {
        const comments = getComments();
        const newComment = {
            id: generateId(),
            postId: commentData.postId,
            authorId: commentData.authorId,
            text: commentData.text,
            createdAt: Date.now()
        };
        comments.push(newComment);
        saveComments(comments);
        return newComment;
    }

    function deleteComment(commentId) {
        let comments = getComments();
        comments = comments.filter(c => c.id !== commentId);
        saveComments(comments);
    }

    // ==================== LIKES ====================

    function getLikes() {
        const data = localStorage.getItem(KEYS.LIKES);
        return data ? JSON.parse(data) : [];
    }

    function saveLikes(likes) {
        localStorage.setItem(KEYS.LIKES, JSON.stringify(likes));
    }

    function getLikeCount(postId) {
        const likes = getLikes();
        return likes.filter(l => l.postId === postId).length;
    }

    function hasUserLiked(postId, userId) {
        const likes = getLikes();
        return likes.some(l => l.postId === postId && l.userId === userId);
    }

    function toggleLike(postId, userId) {
        let likes = getLikes();
        const existingIndex = likes.findIndex(l => l.postId === postId && l.userId === userId);
        
        if (existingIndex !== -1) {
            // Unlike
            likes.splice(existingIndex, 1);
            saveLikes(likes);
            return false;
        } else {
            // Like
            likes.push({ postId, userId });
            saveLikes(likes);
            return true;
        }
    }

    // ==================== FOLLOWS ====================

    function getFollows() {
        const data = localStorage.getItem(KEYS.FOLLOWS);
        return data ? JSON.parse(data) : [];
    }

    function saveFollows(follows) {
        localStorage.setItem(KEYS.FOLLOWS, JSON.stringify(follows));
    }

    function isFollowing(followerId, followingId) {
        const follows = getFollows();
        return follows.some(f => f.followerId === followerId && f.followingId === followingId);
    }

    function toggleFollow(followerId, followingId) {
        let follows = getFollows();
        const existingIndex = follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
        
        if (existingIndex !== -1) {
            // Unfollow
            follows.splice(existingIndex, 1);
            saveFollows(follows);
            return false;
        } else {
            // Follow
            follows.push({ followerId, followingId, createdAt: Date.now() });
            saveFollows(follows);
            return true;
        }
    }

    function getFollowerCount(userId) {
        const follows = getFollows();
        return follows.filter(f => f.followingId === userId).length;
    }

    function getFollowingCount(userId) {
        const follows = getFollows();
        return follows.filter(f => f.followerId === userId).length;
    }

    function getFollowers(userId) {
        const follows = getFollows();
        return follows.filter(f => f.followingId === userId).map(f => getUserById(f.followerId)).filter(Boolean);
    }

    function getFollowing(userId) {
        const follows = getFollows();
        return follows.filter(f => f.followerId === userId).map(f => getUserById(f.followingId)).filter(Boolean);
    }

    // ==================== SAVED POSTS ====================

    function getSavedPosts() {
        const data = localStorage.getItem(KEYS.SAVED_POSTS);
        return data ? JSON.parse(data) : [];
    }

    function saveSavedPosts(savedPosts) {
        localStorage.setItem(KEYS.SAVED_POSTS, JSON.stringify(savedPosts));
    }

    function hasUserSaved(postId, userId) {
        const saved = getSavedPosts();
        return saved.some(s => s.postId === postId && s.userId === userId);
    }

    function toggleSavePost(postId, userId) {
        let saved = getSavedPosts();
        const existingIndex = saved.findIndex(s => s.postId === postId && s.userId === userId);
        
        if (existingIndex !== -1) {
            saved.splice(existingIndex, 1);
            saveSavedPosts(saved);
            return false;
        } else {
            saved.push({ postId, userId, savedAt: Date.now() });
            saveSavedPosts(saved);
            return true;
        }
    }

    function getUserSavedPosts(userId) {
        const saved = getSavedPosts();
        const userSaved = saved.filter(s => s.userId === userId).sort((a, b) => b.savedAt - a.savedAt);
        return userSaved.map(s => getPostById(s.postId)).filter(Boolean);
    }

    // ==================== NOTIFICATIONS ====================

    function getNotifications() {
        const data = localStorage.getItem(KEYS.NOTIFICATIONS);
        return data ? JSON.parse(data) : [];
    }

    function saveNotifications(notifications) {
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }

    function getUserNotifications(userId) {
        const notifications = getNotifications();
        return notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    }

    function createNotification(notifData) {
        const notifications = getNotifications();
        const newNotif = {
            id: generateId(),
            userId: notifData.userId,
            type: notifData.type, // 'like', 'comment', 'follow'
            fromUserId: notifData.fromUserId,
            postId: notifData.postId || null,
            read: false,
            createdAt: Date.now()
        };
        notifications.unshift(newNotif);
        saveNotifications(notifications);
        return newNotif;
    }

    function markNotificationRead(notifId) {
        const notifications = getNotifications();
        const index = notifications.findIndex(n => n.id === notifId);
        if (index !== -1) {
            notifications[index].read = true;
            saveNotifications(notifications);
        }
    }

    function getUnreadNotificationCount(userId) {
        const notifications = getNotifications();
        return notifications.filter(n => n.userId === userId && !n.read).length;
    }

    // ==================== UTILITIES ====================

    function clearAllData() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        console.log('🗑️ All data cleared');
    }

    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        
        return new Date(timestamp).toLocaleDateString();
    }

    // Public API
    return {
        // Users
        getUsers,
        saveUsers,
        getUserById,
        getUserByUsername,
        getUserByEmail,
        createUser,
        updateUser,
        
        // Session
        getCurrentUser,
        setCurrentUser,
        logoutUser,
        isLoggedIn,
        
        // Posts
        getPosts,
        savePosts,
        getPostById,
        getPostsByUser,
        createPost,
        deletePost,
        getFeedPosts,
        
        // Comments
        getComments,
        saveComments,
        getCommentsByPost,
        getCommentCount,
        createComment,
        deleteComment,
        
        // Likes
        getLikes,
        saveLikes,
        getLikeCount,
        hasUserLiked,
        toggleLike,
        
        // Follows
        getFollows,
        saveFollows,
        isFollowing,
        toggleFollow,
        getFollowerCount,
        getFollowingCount,
        getFollowers,
        getFollowing,
        
        // Saved Posts
        getSavedPosts,
        saveSavedPosts,
        hasUserSaved,
        toggleSavePost,
        getUserSavedPosts,
        
        // Notifications
        getNotifications,
        saveNotifications,
        getUserNotifications,
        createNotification,
        markNotificationRead,
        getUnreadNotificationCount,
        
        // Utilities
        generateId,
        clearAllData,
        formatTimeAgo
    };
})();
