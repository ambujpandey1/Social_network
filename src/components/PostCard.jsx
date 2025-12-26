import React, { useState } from "react";
import "../styles/dashboard.css";

/**
 * PostCard Component
 * - Displays a single post
 * - Handles like/dislike interactions
 * - Shows delete option for post author
 */
const PostCard = ({ post, currentUserId, onDelete, onLike, onDislike }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [isDisliked, setIsDisliked] = useState(post.is_disliked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes_count);

  /**
   * Handle like button click
   */
  const handleLike = () => {
    if (isLiked) {
      // Unlike the post
      onLike(post.id, false);
      setIsLiked(false);
      setLikesCount(likesCount - 1);
    } else {
      // Like the post
      onLike(post.id, true);
      setIsLiked(true);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikesCount(dislikesCount - 1);
      }
      setLikesCount(likesCount + 1);
    }
  };

  /**
   * Handle dislike button click
   */
  const handleDislike = () => {
    if (isDisliked) {
      // Remove dislike
      onDislike(post.id, false);
      setIsDisliked(false);
      setDislikesCount(dislikesCount - 1);
    } else {
      // Dislike the post
      onDislike(post.id, true);
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(likesCount - 1);
      }
      setDislikesCount(dislikesCount + 1);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const isAuthor = currentUserId === post.author;

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-info">
          <img
            src={
              post.author_picture
                ? `http://127.0.0.1:8000${post.author_picture}`
                : "https://via.placeholder.com/50?text=User"
            }
            alt={post.author_name}
            className="author-picture"
          />
          <div className="author-details">
            <h4>{post.author_name}</h4>
            <p className="post-time">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {/* Delete Button (Only for author) */}
        {isAuthor && (
          <button
            className="delete-btn"
            onClick={() => onDelete(post.id)}
            title="Delete this post"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Post Description */}
      <div className="post-content">
        <p>{post.description}</p>

        {/* Post Image */}
        {post.image && (
          <img src={post.image} alt="Post content" className="post-image" />
        )}
      </div>

      {/* Post Footer - Interactions */}
      <div className="post-footer">
        {/* Like Button */}
        <button
          className={`interaction-btn ${isLiked ? "active" : ""}`}
          onClick={handleLike}
          title={isLiked ? "Unlike" : "Like"}
        >
          👍 Like ({likesCount})
        </button>

        {/* Dislike Button */}
        <button
          className={`interaction-btn ${isDisliked ? "active" : ""}`}
          onClick={handleDislike}
          title={isDisliked ? "Remove dislike" : "Dislike"}
        >
          👎 Dislike ({dislikesCount})
        </button>
      </div>
    </div>
  );
};

export default PostCard;
