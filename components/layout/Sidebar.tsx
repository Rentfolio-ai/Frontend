'use client';

import { useSession, signOut } from 'next-auth/react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, BarChart2, User, LogOut, Crown, UserPlus, MessageSquare, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';

const navItems = [
	{ label: 'Civitas', href: '/dashboard', icon: <MessageSquare /> },
	{ label: 'Properties', href: '/properties', icon: <FileText /> },
	{ label: 'Reports', href: '/reports', icon: <BarChart2 /> },
	{ label: 'Insights', href: '/insights', icon: <BarChart2 /> },
	{ label: 'Subscription', href: '/dashboard/subscription', icon: <Crown /> },
	{ label: 'Account', href: '/account', icon: <User /> },
];

interface SidebarProps {
	isCollapsed: boolean;
	onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
	const { data: session } = useSession();
	const { subscription } = useSubscription();
	const pathname = usePathname();
	const router = useRouter();
	const [isDemoMode, setIsDemoMode] = useState(false);

	useEffect(() => {
		const sessionDemo = sessionStorage.getItem('demoMode');
		const cookieDemo = document.cookie.includes('demoMode=true');
		setIsDemoMode(sessionDemo === 'true' || cookieDemo);
	}, []);

	const handleSignUp = () => {
		router.push('/auth/signin?mode=signup');
	};

	const handleSignOut = () => {
		// Clear demo mode from both sessionStorage and cookies
		sessionStorage.removeItem('demoMode');
		document.cookie = 'demoMode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

		if (session) {
			signOut({ callbackUrl: '/auth/signin' });
		} else {
			router.push('/auth/signin');
		}
	};

