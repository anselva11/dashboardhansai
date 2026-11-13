import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  ChevronDown,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Vessel Certificate Expiry', desc: 'MT HANSAI LIQUIDUS 2 IOPP certificate expiring in 18 days', time: '10m ago', urgent: true },
    { id: 2, title: 'Overdue Container Rental', desc: 'RNT-2026-005 has reached 12 days past scheduled return', time: '1h ago', urgent: true },
    { id: 3, title: 'Vessel Schedule Update', desc: 'TB HANSAI PIONEER 01 departed Port of Tanjung Priok', time: '3h ago', urgent: false },
    { id: 4, title: 'Customer Payment Received', desc: 'PT Indofood Sukses Makmur Tbk settled $42,500 via TT', time: '5h ago', urgent: false },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/operations/shipments?search=${encodeURIComponent(searchQuery)}`);
  };

  // Breadcrumb generator
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length === 0
    ? 'Executive Dashboard'
    : pathParts.map((p) => p.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())).join(' / ');

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <p className="text-[11px] font-semibold uppercase text-ocean-600 tracking-wider">HANSAI Shipping ERP</p>
          <h2 className="text-sm font-bold text-navy-900 leading-tight">{breadcrumb}</h2>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleSearch} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search B/L, Vessel, Container, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-600 transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right: Actions, Currency, Demo Reset, Profile */}
      <div className="flex items-center gap-3">
        {/* Currency preview badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium text-slate-600">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>USD/IDR:</span>
          <span className="font-bold text-slate-900 font-mono">16,250</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Alerts & Notifications</h4>
                <span className="text-[10px] font-semibold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full">4 New</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2">
                      {n.urgent ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-ocean-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {n.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-navy-900 to-ocean-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'HS'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-ocean-50 text-ocean-700 font-semibold border border-ocean-200">
                  {user?.role || 'Super Admin'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <p className="text-[10px] text-ocean-600 font-medium mt-0.5">{user?.department || 'Executive'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/system/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/system/users');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left font-medium"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  Roles & Permissions
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-semibold"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}

