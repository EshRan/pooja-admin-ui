import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Tags, ArrowLeftRight, Image, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import brandLogo from '../../assets/logo.png';

const navItems = [
    { name: 'Pooja Items', path: '/items', icon: Package },
    { name: 'Nuts', path: '/nuts', icon: Package },
    { name: 'Occasions', path: '/occasions', icon: Tags },
    { name: 'Mappings', path: '/mappings', icon: ArrowLeftRight },
    { name: 'Banners', path: '/banners', icon: Image },
];

export const Sidebar: React.FC = () => {
    const { logout } = useAuth();

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 shadow-sm bg-slate-950/50">
                <img src={brandLogo} alt="Rituals Basket Logo" className="w-8 h-8 mr-3 object-contain" />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Rituals Admin
                </span>
            </div>

            <div className="flex-1 py-6 overflow-y-auto">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                                            }`}
                                    />
                                    {item.name}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <button
                    onClick={logout}
                    className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-400" />
                    Sign out
                </button>
            </div>
        </div>
    );
};
