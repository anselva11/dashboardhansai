import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  Navigation,
  Calendar,
  Box,
  Repeat,
  ShoppingBag,
  TrendingUp,
  Wrench,
  Anchor,
  FileText,
  DollarSign,
  Receipt,
  Percent,
  Calculator,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Compass,
} from 'lucide-react';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Shipping Management', path: '/operations/shipments', icon: Ship },
      { name: 'Shipment Tracking', path: '/operations/tracking', icon: Navigation },
      { name: 'Vessel Schedule', path: '/operations/vessel-schedule', icon: Calendar },
      { name: 'Container Inventory', path: '/operations/containers', icon: Box },
    ],
  },
  {
    title: 'CONTAINER BUSINESS',
    items: [
      { name: 'Container Rental', path: '/container-business/rentals', icon: Repeat },
      { name: 'Container Purchase', path: '/container-business/purchases', icon: ShoppingBag },
      { name: 'Container Sales', path: '/container-business/sales', icon: TrendingUp },
      { name: 'Maintenance', path: '/container-business/maintenance', icon: Wrench },
    ],
  },
  {
    title: 'VESSEL MANAGEMENT',
    items: [
      { name: 'Vessel Dashboard', path: '/vessels/dashboard', icon: Compass },
      { name: 'Vessel Database & Specs', path: '/vessels/database', icon: Anchor },
      { name: 'Vessel Purchase', path: '/vessels/purchases', icon: ShoppingBag },
      { name: 'Vessel Sales', path: '/vessels/sales', icon: TrendingUp },
      { name: 'Vessel Maintenance', path: '/vessels/maintenance', icon: Wrench },
      { name: 'Operational Expenses', path: '/vessels/expenses', icon: DollarSign },
      { name: 'Vessel Documents', path: '/vessels/documents', icon: FileText },
      { name: 'Vessel Surveys', path: '/vessels/surveys', icon: ShieldCheck },
      { name: 'Vessel Trading Calculator', path: '/vessels/trading-calculator', icon: Calculator },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Financial Overview', path: '/finance/overview', icon: BarChart3 },
      { name: 'Transactions', path: '/finance/transactions', icon: DollarSign },
      { name: 'Profit & Loss', path: '/finance/profit-loss', icon: TrendingUp },
      { name: 'Cashflow', path: '/finance/cashflow', icon: Repeat },
      { name: 'Invoices & Payments', path: '/finance/invoices', icon: Receipt },
      { name: 'Tax & Customs', path: '/finance/tax-customs', icon: Percent },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { name: 'Shipping Calculators', path: '/tools/calculators', icon: Calculator },
    ],
  },
  {
    title: 'RELATIONSHIPS',
    items: [
      { name: 'Customers', path: '/relationships/customers', icon: Users },
      { name: 'Suppliers', path: '/relationships/suppliers', icon: Building2 },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { name: 'Analytics & Reports', path: '/reports/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'User Management', path: '/system/users', icon: Users },
      { name: 'Settings & Master Data', path: '/system/settings', icon: Settings },
      { name: 'Audit Logs', path: '/system/audit-logs', icon: History },
    ],
  },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (title) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#102A43] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-navy-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 bg-[#0A1D30] border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-ocean-600 to-ocean-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                HANSAI
                <span className="text-xs px-1.5 py-0.5 rounded bg-ocean-500/30 text-ocean-300 font-semibold uppercase tracking-normal">
                  LINE
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Integrated Fleet ERP</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 tracking-wider hover:text-slate-200 uppercase transition-colors"
              >
                <span>{section.title}</span>
                {collapsedSections[section.title] ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {!collapsedSections[section.title] && (
                <div className="space-y-0.5 pt-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-ocean-600 text-white shadow-sm shadow-ocean-600/30 font-semibold'
                            : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-ocean-400'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer info badge */}
        <div className="p-3 bg-[#0A1D30] border-t border-navy-800 text-xs shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-300">Live Production Mode</span>
          </div>
          <span className="text-[10px] bg-navy-800 text-ocean-300 px-2 py-0.5 rounded font-mono font-bold">
            v2.4
          </span>
        </div>
      </aside>
    </>
  );
}

