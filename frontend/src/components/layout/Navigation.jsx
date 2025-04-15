import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navigation = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavLinks = () => {
    const links = [];

    if (user?.role === 'admin') {
      links.push(
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/interns', label: 'Interns' },
        { path: '/mentors', label: 'Mentors' },
        { path: '/settings', label: 'Settings' },
        { path: '/profile', label: 'My Profile' }
      );
    } else if (user?.role === 'mentor') {
      links.push(
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'My Profile' }
      );
    } else if (user?.role === 'intern') {
      links.push(
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/profile', label: 'My Profile' }
      );
    }

    return links;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Intern Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 