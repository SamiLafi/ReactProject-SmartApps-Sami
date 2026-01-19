import { getFirestore, collection, orderBy, query, limit, getDocs, where, getCountFromServer } from 'firebase/firestore';


const db = getFirestore();

export const fetchPosts = async (limitNumber = 10) => {
    try {
        const postsCollection = collection(db, 'posts');
        const postsQuery = query(postsCollection, orderBy("createdAt", "desc"), limit(limitNumber));
        const querySnapshot = await getDocs(postsQuery);

        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { succes: true, data: posts };
    } catch (error) {
        console.error("Error fetching posts:", error);
        return { succes: false, data: [] };
    }
};

export const fetchPostsByUserId = async (userId, limitNumber = 10) => {
    try {
        const postsCollection = collection(db, 'posts');
        const postsQuery = query(
            postsCollection,
            where("posts_userId", "==", userId), // Filter posts by userId
            orderBy("createdAt", "desc"),       // Order by creation date
            limit(limitNumber)                  // Limit the number of results
        );

        const querySnapshot = await getDocs(postsQuery);

        const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { success: true, data: userPosts };
    } catch (error) {
        console.error("Error fetching posts by userId:", error);
        return { success: false, data: [] };
    }
};


export const fetchPostCount = async (userId) => {
    const db = getFirestore();
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('posts_userId', '==', userId));

    try {
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error('Error fetching post count:', error);
        return 0;
    }
};

