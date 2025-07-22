import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import {
  FiActivity,
  FiUser,
  FiBox,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { removeUser } from '../provider/slice/user.slice';
import clsx from 'clsx';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = [
    { to: '/orders', label: 'Orders', icon: <FiBox /> },
    { to: '/user', label: 'Users', icon: <FiUser /> },
    { to: '/ml-analyzer', label: 'Spike Detection', icon: <FiActivity /> },
  ];

  const logoutHandler = () => {
    try {
      localStorage.removeItem('token');
      dispatch(removeUser());
      navigate('/login');
    } catch (error: any) {
      console.error('Logout Error:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              <MdOutlineSpaceDashboard className="text-2xl" />
              Dashboard
            </Link>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isActive={location.pathname === item.to}
                />
              ))}
            </div>

            {/* Right: User & Logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 font-bold flex items-center justify-center rounded-full">
                U
              </div>
              <button
                title="Logout"
                className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                onClick={logoutHandler}
              >
                <IoLogOutOutline className="text-2xl" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 text-2xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={clsx(
            'md:hidden transition-all duration-300 overflow-hidden',
            isOpen ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="px-4 py-2 bg-white border-t space-y-2">
            {navItems.map((item) => (
              <MobileNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                isActive={location.pathname === item.to}
                onClick={() => setIsOpen(false)}
              />
            ))}

            {/* Mobile Logout */}
            <button
              title="Logout"
              className="flex items-center gap-2 w-full px-4 py-2 rounded-md font-medium text-red-600 hover:bg-red-100 transition"
              onClick={() => {
                logoutHandler();
                setIsOpen(false);
              }}
            >
              <IoLogOutOutline className="text-xl" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

// Desktop nav link with active highlight
const NavLink = ({
  to,
  icon,
  label,
  isActive,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={clsx(
      'flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors duration-200',
      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
    )}
  >
    {icon}
    {label}
  </Link>
);

// Mobile nav link
const MobileNavLink = ({
  to,
  label,
  isActive,
  onClick,
}: {
  to: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={clsx(
      'block px-4 py-2 rounded-md font-medium transition-colors',
      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
    )}
  >
    {label}
  </Link>
);

export default MainLayout;