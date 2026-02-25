import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

export const Header: React.FC = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return '';
        const segment = path.split('/')[1];
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sm:flex-row flex-col sm:h-auto py-2 sm:py-0 transition-all">
            <div className="flex items-center w-full sm:w-auto sm:h-16 mb-2 sm:mb-0 justify-between sm:justify-start">
                <div className="flex items-center">
                    <button className="sm:hidden text-slate-500 hover:text-slate-700 focus:outline-none mr-3">
                        <Menu className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
                </div>
            </div>

            <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-4">
                <div className="relative flex-1 sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Search..."
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="relative p-2 text-slate-400 hover:text-slate-500 focus:outline-none rounded-full hover:bg-slate-100 transition-colors">
                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                        <Bell className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                            AD
                        </div>
                        <div className="hidden md:block text-sm">
                            <p className="font-medium text-slate-700 leading-none">Admin User</p>
                            <p className="text-xs text-slate-500 mt-1">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
