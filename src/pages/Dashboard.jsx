import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().username);
        }
      }
    };

    fetchUsername();
  }, [user]);

  const options = [
    {
      label: "Upload Image",
      icon: "📤",
      color: "#ff6384",
      action: () => navigate("/upload"),
    },
    {
      label: "View Gallery",
      icon: "🖼️",
      color: "#36a2eb",
      action: () => navigate("/gallery"),
    },
    {
      label: "Profile",
      icon: "👤",
      color: "#4bc0c0",
      action: () => navigate("/profile"),
    },
    {
      label: "Settings",
      icon: "⚙️",
      color: "#f9a825",
      action: () => navigate("/settings"),
    },
    {
      label: "Logout",
      icon: "🚪",
      color: "#ef5350",
      action: () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
      },
    },
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome, {username || "User"} 👋</h2>

      <div className="dashboard-grid">
        {options.map((opt) => (
          <div
            key={opt.label}
            className="dashboard-card"
            style={{ backgroundColor: opt.color }}
            onClick={opt.action}
          >
            <div className="dashboard-icon">{opt.icon}</div>
            <div className="dashboard-label">{opt.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
