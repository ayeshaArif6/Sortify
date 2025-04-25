import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute"; 
import UploadPage from "./pages/UploadPage";

import ProfilePage from "./pages/ProfilePage";
import GalleryPage from "./pages/GalleryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
  path="/upload"
  element={
    <PrivateRoute>
      <UploadPage />
    </PrivateRoute>
  }
      />
      <Route
  path="/gallery"
  element={
    <PrivateRoute>
      <GalleryPage />
    </PrivateRoute>
  }
/>
<Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;

