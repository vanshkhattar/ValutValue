import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm px-4 py-3 md:px-10 sticky top-0 z-50">
      <div className="flex items-center justify-center h-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ValueVault
        </h1>
      </div>
    </header>
  );
};

export default Header;