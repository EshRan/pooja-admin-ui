import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar hidden on small screens for simplicity in this demo */}
            <div className="hidden sm:flex z-20">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0 z-10">
                <Header />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
