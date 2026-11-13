import React from 'react';
import { Link } from 'react-router-dom';
import { Ship, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto shadow-inner">
          <Ship className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-800 mt-2">Voyage Chart Error</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The page or navigation course you requested does not exist or has been relocated in the HANSAI Fleet ERP system.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-xs font-semibold rounded-lg text-white shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

