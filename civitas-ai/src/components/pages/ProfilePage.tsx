/**
 * Profile Page - User profile management
 * Personal information, avatar, and account details
 */

import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePageProps {
    onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        bio: '',
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: API call to save profile
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const InfoField: React.FC<{
        icon: React.ElementType;
        label: string;
        value: string;
        field: keyof typeof formData;
        type?: string;
    }> = ({ icon: Icon, label, value, field, type = 'text' }) => (
        <div
            className="p-4 rounded-xl"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        color: '#14B8A6',
                    }}
                >
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block" style={{ color: '#94A3B8' }}>
                        {label}
                    </label>
                    {isEditing ? (
                        <input
                            type={type}
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg transition-colors"
                            style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                color: '#F1F5F9',
                            }}
                        />
                    ) : (
                        <p className="text-base" style={{ color: '#F1F5F9' }}>
                            {value || 'Not set'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
                <div className="flex items-center gap-4">
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
                            Profile
                        </h1>
                        <p className="text-sm" style={{ color: '#94A3B8' }}>
                            Manage your personal information
                        </p>
                    </div>
                </div>

                {/* Edit/Save Button */}
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                    style={{
                        backgroundColor: isEditing ? '#14B8A6' : 'rgba(148, 163, 184, 0.2)',
                        color: '#F1F5F9',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isEditing ? '#0D9488' : 'rgba(148, 163, 184, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isEditing ? '#14B8A6' : 'rgba(148, 163, 184, 0.2)';
                    }}
                >
                    {isSaving ? (
                        <>Saving...</>
                    ) : isEditing ? (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </>
                    ) : (
                        <>Edit Profile</>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Avatar Section */}
                    <div
                        className="p-6 rounded-xl text-center"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(148, 163, 184, 0.12)',
                        }}
                    >
                        <div className="relative inline-block mb-4">
                            <div
                                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
                                    color: '#FFFFFF',
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {isEditing && (
                                <button
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: '#14B8A6',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <h2 className="text-xl font-bold mb-1" style={{ color: '#F1F5F9' }}>
                            {user?.name || 'User'}
                        </h2>
                        <p className="text-sm" style={{ color: '#94A3B8' }}>
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>

                    {/* Profile Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            Personal Information
                        </h3>
                        <div className="space-y-3">
                            <InfoField
                                icon={User}
                                label="Full Name"
                                value={formData.name}
                                field="name"
                            />
                            <InfoField
                                icon={Mail}
                                label="Email Address"
                                value={formData.email}
                                field="email"
                                type="email"
                            />
                            <InfoField
                                icon={Phone}
                                label="Phone Number"
                                value={formData.phone}
                                field="phone"
                                type="tel"
                            />
                            <InfoField
                                icon={MapPin}
                                label="Location"
                                value={formData.location}
                                field="location"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#F1F5F9' }}>
                            About
                        </h3>
                        <div
                            className="p-4 rounded-xl"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(148, 163, 184, 0.12)',
                            }}
                        >
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself and your investment goals..."
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-lg resize-none"
                                    style={{
                                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                        border: '1px solid rgba(148, 163, 184, 0.2)',
                                        color: '#F1F5F9',
                                    }}
                                />
                            ) : (
                                <p className="text-sm" style={{ color: '#CBD5E1' }}>
                                    {formData.bio || 'No bio added yet. Click Edit Profile to add one.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
