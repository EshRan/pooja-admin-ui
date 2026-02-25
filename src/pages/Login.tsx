import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [authError, setAuthError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const from = location.state?.from?.pathname || '/';

    const onSubmit = async (data: LoginFormValues) => {
        setAuthError(null);
        // Dummy authentication
        if (data.username === 'admin' && data.password === 'admin123') {
            // Create a fake token
            const fakeToken = btoa(JSON.stringify({ user: 'admin', role: 'admin', exp: Date.now() + 86400000 }));
            login(fakeToken);
            navigate(from, { replace: true });
        } else {
            setAuthError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30 text-white">
                        <Package size={32} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Inventory Admin
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Sign in to manage your inventory
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {authError && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-100">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{authError}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    className={`block w-full pl-10 sm:text-sm rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500 py-3 border outline-none transition-colors ${errors.username ? 'border-red-300 ring-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-slate-400'
                                        }`}
                                    placeholder="admin"
                                    {...register('username')}
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-2 text-sm text-red-600" id="username-error">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    className={`block w-full pl-10 sm:text-sm rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500 py-3 border outline-none transition-colors ${errors.password ? 'border-red-300 ring-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-slate-400'
                                        }`}
                                    placeholder="admin123"
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600" id="password-error">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Demo Credentials</span>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col items-center gap-1 text-sm text-slate-600">
                                <p>Username: <strong className="text-slate-900">admin</strong></p>
                                <p>Password: <strong className="text-slate-900">admin123</strong></p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
