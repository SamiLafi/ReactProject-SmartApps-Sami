import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/Home.css';
import '../styles/Global.css';

import Sidebar from '../components/HomePage/Sidebar';
import PostInput from '../components/HomePage/PostInput';
import PostList from '../components/HomePage/PostList';
import { handleLikePost } from '../functions/postActions';
import { fetchPosts } from '../services/postService';
import { usePostFetch } from '../contexts/PostFetchProvider';

var limitNumber = 0;

const Home = () => {
  const { posts, setPosts, hasFetchedPosts, setHasFetchedPosts } = usePostFetch();
  const [filter, setFilter] = useState("newest");
  //const [selectedTab, setSelectedTab] = useState("foryou");
  const [hasMorePosts, setHasMorePosts] = useState(true); // Indicates if there are more posts to fetch
  const [hasReachedBottom, setHasReachedBottom] = useState(false); // Track if the bottom has been reached

  const navigate = useNavigate();


  useEffect(() => {
    if (!hasFetchedPosts) {
      console.log("Initial fetch triggered");
      getPosts();
      setHasFetchedPosts(true); // Mark as fetched only once
    }
  }, [hasFetchedPosts, setHasFetchedPosts]);

  useEffect(() => {
    const onscroll = () => {
      const homePageElement = document.querySelector('.home-page');
  
      if (!homePageElement) return; // Check if the element exists
  
      // Check if the user has reached the bottom of the home page
      const atBottom = window.innerHeight + window.scrollY >= homePageElement.scrollHeight;
  
      if (atBottom && !hasReachedBottom) {
        if (hasMorePosts) {
          getPosts();
        }
        setHasReachedBottom(true); // Set the flag to true after reaching the bottom
      } else if (!atBottom && hasReachedBottom) {
        setHasReachedBottom(false); // Reset the flag when the user scrolls up
      }
    };
  
    window.addEventListener("scroll", onscroll);
  
    return () => {
      window.removeEventListener("scroll", onscroll);
    };
  }, [hasReachedBottom]);
  

  const getPosts = async () => {
    limitNumber = limitNumber + 10;
    let res = await fetchPosts(limitNumber);
    if (res.succes) {
      setPosts(res.data);
    }

    if (res.data.length < limitNumber) {
      setHasMorePosts(false);
    }else{
      setHasMorePosts(true);
    }

    console.log("got posts result: ", res);
    setHasReachedBottom(false); // Reset the bottom reached flag after fetching new posts
  };

  const handleCommentClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleHeaderClick = (userId) => {
    navigate(`/profile/${userId}`); // Navigate to user's profile
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]); // Voeg de nieuwe post bovenaan toe
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="main-container">

          {/* Horizontal Sidebar */}
          <Sidebar />

          <PostInput onPostCreated={handlePostCreated}/>

          <div className="filter-container">
              <select 
                id="filter-select" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="filter-select"
              >
                <option value="newest">Newest</option>
                <option value="mostLikes">Most Likes</option>
              </select>
          </div>

          {/* <div className="filter-tabs">
            <button 
              className={`tab ${selectedTab === 'foryou' ? 'active' : ''}`}
              onClick={() => setSelectedTab("foryou")}
            >
              For You
            </button>
            <button 
              className={`tab ${selectedTab === 'following' ? 'active' : ''}`}
              onClick={() => setSelectedTab("following")}
            >
              Following
            </button>
          </div> */}
          <PostList 
            posts={posts}
            onLike={(postId) => handleLikePost(postId, setPosts)}
            onComment={handleCommentClick}
            onHeaderClick={handleHeaderClick}
            filter={filter} // Pass the filter state here
          />

        </div>
      </div>
    </div>
  );
};

export default Home;
