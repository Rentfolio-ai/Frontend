import React, { useState } from 'react';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Camera, Save, Check,
    Loader2, Crown, Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

interface ProfilePageProps {
    onBack: () => void;
}

const reveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { user, updateProfile } = useAuth();
    const { isPro } = useSubscription();
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
        <div className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.015] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.06] transition-colors">
                <Icon className="w-[18px] h-[18px] text-white/40 group-hover:text-white/60 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
                <label className="text-[11px] font-medium text-white/35 block mb-1 uppercase tracking-wider">{label}</label>
                {isEditing ? (
                    <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0E0E11] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#C08B5C]/40 focus:ring-1 focus:ring-[#C08B5C]/20 transition-all placeholder-white/20"
                        placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                ) : (
                    <p className="text-[14px] font-medium text-white/85 truncate">
                        {value || <span className="text-white/20 italic font-normal">Not set</span>}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#161619]">
            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-5 border-b border-white/[0.06] bg-[#161619]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-medium text-white tracking-tight">Profile</h1>
                </div>

                <AnimatePresence mode="wait">
                    <motion.button
                        key={showSaved ? 'saved' : isEditing ? 'save' : 'edit'}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                            showSaved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isEditing
                                    ? 'bg-[#C08B5C] text-[#0A0A0C] hover:bg-[#D4A27F] shadow-lg shadow-[#C08B5C]/20'
                                    : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
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
                    </motion.button>
                </AnimatePresence>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-3xl mx-auto px-8 py-10 space-y-8"
                >
                    {/* Avatar Card */}
                    <motion.div
                        variants={reveal}
                        className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 md:p-8 overflow-hidden"
                    >
                        {/* Subtle copper glow orb */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#C08B5C]/[0.04] blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-6 relative z-10">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {user?.avatar && user.avatar.length > 200 ? (
                                    <div className="relative">
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#C08B5C]/20 group-hover:ring-[#C08B5C]/40 transition-all"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[#C08B5C]/20 to-[#D4A27F]/10 text-[#D4A27F] ring-1 ring-[#C08B5C]/15 group-hover:ring-[#C08B5C]/30 transition-all relative">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C08B5C] border-2 border-[#161619] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Camera className="w-3.5 h-3.5 text-[#0A0A0C]" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white mb-1">{user?.name || 'User Name'}</h2>
                                <p className="text-sm text-white/35">{user?.email || 'user@example.com'}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        isPro
                                            ? 'bg-[#C08B5C]/10 text-[#D4A27F] border border-[#C08B5C]/20'
                                            : 'bg-white/[0.04] text-white/35 border border-white/[0.06]'
                                    }`}>
                                        {isPro ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                        {isPro ? 'Pro' : 'Free Plan'}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Personal Details */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3 px-1">
                            Personal Details
                        </h2>
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm divide-y divide-white/[0.04] overflow-hidden">
                            <Field icon={User} label="Full Name" value={formData.name} field="name" />
                            <Field icon={Mail} label="Email Address" value={formData.email} field="email" type="email" />
                            <Field icon={Phone} label="Phone Number" value={formData.phone} field="phone" type="tel" />
                            <Field icon={MapPin} label="Location" value={formData.location} field="location" />
                        </div>
                    </motion.div>

                    {/* Investor Profile Bio */}
                    <motion.div variants={reveal}>
                        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3 px-1">
                            Investor Profile
                        </h2>
                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm p-5">
                            {isEditing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about your investment strategy and goals..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg bg-[#0E0E11] border border-white/[0.08] text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#C08B5C]/40 focus:ring-1 focus:ring-[#C08B5C]/20 transition-all"
                                />
                            ) : (
                                <p className="text-sm text-white/50 leading-relaxed italic">
                                    {formData.bio || "No bio added yet. Click 'Edit Profile' to share your investment goals."}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    <div className="h-4" />
                </motion.div>
            </div>
        </div>
    );
};
