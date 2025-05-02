# Accessibility Component Guidelines

This document provides guidelines for creating accessible components in the Naat application.

## Table of Contents

1. [Introduction](#introduction)
2. [General Guidelines](#general-guidelines)
3. [Component-Specific Guidelines](#component-specific-guidelines)
   - [Buttons](#buttons)
   - [Links](#links)
   - [Forms](#forms)
   - [Dialogs](#dialogs)
   - [Comboboxes](#comboboxes)
   - [Tables](#tables)
   - [Accordions](#accordions)
   - [Tabs](#tabs)
   - [Tooltips](#tooltips)
   - [Menus](#menus)
   - [Sliders](#sliders)
   - [Progress Indicators](#progress-indicators)
   - [File Uploads](#file-uploads)
   - [Carousels](#carousels)
   - [Date Pickers](#date-pickers)
   - [Notifications](#notifications)
4. [Testing Components](#testing-components)
5. [Resources](#resources)

## Introduction

Creating accessible components is essential for ensuring that all users, including those with disabilities, can use the Naat application effectively. This document provides guidelines for creating accessible components based on the Web Content Accessibility Guidelines (WCAG) 2.1 and best practices.

## General Guidelines

### Semantic HTML

- Use semantic HTML elements whenever possible
- Use the appropriate HTML element for the purpose (e.g., `<button>` for buttons, `<a>` for links)
- Use heading elements (`<h1>` through `<h6>`) in a logical order
- Use list elements (`<ul>`, `<ol>`, `<li>`) for lists
- Use table elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`) for tabular data
- Use form elements (`<form>`, `<fieldset>`, `<legend>`, `<label>`, `<input>`, etc.) for forms

### ARIA

- Use ARIA attributes only when necessary
- Use ARIA attributes correctly
- Use ARIA landmarks to identify regions of the page
- Use ARIA live regions for dynamic content
- Use ARIA roles to enhance semantics

### Keyboard Navigation

- Ensure all interactive elements are focusable
- Ensure focus order is logical
- Provide visible focus indicators
- Trap focus in dialogs and modals
- Restore focus when dialogs and modals are closed

### Screen Reader Support

- Provide text alternatives for non-text content
- Use ARIA live regions for dynamic content
- Ensure screen readers can access all content
- Test with multiple screen readers
- Provide skip links for keyboard users

### Color and Contrast

- Ensure sufficient color contrast
- Do not rely on color alone to convey information
- Provide high contrast mode
- Test with color blindness simulators
- Use patterns and textures to differentiate elements when necessary

### Touch and Pointer

- Ensure touch targets are large enough (at least 44x44 pixels)
- Ensure touch targets have sufficient spacing
- Provide alternatives for hover and focus effects
- Ensure drag and drop operations are accessible
- Test with touch devices

## Component-Specific Guidelines

### Buttons

#### HTML and ARIA

```tsx
// Good
<button type="button" aria-label="Close">X</button>

// Good
<Button variant="primary" aria-label="Save changes">Save</Button>

// Bad - using a div as a button
<div onClick={handleClick} role="button">Click me</div>
```

#### Keyboard Support

- `Enter` or `Space`: Activate the button
- `Tab`: Move focus to the next focusable element
- `Shift + Tab`: Move focus to the previous focusable element

#### Guidelines

- Use the `<button>` element for buttons
- Provide a descriptive label
- Ensure buttons have a visible focus state
- Ensure buttons have sufficient contrast
- Disable buttons only when necessary
- Provide a visual indication when buttons are disabled
- Ensure disabled buttons have sufficient contrast
- Use `aria-disabled="true"` instead of the `disabled` attribute when appropriate

### Links

#### HTML and ARIA

```tsx
// Good
<a href="/about">About</a>

// Good
<Link to="/about" aria-label="Learn more about our company">About</Link>

// Bad - using a span as a link
<span onClick={handleClick} role="link">Click me</span>
```

#### Keyboard Support

- `Enter`: Activate the link
- `Tab`: Move focus to the next focusable element
- `Shift + Tab`: Move focus to the previous focusable element

#### Guidelines

- Use the `<a>` element for links
- Provide a descriptive label
- Ensure links have a visible focus state
- Ensure links have sufficient contrast
- Ensure links are distinguishable from surrounding text
- Avoid "click here" and "read more" as link text
- Use `aria-current="page"` for the current page link
- Use `target="_blank"` and `rel="noopener noreferrer"` for links that open in a new tab
- Provide a visual indication for links that open in a new tab

### Forms

#### HTML and ARIA

```tsx
// Good
<form>
  <div>
    <label htmlFor="name">Name</label>
    <input id="name" type="text" aria-required="true" />
  </div>
  <div>
    <label htmlFor="email">Email</label>
    <input id="email" type="email" aria-required="true" aria-invalid={emailError ? "true" : "false"} />
    {emailError && <div id="email-error" aria-live="polite">{emailError}</div>}
  </div>
  <button type="submit">Submit</button>
</form>

// Bad - missing labels
<form>
  <div>
    <input type="text" placeholder="Name" />
  </div>
  <div>
    <input type="email" placeholder="Email" />
  </div>
  <button type="submit">Submit</button>
</form>
```

#### Keyboard Support

- `Tab`: Move focus to the next form control
- `Shift + Tab`: Move focus to the previous form control
- `Enter`: Submit the form (when focus is on a submit button or when there is only one text input)
- `Space`: Toggle checkboxes and radio buttons

#### Guidelines

- Associate labels with form controls using the `for` attribute
- Provide clear error messages
- Use `aria-invalid="true"` for invalid form controls
- Use `aria-describedby` to associate error messages with form controls
- Use `aria-required="true"` for required form controls
- Group related form controls with fieldsets and legends
- Provide clear instructions for form completion
- Ensure form controls have sufficient contrast
- Ensure form controls have a visible focus state
- Provide feedback for form submission
- Use `autocomplete` attributes when appropriate

### Dialogs

#### HTML and ARIA

```tsx
// Good
<div
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-description">Dialog description</p>
  <button onClick={closeDialog}>Close</button>
</div>

// Using AccessibleDialog component
<AccessibleDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Dialog Title"
  description="Dialog description"
>
  Dialog content
</AccessibleDialog>
```

#### Keyboard Support

- `Tab`: Move focus to the next focusable element within the dialog
- `Shift + Tab`: Move focus to the previous focusable element within the dialog
- `Esc`: Close the dialog
- `Enter`: Activate the focused button

#### Guidelines

- Use `role="dialog"` or `role="alertdialog"` for dialogs
- Use `aria-labelledby` to associate the dialog with its title
- Use `aria-describedby` to associate the dialog with its description
- Use `aria-modal="true"` for modal dialogs
- Trap focus within the dialog
- Set initial focus to the first focusable element or the close button
- Restore focus to the trigger element when the dialog is closed
- Ensure the dialog is properly positioned
- Ensure the dialog has sufficient contrast
- Provide a close button
- Ensure the dialog is responsive

### Comboboxes

#### HTML and ARIA

```tsx
// Using AccessibleCombobox component
<AccessibleCombobox
  items={items}
  placeholder="Select an option"
  onValueChange={setValue}
  label="Favorite Fruit"
/>
```

#### Keyboard Support

- `Enter` or `Arrow Down`: Open the dropdown
- `Esc`: Close the dropdown
- `Arrow Up/Down`: Navigate through options
- `Enter`: Select the focused option
- `Tab`: Move focus to the next focusable element
- `Shift + Tab`: Move focus to the previous focusable element
- `Home`: Move focus to the first option
- `End`: Move focus to the last option
- `Type characters`: Filter options

#### Guidelines

- Use `role="combobox"` for the input
- Use `aria-expanded="true/false"` to indicate whether the dropdown is open
- Use `aria-controls` to associate the input with the dropdown
- Use `aria-activedescendant` to indicate the currently focused option
- Use `role="listbox"` for the dropdown
- Use `role="option"` for the options
- Use `aria-selected="true/false"` to indicate the selected option
- Ensure the combobox has a visible focus state
- Ensure the combobox has sufficient contrast
- Provide a clear indication of the selected option
- Announce selection changes to screen readers
- Support keyboard navigation within the dropdown

### Tables

#### HTML and ARIA

```tsx
// Good
<table>
  <caption>Users</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane@example.com</td>
      <td>User</td>
    </tr>
  </tbody>
</table>

// Using AccessibleDataTable component
<AccessibleDataTable
  data={data}
  columns={columns}
  caption="Users Table"
  pagination
  sortable
  searchable
/>
```

#### Keyboard Support

- `Tab`: Move focus to the next focusable element within the table
- `Shift + Tab`: Move focus to the previous focusable element within the table
- `Arrow Up/Down/Left/Right`: Navigate through cells
- `Home`: Move to the first cell in the row
- `End`: Move to the last cell in the row
- `Ctrl + Home`: Move to the first cell in the first row
- `Ctrl + End`: Move to the last cell in the last row
- `Page Up/Down`: Navigate between pages

#### Guidelines

- Use proper table markup (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- Use `<caption>` to provide a title for the table
- Use `scope="col"` for column headers and `scope="row"` for row headers
- Use `<th>` for header cells and `<td>` for data cells
- Use `aria-sort="ascending/descending/none"` for sortable columns
- Use `aria-label` or `aria-labelledby` to provide a description for the table
- Ensure the table is responsive
- Provide a way to sort and filter the table
- Provide pagination for large tables
- Announce sort and filter changes to screen readers
- Support keyboard navigation within the table

### Accordions

#### HTML and ARIA

```tsx
// Good
<div>
  <h3>
    <button
      aria-expanded="false"
      aria-controls="section1-content"
      id="section1-header"
    >
      Section 1
    </button>
  </h3>
  <div
    id="section1-content"
    role="region"
    aria-labelledby="section1-header"
    hidden
  >
    Content for section 1
  </div>
</div>

// Using AccessibleAccordion component
<AccessibleAccordion>
  <AccessibleAccordionItem title="Section 1">
    Content for section 1
  </AccessibleAccordionItem>
  <AccessibleAccordionItem title="Section 2">
    Content for section 2
  </AccessibleAccordionItem>
</AccessibleAccordion>
```

#### Keyboard Support

- `Enter` or `Space`: Toggle the accordion item
- `Tab`: Move focus to the next focusable element
- `Shift + Tab`: Move focus to the previous focusable element
- `Arrow Up/Down`: Navigate between accordion items
- `Home`: Move focus to the first accordion item
- `End`: Move focus to the last accordion item

#### Guidelines

- Use `aria-expanded="true/false"` to indicate whether the accordion item is expanded
- Use `aria-controls` to associate the button with the content
- Use `aria-labelledby` to associate the content with the button
- Use `role="region"` for the content
- Use `hidden` attribute to hide collapsed content
- Ensure the accordion has a visible focus state
- Ensure the accordion has sufficient contrast
- Provide a clear indication of the expanded state
- Announce expansion state changes to screen readers
- Support keyboard navigation between accordion items

### Tabs

#### HTML and ARIA

```tsx
// Good
<div>
  <div role="tablist" aria-label="Tabs">
    <button
      role="tab"
      aria-selected="true"
      aria-controls="tab1-panel"
      id="tab1"
    >
      Tab 1
    </button>
    <button
      role="tab"
      aria-selected="false"
      aria-controls="tab2-panel"
      id="tab2"
      tabIndex="-1"
    >
      Tab 2
    </button>
  </div>
  <div
    role="tabpanel"
    aria-labelledby="tab1"
    id="tab1-panel"
  >
    Content for tab 1
  </div>
  <div
    role="tabpanel"
    aria-labelledby="tab2"
    id="tab2-panel"
    hidden
  >
    Content for tab 2
  </div>
</div>
```

#### Keyboard Support

- `Tab`: Move focus to the selected tab
- `Arrow Left/Right`: Navigate between tabs
- `Home`: Move focus to the first tab
- `End`: Move focus to the last tab
- `Enter` or `Space`: Activate the focused tab
- `Tab` (after activating a tab): Move focus to the tab panel

#### Guidelines

- Use `role="tablist"` for the container of tabs
- Use `role="tab"` for the tabs
- Use `role="tabpanel"` for the tab panels
- Use `aria-selected="true/false"` to indicate the selected tab
- Use `aria-controls` to associate the tab with the tab panel
- Use `aria-labelledby` to associate the tab panel with the tab
- Use `tabIndex="0"` for the selected tab and `tabIndex="-1"` for other tabs
- Use `hidden` attribute to hide inactive tab panels
- Ensure tabs have a visible focus state
- Ensure tabs have sufficient contrast
- Provide a clear indication of the selected tab
- Announce tab changes to screen readers
- Support keyboard navigation between tabs

### Tooltips

#### HTML and ARIA

```tsx
// Good
<button aria-describedby="tooltip1">Hover me</button>
<div id="tooltip1" role="tooltip">This is a tooltip</div>

// Using AccessibleTooltip component
<AccessibleTooltip content="This is a tooltip">
  <Button>Hover me</Button>
</AccessibleTooltip>
```

#### Keyboard Support

- `Tab`: Move focus to the element with the tooltip
- `Esc`: Dismiss the tooltip (if persistent)

#### Guidelines

- Use `role="tooltip"` for the tooltip
- Use `aria-describedby` to associate the element with the tooltip
- Ensure the tooltip is visible on hover and focus
- Ensure the tooltip has sufficient contrast
- Position the tooltip appropriately
- Ensure the tooltip does not obscure important content
- Provide a way to dismiss persistent tooltips
- Announce tooltip content to screen readers
- Ensure tooltips are not the only way to access information

### Menus

#### HTML and ARIA

```tsx
// Good
<div>
  <button
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="menu1"
  >
    Menu
  </button>
  <ul
    id="menu1"
    role="menu"
    aria-labelledby="menu-button"
    hidden
  >
    <li role="menuitem">Item 1</li>
    <li role="menuitem">Item 2</li>
    <li role="menuitem">Item 3</li>
  </ul>
</div>
```

#### Keyboard Support

- `Enter`, `Space`, or `Arrow Down`: Open the menu
- `Esc`: Close the menu
- `Arrow Up/Down`: Navigate through menu items
- `Enter` or `Space`: Activate the focused menu item
- `Tab`: Move focus to the next focusable element (closes the menu)
- `Home`: Move focus to the first menu item
- `End`: Move focus to the last menu item

#### Guidelines

- Use `aria-haspopup="true"` for the menu button
- Use `aria-expanded="true/false"` to indicate whether the menu is open
- Use `aria-controls` to associate the button with the menu
- Use `role="menu"` for the menu
- Use `role="menuitem"` for menu items
- Use `aria-labelledby` to associate the menu with the button
- Trap focus within the menu when open
- Ensure the menu has a visible focus state
- Ensure the menu has sufficient contrast
- Provide a clear indication of the focused menu item
- Announce menu opening and closing to screen readers
- Support keyboard navigation within the menu

### Sliders

#### HTML and ARIA

```tsx
// Good
<div>
  <label id="slider-label">Volume</label>
  <input
    type="range"
    min="0"
    max="100"
    value="50"
    aria-labelledby="slider-label"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="50"
    aria-valuetext="50%"
  />
</div>
```

#### Keyboard Support

- `Tab`: Move focus to the slider
- `Arrow Left/Down`: Decrease the value
- `Arrow Right/Up`: Increase the value
- `Home`: Set to the minimum value
- `End`: Set to the maximum value
- `Page Down`: Decrease by a larger amount
- `Page Up`: Increase by a larger amount

#### Guidelines

- Use the `<input type="range">` element for sliders
- Use `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` to indicate the range and current value
- Use `aria-valuetext` to provide a text alternative for the current value
- Use `aria-labelledby` or `aria-label` to provide a label for the slider
- Ensure the slider has a visible focus state
- Ensure the slider has sufficient contrast
- Provide a clear indication of the current value
- Announce value changes to screen readers
- Support keyboard navigation for the slider

### Progress Indicators

#### HTML and ARIA

```tsx
// Good
<div>
  <label id="progress-label">Loading</label>
  <progress
    value="50"
    max="100"
    aria-labelledby="progress-label"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="50"
    aria-valuetext="50%"
  ></progress>
</div>

// Indeterminate progress
<div>
  <label id="progress-label">Loading</label>
  <progress
    aria-labelledby="progress-label"
    aria-busy="true"
  ></progress>
</div>
```

#### Guidelines

- Use the `<progress>` element for progress indicators
- Use `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` to indicate the range and current value
- Use `aria-valuetext` to provide a text alternative for the current value
- Use `aria-labelledby` or `aria-label` to provide a label for the progress indicator
- Use `aria-busy="true"` for indeterminate progress indicators
- Ensure the progress indicator has sufficient contrast
- Provide a clear indication of the current progress
- Announce progress changes to screen readers
- Provide a text alternative for visual progress indicators

### File Uploads

#### HTML and ARIA

```tsx
// Good
<div>
  <label htmlFor="file-upload">Upload file</label>
  <input
    id="file-upload"
    type="file"
    aria-describedby="file-upload-description"
  />
  <div id="file-upload-description">
    Accepted file types: JPG, PNG, PDF. Maximum file size: 5MB.
  </div>
</div>

// Using AccessibleFileUpload component
<AccessibleFileUpload
  label="Upload file"
  helperText="Accepted file types: JPG, PNG, PDF. Maximum file size: 5MB."
  accept=".jpg,.png,.pdf"
  maxSize={5 * 1024 * 1024}
/>
```

#### Keyboard Support

- `Tab`: Move focus to the file input
- `Enter` or `Space`: Open the file browser
- `Tab` (after selecting a file): Move focus to the next focusable element

#### Guidelines

- Use the `<input type="file">` element for file uploads
- Use `aria-describedby` to associate the input with a description
- Provide clear instructions for file uploads
- Specify accepted file types and size limits
- Provide feedback for file selection and upload progress
- Ensure the file input has a visible focus state
- Ensure the file input has sufficient contrast
- Announce file selection and upload progress to screen readers
- Support keyboard navigation for the file input

### Carousels

#### HTML and ARIA

```tsx
// Good
<div
  role="region"
  aria-label="Image carousel"
  aria-roledescription="carousel"
>
  <div aria-live="polite">
    <div
      role="group"
      aria-roledescription="slide"
      aria-label="1 of 3"
    >
      <img src="image1.jpg" alt="Description of image 1" />
    </div>
  </div>
  <div>
    <button aria-label="Previous slide">Previous</button>
    <button aria-label="Next slide">Next</button>
  </div>
  <div>
    <button aria-label="Go to slide 1" aria-current="true">1</button>
    <button aria-label="Go to slide 2">2</button>
    <button aria-label="Go to slide 3">3</button>
  </div>
</div>
```

#### Keyboard Support

- `Tab`: Move focus to the carousel controls
- `Enter` or `Space`: Activate the focused control
- `Arrow Left/Right`: Navigate between slides (when supported)

#### Guidelines

- Use `role="region"` for the carousel container
- Use `aria-roledescription="carousel"` to identify the carousel
- Use `aria-label` to provide a label for the carousel
- Use `role="group"` for each slide
- Use `aria-roledescription="slide"` to identify each slide
- Use `aria-label` to provide a label for each slide
- Use `aria-live="polite"` for the slide container
- Use `aria-current="true"` for the current slide indicator
- Provide controls for navigating between slides
- Ensure the carousel controls have a visible focus state
- Ensure the carousel controls have sufficient contrast
- Provide a way to pause automatic rotation
- Announce slide changes to screen readers
- Support keyboard navigation for the carousel

### Date Pickers

#### HTML and ARIA

```tsx
// Good
<div>
  <label htmlFor="date-picker">Select a date</label>
  <input
    id="date-picker"
    type="date"
    aria-describedby="date-picker-description"
  />
  <div id="date-picker-description">
    Format: MM/DD/YYYY
  </div>
</div>
```

#### Keyboard Support

- `Tab`: Move focus to the date input
- `Enter`: Open the date picker
- `Esc`: Close the date picker
- `Arrow Up/Down/Left/Right`: Navigate within the date picker
- `Enter`: Select the focused date
- `Tab` (within the date picker): Navigate between focusable elements
- `Home`: Move to the first day of the month
- `End`: Move to the last day of the month
- `Page Up`: Move to the previous month
- `Page Down`: Move to the next month
- `Shift + Page Up`: Move to the previous year
- `Shift + Page Down`: Move to the next year

#### Guidelines

- Use the `<input type="date">` element for date inputs
- Use `aria-describedby` to associate the input with a description
- Provide clear instructions for date format
- Ensure the date picker is keyboard accessible
- Ensure the date picker has a visible focus state
- Ensure the date picker has sufficient contrast
- Provide a clear indication of the selected date
- Announce date selection to screen readers
- Support keyboard navigation within the date picker

### Notifications

#### HTML and ARIA

```tsx
// Good
<div
  role="alert"
  aria-live="assertive"
>
  Error: Form submission failed
</div>

// Good
<div
  role="status"
  aria-live="polite"
>
  Form submitted successfully
</div>

// Using LiveRegion component
<LiveRegion politeness="assertive">
  Error: Form submission failed
</LiveRegion>

<LiveRegion politeness="polite">
  Form submitted successfully
</LiveRegion>
```

#### Guidelines

- Use `role="alert"` for important notifications
- Use `role="status"` for less important notifications
- Use `aria-live="assertive"` for important notifications
- Use `aria-live="polite"` for less important notifications
- Ensure notifications are announced to screen readers
- Provide a way to dismiss notifications
- Ensure notifications have sufficient contrast
- Provide a clear indication of the notification type
- Use appropriate icons to convey the notification type
- Ensure notifications are visible for a sufficient amount of time

## Testing Components

### Automated Testing

- Use Jest-Axe for automated accessibility testing
- Use Lighthouse for performance and accessibility audits
- Use ESLint with jsx-a11y for static code analysis

```tsx
// Example Jest-Axe test
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Button from './Button';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

- Test with keyboard navigation
- Test with screen readers
- Test with high contrast mode
- Test with reduced motion
- Test with different font sizes
- Test with color contrast tools

## Resources

- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [Accessible Rich Internet Applications (ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [Deque University](https://dequeuniversity.com/)