	return (
		<aside className={clsx(
			"fixed left-0 top-0 h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] shadow-2xl flex flex-col z-40 transition-all duration-300 relative overflow-hidden",
			isCollapsed ? "w-16" : "w-64"
		)}>
			{/* Animated Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
			<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
			<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
			<div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-xl animate-bounce"></div>

			{/* Content with backdrop blur */}
			<div className="relative z-10 h-full flex flex-col backdrop-blur-sm">
				{/* Debug indicator */}
				<div className={clsx(
					"absolute top-2 right-2 w-2 h-2 z-50 rounded-full",
					isCollapsed ? "bg-red-400/80" : "bg-green-400/80"
				)}></div>

				{/* Header with collapse toggle */}
				<div className={clsx(
					"flex items-center border-b border-white/10",
					isCollapsed ? "justify-center py-6 px-2 relative" : "justify-between px-6 py-6"
				)}>
					{isCollapsed ? (
						// Collapsed state: only show AI icon centered, with menu button absolute positioned
						<>
							<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/25 animate-pulse">
								AI
							</div>
							<button
								onClick={onToggle}
								className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/10"
								aria-label="Expand sidebar"
							>
								<Menu className="w-4 h-4" />
							</button>
						</>
					) : (
						// Expanded state: show full header with logo and close button
						<>
							<div className="flex items-center gap-3">
								<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/25">
									AI
								</div>
								<span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent tracking-tight">
									Rentfolio
								</span>
							</div>
							<button
								onClick={onToggle}
								className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm border border-white/10"
								aria-label="Collapse sidebar"
							>
								<X className="w-4 h-4" />
							</button>
						</>
					)}
				</div>
			<nav className={clsx("flex-1 py-6 relative z-10", isCollapsed ? "px-1" : "px-2")}>
				<ul className="space-y-2">
					{/* Home button - only show on account and subscription pages */}
					{(pathname === '/account' || pathname === '/dashboard/subscription') && (
						<li>
							<Link
								href="/dashboard"
								className={clsx(
									'flex items-center rounded-xl text-lg font-medium transition-all duration-300 relative group transform hover:scale-105',
									'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-purple-500/20',
									isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
									'backdrop-blur-sm'
								)}
							>
								{/* Home Icon */}
								<span className={clsx(
									"w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all duration-300",
									"group-hover:scale-110"
								)}>
									<Home />
								</span>

								{!isCollapsed && (
									<span className="flex-1 font-semibold">Home</span>
								)}

								{/* Tooltip for collapsed state */}
								{isCollapsed && (
									<div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-lg">
										Home
										<div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/90 rotate-45 border-l border-b border-white/10"></div>
									</div>
								)}
							</Link>
						</li>
					)}
					{navItems.map((item, index) => (
						<li key={item.label}>
							<Link
								href={item.href}
								className={clsx(
									'flex items-center rounded-xl text-lg font-medium transition-all duration-300 relative group transform hover:scale-105',
									'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-purple-500/20',
									pathname === item.href &&
										'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white shadow-lg shadow-purple-500/25 border border-white/10',
									isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
									'backdrop-blur-sm'
								)}
								style={{
									animationDelay: `${index * 100}ms`
								}}
							>
								{/* Icon with enhanced styling */}
								<span className={clsx(
									"w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all duration-300",
									pathname === item.href && "text-blue-300",
									"group-hover:scale-110"
								)}>
									{item.icon}
								</span>

								{/* Active indicator */}
								{pathname === item.href && (
									<div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
								)}

								{!isCollapsed && (
									<>
										<span className="flex-1 font-semibold">{item.label}</span>
										{item.label === 'Subscription' && subscription?.tier === 'free' && (
											<span className="ml-auto bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
												Free
											</span>
										)}
										{item.label === 'Subscription' && subscription?.tier === 'pro' && (
											<span className="ml-auto bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
												Pro
											</span>
										)}
										{item.label === 'Subscription' && subscription?.tier === 'enterprise' && (
											<span className="ml-auto bg-gradient-to-r from-purple-400 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
												Enterprise
											</span>
										)}
									</>
								)}
								{/* Enhanced Tooltip for collapsed state */}
								{isCollapsed && (
									<div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-lg">
										{item.label}
										<div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/90 rotate-45 border-l border-b border-white/10"></div>
									</div>
								)}
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<div className={clsx("pb-6 mt-auto relative z-10", isCollapsed ? "px-2" : "px-6")}>
				{/* Always show user section or sign in prompt */}
				<div className="space-y-3">
					{/* Demo Mode Sign Up Prompt - only show when expanded */}
					{isDemoMode && !session && !isCollapsed && (
						<button
							onClick={handleSignUp}
							className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600
									   text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300
									   transform hover:scale-105 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
						>
							<UserPlus className="w-5 h-5" />
							<span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
								Sign Up to Save Progress
							</span>
						</button>
					)}

					{/* User Info and Sign Out */}
					<div className={clsx(
						"flex items-center p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm",
						isCollapsed ? "flex-col gap-2" : "gap-3"
					)}>
						<div className="relative">
							<img
								src={session?.user?.image || 'https://via.placeholder.com/32'}
								alt="User"
								className="w-10 h-10 rounded-full border-2 border-purple-400 shadow-lg"
							/>
							<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
						</div>
						{!isCollapsed && (
							<div className="flex-1 min-w-0">
								<div className="text-white font-semibold text-sm truncate">
									{session?.user?.name || 'Demo User'}
								</div>
								<div className="text-white/60 text-xs truncate flex items-center gap-2">
									{session?.user?.email || 'demo@rentfolio.ai'}
									{isDemoMode && !session && (
										<span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
											Demo
										</span>
									)}
								</div>
							</div>
						)}
						<button
							className={clsx(
								"rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-200 flex items-center shadow-md hover:scale-110",
								isCollapsed ? "p-2" : "px-3 py-2 gap-2"
							)}
							onClick={handleSignOut}
							title={isCollapsed ? (isDemoMode && !session ? 'Exit' : 'Logout') : ''}
						>
							<LogOut className="w-4 h-4" />
							{!isCollapsed && (
								<span className="text-xs font-semibold">{isDemoMode && !session ? 'Exit' : 'Logout'}</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
		</aside>
	);
}
