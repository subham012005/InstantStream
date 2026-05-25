# Requirements Document

## Introduction

This feature adds a structured error-reporting mechanism to the FluxPlays video player. When a user pastes a video URL and it fails to load — either because the `/api/validate` endpoint rejects it, the browser player encounters a fatal HLS error, or the native `<video>` element fires an unrecoverable error — a contextual report form surfaces inline beneath the error message. The form pre-fills the failing URL, collects a short description and an optional email address, and submits the report to the existing Google Forms backend. The goal is to give users a frictionless way to flag broken links while giving the development team actionable data to improve link compatibility.

## Glossary

- **Error_Banner**: The inline UI element that displays a human-readable error message beneath the URL input field when a link fails validation or playback.
- **Report_Form**: The compact inline form that appears beneath the Error_Banner, allowing the user to submit a report about the failing link.
- **Validate_API**: The Next.js API route at `/api/validate` that performs server-side URL validation and returns either a stream URL or an error.
- **Player**: The `CustomPlayer` React component that handles HLS and native video playback.
- **Fatal_Error**: A playback error from which the Player cannot recover automatically, as signalled by `hls.js` `data.fatal === true` or a native `<video>` `error` event with a non-null `MediaError`.
- **Report_Submission**: The HTTP POST to the Google Forms endpoint that records the user's report.
- **Feedback_Type**: A fixed category label attached to every report submitted via the Report_Form, set to `"⚡ Stream Performance Issue"`.
- **Dismiss_Action**: The user action of closing the Report_Form without submitting it.

---

## Requirements

### Requirement 1: Error Detection and Report Form Trigger

**User Story:** As a user, I want the app to automatically offer me a way to report a problem when my pasted link fails, so that I don't have to hunt for a feedback channel.

#### Acceptance Criteria

1. WHEN the Validate_API returns a non-2xx HTTP response for a submitted URL, THE Error_Banner SHALL display the error message returned by the API, truncated to 300 characters if longer.
2. WHEN the Validate_API returns a non-2xx HTTP response for a submitted URL, THE Report_Form SHALL appear beneath the Error_Banner without requiring any additional user action.
3. WHEN the Player emits a Fatal_Error during HLS playback, THE Error_Banner SHALL display a message in the format "[error type]: [error details]", truncated to 300 characters if longer.
4. WHEN the Player emits a Fatal_Error during HLS playback, THE Report_Form SHALL appear beneath the Error_Banner without requiring any additional user action.
5. WHEN a network failure prevents the browser from reaching the Validate_API, THE Error_Banner SHALL display the message "An error occurred connecting to the server."
6. WHEN a network failure prevents the browser from reaching the Validate_API, THE Report_Form SHALL appear beneath the Error_Banner without requiring any additional user action.
7. WHEN the user clears the URL input field, THE Report_Form SHALL be hidden and THE Error_Banner SHALL be hidden.
8. WHEN the user submits a new URL for validation, THE Report_Form SHALL be hidden and THE Error_Banner SHALL be hidden before the new validation request begins.
9. WHEN the Report_Form is already visible and a new Fatal_Error fires, THE Report_Form SHALL remain visible without a hide/re-show cycle.

---

### Requirement 2: Report Form Content and Pre-fill

**User Story:** As a user, I want the report form to already know which URL failed, so that I don't have to type it in myself.

#### Acceptance Criteria

1. THE Report_Form SHALL pre-fill the failing video URL (the URL most recently submitted for validation) into the Report_Submission payload without displaying it as an editable input field.
2. THE Report_Form SHALL set the Feedback_Type field in the Report_Submission payload to the fixed value `"⚡ Stream Performance Issue"`.
3. THE Report_Form SHALL display a required free-text description field labelled "What went wrong?" with a maximum length of 2000 characters, blocking input beyond that limit.
4. THE Report_Form SHALL display a character counter showing the current length and the 2000-character limit for the description field.
5. THE Report_Form SHALL display an optional email address field labelled "Your email (optional)", which may be left blank without preventing submission.
6. THE Report_Form SHALL display the Feedback_Type value as a non-editable badge in the form header.
7. IF no failing URL is available when the Report_Form is triggered, THEN THE Report_Form SHALL use an empty string as the URL value in the Report_Submission payload.

---

### Requirement 3: Report Form Validation

**User Story:** As a user, I want the form to catch obvious mistakes before I submit, so that I don't accidentally send an empty or malformed report.

#### Acceptance Criteria

