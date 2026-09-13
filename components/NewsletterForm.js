'use client';

import React, { useState } from 'react';

function MailIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function ArrowLeftIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}

function CheckIcon({ size = 16, strokeWidth = 3, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

export default function NewsletterForm() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSent(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSent(false);
    }, 4000);
  };

  return (
    <div className="newsletter-wrap">
      <form 
        onSubmit={handleNewsletter} 
        className={`newsletter-form-pill ${isFocused ? 'focused' : ''} ${newsletterSent ? 'success' : ''}`}
      >
        <div className="newsletter-icon-wrapper" aria-hidden="true">
          <MailIcon size={16} className="newsletter-input-icon" />
        </div>
        <input
          type="email"
          placeholder="بريدك الإلكتروني"
          value={newsletterEmail}
          onChange={(e) => setNewsletterEmail(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          aria-label="البريد الإلكتروني للاشتراك"
          className="newsletter-input-field"
        />
        <button 
          type="submit" 
          aria-label={newsletterSent ? "تم الاشتراك بنجاح" : "اشتراك في النشرة البريدية"} 
          className={`newsletter-arrow-btn ${newsletterSent ? 'sent' : ''}`}
          disabled={newsletterSent}
        >
          {newsletterSent ? (
            <CheckIcon size={16} strokeWidth={3} className="check-anim" />
          ) : (
            <ArrowLeftIcon size={16} className="arrow-icon" />
          )}
        </button>
      </form>

      {newsletterSent && (
        <div className="newsletter-success-badge" role="alert">
          <CheckIcon size={13} strokeWidth={3} />
          <span>تم اشتراكك بنجاح! أهلاً بك في عائلة قصب</span>
        </div>
      )}
    </div>
  );
}


