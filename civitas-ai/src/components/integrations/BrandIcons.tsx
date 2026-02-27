import React from 'react';

interface IconProps {
  className?: string;
}

export const GmailIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <img src="/brand-logos/gmail.png" alt="Gmail" className={`${className} object-contain`} />
);

export const OutlookIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <img src="/brand-logos/outlook.png" alt="Outlook" className={`${className} object-contain`} />
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <img src="/brand-logos/whatsapp.png" alt="WhatsApp" className={`${className} object-contain`} />
);

export const IMessageIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <img src="/brand-logos/imessage.png" alt="iMessage" className={`${className} object-contain`} />
);

export const GoogleMeetIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <img src="/brand-logos/google-meet.svg" alt="Google Meet" className={`${className} object-contain`} />
);

export const ZoomIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <img src="/brand-logos/zoom.svg" alt="Zoom" className={`${className} object-contain`} />
);
