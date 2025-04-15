import { useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image || !user) return;
  
    setUploading(true);
  
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `images/${user.uid}/${Date.now()}_${image.name}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
  
      // 🔍 Call your AI server
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: downloadURL }),
      });
  
      const result = await response.json();
      const tags = result.labels || [];
  
      // 🔥 Save to Firestore
      await addDoc(collection(db, "images"), {
        userId: user.uid,
        name: image.name,
        url: downloadURL,
        tags: tags,
        createdAt: new Date(),
      });
  
      alert("Uploaded and tagged successfully!");
      setImage(null);
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };
  
  

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={!image || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadPage;
