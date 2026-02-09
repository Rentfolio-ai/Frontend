/**
 * Profile Page — Redesigned
 * Clean, compact user profile management with professional fintech styling.
 */

import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePageProps {
    onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        bio: '',
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => updateProfile({ avatar: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ name: formData.name, email: formData.email });
            setIsEditing(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const Field: React.FC<{
        icon: React.ElementType;
        label: string;
        value: string;
        field: keyof typeof formData;
        type?: string;
    }> = ({ icon: Icon, label, value, field, type = 'text' }) => (
        <div className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
            <div className="w-8 h-8 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.05] transition-colors">
                <Icon className="w-4 h-4 text-white/50 group-hover:text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
                <label className="text-xs font-medium font-sans text-white/40 block mb-1">{label}</label>
                {isEditing ? (
                    <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full px-3 py-2 rounded bg-[#0C0C0E] border border-white/[0.1] text-sm font-sans text-white focus:outline-none focus:border-[#C08B5C]/50 transition-colors placeholder-white/20"
                        placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                ) : (
                    <p className="text-sm font-medium font-sans text-white/90 truncate">
                        {value || <span className="text-white/20 italic">Not set</span>}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#0C0C0E]">
            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-6 border-b border-white/[0.08] bg-[#0C0C0E]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-display font-semibold text-white tracking-tight">Profile Settings</h1>
                </div>

                {/* Save/Edit Button */}
                <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 ${showSaved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isEditing
                                ? 'bg-[#C08B5C] text-[#0C0C0E] hover:bg-[#D4A27F] shadow-lg shadow-[#C08B5C]/20 border border-transparent'
                                : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'
                        }`}
                >
                    {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : showSaved ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                        </>
                    ) : isEditing ? (
                        <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                        </>
                    ) : (
                        <span>Edit Profile</span>
                    )}
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">

                    {/* Unique Avatar Section - Horizontal Card */}
                    <div className="flex items-center gap-6 p-6 rounded bg-[#161618] border border-white/[0.08]">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {user?.avatar && user.avatar.length > 200 ? (
                                <div className="relative">
                                    <img
                                        src={user.avatar}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover ring-2 ring-[#C08B5C]/20 group-hover:ring-[#C08B5C]/50 transition-all"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold bg-gradient-to-br from-[#1A1A1C] to-[#0C0C0E] text-white/50 ring-1 ring-white/[0.1] group-hover:ring-white/[0.2] transition-all">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C08B5C] border-2 border-[#161618] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Camera className="w-3.5 h-3.5 text-[#0C0C0E]" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-display font-semibold text-white mb-1">{user?.name || 'User Name'}</h2>
                            <p className="text-sm font-sans text-white/40">{user?.email || 'user@example.com'}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/[0.05] text-white/40 border border-white/[0.05]">
                                    Free Plan
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#C08B5C]/10 text-[#D4A27F] border border-[#C08B5C]/20">
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Personal Info */}
                        <div>
                            <h2 className="text-xs font-medium font-sans text-white/40 mb-3 px-1 tracking-wide uppercase">
                                Personal Details
                            </h2>
                            <div className="rounded bg-[#161618] border border-white/[0.08] divide-y divide-white/[0.04] overflow-hidden">
                                <Field icon={User} label="Full Name" value={formData.name} field="name" />
                                <Field icon={Mail} label="Email Address" value={formData.email} field="email" type="email" />
                                <Field icon={Phone} label="Phone Number" value={formData.phone} field="phone" type="tel" />
                                <Field icon={MapPin} label="Location" value={formData.location} field="location" />
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div>
                            <h2 className="text-xs font-medium font-sans text-white/40 mb-3 px-1 tracking-wide uppercase">
                                Investor Profile
                            </h2>
                            <div className="rounded bg-[#161618] border border-white/[0.08] p-5">
                                {isEditing ? (
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell us about your investment strategy and goals..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded bg-[#0C0C0E] border border-white/[0.1] text-sm font-sans text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#C08B5C]/50 transition-colors"
                                    />
                                ) : (
                                    <p className="text-sm font-sans text-white/60 leading-relaxed italic">
                                        {formData.bio || "No bio added yet. Click 'Edit Profile' to share your investment goals."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
};
