# Accessibility Testing Guide

This document provides guidelines for testing the accessibility of the Naat application.

## Table of Contents

1. [Introduction](#introduction)
2. [Automated Testing](#automated-testing)
   - [Jest-Axe](#jest-axe)
   - [Lighthouse](#lighthouse)
   - [ESLint with jsx-a11y](#eslint-with-jsx-a11y)
3. [Manual Testing](#manual-testing)
   - [Keyboard Navigation](#keyboard-navigation)
   - [Screen Reader Testing](#screen-reader-testing)
   - [Visual Testing](#visual-testing)
   - [Cognitive Testing](#cognitive-testing)
   - [Mobile Testing](#mobile-testing)
4. [Testing Checklist](#testing-checklist)
5. [Testing Tools](#testing-tools)
6. [Resources](#resources)

## Introduction

Accessibility testing is essential for ensuring that the Naat application is usable by all users, including those with disabilities. This document provides guidelines for testing the accessibility of the application using both automated and manual testing methods.

## Automated Testing

Automated testing tools can help identify many accessibility issues, but they cannot catch all issues. They should be used as part of a comprehensive testing strategy that includes manual testing.

### Jest-Axe

Jest-Axe is a Jest matcher that allows you to test your React components for accessibility issues using the axe-core accessibility testing engine.

#### Setup

```bash
npm install --save-dev jest-axe @testing-library/react
```

#### Usage

```tsx
// Example Jest-Axe test
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button';

// Add custom matchers
expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Configuration

You can configure Jest-Axe to focus on specific rules or to ignore certain rules:

```tsx
// Configure axe for accessibility testing
const axeConfig = {
  rules: {
    // Enable specific rules
    'color-contrast': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    
    // Disable specific rules
    'document-title': { enabled: false },
    'html-has-lang': { enabled: false },
  },
};

// Use the configuration in tests
it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container, axeConfig);
  expect(results).toHaveNoViolations();
});
```

### Lighthouse

Lighthouse is an open-source, automated tool for improving the quality of web pages. It has audits for performance, accessibility, progressive web apps, SEO, and more.

#### Usage

1. Open Chrome DevTools
2. Go to the "Lighthouse" tab
3. Select "Accessibility" and any other categories you want to audit
4. Click "Generate report"

#### CI Integration

You can integrate Lighthouse into your CI pipeline using the Lighthouse CI tool:

```bash
npm install -g @lhci/cli
lhci autorun
```

### ESLint with jsx-a11y

ESLint with the jsx-a11y plugin can help identify accessibility issues in your React code during development.

#### Setup

```bash
npm install --save-dev eslint eslint-plugin-jsx-a11y
```

#### Configuration

Add the following to your `.eslintrc.js` file:

```js
module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    // Add or override specific rules
    'jsx-a11y/label-has-associated-control': ['error', {
      assert: 'either',
    }],
  },
};
```

## Manual Testing

Manual testing is essential for identifying accessibility issues that automated testing tools cannot catch. It involves testing the application with different assistive technologies and under different conditions.

### Keyboard Navigation

Testing keyboard navigation involves ensuring that all functionality is accessible using only the keyboard.

#### Testing Steps

1. Start with the Tab key to navigate through all interactive elements
2. Ensure the focus order is logical and follows the visual layout
3. Ensure all interactive elements have a visible focus state
4. Test all keyboard shortcuts
5. Ensure focus is trapped within dialogs and modals
6. Ensure focus is restored when dialogs and modals are closed
7. Test keyboard navigation within complex components (e.g., comboboxes, data tables)

#### Common Keyboard Commands

- `Tab`: Move focus to the next focusable element
- `Shift + Tab`: Move focus to the previous focusable element
- `Enter` or `Space`: Activate buttons and links
- `Arrow keys`: Navigate within components (e.g., comboboxes, data tables)
- `Esc`: Close dialogs and modals
- `Home`: Move to the first item in a list
- `End`: Move to the last item in a list
- `Page Up/Down`: Scroll the page or navigate between pages in a data table

### Screen Reader Testing

Testing with screen readers involves ensuring that all content is accessible to users who rely on screen readers.

#### Testing Steps

1. Navigate through the application using the screen reader's navigation commands
2. Ensure all content is announced correctly
3. Ensure all interactive elements are announced with their roles and states
4. Ensure all images have appropriate alternative text
5. Ensure all form controls have associated labels
6. Ensure all error messages are announced
7. Ensure all dynamic content changes are announced
8. Test screen reader navigation within complex components (e.g., comboboxes, data tables)

#### Screen Readers to Test With

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS and iOS)
- TalkBack (Android)
- Orca (Linux)

### Visual Testing

Visual testing involves ensuring that the application is visually accessible to users with different visual impairments.

#### Testing Steps

1. Test with high contrast mode
2. Test with different font sizes
3. Test with different zoom levels
4. Test with color blindness simulators
5. Test with different screen sizes
6. Test with different display settings
7. Test with different browsers and devices

#### Tools for Visual Testing

- High Contrast mode in Windows
- Zoom functionality in browsers
- Color blindness simulators (e.g., Chrome DevTools)
- Responsive design mode in browsers
- Different browsers and devices

### Cognitive Testing

Cognitive testing involves ensuring that the application is usable by users with cognitive impairments.

#### Testing Steps

1. Test with simplified language
2. Test with clear and consistent navigation
3. Test with clear and consistent error messages
4. Test with clear and consistent feedback
5. Test with reduced motion
6. Test with reduced distractions
7. Test with different reading levels

### Mobile Testing

Mobile testing involves ensuring that the application is accessible on mobile devices.

#### Testing Steps

1. Test with touch navigation
2. Test with screen readers on mobile devices
3. Test with different screen sizes
4. Test with different orientations
5. Test with different input methods
6. Test with different network conditions
7. Test with different mobile browsers

## Testing Checklist

Use this checklist to ensure you've covered all aspects of accessibility testing:

### Automated Testing

- [ ] Run Jest-Axe tests for all components
- [ ] Run Lighthouse audits for all pages
- [ ] Run ESLint with jsx-a11y for all code

### Keyboard Navigation

- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] All interactive elements have a visible focus state
- [ ] All keyboard shortcuts work
- [ ] Focus is trapped within dialogs and modals
- [ ] Focus is restored when dialogs and modals are closed
- [ ] Keyboard navigation works within complex components

### Screen Reader Testing

- [ ] All content is announced correctly
- [ ] All interactive elements are announced with their roles and states
- [ ] All images have appropriate alternative text
- [ ] All form controls have associated labels
- [ ] All error messages are announced
- [ ] All dynamic content changes are announced
- [ ] Screen reader navigation works within complex components

### Visual Testing

- [ ] Application is usable in high contrast mode
- [ ] Application is usable with different font sizes
- [ ] Application is usable with different zoom levels
- [ ] Application is usable with color blindness
- [ ] Application is usable with different screen sizes
- [ ] Application is usable with different display settings
- [ ] Application is usable with different browsers and devices

### Cognitive Testing

- [ ] Application uses simplified language
- [ ] Application has clear and consistent navigation
- [ ] Application has clear and consistent error messages
- [ ] Application has clear and consistent feedback
- [ ] Application supports reduced motion
- [ ] Application supports reduced distractions
- [ ] Application is usable with different reading levels

### Mobile Testing

- [ ] Application is usable with touch navigation
- [ ] Application is usable with screen readers on mobile devices
- [ ] Application is usable with different screen sizes
- [ ] Application is usable with different orientations
- [ ] Application is usable with different input methods
- [ ] Application is usable with different network conditions
- [ ] Application is usable with different mobile browsers

## Testing Tools

### Automated Testing Tools

- [Jest-Axe](https://github.com/nickcolley/jest-axe)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [ESLint with jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE](https://wave.webaim.org/)
- [Accessibility Insights](https://accessibilityinsights.io/)

### Screen Readers

- [NVDA](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver](https://www.apple.com/accessibility/mac/vision/)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677)
- [Orca](https://help.gnome.org/users/orca/stable/)

### Visual Testing Tools

- [Color Contrast Analyzer](https://developer.paciellogroup.com/resources/contrastanalyser/)
- [Colorblinding](https://chrome.google.com/webstore/detail/colorblinding/dgbgleaofjainknadoffbjkclicbbgaa)
- [NoCoffee](https://chrome.google.com/webstore/detail/nocoffee/jjeeggmbnhckmgdhmgdckeigabjfbddl)
- [Responsive Design Mode in browsers](https://developer.mozilla.org/en-US/docs/Tools/Responsive_Design_Mode)

### Keyboard Testing Tools

- [Keyboard-Only Navigation](https://www.nngroup.com/articles/keyboard-accessibility/)
- [Tab Order Checker](https://chrome.google.com/webstore/detail/tab-order-checker/jipkbibpcpjhfbcalejbgioemkjpkfak)

## Resources

### Standards and Guidelines

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessible Rich Internet Applications (ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [HTML Accessibility API Mappings (HTML-AAM) 1.0](https://www.w3.org/TR/html-aam-1.0/)
- [User Agent Accessibility Guidelines (UAAG) 2.0](https://www.w3.org/TR/UAAG20/)
- [Authoring Tool Accessibility Guidelines (ATAG) 2.0](https://www.w3.org/TR/ATAG20/)

### Learning Resources

- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [Deque University](https://dequeuniversity.com/)
