# Maay - Production Readiness Backlog

This document tracks improvements needed before public release.

## Priority 1: Critical

- [ ] **Error Boundaries** - Add React error boundaries to prevent full app crashes
- [ ] **Offline Support** - Handle network failures gracefully, queue Firebase syncs for retry
- [ ] **Input Validation** - Sanitize user inputs (partner codes, manual time entries)
- [ ] **Loading States** - Add proper loading indicators for async operations

## Priority 2: High

- [ ] **Accessibility (a11y)**
  - [ ] Screen reader support (ARIA labels)
  - [ ] Keyboard navigation
  - [ ] Color contrast verification
  - [ ] Focus management for sheets/modals

- [ ] **Performance**
  - [ ] Memoize expensive calculations
  - [ ] Lazy load non-critical components
  - [ ] Optimize canvas animations for low-end devices

- [ ] **Testing**
  - [ ] Unit tests for core logic (intervals, durations)
  - [ ] Integration tests for Firebase sync
  - [ ] E2E tests for critical flows

## Priority 3: Medium

- [ ] **Code Cleanup & Components**
  - [ ] Extract reusable `SheetHeader` component from sheets
  - [ ] Extract reusable `SheetContainer` component (backdrop + motion.div pattern)
  - [ ] Create shared button components (primary, secondary, icon buttons)
  - [ ] Move sheet components to separate files
  - [ ] Reduce WaitScreen.tsx file size (currently 4000+ lines)
  - [ ] Explore sheet libraries (vaul, react-modal-sheet) for better scroll + drag handling

- [ ] **PWA Enhancements**
  - [ ] Service worker for offline caching
  - [ ] Push notifications for reminders
  - [ ] App install prompts

- [ ] **Analytics** (privacy-respecting)
  - [ ] Anonymous usage metrics
  - [ ] Error tracking (Sentry or similar)

- [ ] **Internationalization (i18n)**
  - [ ] Extract all strings
  - [ ] Add German translation
  - [ ] RTL support consideration

## Priority 4: Nice to Have

- [ ] **Data Backup**
  - [ ] Cloud backup option
  - [ ] Import from backup

- [ ] **Theming**
  - [ ] Custom color themes
  - [ ] High contrast mode

- [ ] **Sharing**
  - [ ] Share contraction summary image
  - [ ] Share with healthcare provider

---

*Last updated: January 2026*
