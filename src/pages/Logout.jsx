import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        localStorage.clear(); // optional: clear local storage
        navigate("/", { replace: true });
      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    };

    performLogout();
  }, [logout, navigate]);

  return <p>Logging out...</p>; // or a spinner
};

export default Logout;

