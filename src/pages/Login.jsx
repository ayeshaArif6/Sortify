import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { loginWithGoogle } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError("Failed to login. Check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("dashboard");

    } catch (error){
      setError("Unable to log in with Google.");
    }
  }

  return (
    <div className="login-container">
      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="splash-header">
          <img src="/logo.png" alt="Sortify logo" className="logo" />
          <h1>
            Welcome to <span className="brand">Sortify</span>
          </h1>
          <p>Your smart space to upload, sort, and simplify your visual life.</p>
        </div>

        <h2 className="login-title">Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Sign In</button>
          <button className="google-button" onClick={handleGoogleLogin}>
               <img src="/google-icon.png" alt="Google" className="google-icon" />
                 Sign in with Google
          </button>

        </form>
        <p className="signup-text">
          Don't have an account? <a href="/register">Sign up here</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
