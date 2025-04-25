import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth(); // current Firebase Auth user
  console.log("UID:", user?.uid);
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h2 className="dashboard-title">Welcome to Sortify!</h2>
        <h3 className="dashboard-heading">Your smart gallery awaits!</h3>

        <button
          className="dashboard-btn"
          onClick={() => navigate("/upload")}
        >
           Upload Image
        </button>

        <button className="dashboard-btn" onClick={() => navigate("/gallery")}>
   View Gallery
</button>

      </div>
    </div>
  );

};

export default Dashboard;
