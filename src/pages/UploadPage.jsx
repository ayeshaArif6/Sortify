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
    if (!image) return;
    setUploading(true);

    const storageRef = ref(storage, `images/${user.uid}/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "images"), {
      url,
      name: image.name,
      userId: user.uid,
      createdAt: new Date()
    });

    setImage(null);
    setUploading(false);
    alert("Upload successful!");
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
