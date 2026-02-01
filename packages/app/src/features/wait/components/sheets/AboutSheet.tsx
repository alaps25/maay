import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, ChevronRight, ChevronLeft, Scale, Shield, FileText, AlertTriangle, Database, Sparkles } from 'lucide-react';
import { SheetDragHandle } from '../SheetDragHandle';
import type { AboutSheetProps, AboutSubPage } from '../../types';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  lineHeights,
  spacing,
  radii,
  blur,
  zIndex,
  animation,
  sizes,
  opacity,
  viewportHeights,
  getThemeColors,
} from '../../../../design';

/**
 * About sheet with app info, how it works, and legal pages
 */
export function AboutSheet({ onClose, lineColor, isNight }: AboutSheetProps) {
  const [activePage, setActivePage] = useState<AboutSubPage>('main');
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = getThemeColors(isNight);
  
  // Reset scroll position when page changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activePage]);
  
  // Share the app
  const handleShare = useCallback(() => {
    const shareData = {
      title: 'Maay',
      text: 'A calming companion for tracking contractions during labor',
      url: 'https://maay.app',
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
    }
  }, []);
  
  const menuItems: { id: AboutSubPage; label: string; icon: React.ReactNode }[] = [
    { id: 'howItWorks', label: 'How It Works', icon: <Sparkles size={sizes.iconMd} /> },
    { id: 'impressum', label: 'Legal Notice (Impressum)', icon: <Scale size={sizes.iconMd} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={sizes.iconMd} /> },
    { id: 'terms', label: 'Terms of Service', icon: <FileText size={sizes.iconMd} /> },
    { id: 'medical', label: 'Medical Disclaimer', icon: <AlertTriangle size={sizes.iconMd} /> },
    { id: 'gdpr', label: 'Your Data (GDPR)', icon: <Database size={sizes.iconMd} /> },
  ];

  // Shared styles
  const sectionHeadingStyle = {
    fontFamily: fonts.sans,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.standard,
    marginBottom: spacing[6],
    opacity: 0.6,
  };

  const bodyTextStyle = {
    fontFamily: fonts.serif,
    fontSize: fontSizes.small,
    lineHeight: lineHeights.relaxed,
    marginBottom: spacing[9],
    opacity: 0.8,
  };

  const contentPadding = `0 ${spacing[10]}px ${spacing[14]}px`;
  
  const renderContent = () => {
    switch (activePage) {
      case 'howItWorks':
        return (
          <div style={{ padding: contentPadding, color: lineColor }}>
            <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.bodyAlt, lineHeight: lineHeights.relaxed, marginBottom: spacing[10], opacity: 0.8 }}>
              Maay helps you track contractions during labor with a simple, calming interface designed to reduce stress.
            </p>
            
            <h3 style={sectionHeadingStyle}>TRACKING CONTRACTIONS</h3>
            <p style={bodyTextStyle}>
              <strong>Tap anywhere</strong> on the screen when a contraction starts. Tap again when it ends. The app automatically calculates duration and intervals between contractions.
            </p>
            
            <h3 style={sectionHeadingStyle}>ADAPTIVE BREATHING</h3>
            <p style={bodyTextStyle}>
              During recording, the flowing rings guide you through calming breaths. The breathing pace automatically adapts as labor progresses—normal rhythm in early labor, slower and deeper during active labor, and the slowest pace during transition to promote maximum relaxation when you need it most.
            </p>
            
            <h3 style={sectionHeadingStyle}>HAPTIC FEEDBACK</h3>
            <p style={bodyTextStyle}>
              On iOS, feel gentle haptic patterns that match your breathing rhythm—building during inhale, releasing during exhale. A distinct calm release haptic signals when each contraction ends.
            </p>
            
            <h3 style={sectionHeadingStyle}>PAIR WITH PARTNER</h3>
            <p style={bodyTextStyle}>
              Share a 6-digit code with your partner so they can follow along in real-time from their own device. Both can track contractions together.
            </p>
            
            <h3 style={sectionHeadingStyle}>WATER BROKE</h3>
            <p style={bodyTextStyle}>
              Mark when your water breaks from the menu. This timestamp is included when you export your data for healthcare providers.
            </p>
            
            <h3 style={sectionHeadingStyle}>EXPORT DATA</h3>
            <p style={bodyTextStyle}>
              Share your contraction history via text, copy to clipboard, or download as a file to show your midwife or doctor.
            </p>
            
            <h3 style={sectionHeadingStyle}>SMART SAFEGUARDS</h3>
            <p style={bodyTextStyle}>
              If you accidentally tap to stop within 5 seconds, the app asks if you want to continue recording. If a contraction runs longer than 2 minutes, you&apos;ll be gently prompted to confirm if it ended.
            </p>
            
            <h3 style={sectionHeadingStyle}>LABOR INTELLIGENCE</h3>
            <p style={bodyTextStyle}>
              The app monitors your contraction pattern and gently notifies you when you appear to be entering active labor, or when your contractions match international medical guidelines for contacting your hospital.
            </p>
            
            <h3 style={sectionHeadingStyle}>BIRTH TAB</h3>
            <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
              When the moment arrives, switch to the Birth tab. The calming waves continue as you prepare to welcome your baby.
            </p>
          </div>
        );
        
      case 'impressum':
        return (
          <div style={{ padding: contentPadding, color: lineColor }}>
            <h3 style={sectionHeadingStyle}>ANGABEN GEMÄSS § 5 TMG</h3>
            <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.bodyAlt, lineHeight: lineHeights.relaxed, marginBottom: spacing[10], opacity: 0.8 }}>
              Alap Shah<br />
              13187 Berlin<br />
              Germany
            </p>
            
            <h3 style={sectionHeadingStyle}>KONTAKT</h3>
            <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.bodyAlt, lineHeight: lineHeights.relaxed, marginBottom: spacing[10], opacity: 0.8 }}>
              E-Mail: alaps@gmx.de
            </p>
            
            <h3 style={sectionHeadingStyle}>VERANTWORTLICH FÜR DEN INHALT</h3>
            <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.bodyAlt, lineHeight: lineHeights.relaxed, marginBottom: spacing[10], opacity: 0.8 }}>
              Alap Shah<br />
              13187 Berlin
            </p>
            
            <h3 style={sectionHeadingStyle}>EU-STREITSCHLICHTUNG</h3>
            <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        );
        
      case 'privacy':
        return (
          <div style={{ padding: contentPadding, color: lineColor }}>
            <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.small, lineHeight: lineHeights.relaxed, marginBottom: spacing[10], opacity: 0.8, fontStyle: 'italic' }}>
              Last updated: January 2026
            </p>
            
            <h3 style={sectionHeadingStyle}>DATA WE COLLECT</h3>
            <p style={bodyTextStyle}>
              <strong>Contraction data:</strong> Start times, durations, and intervals are stored locally on your device. This data never leaves your device unless you explicitly export it or use the pairing feature.
            </p>
            <p style={bodyTextStyle}>
              <strong>Pairing feature:</strong> When you pair with a partner, contraction data is temporarily synced via Firebase Realtime Database. A random device ID and session code are generated—no personal information is collected.
            </p>
            
            <h3 style={sectionHeadingStyle}>DATA WE DO NOT COLLECT</h3>
            <p style={bodyTextStyle}>
              We do not collect names, email addresses, location data, device information, analytics, or any other personal information. There are no cookies, no tracking, and no advertisements.
            </p>
            
            <h3 style={sectionHeadingStyle}>DATA STORAGE</h3>
            <p style={bodyTextStyle}>
              All data is stored locally in your browser&apos;s storage. When using the pairing feature, data is temporarily stored on Firebase servers (Google Cloud, EU region) and is deleted when you unpair or clear your data.
            </p>
            
            <h3 style={sectionHeadingStyle}>YOUR RIGHTS</h3>
            <p style={bodyTextStyle}>
              You can export all your data at any time using the Export feature. You can delete all your data using Clear Data in the menu. For questions, contact alaps@gmx.de.
            </p>
            
            <h3 style={sectionHeadingStyle}>THIRD-PARTY SERVICES</h3>
            <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
              Firebase Realtime Database (Google) is used only for the optional pairing feature. Vercel hosts this application. Neither service receives personal data from this app.
            </p>
          </div>
        );
        
      case 'terms':
        return (
          <div style={{ padding: contentPadding, color: lineColor }}>
            <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.small, lineHeight: lineHeights.relaxed, marginBottom: spacing[10], opacity: 0.8, fontStyle: 'italic' }}>
              Last updated: January 2026
            </p>
            
            <h3 style={sectionHeadingStyle}>ACCEPTANCE OF TERMS</h3>
            <p style={bodyTextStyle}>
              By using Maay, you agree to these terms. If you do not agree, please do not use the app.
            </p>
            
            <h3 style={sectionHeadingStyle}>SERVICE DESCRIPTION</h3>
            <p style={bodyTextStyle}>
              Maay is a free contraction tracking tool provided as-is for informational purposes only. It is not a medical device and should not be used as a substitute for professional medical advice.
            </p>
            
            <h3 style={sectionHeadingStyle}>USER RESPONSIBILITIES</h3>
            <p style={bodyTextStyle}>
              You are responsible for ensuring this app is appropriate for your needs. Always follow your healthcare provider&apos;s guidance regarding labor and delivery.
            </p>
            
            <h3 style={sectionHeadingStyle}>LIMITATION OF LIABILITY</h3>
            <p style={bodyTextStyle}>
              This app is provided &quot;as is&quot; without warranties of any kind. The developer is not liable for any damages arising from the use of this app. Use at your own discretion.
            </p>
            
            <h3 style={sectionHeadingStyle}>CHANGES TO TERMS</h3>
            <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
              These terms may be updated from time to time. Continued use of the app constitutes acceptance of any changes.
            </p>
          </div>
        );
        
      case 'medical':
        return (
          <div style={{ padding: contentPadding, color: lineColor }}>
            <div style={{ 
              backgroundColor: theme.warningBg, 
              padding: spacing[8], 
              borderRadius: radii.md, 
              marginBottom: spacing[10],
              border: `1px solid ${theme.warningBorder}`
            }}>
              <p style={{ fontFamily: fonts.serif, fontSize: fontSizes.bodyAlt, lineHeight: lineHeights.relaxed, color: lineColor, fontWeight: fontWeights.medium }}>
                ⚠️ Maay is NOT a medical device. It does not provide medical advice, diagnosis, or treatment recommendations.
              </p>
            </div>
            
            <h3 style={sectionHeadingStyle}>INFORMATIONAL USE ONLY</h3>
            <p style={bodyTextStyle}>
              This app is designed to help you track contraction timing for informational purposes. It is a simple timer and logging tool—nothing more.
            </p>
            
            <h3 style={sectionHeadingStyle}>ALWAYS CONSULT HEALTHCARE PROVIDERS</h3>
            <p style={bodyTextStyle}>
              Always follow your midwife&apos;s, doctor&apos;s, or healthcare provider&apos;s instructions. They know your specific medical situation. When in doubt, call your healthcare provider or go to the hospital.
            </p>
            
            <h3 style={sectionHeadingStyle}>EMERGENCY SITUATIONS</h3>
            <p style={bodyTextStyle}>
              Do not rely on this app in medical emergencies. If you experience heavy bleeding, severe pain, reduced baby movement, or any other concerning symptoms, seek immediate medical attention.
            </p>
            
            <h3 style={sectionHeadingStyle}>NO WARRANTY OF ACCURACY</h3>
            <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
              The developer makes no guarantees about the accuracy of timing data. Technical issues, user error, or device problems may affect recorded times.
            </p>
          </div>
        );
        
      case 'gdpr':
        return (
          <div style={{ padding: contentPadding, color: lineColor }}>
            <p style={bodyTextStyle}>
              Under the General Data Protection Regulation (GDPR), you have rights regarding your personal data.
            </p>
            
            <h3 style={sectionHeadingStyle}>YOUR DATA</h3>
            <p style={bodyTextStyle}>
              Maay stores the following data locally on your device:
            </p>
            <ul style={{ fontFamily: fonts.serif, fontSize: fontSizes.small, lineHeight: lineHeights.wide, marginBottom: spacing[9], opacity: 0.8, paddingLeft: spacing[9] }}>
              <li>Contraction start times and durations</li>
              <li>Water broke timestamp (if recorded)</li>
              <li>Pairing session code (if using pair feature)</li>
              <li>Random device identifier (for pairing only)</li>
            </ul>
            
            <h3 style={sectionHeadingStyle}>RIGHT TO ACCESS (EXPORT)</h3>
            <p style={bodyTextStyle}>
              You can export all your data at any time: Open the menu (three dots) → tap &quot;Export Data&quot; → choose your preferred format.
            </p>
            
            <h3 style={sectionHeadingStyle}>RIGHT TO ERASURE (DELETE)</h3>
            <p style={bodyTextStyle}>
              You can delete all your data at any time: Open the menu (three dots) → tap &quot;Clear Data&quot; → confirm deletion. This removes all local data and any data synced to Firebase.
            </p>
            
            <h3 style={sectionHeadingStyle}>DATA PORTABILITY</h3>
            <p style={bodyTextStyle}>
              The Export feature provides your data in a human-readable text format that can be shared with healthcare providers or saved for your records.
            </p>
            
            <h3 style={sectionHeadingStyle}>CONTACT</h3>
            <p style={{ ...bodyTextStyle, marginBottom: 0 }}>
              For any data-related questions or requests, contact: alaps@gmx.de
            </p>
          </div>
        );
        
      default: // main
        return (
          <div style={{ padding: contentPadding }}>
            {/* App Description */}
            <p style={{ 
              fontFamily: fonts.serif, 
              fontSize: fontSizes.bodyAlt, 
              lineHeight: lineHeights.wide, 
              color: lineColor, 
              opacity: 0.8,
              marginBottom: spacing[12],
              textAlign: 'center',
            }}>
              I built Maay for my partner, though a little too late for us. I noticed a gap that no one was elegantly solving—a truly calming companion for one of life&apos;s most intense moments. There are many problems to solve in this journey, but I started with the first one. I hope it helps all mothers, and their partners who want to support them.
            </p>
            
            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[6],
                    padding: `${spacing[8]}px 0`,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${lineColor}${opacity.light}`,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: lineColor, opacity: 0.5 }}>{item.icon}</span>
                  <span style={{ 
                    flex: 1,
                    fontFamily: fonts.sans, 
                    fontSize: fontSizes.small, 
                    color: lineColor,
                  }}>
                    {item.label}
                  </span>
                  <ChevronRight size={sizes.iconSm} style={{ color: lineColor, opacity: 0.3 }} />
                </button>
              ))}
            </div>
            
            {/* Version */}
            <p style={{ 
              fontFamily: fonts.sans, 
              fontSize: fontSizes.caption, 
              color: lineColor, 
              opacity: 0.3,
              textAlign: 'center',
              marginTop: spacing[12],
            }}>
              Maay v1.0 · Made with love in Berlin
            </p>
          </div>
        );
    }
  };
  
  const getPageTitle = () => {
    switch (activePage) {
      case 'howItWorks': return 'HOW IT WORKS';
      case 'impressum': return 'LEGAL NOTICE';
      case 'privacy': return 'PRIVACY POLICY';
      case 'terms': return 'TERMS OF SERVICE';
      case 'medical': return 'MEDICAL DISCLAIMER';
      case 'gdpr': return 'YOUR DATA';
      default: return 'ABOUT MAAY';
    }
  };

  const iconButtonStyle = {
    width: sizes.buttonIcon,
    height: sizes.buttonIcon,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer' as const,
    color: lineColor,
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: colors.backdrop,
          zIndex: zIndex.modalBackdrop,
        }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={animation.drag.elastic}
        onDragEnd={(_, info) => {
          if (info.offset.y > animation.drag.threshold * 2) onClose();
        }}
        transition={animation.spring.default}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: viewportHeights.sheetExpanded,
          zIndex: zIndex.modalContent,
          backgroundColor: theme.sheetBgSubtle,
          backdropFilter: blur.subtle,
          WebkitBackdropFilter: blur.subtle,
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SheetDragHandle lineColor={lineColor} />
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spacing[2]}px ${spacing[9]}px ${spacing[6]}px`,
          borderBottom: `1px solid ${lineColor}${opacity.subtle}`,
        }}>
          {/* Left button - Close or Back */}
          {activePage !== 'main' ? (
            <button
              onClick={() => setActivePage('main')}
              style={{
                ...iconButtonStyle,
                opacity: 0.6,
              }}
              aria-label="Back"
            >
              <ChevronLeft size={sizes.iconMd} />
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                ...iconButtonStyle,
                opacity: 0.6,
              }}
              aria-label="Close"
            >
              <X size={sizes.iconMd} strokeWidth={sizes.strokeNormal} />
            </button>
          )}
          
          {/* Title */}
          <span style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: fonts.sans,
            fontSize: fontSizes.button,
            fontWeight: fontWeights.medium,
            letterSpacing: letterSpacing.standard,
            color: lineColor,
          }}>
            {getPageTitle()}
          </span>
          
          {/* Right button - Share (only on main page) */}
          {activePage === 'main' ? (
            <button
              onClick={handleShare}
              style={iconButtonStyle}
              aria-label="Share app"
            >
              <Share size={sizes.iconSm} strokeWidth={sizes.strokeNormal} />
            </button>
          ) : (
            <div style={{ width: sizes.buttonIcon }} />
          )}
        </div>
        
        {/* Content */}
        <div 
          ref={scrollRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingTop: spacing[9],
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: activePage === 'main' ? -spacing[9] : spacing[9] }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activePage === 'main' ? spacing[9] : -spacing[9] }}
              transition={{ duration: animation.duration.fast }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

export default AboutSheet;
