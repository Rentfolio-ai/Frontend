/**
 * Notifications Page - Notification preferences management
 * Email, push, and in-app notification settings
 */

import React, { useState } from 'react';
import { ArrowLeft, Mail, Bell, MessageSquare, TrendingUp, FileText, AlertCircle } from 'lucide-react';

interface NotificationsPageProps {
    onBack: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
    const [notifications, setNotifications] = useState({
        // Email notifications
        emailPropertyUpdates: true,
        emailMarketInsights: true,
        emailReportReady: true,
        emailWeeklySummary: false,
        emailPromotional: false,
        
        // Push notifications
        pushNewListings: true,
        pushPriceChanges: true,
        pushPortfolioAlerts: true,
        
        // In-app notifications
        inAppMessages: true,
        inAppUpdates: true,
    });

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    const NotificationToggle: React.FC<{
        icon: React.ElementType;
        title: string;
        description: string;
        enabled: boolean;
        onToggle: () => void;
    }> = ({ icon: Icon, title, description, enabled, onToggle }) => (
        <div
            className="p-4 rounded-xl flex items-start gap-4"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                    backgroundColor: enabled ? 'rgba(20, 184, 166, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    color: enabled ? '#14B8A6' : '#94A3B8',
                }}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F1F5F9' }}>
                    {title}
                </h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                    {description}
                </p>
            </div>
            <button
                onClick={onToggle}
                className="flex-shrink-0 relative w-12 h-6 rounded-full transition-colors"
                style={{
                    backgroundColor: enabled ? '#14B8A6' : 'rgba(148, 163, 184, 0.3)',
                }}
            >
                <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                    style={{
                        backgroundColor: '#FFFFFF',
                        transform: enabled ? 'translateX(26px)' : 'translateX(2px)',
                    }}
                />
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div
                className="flex items-center gap-4 px-6 py-4 border-b"
                style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#E2E8F0',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                        Notifications
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Manage how you receive updates and alerts
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Email Notifications */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-5 h-5" style={{ color: '#14B8A6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                                Email Notifications
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <NotificationToggle
                                icon={TrendingUp}
                                title="Property Updates"
                                description="Get notified when properties in your saved searches change"
                                enabled={notifications.emailPropertyUpdates}
                                onToggle={() => handleToggle('emailPropertyUpdates')}
                            />
                            <NotificationToggle
                                icon={AlertCircle}
                                title="Market Insights"
                                description="Receive market trends and investment opportunities"
                                enabled={notifications.emailMarketInsights}
                                onToggle={() => handleToggle('emailMarketInsights')}
                            />
                            <NotificationToggle
                                icon={FileText}
                                title="Report Ready"
                                description="Get notified when your generated reports are ready"
                                enabled={notifications.emailReportReady}
                                onToggle={() => handleToggle('emailReportReady')}
                            />
                            <NotificationToggle
                                icon={Mail}
                                title="Weekly Summary"
                                description="Receive a weekly summary of your activity and insights"
                                enabled={notifications.emailWeeklySummary}
                                onToggle={() => handleToggle('emailWeeklySummary')}
                            />
                            <NotificationToggle
                                icon={MessageSquare}
                                title="Promotional Emails"
                                description="Receive news, tips, and special offers"
                                enabled={notifications.emailPromotional}
                                onToggle={() => handleToggle('emailPromotional')}
                            />
                        </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="w-5 h-5" style={{ color: '#14B8A6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                                Push Notifications
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <NotificationToggle
                                icon={TrendingUp}
                                title="New Listings"
                                description="Real-time alerts for new properties matching your criteria"
                                enabled={notifications.pushNewListings}
                                onToggle={() => handleToggle('pushNewListings')}
                            />
                            <NotificationToggle
                                icon={AlertCircle}
                                title="Price Changes"
                                description="Get alerted when saved properties change price"
                                enabled={notifications.pushPriceChanges}
                                onToggle={() => handleToggle('pushPriceChanges')}
                            />
                            <NotificationToggle
                                icon={FileText}
                                title="Portfolio Alerts"
                                description="Important updates about your portfolio properties"
                                enabled={notifications.pushPortfolioAlerts}
                                onToggle={() => handleToggle('pushPortfolioAlerts')}
                            />
                        </div>
                    </div>

                    {/* In-App Notifications */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="w-5 h-5" style={{ color: '#14B8A6' }} />
                            <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>
                                In-App Notifications
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <NotificationToggle
                                icon={MessageSquare}
                                title="Messages"
                                description="Show notifications for new messages and replies"
                                enabled={notifications.inAppMessages}
                                onToggle={() => handleToggle('inAppMessages')}
                            />
                            <NotificationToggle
                                icon={AlertCircle}
                                title="System Updates"
                                description="Get notified about new features and improvements"
                                enabled={notifications.inAppUpdates}
                                onToggle={() => handleToggle('inAppUpdates')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
