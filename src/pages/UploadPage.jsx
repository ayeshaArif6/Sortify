import { useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../UploadPage.css";

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreviewURL(URL.createObjectURL(file));
    } else {
      setPreviewURL(null);
    }
    setTags([]);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!image || !user) return;
    setUploading(true);

    const storageRef = ref(storage, `images/${user.uid}/${Date.now()}_${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(pct.toFixed(0));
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Upload failed: " + error.message);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Call AI API to analyze image
          const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: downloadURL }),
          });

          const result = await response.json();
          const detectedTags = result.labels || [];
          setTags(detectedTags);

          // Save to Firestore
          await addDoc(collection(db, "images"), {
            userId: user.uid,
            name: image.name,
            url: downloadURL,
            tags: detectedTags,
            createdAt: new Date(),
          });

          alert("Uploaded and tagged successfully!");
          setUploadSuccess(true);
          setImage(null);
          setPreviewURL(null);
          setProgress(0);
        } catch (err) {
          console.error("AI tagging error:", err);
          alert("Tagging failed: " + err.message);
        } finally {
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="upload-page-container">
      <div className="upload-card">
        <h2 className="upload-title">📤 Upload an Image</h2>
        <p className="upload-subtitle">Choose a file to add to your gallery</p>

        <input type="file" className="upload-input" onChange={handleImageChange} />

        {previewURL && (
          <div className="preview-section">
            <img src={previewURL} alt="Preview" className="preview-image" />
          </div>
        )}

        <button
          className="upload-btn"
          disabled={!image || uploading}
          onClick={handleUpload}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, transition: "width 0.3s ease" }}
            />
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="tag-result">
            <p>AI Tags Detected:</p>
            <ul>
              {tags.map((tag, idx) => (
                <li key={idx}>✅ {tag}</li>
              ))}
            </ul>
          </div>
        )}

        {uploadSuccess && (
          <button className="upload-btn" onClick={() => navigate("/gallery")}>
            View in Gallery
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
