import React, { useState } from 'react';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import '../styles/Explore.css';

const db = getFirestore();

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState({
        users: [],
        posts: [],
        hashtags: [],
    });
    const [loading, setLoading] = useState(false);

    // Load users from Firestore
    const loadUsers = async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    // Load posts from Firestore
    const loadPosts = async () => {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    // Handle the search functionality
    const handleSearch = async () => {
        setLoading(true);

        const users = await loadUsers();
        const posts = await loadPosts();

        const isHashtagSearch = searchQuery.startsWith('#');
        const isUserSearch = !isHashtagSearch && !searchQuery.includes('#');
        const isPostSearch = !isHashtagSearch && !isUserSearch;

        if (searchQuery.trim() === '') {
            setResults({
                users: [],
                posts: [],
                hashtags: [],
            });
            setLoading(false);
            return;
        }

        if (isHashtagSearch) {
            const hashtag = searchQuery.substring(1).toLowerCase(); 
            const filteredPosts = posts.filter(post =>
                post.posts_hashtags && post.posts_hashtags.some(h => h.toLowerCase() === hashtag)
            );

            const filteredHashtags = filteredPosts.flatMap(post => post.posts_hashtags)
                .filter((value, index, self) => self.indexOf(value) === index);

            setResults({
                users: [],
                posts: filteredPosts,
                hashtags: filteredHashtags,
            });
        } else if (isUserSearch) {
            const filteredUsers = users.filter(user =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setResults({
                users: filteredUsers,
                posts: [],
                hashtags: [],
            });
        } else if (isPostSearch) {
            const searchQueryLower = searchQuery.toLowerCase();

            const filteredPosts = posts.filter(post =>
                post.posts_bio && post.posts_bio.toLowerCase().includes(searchQueryLower)
            );

            setResults({
                users: [],
                posts: filteredPosts,
                hashtags: [],
            });
        }

        setLoading(false);
    };

    return (
        <div className="explore-container">
            <h1>Ontdek</h1>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Zoek naar gebruikers, hashtags, of berichten..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Bezig met zoeken...' : 'Zoeken'}
                </button>
            </div>

            <div className="search-results">
                <h3>Hashtags</h3>
                {results.hashtags.length > 0 ? (
                    results.hashtags.map((hashtag, index) => (
                        <div key={index} className="result-item">
                            <p><strong>#{hashtag}</strong></p>
                        </div>
                    ))
                ) : (
                    <p>Geen hashtags gevonden</p>
                )}

                <h3>Berichten</h3>
                {results.posts.length > 0 ? (
                    results.posts.map(post => (
                        <div key={post.id} className="result-item">
                            <p><strong>{post.posts_userId}:</strong> {post.posts_bio}</p>
                            {post.hashtags && post.hashtags.map((hashtag, index) => (
                                <span key={index}>#{hashtag} </span>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>Geen berichten gevonden</p>
                )}

                <h3>Gebruikers</h3>
                {results.users.length > 0 ? (
                    results.users.map(user => (
                        <div key={user.id} className="result-item">
                            <p><strong>{user.username}</strong></p>
                        </div>
                    ))
                ) : (
                    <p>Geen gebruikers gevonden</p>
                )}
            </div>
        </div>
    );
};

export default Explore;
