
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIssue,
  uploadIssueImage,
} from "../api/issues";

export default function CreateIssueForm() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Infrastructure",
    priority: "MEDIUM",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");

  // Update normal form fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Select and preview an image.
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove selected image.
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image first, then create the issue.
  const mutation = useMutation({
    mutationFn: async ({ issueData, imageFile }) => {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in before submitting an issue.");
      }

      let imageUrl = null;
let imagePublicId = null;

if (imageFile) {
  const uploadResponse = await uploadIssueImage(
    imageFile,
    token
  );

  imageUrl = uploadResponse.image.url;
  imagePublicId = uploadResponse.image.publicId;
}
      
      return createIssue(
        {
          ...issueData,
          imageUrl,
        },
        token
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issues"],
      });

      setFormData({
        title: "",
        description: "",
        category: "Infrastructure",
        priority: "MEDIUM",
      });

      setImageFile(null);
      setImagePreview(null);
      setImageError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  // Submit issue.
  const handleSubmit = (event) => {
    event.preventDefault();

    mutation.mutate({
      issueData: formData,
      imageFile,
    });
  };

  return (
    <section className="create-issue">
      <h2>Report a campus issue</h2>
      <p>
        Tell us what's wrong so the campus team can take action.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Issue title</label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Broken classroom projector"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the problem and where it occurred..."
          required
          rows={4}
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="Infrastructure">Infrastructure</option>
          <option value="Cleanliness">Cleanliness</option>
          <option value="Electrical">Electrical</option>
          <option value="Internet">Internet</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Image upload section */}
        <label htmlFor="issueImage">
          Upload issue image (Optional)
        </label>

        <input
          ref={fileInputRef}
          id="issueImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {imageError && (
          <p role="alert">{imageError}</p>
        )}

        {imagePreview && (
          <div className="image-preview">
            <p>Image preview:</p>

            <img
              src={imagePreview}
              alt="Selected issue"
              style={{
                width: "200px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            <button
              type="button"
              onClick={removeImage}
            >
              Remove Image
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? imageFile
              ? "Uploading image and submitting..."
              : "Submitting..."
            : "Submit Issue"}
        </button>

        {mutation.isSuccess && (
          <p role="status">
            Issue submitted successfully!
          </p>
        )}

        {mutation.isError && (
          <p role="alert">
            {mutation.error.message ||
              "Could not submit the issue."}
          </p>
        )}
      </form>
    </section>
  );
}