1. WHILE the description field is empty or contains only whitespace, THE Report_Form SHALL keep the submit button in a disabled state.
2. WHEN the description field contains at least one non-whitespace character, THE Report_Form SHALL enable the submit button.
3. WHEN the user activates the enabled submit button, THE Report_Form SHALL proceed to submission.
4. IF the email field contains a non-empty value that does not contain both "@" and ".", THEN THE Report_Form SHALL display an inline validation error beneath the email field.
5. IF the email field contains a non-empty value that does not contain both "@" and ".", THEN THE Report_Form SHALL NOT initiate a Report_Submission.
6. IF the email field is empty, THEN THE Report_Form SHALL treat the email as not provided and SHALL NOT display a validation error for the email field.
7. WHEN the user activates the submit button, THE Report_Form SHALL perform all validation client-side before initiating a Report_Submission.

---

### Requirement 4: Report Submission

**User Story:** As a user, I want my report to be sent reliably and to receive clear feedback on whether it succeeded, so that I know my input was received.

#### Acceptance Criteria

1. WHEN the user submits the Report_Form with a description of 1–2000 non-whitespace-containing characters, THE Report_Form SHALL POST the report data to the Google Forms endpoint.
2. WHILE a Report_Submission is in progress, THE Report_Form SHALL display a visual loading indicator on the submit button and SHALL disable all form inputs.
3. WHEN the fetch request for a Report_Submission resolves without throwing a network error, THE Report_Form SHALL replace the form fields with a success confirmation message.
4. IF a network error occurs during Report_Submission, THEN THE Report_Form SHALL display an inline error message and SHALL re-enable all form inputs so the user can retry.
5. THE Report_Submission payload SHALL include: the Feedback_Type, the pre-filled video URL, an empty photo-proof field, the user's description, and the user's email (empty string if not provided).

---

### Requirement 5: Dismiss Behaviour

**User Story:** As a user, I want to be able to close the report form if I don't want to submit a report, so that it doesn't clutter my screen.

#### Acceptance Criteria

1. THE Report_Form SHALL display a close button in its header.
2. WHEN the user activates the close button, THE Report_Form SHALL be removed from the visible UI (the Dismiss_Action), and any data entered into the form fields SHALL be cleared.
3. WHEN the Dismiss_Action occurs and the Error_Banner is currently visible, THE Error_Banner SHALL remain visible.
4. WHEN the Report_Form is hidden via the Dismiss_Action, THE Report_Form SHALL NOT be shown again for the same URL unless the user re-submits that URL for validation.
5. WHEN the user re-submits the same URL that was previously dismissed, THE dismissed state SHALL be reset and THE Report_Form SHALL appear again if an error occurs.

---

### Requirement 6: Accessibility

**User Story:** As a user relying on assistive technology, I want the report form to be fully operable with a keyboard and screen reader, so that I can report errors regardless of how I interact with the page.

#### Acceptance Criteria

1. THE Report_Form SHALL associate every input field with a visible `<label>` element using matching `htmlFor` and `id` attributes.
2. THE Report_Form SHALL provide an `aria-label` attribute on the close button describing its action.
3. WHEN the Report_Form becomes visible, THE Report_Form SHALL move focus to the description textarea.
4. WHILE the submit button is disabled, THE Report_Form SHALL expose `aria-disabled="true"` on the submit button element.
5. WHEN the Report_Form is open, keyboard navigation SHALL allow: Tab to move to the next focusable element, Shift+Tab to move to the previous focusable element, Enter or Space to activate buttons, and Escape to trigger the Dismiss_Action.
6. WHEN the Report_Form is open, keyboard focus SHALL be trapped within the form so that Tab and Shift+Tab cycle only through the form's focusable elements.
7. WHEN the Dismiss_Action occurs, focus SHALL be returned to the element that triggered the Report_Form to open.
8. WHEN a validation error is displayed, THE Report_Form SHALL announce the error to screen readers via an ARIA live region.

---

### Requirement 7: Responsive Layout

**User Story:** As a user on a mobile device, I want the report form to display correctly at small screen widths, so that I can submit a report from my phone.

#### Acceptance Criteria

1. THE Report_Form SHALL render without horizontal overflow at a minimum viewport width of 320 px.
2. THE Report_Form SHALL use a single-column layout for all form fields at viewport widths below 640 px.
3. THE Report_Form SHALL ensure no child element causes the form container to exceed the viewport width at any supported screen size.
