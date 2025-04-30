/* Dashboard.jsx */

import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [images, setImages] = useState([]);
  const [topTag, setTopTag] = useState("None");
  const [uploadStreak, setUploadStreak] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setUsername(userDoc.data().username);

        const q = query(collection(db, "images"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const imgData = snapshot.docs.map(doc => doc.data());
        setImages(imgData);

        // Top tag logic
        const tagMap = {};
        imgData.forEach(img => img.tags?.forEach(tag => tagMap[tag] = (tagMap[tag] || 0) + 1));
        const sortedTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
        setTopTag(sortedTags[0]?.[0] || "None");

        // Streak logic
        const days = [...new Set(imgData.map(img => new Date(img.createdAt.seconds * 1000).toDateString()))];
        days.sort((a, b) => new Date(b) - new Date(a));
        let streak = 0;
        for (let i = 0; i < days.length; i++) {
          const expected = new Date();
          expected.setDate(expected.getDate() - i);
          if (new Date(days[i]).toDateString() === expected.toDateString()) {
            streak++;
          } else break;
        }
        setUploadStreak(streak);
      }
    };

    fetchUser();
  }, [user]);

  return (
    <div className="dashboard-page">
      <div className="user-summary-card">
        <img src={user?.photoURL || "/avatar.jpg"} className="user-avatar" />
        <div>
          <h2>Welcome, {username || "User"} 👋</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="card stat-card">
          <h4>Total Uploads</h4>
          <p>{images.length}</p>
        </div>
        <div className="card stat-card">
          <h4>Top Tag</h4>
          <p>{topTag}</p>
        </div>
        <div className="card stat-card">
          <h4>Upload Streak</h4>
          <p>{uploadStreak} day{uploadStreak !== 1 && "s"} 🔥</p>
        </div>
        {uploadStreak === 0 && (
  <div className="motivation-box">
    <p>🔥 Let’s get back on track — upload something today to start a new streak!</p>
  </div>
)}

      </div>

      <div className="recent-uploads-card card">
        <h3>Recent Uploads</h3>
        <div className="thumbnail-row">
          {images.slice(0, 4).map((img, i) => (
            <img key={i} src={img.url} alt={img.name} className="thumb-img" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
