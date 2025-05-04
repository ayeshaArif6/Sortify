import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth(); // ✅ get `loading` here

  if (loading) {
    return <p>Loading...</p>; // or a spinner component
  }

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
