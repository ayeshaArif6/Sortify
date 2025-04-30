// components/PrivateRoute.jsx
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
