import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { storage, auth } from "../firebase"; 
import "../ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.username || "");
        setOriginalName(data.username || "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { username: displayName });
      setOriginalName(displayName);
      setEditing(false);
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    console.log("Uploading avatar:", file.name);
  
    setUploading(true);
  
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed:", error);
          alert("Upload failed: " + error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Uploaded! URL:", downloadURL); // 👈 this should appear
      
          await setDoc(doc(db, "users", user.uid), { photoURL: downloadURL }, { merge: true });
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
      
          setUploading(false);
          window.location.reload();
        }
      );
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setUploading(false);
    }
  };
  
  

  return (
    <div className="profile-container">
      <div className="profile-card">
         {/* 📸 Avatar Upload */}
         <label htmlFor="avatar-upload">
          <img
            src={user?.photoURL || "/avatar.jpg"}
            alt="Profile"
            className="profile-avatar"
            style={{ cursor: "pointer" }}
          />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
        {uploading && <p>Uploading profile picture...</p>}


  
        <h2>👤 User Profile</h2>
        <p className="profile-email"><strong>Email:</strong> {user?.email}</p>
  
        <label><strong>Display Name:</strong></label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={!editing}
        />
  
        {!editing ? (
          <button className="profile-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
        ) : (
          <>
            <button className="profile-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "💾 Save"}
            </button>
            <button className="profile-btn logout" onClick={() => {
              setDisplayName(originalName);
              setEditing(false);
            }}>
              ❌ Cancel
            </button>
          </>
        )}
  
        
      </div>
    </div>
  );
  
};

export default ProfilePage;
