import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { token, user, logout } = useAuth();

  const getLinkClass = ({ isActive }) => {
    const baseClass = "text-sm font-medium transition-colors hover:text-primary";
    return isActive ? `${baseClass} text-primary` : `${baseClass} text-neutral-500`;
  };


  let homePath = '/'; // Default for logged-out users
  if (user) {
    homePath = ['admin', 'super_admin'].includes(user.role) 
      ? '/admin/dashboard' 
      : '/dashboard';
  }
  // --------------------

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          
          {/* --- UPDATE THIS LINK --- */}
          <NavLink to={homePath} className="flex items-center gap-2 text-lg font-bold text-primary">
            <span>💳 Credit Parser</span>
          </NavLink>

          {user && <span className="text-sm text-neutral-500">Welcome, {user.sub}!</span>}
        </div>
        
        <nav className="flex items-center gap-6">
          {token && user ? (
            <>
              {['admin', 'super_admin'].includes(user.role) ? (
                <>
                  <NavLink to="/admin/dashboard" className={getLinkClass}>Admin Dashboard</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className={getLinkClass}>Dashboard</NavLink>
                  <NavLink to="/history" className={getLinkClass}>History</NavLink>
                </>
              )}
              <button onClick={logout} className="text-sm font-medium text-danger hover:text-danger-hover">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>User Login</NavLink>
              <NavLink to="/admin/login" className={getLinkClass}>Admin Login</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}