# Requirements Document

## Introduction

This feature improves the video streaming experience on FluxPlays (InstantStream) across four dimensions: error transparency, streaming performance, playback visibility, and mobile usability. Users currently lose trust when a stream silently fails or buffers indefinitely with no feedback. This spec introduces an inline error report form, optimised HLS.js buffering configuration, a live stats overlay, a buffered-range indicator on the seek bar, and a fully responsive mobile layout for the player and surrounding UI.

The player is built on HLS.js (`hls.js ^1.6.16`) inside `CustomPlayer.tsx`. The error report form reuses the existing Google Forms submission pipeline from `FeedbackModal.tsx`. All changes are client-side React/TypeScript within the Next.js 16 app.

## Glossary

- **Player**: The `CustomPlayer` React component that wraps HLS.js and the `<video>` element.
- **HLS_Engine**: The HLS.js instance (`hlsRef.current`) responsible for fetching and demuxing HLS segments.
- **Error_Banner**: The inline error message shown below the URL input when stream validation or playback fails.
- **Inline_Report_Form**: A compact form rendered directly beneath the Error_Banner, allowing users to report a broken link without opening the full FeedbackModal.
- **Stats_Overlay**: A semi-transparent panel rendered inside the Player that displays live network and playback diagnostics.
- **Buffer_Bar**: A secondary visual track on the seek bar that shows the currently buffered range of the video.
- **ABR**: Adaptive Bitrate — HLS.js automatically switches quality levels based on available bandwidth.
- **Bandwidth_Estimator**: The HLS.js internal EWMA bandwidth estimator used for ABR decisions.
- **Validate_API**: The `/api/validate` edge route that performs a HEAD request to verify a URL before playback begins.
- **Report_API**: The Google Forms endpoint used by FeedbackModal and the Inline_Report_Form to submit user reports.

---

## Requirements

### Requirement 1: Inline Error Report Form

**User Story:** As a user who pastes a link that fails to load, I want to see a report form right next to the error message, so that I can quickly flag the broken link without navigating away or opening a separate modal.

#### Acceptance Criteria

1. WHEN the Validate_API returns an error response for a submitted URL, THE Player_Page SHALL render the Inline_Report_Form directly beneath the Error_Banner within the same view.
2. WHEN the Inline_Report_Form is rendered, THE Inline_Report_Form SHALL pre-populate the video URL field with the URL that caused the error.
3. WHEN the Inline_Report_Form is rendered, THE Inline_Report_Form SHALL pre-select the feedback type as "⚡ Stream Performance Issue".
4. THE Inline_Report_Form SHALL include a required description textarea (maximum 2000 characters), an optional email field (validated as a properly formatted email address when populated), and a submit button.
5. WHEN the user submits the Inline_Report_Form with a non-empty description, THE Inline_Report_Form SHALL disable the submit button for the duration of the submission and SHALL dispatch the report to the Report_API using the same no-cors POST mechanism as FeedbackModal.
6. WHEN the Inline_Report_Form submission succeeds, THE Inline_Report_Form SHALL replace its content with a confirmation message of no more than 100 characters, and that confirmation SHALL persist until the user clears the URL input or submits a new URL.
7. IF the Inline_Report_Form submission fails due to a network error, THEN THE Inline_Report_Form SHALL display an inline error message and SHALL keep the form fields populated so the user can retry.
8. IF the user clears the URL input or pastes a new URL, THEN THE Inline_Report_Form SHALL be dismissed and hidden.
9. THE Inline_Report_Form SHALL be fully usable on screens with a minimum width of 320px without horizontal overflow.
10. WHEN the optional email field contains a value, THE Inline_Report_Form SHALL validate that the value matches a standard email format (contains "@" and a domain) before enabling submission.

---

### Requirement 2: Streaming Performance — Fast Start and Reduced Buffering

**User Story:** As a user who clicks "Stream Now", I want the video to start playing as quickly as possible, so that I am not left staring at a spinner while the stream loads.

#### Acceptance Criteria

1. WHEN the HLS_Engine is initialised for an HLS source, THE HLS_Engine SHALL be configured with `startLevel: 0` so that playback begins at the lowest available quality level immediately.
2. WHEN the HLS_Engine is initialised, THE HLS_Engine SHALL be configured with `abrEwmaDefaultEstimate: 500000` (500 kbps) as the initial bandwidth estimate to avoid optimistic quality selection on cold start.
3. WHEN the HLS_Engine is initialised, THE HLS_Engine SHALL be configured with `maxBufferLength: 30` and `maxMaxBufferLength: 60` to allow the buffer to grow progressively as the user watches.
4. WHEN the HLS_Engine is initialised, THE HLS_Engine SHALL be configured with `highBufferWatchdogPeriod: 2` and `nudgeMaxRetry: 5` to recover automatically from stalled playback without user intervention.
5. WHEN the HLS_Engine is initialised, THE HLS_Engine SHALL be configured with `fragLoadingMaxRetry: 6` and `levelLoadingMaxRetry: 6` to retry failed segment and manifest requests before surfacing an error.
6. WHEN the HLS_Engine fires a fatal error event, THE Player SHALL display the Error_Banner showing the error's `type` (category) and `details` (specific code) from the HLS.js error event, and SHALL render the Inline_Report_Form.
7. WHEN a non-HLS (MP4/WEBM) source is loaded, THE Player SHALL set `preload="auto"` on the `<video>` element so the browser begins buffering immediately.

---

### Requirement 3: Stats Transparency Overlay

