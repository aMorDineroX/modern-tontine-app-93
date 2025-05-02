import { configureAxe, toHaveNoViolations } from 'jest-axe';

// Add custom matchers
expect.extend(toHaveNoViolations);

// Configure axe for accessibility testing
export const axeConfig = configureAxe({
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
    'list': { enabled: true },
    'listitem': { enabled: true },
    'meta-viewport': { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'frame-title': { enabled: true },
    'heading-order': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'input-button-name': { enabled: true },
    'input-image-alt': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-one-main': { enabled: true },
    'meta-refresh': { enabled: true },
    'nested-interactive': { enabled: true },
    'no-autoplay-audio': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'scope-attr-valid': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'select-name': { enabled: true },
    'server-side-image-map': { enabled: true },
    'svg-img-alt': { enabled: true },
    'tabindex': { enabled: true },
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'td-has-header': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
    'video-caption': { enabled: true },
    
    // Disable specific rules that might cause false positives in testing environment
    'document-title': { enabled: false }, // Often not relevant in component tests
    'html-has-lang': { enabled: false }, // Often not relevant in component tests
    'landmark-one-main': { enabled: false }, // Often not relevant in component tests
    'page-has-heading-one': { enabled: false }, // Often not relevant in component tests
    'region': { enabled: false }, // Often not relevant in component tests
  },
  
  // Set the level of message to include in the violations
  resultTypes: ['violations', 'incomplete', 'inapplicable'],
  
  // Set the HTML element to test
  elementRef: true,
  
  // Set the level of violation to report
  // 'minor', 'moderate', 'serious', 'critical'
  includedImpacts: ['critical', 'serious', 'moderate'],
});

// Define accessibility test levels
export enum AccessibilityTestLevel {
  /** Basic accessibility tests (critical issues only) */
  BASIC = 'basic',
  /** Standard accessibility tests (critical and serious issues) */
  STANDARD = 'standard',
  /** Comprehensive accessibility tests (all issues) */
  COMPREHENSIVE = 'comprehensive',
}

// Configure axe based on test level
export const getAxeConfig = (level: AccessibilityTestLevel) => {
  switch (level) {
    case AccessibilityTestLevel.BASIC:
      return {
        ...axeConfig,
        includedImpacts: ['critical'],
      };
    case AccessibilityTestLevel.STANDARD:
      return {
        ...axeConfig,
        includedImpacts: ['critical', 'serious'],
      };
    case AccessibilityTestLevel.COMPREHENSIVE:
      return {
        ...axeConfig,
        includedImpacts: ['critical', 'serious', 'moderate', 'minor'],
      };
    default:
      return axeConfig;
  }
};

// Define common ARIA roles for testing
export const ariaRoles = {
  // Landmark roles
  banner: 'banner',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  form: 'form',
  main: 'main',
  navigation: 'navigation',
  region: 'region',
  search: 'search',
  
  // Widget roles
  alert: 'alert',
  alertdialog: 'alertdialog',
  button: 'button',
  checkbox: 'checkbox',
  dialog: 'dialog',
  gridcell: 'gridcell',
  link: 'link',
  log: 'log',
  marquee: 'marquee',
  menuitem: 'menuitem',
  menuitemcheckbox: 'menuitemcheckbox',
  menuitemradio: 'menuitemradio',
  option: 'option',
  progressbar: 'progressbar',
  radio: 'radio',
  scrollbar: 'scrollbar',
  slider: 'slider',
  spinbutton: 'spinbutton',
  status: 'status',
  switch: 'switch',
  tab: 'tab',
  tabpanel: 'tabpanel',
  textbox: 'textbox',
  timer: 'timer',
  tooltip: 'tooltip',
  treeitem: 'treeitem',
  
  // Document structure roles
  article: 'article',
  cell: 'cell',
  columnheader: 'columnheader',
  definition: 'definition',
  directory: 'directory',
  document: 'document',
  feed: 'feed',
  figure: 'figure',
  group: 'group',
  heading: 'heading',
  img: 'img',
  list: 'list',
  listitem: 'listitem',
  math: 'math',
  none: 'none',
  note: 'note',
  presentation: 'presentation',
  row: 'row',
  rowgroup: 'rowgroup',
  rowheader: 'rowheader',
  separator: 'separator',
  table: 'table',
  term: 'term',
  toolbar: 'toolbar',
  tooltip: 'tooltip',
};

// Define common ARIA attributes for testing
export const ariaAttributes = {
  // Widget attributes
  'aria-autocomplete': ['none', 'inline', 'list', 'both'],
  'aria-checked': ['true', 'false', 'mixed', undefined],
  'aria-current': ['page', 'step', 'location', 'date', 'time', 'true', 'false'],
  'aria-disabled': ['true', 'false'],
  'aria-expanded': ['true', 'false', undefined],
  'aria-haspopup': ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
  'aria-hidden': ['true', 'false'],
  'aria-invalid': ['true', 'false', 'grammar', 'spelling'],
  'aria-label': ['string'],
  'aria-level': ['number'],
  'aria-modal': ['true', 'false'],
  'aria-multiline': ['true', 'false'],
  'aria-multiselectable': ['true', 'false'],
  'aria-orientation': ['horizontal', 'vertical', undefined],
  'aria-placeholder': ['string'],
  'aria-pressed': ['true', 'false', 'mixed', undefined],
  'aria-readonly': ['true', 'false'],
  'aria-required': ['true', 'false'],
  'aria-selected': ['true', 'false', undefined],
  'aria-sort': ['ascending', 'descending', 'none', 'other'],
  'aria-valuemax': ['number'],
  'aria-valuemin': ['number'],
  'aria-valuenow': ['number'],
  'aria-valuetext': ['string'],
  
  // Live region attributes
  'aria-atomic': ['true', 'false'],
  'aria-busy': ['true', 'false'],
  'aria-live': ['assertive', 'polite', 'off'],
  'aria-relevant': ['additions', 'additions text', 'all', 'removals', 'text'],
  
  // Drag-and-drop attributes
  'aria-dropeffect': ['copy', 'execute', 'link', 'move', 'none', 'popup'],
  'aria-grabbed': ['true', 'false', undefined],
  
  // Relationship attributes
  'aria-activedescendant': ['ID reference'],
  'aria-colcount': ['number'],
  'aria-colindex': ['number'],
  'aria-colspan': ['number'],
  'aria-controls': ['ID reference list'],
  'aria-describedby': ['ID reference list'],
  'aria-details': ['ID reference'],
  'aria-errormessage': ['ID reference'],
  'aria-flowto': ['ID reference list'],
  'aria-labelledby': ['ID reference list'],
  'aria-owns': ['ID reference list'],
  'aria-posinset': ['number'],
  'aria-rowcount': ['number'],
  'aria-rowindex': ['number'],
  'aria-rowspan': ['number'],
  'aria-setsize': ['number'],
};

// Define common keyboard interactions for testing
export const keyboardInteractions = {
  tab: { key: 'Tab' },
  shiftTab: { key: 'Tab', shiftKey: true },
  enter: { key: 'Enter' },
  space: { key: ' ' },
  escape: { key: 'Escape' },
  arrowUp: { key: 'ArrowUp' },
  arrowDown: { key: 'ArrowDown' },
  arrowLeft: { key: 'ArrowLeft' },
  arrowRight: { key: 'ArrowRight' },
  home: { key: 'Home' },
  end: { key: 'End' },
  pageUp: { key: 'PageUp' },
  pageDown: { key: 'PageDown' },
};
