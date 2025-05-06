import { useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../UploadPage.css";

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState([]);
  const [showGalleryButton, setShowGalleryButton] = useState(false); // NEW
  const { user } = useAuth();
  const navigate = useNavigate(); // NEW

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setShowGalleryButton(false); // reset
    if (file) {
      setPreviewURL(URL.createObjectURL(file));
    } else {
      setPreviewURL(null);
    }
    setTags([]);
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
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        try {
          const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: downloadURL }),
          });

          const result = await response.json();
          const detectedTags = result.labels || [];
          setTags(detectedTags);

          await addDoc(collection(db, "images"), {
            userId: user.uid,
            name: image.name,
            url: downloadURL,
            tags: detectedTags,
            createdAt: serverTimestamp(),
            deleted: false
          });

          //alert("Uploaded and tagged successfully!");
          setImage(null);
          setPreviewURL(null);
          setProgress(0);
          setShowGalleryButton(true); // ✅ show "View in Gallery"
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

        <div
  className="dropzone"
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setTags([]);
    }
  }}
  onClick={() => document.getElementById("fileInput").click()}
>
  {previewURL ? (
    <img src={previewURL} alt="Preview" className="preview-image" />
  ) : (
    <p>📁 Drag & drop an image here, or click to select</p>
  )}
  <input
    id="fileInput"
    type="file"
    hidden
    onChange={handleImageChange}
    accept="image/*"
  />
</div>


        <button className="upload-btn" disabled={!image || uploading} onClick={handleUpload}>
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
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

        {/* ✅ View in Gallery Button */}
        {showGalleryButton && (
          <button className="view-gallery-btn" onClick={() => navigate("/gallery")}>
            View in Gallery
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