**User Story:** As a user whose video is buffering, I want to see live network speed, current video quality, and buffer health, so that I understand why playback is slow and can make an informed decision about quality or connection.

#### Acceptance Criteria

1. WHEN the user clicks the stats toggle button in the Player controls bar, THE Player SHALL toggle the Stats_Overlay between visible and hidden states; the Stats_Overlay SHALL be hidden by default when a source is first loaded.
2. WHEN the Stats_Overlay is visible, THE Stats_Overlay SHALL display the estimated download bandwidth in Mbps, updated on each HLS.js `FRAG_LOADED` event; before the first `FRAG_LOADED` event fires, THE Stats_Overlay SHALL display "—" as a placeholder.
3. WHEN the Stats_Overlay is visible, THE Stats_Overlay SHALL display the current active quality level label (e.g. "720p" or "Auto") updated on each HLS.js `LEVEL_SWITCHED` event; before the first `LEVEL_SWITCHED` event fires, THE Stats_Overlay SHALL display "—" as a placeholder.
4. WHEN the Stats_Overlay is visible, THE Stats_Overlay SHALL display the buffer health in seconds (rounded to one decimal place), calculated as the end of the first buffered range ahead of `currentTime` minus `currentTime`, updated every second.
5. WHEN the Stats_Overlay is visible and the source is not an HLS stream, THE Stats_Overlay SHALL display "N/A" for bandwidth and quality fields, and SHALL still display the buffer health derived from the `<video>` element's `buffered` TimeRanges.
6. WHEN the Stats_Overlay is visible and buffer health drops below 2 seconds, THE Stats_Overlay SHALL render the buffer health value in a colour that is visually distinct from the default text colour (e.g. amber or red); WHEN buffer health recovers to 2 seconds or above, THE Stats_Overlay SHALL revert the buffer health value to the default text colour.
7. THE Stats_Overlay SHALL be positioned in the top-right corner of the Player with a background opacity between 0.6 and 0.85, and SHALL not overlap the horizontal centre third of the Player at any viewport width.
8. THE Stats_Overlay SHALL have a z-index higher than the video element but lower than the fullscreen button so it does not obstruct primary controls.
9. WHEN the player is in fullscreen mode, THE Stats_Overlay SHALL remain visible in the top-right corner of the fullscreen container.

---

### Requirement 4: Buffer Progress Visualisation on Seek Bar

**User Story:** As a user watching a video, I want to see how much of the video has been buffered on the seek bar, so that I know how far I can skip ahead without triggering a re-download or stall.

#### Acceptance Criteria

1. THE Player SHALL render a Buffer_Bar as a secondary visual layer beneath the playback progress indicator on the seek bar.
2. WHEN the `<video>` element's `progress` event fires and the video duration is a finite positive number, THE Player SHALL update the Buffer_Bar width to `(bufferedEnd / duration) × 100%`, where `bufferedEnd` is the end of the buffered range that contains `currentTime`, or 0% if no such range exists.
3. WHEN the user seeks to a position within the Buffer_Bar's buffered range, THE Player SHALL begin playback from that position within 500ms without displaying a buffering spinner, indicating that no new network requests were required.
4. THE Buffer_Bar fill colour SHALL differ from the playback progress indicator fill colour by a minimum contrast ratio of 1.5:1 so that users can visually distinguish buffered from played content.
5. WHEN a source is loaded and the video duration is a finite positive number, THE Buffer_Bar SHALL be rendered at all times, including at 0% width when no data has been buffered yet.
6. IF the video duration is `Infinity` or `NaN` (e.g. a live stream), THEN THE Buffer_Bar SHALL be hidden and SHALL not be rendered.

---

### Requirement 5: Mobile Responsiveness

**User Story:** As a user on a mobile device, I want the player and all controls to be fully usable on my phone screen, so that I can stream video comfortably without pinching, zooming, or accidentally tapping the wrong control.

#### Acceptance Criteria

1. THE Player SHALL render at full viewport width on screens narrower than 768px, with no horizontal overflow or clipping.
2. THE Player SHALL maintain a 16:9 aspect ratio on all screen sizes using a responsive container (e.g. `aspect-ratio: 16/9` or a padding-top percentage wrapper), falling back to a minimum height of 200px on screens 480px wide or narrower.
3. WHEN rendered on a screen narrower than 768px, THE Player controls bar SHALL stack the volume slider and quality/settings controls onto a second row, keeping play/pause, seek bar, and time display on the primary row and always visible.
4. WHEN rendered on a screen narrower than 768px, all interactive control buttons in the Player (play/pause, mute, fullscreen, stats toggle) SHALL have a minimum touch target size of 44×44 CSS pixels.
5. WHEN rendered on a screen narrower than 768px, THE Stats_Overlay SHALL use a font size of no less than 11px and padding of no less than 4px, and its total rendered height SHALL not exceed 40% of the Player's rendered height.
6. WHEN a user performs a touch drag gesture on the seek bar, THE Player SHALL update the seek bar thumb position in real time during the drag and SHALL seek the video to the dragged position when the touch ends.
7. WHEN rendered on a screen narrower than 768px, THE Inline_Report_Form SHALL display its fields in a single-column layout with no horizontal overflow.
8. WHEN rendered on a screen narrower than 320px or wider, THE Player page hero section SHALL display the URL input and "Stream Now" button as full-width block elements stacked vertically, with no element narrower than 280px.
9. WHEN a user performs a touch drag gesture on the seek bar, THE seek bar position indicator SHALL update continuously during the drag to reflect the current drag position before the touch ends.
