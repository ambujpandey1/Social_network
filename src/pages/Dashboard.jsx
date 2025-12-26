import React, { useState, useEffect } from "react";
import { postsAPI } from "../utils/api";
import Profile from "../components/Profile";
import PostCard from "../components/PostCard";
import "../styles/dashboard.css";

/**
 * Dashboard Component
 * - Main page after login
 * - Displays all posts and user profile
 * - Handles post creation, deletion, like/dislike
 */
const Dashboard = ({ user, onLogout }) => {
  // Posts state
  const [posts, setPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Post creation state
  const [newPost, setNewPost] = useState({
    description: "",
    image: null,
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createError, setCreateError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  /**
   * Fetch all posts on component mount
   */
  useEffect(() => {
    fetchPosts();
  }, []);

  /**
   * Fetch posts from backend
   */
  const fetchPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await postsAPI.getPosts();
      setPosts(response.data.posts);

      // Filter user's posts
      const filtered = response.data.posts.filter(
        (post) => post.author === user.id
      );
      setUserPosts(filtered);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle post description change
   */
  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle post image selection
   */
  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setCreateError("Invalid image format. Use JPG, PNG, or GIF.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setCreateError("Image must be less than 10MB");
        return;
      }

      setNewPost((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Create a new post
   */
  const handleCreatePost = async (e) => {
    e.preventDefault();

    // Validate
    if (!newPost.description.trim()) {
      setCreateError("Post description is required");
      return;
    }

    setIsCreatingPost(true);
    setCreateError("");

    try {
      const response = await postsAPI.createPost(newPost);

      // Add new post to the list
      setPosts([response.data.post, ...posts]);

      // If it's user's post, add to userPosts
      if (response.data.post.author === user.id) {
        setUserPosts([response.data.post, ...userPosts]);
      }

      // Reset form
      setNewPost({
        description: "",
        image: null,
      });
      setPreviewImage(null);

      // Clear the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setCreateError(Object.values(errorData.errors)[0]);
      } else {
        setCreateError("Failed to create post. Please try again.");
      }
    } finally {
      setIsCreatingPost(false);
    }
  };

  /**
   * Delete a post
   */
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postsAPI.deletePost(postId);

        // Remove from posts list
        setPosts(posts.filter((p) => p.id !== postId));

        // Remove from user posts
        setUserPosts(userPosts.filter((p) => p.id !== postId));
      } catch (err) {
        alert("Failed to delete post");
      }
    }
  };

  /**
   * Handle post like
   */
  const handlePostLike = async (postId, shouldLike) => {
    try {
      if (shouldLike) {
        await postsAPI.likePost(postId);
      } else {
        await postsAPI.removeLike(postId);
      }
      // Local state is updated in PostCard component
    } catch (err) {
      alert("Failed to update like");
    }
  };

  /**
   * Handle post dislike
   */
  const handlePostDislike = async (postId, shouldDislike) => {
    try {
      if (shouldDislike) {
        await postsAPI.dislikePost(postId);
      } else {
        await postsAPI.removeDislike(postId);
      }
      // Local state is updated in PostCard component
    } catch (err) {
      alert("Failed to update dislike");
    }
  };

  /**
   * Handle profile update
   */
  const handleProfileUpdate = (updatedUser) => {
    // Update user data if needed
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Social Network</h1>
        <button className="btn btn-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </header>

      <div className="dashboard-container">
        {/* Sidebar - Profile */}
        <aside className="sidebar">
          <Profile
            user={user}
            posts={userPosts}
            onPostDelete={handleDeletePost}
            onPostLike={handlePostLike}
            onPostDislike={handlePostDislike}
            onPostsUpdate={handleProfileUpdate}
          />
        </aside>

        {/* Main Content - Feed */}
        <main className="main-content">
          {/* Create Post Form */}
          <div className="create-post-card">
            <h2>Create a Post</h2>

            {createError && <div className="error-message">{createError}</div>}

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <textarea
                  name="description"
                  value={newPost.description}
                  onChange={handlePostInputChange}
                  placeholder="What's on your mind?"
                  rows="4"
                  maxLength="1000"
                />
                <small>{newPost.description.length}/1000 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="post-image">Add Image</label>
                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageChange}
                />

                {previewImage && (
                  <div className="post-image-preview">
                    <img src={previewImage} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setPreviewImage(null);
                        setNewPost((prev) => ({
                          ...prev,
                          image: null,
                        }));
                        const fileInput =
                          document.querySelector('input[type="file"]');
                        if (fileInput) {
                          fileInput.value = "";
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreatingPost}
              >
                {isCreatingPost ? "Posting..." : "Post"}
              </button>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            <h2>Posts Feed</h2>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <p className="loading">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="no-posts">No posts yet. Be the first to post!</p>
            ) : (
              <div className="posts-list">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    onDelete={handleDeletePost}
                    onLike={handlePostLike}
                    onDislike={handlePostDislike}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
