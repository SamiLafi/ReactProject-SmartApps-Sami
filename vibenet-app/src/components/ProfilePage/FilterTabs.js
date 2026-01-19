import React from 'react';

const FilterTabs = ({ selectedTab, setSelectedTab }) => {
    return (
        <div className="filter-tabs">
            <button
                className={`tab ${selectedTab === 'vibe' ? 'active' : ''}`}
                onClick={() => setSelectedTab("vibe")}
            >
                Vibes
            </button>
            <button
                className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTab("all")}
            >
                All
            </button>
            <button
                className={`tab ${selectedTab === 'post' ? 'active' : ''}`}
                onClick={() => setSelectedTab("post")}
            >
                Posts
            </button>
        </div>
    );
};

export default FilterTabs;
