import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { FiMenu } from "react-icons/fi"; // install react-icons if not already

import "./Layout.css";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <span className="logo"> {collapsed ? "" : "Sortify"}</span>
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            <FiMenu />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" title="Dashboard">📊 {!collapsed && "Dashboard"}</NavLink>
          <NavLink to="/upload" title="Upload">📤 {!collapsed && "Upload"}</NavLink>
          <NavLink to="/gallery" title="Gallery">🖼️ {!collapsed && "Gallery"}</NavLink>
          <NavLink to="/profile" title="Profile">👤 {!collapsed && "Profile"}</NavLink>
          <NavLink to="/settings" title="Settings">⚙️ {!collapsed && "Settings"}</NavLink>
          <NavLink to="/logout" title="Logout">🚪 {!collapsed && "Logout"}</NavLink>
        </nav>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
