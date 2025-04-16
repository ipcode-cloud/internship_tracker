import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Layout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  // Close sidebar when the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 md:max-h-full w-64 overflow-hidden bg-white shadow-md transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50 lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <div className="p-4 border-b">
          <span className="text-xl font-bold text-gray-800">
            Internship Tracker
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`block px-4 py-2 rounded-md text-sm font-medium ${
              isActive("/dashboard")
                ? "bg-indigo-500 text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            Dashboard
          </Link>
          {(user?.role === "admin" || user?.role === "mentor") && (
            <Link
              to="/interns"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive("/interns")
                  ? "bg-indigo-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Interns
            </Link>
          )}
          {user?.role !== "intern" && (
            <Link
              to="/attendance"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive("/attendance")
                  ? "bg-indigo-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Attendance
            </Link>
          )}
          <Link
            to="/profile"
            className={`block px-4 py-2 rounded-md text-sm font-medium ${
              isActive("/profile")
                ? "bg-indigo-500 text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            My Profile
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/settings"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive("/settings")
                  ? "bg-indigo-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Settings
            </Link>
          )}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 pl-4 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 px-4 py-2 text-sm font-bold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 lg:hidden"
        >
          {sidebarOpen ? "X" : "≡"}
        </button>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
