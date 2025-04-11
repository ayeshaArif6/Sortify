import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth(); // current Firebase Auth user
  const [username, setUsername] = useState("");

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
      <header className="dashboard-title">
      Welcome {username} !
      </header>
    </div>
  );
};

export default Dashboard;
