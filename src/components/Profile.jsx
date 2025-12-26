import React, { useState, useEffect } from "react";
import { authAPI } from "../utils/api";
import PostCard from "./PostCard";
import "../styles/dashboard.css";

/**
 * Profile Component
 * - Displays user profile information
 * - Allows editing profile fields
 * - Shows user's posts
 */
const Profile = ({
  user,
  posts,
  onPostDelete,
  onPostLike,
  onPostDislike,
  onPostsUpdate,
}) => {
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    date_of_birth: user?.date_of_birth || "",
    bio: user?.bio || "",
    profile_picture: null,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    `http://127.0.0.1:8000${user.profile_picture}` || null
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [hoveredField, setHoveredField] = useState(null);

  /**
   * Handle input changes in edit mode
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle profile picture change
   */
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setErrors({ profile_picture: "Invalid file type" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ profile_picture: "File too large (max 5MB)" });
        return;
      }

      setEditData((prev) => ({
        ...prev,
        profile_picture: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Save profile changes
   */
  const handleSaveProfile = async () => {
    setLoading(true);
    setErrors({});

    try {
      await authAPI.updateProfile(editData);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      // Refresh profile data
      const response = await authAPI.getProfile();
      if (onPostsUpdate) {
        onPostsUpdate(response.data.user);
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        setErrors({ submit: "Failed to update profile" });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      date_of_birth: user?.date_of_birth || "",
      bio: user?.bio || "",
      profile_picture: null,
    });
    setPreviewImage(user?.profile_picture || null);
    setErrors({});
  };

  return (
    <div className="profile-container">
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">✓ {successMessage}</div>
      )}

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-header">
          {/* Profile Picture */}
          <div className="profile-picture-container">
            <img
              src={
                previewImage || "https://via.placeholder.com/150?text=No+Photo"
              }
              alt="Profile"
              className="profile-picture"
            />
            {isEditing && (
              <label className="edit-picture-label">
                📷 Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-fields">
                <div className="form-group">
                  <input
                    type="text"
                    name="first_name"
                    value={editData.first_name}
                    onChange={handleInputChange}
                    placeholder="First Name"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="last_name"
                    value={editData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                  />
                </div>
              </div>
            ) : (
              <h1>
                {user?.first_name} {user?.last_name}
                <span
                  className="edit-icon"
                  onClick={() => setIsEditing(true)}
                  title="Edit profile"
                >
                  ✏️
                </span>
              </h1>
            )}
            {/* <p className="email">{user?.email}</p> */}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="profile-details">
          {/* Date of Birth */}
          <div
            className="detail-item"
            onMouseEnter={() => setHoveredField("dob")}
            onMouseLeave={() => setHoveredField(null)}
          >
            <strong>Date of Birth:</strong>
            {isEditing ? (
              <input
                type="date"
                name="date_of_birth"
                value={editData.date_of_birth}
                onChange={handleInputChange}
              />
            ) : (
              <span>
                {user?.date_of_birth || "Not provided"}
                {hoveredField === "dob" && !isEditing && (
                  <span className="hover-edit">✏️</span>
                )}
              </span>
            )}
          </div>

          {/* Bio */}
          <div
            className="detail-item"
            onMouseEnter={() => setHoveredField("bio")}
            onMouseLeave={() => setHoveredField(null)}
          >
            <strong>Bio:</strong>
            {isEditing ? (
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows="3"
              />
            ) : (
              <span>
                {user?.bio || "No bio added"}
                {hoveredField === "bio" && !isEditing && (
                  <span className="hover-edit">✏️</span>
                )}
              </span>
            )}
          </div>

          {/* Member Since */}
          <div className="detail-item">
            <strong>Member Since:</strong>
            <span>{new Date(user?.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        {errors.profile_picture && (
          <div className="error-message">{errors.profile_picture}</div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn btn-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* User's Posts Section */}
      <div className="posts-section">
        <h2>My Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onDelete={onPostDelete}
                onLike={onPostLike}
                onDislike={onPostDislike}
              />
            ))}
          </div>
        ) : (
          <p className="no-posts">No posts yet. Create your first post!</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
