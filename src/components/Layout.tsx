import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Package, Users, ShoppingCart, Home, Settings, Wallet } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold flex items-center">
            <BarChart3 className="mr-2" />
            Envanter Sistemi
          </h1>
        </div>
        <nav className="mt-8">
          <ul>
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-3 ${isActive('/')}`}
              >
                <Home className="mr-3" size={20} />
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link
                to="/stock"
                className={`flex items-center px-4 py-3 ${isActive('/stock')}`}
              >
                <Package className="mr-3" size={20} />
                Stok
              </Link>
            </li>
            <li>
              <Link
                to="/contacts"
                className={`flex items-center px-4 py-3 ${isActive('/contacts')}`}
              >
                <Users className="mr-3" size={20} />
                Kişiler
              </Link>
            </li>
            <li>
              <Link
                to="/transactions"
                className={`flex items-center px-4 py-3 ${isActive('/transactions')}`}
              >
                <ShoppingCart className="mr-3" size={20} />
                İşlemler
              </Link>
            </li>
            <li>
              <Link
                to="/capital"
                className={`flex items-center px-4 py-3 ${isActive('/capital')}`}
              >
                <Wallet className="mr-3" size={20} />
                Sermaye
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center px-4 py-3 ${isActive('/settings')}`}
              >
                <Settings className="mr-3" size={20} />
                Ayarlar
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;