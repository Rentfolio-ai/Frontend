import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Book, ExternalLink, Send, Mail, Phone } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I analyze a property?',
      answer: 'Navigate to the Properties section and click "Add Property" to start analyzing a new property. You can enter the address or property details to get AI-powered insights.'
    },
    {
      question: 'What subscription plan do I need?',
      answer: 'The Starter plan is perfect for individual investors with up to 10 property analyses. For unlimited analyses and advanced features, consider the Professional plan.'
    },
    {
      question: 'How accurate are the AI predictions?',
      answer: 'Our AI models are trained on extensive real estate data and provide insights with high confidence levels. However, they should be used as guidance alongside professional real estate advice.'
    },
    {
      question: 'Can I export my reports?',
      answer: 'Yes! All subscription plans include the ability to export reports as PDF or share them with stakeholders via secure links.'
    }
  ];

  const handleSendMessage = () => {
    // TODO: Implement contact form submission
    console.log('Sending message:', contactForm);
    setContactForm({ subject: '', message: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Support" size="lg">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
          {[
            { key: 'faq', label: 'FAQ', icon: HelpCircle },
            { key: 'contact', label: 'Contact', icon: MessageCircle },
            { key: 'resources', label: 'Resources', icon: Book }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === key
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h4>
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <h5 className="font-medium text-foreground mb-2">{faq.question}</h5>
                  <p className="text-sm text-foreground/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Contact Support</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-xs text-foreground/60">support@civitas-ai.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Phone</p>
                      <p className="text-xs text-foreground/60">1-800-CIVITAS</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Describe your issue or question..."
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground mb-4">Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'User Guide',
                    description: 'Complete guide to using Civitas AI',
                    link: '#'
                  },
                  {
                    title: 'API Documentation',
                    description: 'For developers integrating with our API',
                    link: '#'
                  },
                  {
                    title: 'Video Tutorials',
                    description: 'Step-by-step video walkthroughs',
                    link: '#'
                  },
                  {
                    title: 'Community Forum',
                    description: 'Connect with other users',
                    link: '#'
                  }
                ].map((resource, index) => (
                  <a
                    key={index}
                    href={resource.link}
                    className="block p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </h5>
                        <p className="text-sm text-foreground/60">{resource.description}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};