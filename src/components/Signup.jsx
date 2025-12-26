import React, { useState } from "react";
import { authAPI } from "../utils/api";
import "../styles/auth.css";

/**
 * Signup Component
 * - Handles user registration
 * - Validates input fields
 * - Handles file upload for profile picture
 */
const Signup = ({ onSignupSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    password: "",
    password2: "",
    profile_picture: null,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  /**
   * Handle input field changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Handle file input for profile picture
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profile_picture: "Please upload a valid image file (JPG, PNG, GIF)",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profile_picture: "File size must be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_picture: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const age =
        new Date().getFullYear() -
        new Date(formData.date_of_birth).getFullYear();
      if (age < 13) {
        newErrors.date_of_birth = "Must be at least 13 years old";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and numbers";
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const response = await authAPI.signup(formData);
      setSuccessMessage("Signup successful! Redirecting to login...");

      // Clear form
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        password: "",
        password2: "",
        profile_picture: null,
      });
      setPreviewImage(null);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }, 2000);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        // Handle backend validation errors
        setErrors(errorData.errors);
      } else if (errorData?.message) {
        setErrors({ submit: errorData.message });
      } else {
        setErrors({
          submit: "An error occurred during signup. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">✓ {successMessage}</div>
        )}

        {/* General Error */}
        {errors.submit && (
          <div className="error-message">✗ {errors.submit}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="John"
              className={errors.first_name ? "input-error" : ""}
            />
            {errors.first_name && (
              <span className="error-text">{errors.first_name}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="Doe"
              className={errors.last_name ? "input-error" : ""}
            />
            {errors.last_name && (
              <span className="error-text">{errors.last_name}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth *</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className={errors.date_of_birth ? "input-error" : ""}
            />
            {errors.date_of_birth && (
              <span className="error-text">{errors.date_of_birth}</span>
            )}
          </div>

          {/* Profile Picture */}
          <div className="form-group">
            <label htmlFor="profile_picture">Profile Picture</label>
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              onChange={handleFileChange}
              accept="image/*"
              className={errors.profile_picture ? "input-error" : ""}
            />
            {errors.profile_picture && (
              <span className="error-text">{errors.profile_picture}</span>
            )}
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="password2">Confirm Password *</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className={errors.password2 ? "input-error" : ""}
            />
            {errors.password2 && (
              <span className="error-text">{errors.password2}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
