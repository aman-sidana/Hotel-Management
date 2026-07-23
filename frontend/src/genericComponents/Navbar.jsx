import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, changeTheme } = UseTheme();

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo & Tagline */}
        <div
          onClick={() => navigate("/userdashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            🏨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 dark:from-white dark:via-sky-300 dark:to-blue-400 bg-clip-text text-transparent">
                StayEasy
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                Hotels
              </span>
            </div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${isActive("/userdashboard") || isActive("/")
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            🏨 Explore Hotels
          </button>

          {currentUser && (
            <button
              onClick={() => navigate("/userbookings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${isActive("/userbookings")
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              🧳 My Bookings
            </button>
          )}
        </nav>

        {/* Right Section: Theme Toggle & User Info / Actions */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={changeTheme}
            title="Toggle Light/Dark Theme"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg
              bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200
              border border-slate-200 dark:border-slate-700
              hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {(currentUser.name || currentUser.username || "U")[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">
                    {currentUser.name || currentUser.username || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                    {currentUser.role || "Guest"}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  localStorage.removeItem("currentuser");
                  navigate("/");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold
                  bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400
                  border border-red-200 dark:border-red-500/30
                  hover:bg-red-500 hover:text-white hover:border-red-500
                  transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white
                bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all duration-200"
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
