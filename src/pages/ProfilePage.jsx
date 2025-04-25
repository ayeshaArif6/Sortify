import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
           src={user?.photoURL || "/avatar.jpg"}
           alt="Profile"
           className="profile-avatar"
        />

  
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
  
        <div style={{ marginTop: "2rem" }}>
          <a
            href="https://myaccount.google.com/"
            target="_blank"
            rel="noreferrer"
            className="profile-btn"
          >
            Manage Google Account 🔐
          </a>
        </div>
      </div>
    </div>
  );
  
};

export default ProfilePage;
