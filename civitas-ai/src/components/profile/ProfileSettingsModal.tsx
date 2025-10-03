import React, { useState } from 'react';
import { User, Mail, Camera, Save } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  
  // Add error state for validation
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    general?: string;
  }>({});
  
  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form fields
    const newErrors: {name?: string; email?: string; general?: string} = {};
    
    // Validate name (required)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email (required and format)
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // If there are errors, set them and return early
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Don't proceed with save if validation fails
    }
    
    // If validation passes, proceed with save
    // TODO: Implement profile update logic
    console.log('Saving profile:', formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings" size="md">
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent-from rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-white">
                {formData.avatar || formData.name.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Profile Photo</h4>
            <p className="text-xs text-foreground/60">Click the camera icon to upload a new photo</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-border'} rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-border'} rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        {/* General Error Message (if needed) */}
        {errors.general && (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{errors.general}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};