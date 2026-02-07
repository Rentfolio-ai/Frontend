/**
 * Profile Page — Redesigned
 * Clean, compact user profile management
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
        <div className="flex items-center gap-3 px-3.5 py-3">
            <div className="w-7 h-7 rounded-md bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#D4A27F]" />
            </div>
            <div className="flex-1 min-w-0">
                <label className="text-[10px] font-medium uppercase tracking-wider text-white/30 block mb-0.5">{label}</label>
                {isEditing ? (
                    <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[13px] text-white/85 focus:outline-none focus:border-[#C08B5C]/30 transition-colors"
                    />
                ) : (
                    <p className="text-[13px] text-white/75 truncate">{value || 'Not set'}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-white/90">Profile</h1>
                    <p className="text-[11px] text-white/35">Manage your personal information</p>
                </div>
                <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                        showSaved
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : isEditing
                            ? 'bg-[#C08B5C] text-white hover:bg-[#A8734A]'
                            : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-white/[0.06]'
                    }`}
                >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> :
                     showSaved ? <><Check className="w-3 h-3" /> Saved</> :
                     isEditing ? <><Save className="w-3 h-3" /> Save</> :
                     'Edit'}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-2xl mx-auto space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        <div className="relative">
                            {user?.avatar && user.avatar.length > 200 ? (
                                <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#C08B5C]/30" />
                            ) : (
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-[#A8734A] to-[#C08B5C] text-white">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C08B5C] flex items-center justify-center hover:bg-[#A8734A] transition-colors shadow-lg"
                            >
                                <Camera className="w-3 h-3 text-white" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-white/90">{user?.name || 'User'}</h2>
                            <p className="text-[12px] text-white/40">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">Personal Information</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
                            <Field icon={User} label="Full Name" value={formData.name} field="name" />
                            <Field icon={Mail} label="Email" value={formData.email} field="email" type="email" />
                            <Field icon={Phone} label="Phone" value={formData.phone} field="phone" type="tel" />
                            <Field icon={MapPin} label="Location" value={formData.location} field="location" />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">About</h2>
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself and your investment goals..."
                                    rows={3}
                                    className="w-full px-2.5 py-2 rounded-md bg-white/[0.06] border border-white/[0.08] text-[13px] text-white/85 placeholder-white/25 resize-none focus:outline-none focus:border-[#C08B5C]/30 transition-colors"
                                />
                            ) : (
                                <p className="text-[13px] text-white/50 leading-relaxed">
                                    {formData.bio || 'No bio added yet. Click Edit to add one.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
