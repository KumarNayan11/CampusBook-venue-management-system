import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64 transition-all duration-300">
        <Navbar />
        <main className="flex-1 w-full px-10 py-10 max-w-7xl mx-auto animate-fade-in transition-all">
          {children}
        </main>
        
        <footer className="mt-auto px-10 py-6 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <span>&copy; 2026 CampusBook Analytics & Management</span>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
              <a href="#" className="hover:text-blue-600 transition-colors">API Status</a>
              <a
                href="https://github.com/rashijain2025/CampusBook"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 opacity-80 hover:opacity-100 hover:text-blue-600 transition-colors"
                title="View GitHub Repository"
              >
                <GithubIcon />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
