import React, { createContext, useState, useContext } from 'react';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [allPosts, setAllPosts] = useState([]);

  const addPosts = (newPosts) => {
    setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
  };

  const filterPosts = (filter) => {
    if (filter === 'mostLikes') {
      return [...allPosts].sort((a, b) => b.likes - a.likes);
    } else {
      return [...allPosts].sort((a, b) => {
        const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return bDate - aDate;
      });
    }
  };

  return (
    <PostContext.Provider value={{ allPosts, addPosts, filterPosts }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);
