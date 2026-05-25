# Implementation Plan: Video Player UX Improvements

## Overview

Implement four coordinated improvements to the FluxPlays streaming experience: an inline error-report form, tuned HLS.js buffering parameters, a live stats overlay, a buffered-range indicator on the seek bar, and a fully responsive mobile layout. Changes touch exactly three files: a new `InlineReportForm.tsx` component, and modifications to `CustomPlayer.tsx` and `page.tsx`.

## Tasks

- [x] 1. Create `InlineReportForm` component
  - [x] 1.1 Scaffold `src/components/InlineReportForm.tsx` with props and state types
    - Create the file with `InlineReportFormProps` (`videoUrl: string`, `onDismiss?: () => void`) and internal state (`description`, `email`, `isSubmitting`, `isSuccess`, `submitError`)
    - Hard-code `feedbackType` to `"⚡ Stream Performance Issue"` — not user-editable
    - Single-column layout with `min-w-0 w-full`; must render without overflow at 320 px
    - _Requirements: 1.1, 1.2, 1.3, 1.9_

  - [x] 1.2 Implement form fields, validation, and submit handler
    - Required `<textarea>` for description (max 2000 chars); submit button disabled when `description.trim() === ""` or `isSubmitting === true`
    - Optional email `<input>`; validate `value.includes("@") && value.includes(".")` before POST — show inline error and abort if invalid
    - `handleSubmit`: build `URLSearchParams` with the five Google Forms entry IDs from the design, POST with `mode: "no-cors"`, treat resolved fetch as success, catch throws as network error
    - On success: set `isSuccess = true`, replace form with confirmation `<p>` (≤ 100 chars: `"Report sent — thanks! We'll look into this stream."`)
    - On network error: set `submitError`, keep fields populated
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.10_

  - [ ]* 1.3 Write property tests for `InlineReportForm` logic
    - **Property 1: POST body field correctness** — for any `videoUrl` string `v`, the dispatched `URLSearchParams` must have `entry.764717073 === v` and `entry.1927203179 === "⚡ Stream Performance Issue"`
    - **Validates: Requirements 1.2, 1.3, 1.5**
    - **Property 2: Submit button disabled invariant** — button is disabled whenever `isSubmitting === true` OR `description.trim() === ""`; never enabled while a POST is in flight
    - **Validates: Requirements 1.4, 1.5**
    - **Property 3: Email validation gate** — for any string `s` where `s.length > 0` and `(!s.includes("@") || !s.includes("."))`, no POST is dispatched and an inline error is shown
    - **Validates: Requirements 1.10**

  - [ ]* 1.4 Write unit tests for `InlineReportForm`
    - Render with a `videoUrl` prop and assert the hidden field value in the POST body
    - Submit with empty description and assert button stays disabled
    - Submit with invalid email and assert inline error message appears, no fetch called
    - Mock `fetch` to throw and assert fields remain populated and `submitError` is set
    - Mock `fetch` to resolve and assert success confirmation text is shown
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.10_

- [x] 2. Patch HLS.js config and `onFatalError` prop in `CustomPlayer.tsx`
  - [x] 2.1 Add `onFatalError` prop and derive `isHlsSource` with `useMemo`
    - Extend `CustomPlayerProps` with `onFatalError?: (type: string, details: string) => void`
    - Add `const isHlsSource = useMemo(() => src.includes('.m3u8') || src.includes('.ts'), [src])`
    - Change `<video preload="metadata">` to `<video preload={isHlsSource ? "metadata" : "auto"}>`
    - _Requirements: 2.7_

  - [x] 2.2 Replace HLS config object with tuned values and wire fatal error callback
    - Replace the existing `new Hls({...})` config with the full tuned object from the design: `startLevel: 0`, `abrEwmaDefaultEstimate: 500_000`, `maxBufferLength: 30`, `maxMaxBufferLength: 60`, `highBufferWatchdogPeriod: 2`, `nudgeMaxRetry: 5`, `fragLoadingMaxRetry: 6`, `levelLoadingMaxRetry: 6` (retain existing `backBufferLength`, `maxStarvationDelay`, `appendErrorMaxRetry`, `lowLatencyMode`, `enableWorker`, `progressive`, `liveSyncDurationCount`)
    - Inside `setupPlayback`, after `hls.attachMedia(video)`, add: `hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) { props.onFatalError?.(data.type, data.details); } })`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.3 Write property test for fatal error callback
    - **Property 7: Fatal error callback exactness** — every HLS error event where `data.fatal === true` invokes `onFatalError(data.type, data.details)` exactly once; events where `data.fatal === false` must not invoke the callback
    - **Validates: Requirements 2.6**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add Stats Overlay to `CustomPlayer.tsx`
  - [x] 4.1 Add stats state, HLS event listeners, and buffer health interval
    - Add state: `showStats` (false), `bandwidth` (null), `qualityLabel` (null), `bufferHealth` (0)
    - Inside `setupPlayback` after `hls.attachMedia`: add `FRAG_LOADED` listener → `setBandwidth(data.frag.stats.bwEstimate / 1_000_000)` (guard `bw > 0`); add `LEVEL_SWITCHED` listener → `setQualityLabel(level?.height ? \`${level.height}p\` : "Auto")`
    - Add `useEffect` with `setInterval(1s)` gated on `showStats`; compute buffer health from `video.buffered` and `video.currentTime`; clear interval on cleanup
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Render Stats Overlay and add toggle button to controls bar
    - Render overlay: `absolute top-3 right-3 z-30 bg-black/70 rounded-lg px-3 py-2 text-white font-mono select-none pointer-events-none text-[11px] min-[480px]:text-xs`, `style={{ maxWidth: "33%" }}`
    - Display: `BW: {bandwidth !== null ? \`${bandwidth.toFixed(2)} Mbps\` : isHlsSource ? "—" : "N/A"}`, `Q: {qualityLabel !== null ? qualityLabel : isHlsSource ? "—" : "N/A"}`, `Buf: {bufferHealth.toFixed(1)}s` with `text-amber-400` when `bufferHealth < 2`, else `text-white`
    - Add stats toggle `<button>` with `<Activity size={20} />` (import from `lucide-react`) to the right-side controls group; highlight when `showStats` is active
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 4.3 Write property tests for Stats Overlay
    - **Property 5: Stats overlay z-index and pointer-events** — overlay has `z-index` 30 and `pointer-events-none` so it never blocks player controls
    - **Validates: Requirements 3.7, 3.8**
    - **Property 6: Buffer health colour threshold is exhaustive** — for any `bufferHealth: number`, exactly one of `bufferHealth < 2` (amber) or `bufferHealth >= 2` (white) is true; no value falls outside both cases
    - **Validates: Requirements 3.6**

  - [ ]* 4.4 Write unit tests for Stats Overlay
    - Render `CustomPlayer` with an HLS source; toggle stats button; assert overlay appears with placeholder `"—"` values before events fire
    - Toggle stats button again; assert overlay disappears
    - Simulate `FRAG_LOADED` event; assert bandwidth value updates
    - Simulate `LEVEL_SWITCHED` event; assert quality label updates
    - Set `bufferHealth` to 1.5; assert `text-amber-400` class; set to 3.0; assert `text-white` class
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5. Add Buffer Bar to `CustomPlayer.tsx`
  - [x] 5.1 Add `bufferedPercent` state and `handleProgress` handler
    - Add `const [bufferedPercent, setBufferedPercent] = useState(0)`
    - Implement `handleProgress`: guard `!isFinite(video.duration) || isNaN(video.duration) || video.duration === 0` → set 0 and return; otherwise iterate `video.buffered` to find range containing `currentTime`, compute `(end / video.duration) * 100`
    - Attach `onProgress={handleProgress}` to the `<video>` element
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [x] 5.2 Render Buffer Bar inside `Slider.Track`
    - Inside `Slider.Track`, before `<Slider.Range>`, add: `{isFinite(duration) && !isNaN(duration) && duration > 0 && (<div className="absolute left-0 top-0 h-full rounded-full bg-white/40 pointer-events-none" style={{ width: \`${bufferedPercent}%\` }} />)}`
    - Buffer Bar (`bg-white/40`) sits behind playback indicator (`bg-primary`) by DOM order — no explicit z-index needed
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 5.3 Write property tests for Buffer Bar
    - **Property 4: Buffer Bar hidden for non-finite duration** — if `!isFinite(duration) || isNaN(duration)`, the Buffer Bar element must not be present in the DOM
    - **Validates: Requirements 4.6**
    - **Property (buffer percent range)**: for any finite positive `duration` and any `bufferedEnd` in `[0, duration]`, `(bufferedEnd / duration) * 100` is always in `[0, 100]`
    - **Validates: Requirements 4.2**

  - [ ]* 5.4 Write unit tests for Buffer Bar
    - `handleProgress` with no buffered ranges → `bufferedPercent === 0`
    - `handleProgress` with `duration = Infinity` → `bufferedPercent === 0`, bar hidden
    - `handleProgress` with `duration = NaN` → `bufferedPercent === 0`, bar hidden
    - `handleProgress` with `currentTime` outside all buffered ranges → `bufferedPercent === 0`
    - `handleProgress` with valid range → correct percentage computed
    - _Requirements: 4.2, 4.5, 4.6_

- [x] 6. Mobile controls layout in `CustomPlayer.tsx`
  - [x] 6.1 Split controls bar into two rows with `flex-wrap`
    - Replace the single `flex items-center justify-between` controls bar with a `flex flex-wrap items-center gap-y-2` wrapper
    - Row 1 (`flex items-center gap-3 sm:gap-5 flex-1 min-w-0`): play/pause, rewind, skip, time display
    - Row 2 (`flex items-center gap-3 sm:gap-5 ml-auto flex-wrap justify-end`): volume, quality, speed, stats toggle, PiP, fullscreen
    - _Requirements: 5.3_

  - [x] 6.2 Apply 44×44 px minimum touch targets and mobile overlay sizing
    - Add `min-w-[44px] min-h-[44px]` to all interactive buttons in the controls bar (play/pause, mute, fullscreen, stats toggle, rewind, skip, PiP, quality, speed)
    - Ensure Stats Overlay uses `text-[11px]` minimum font and `p-1` minimum padding on mobile (already in overlay class string from Task 4.2)
    - _Requirements: 5.4, 5.5_

  - [ ]* 6.3 Write unit tests for mobile layout
    - Render `CustomPlayer` at 375 px viewport width; assert controls bar has two rows (both row divs present in DOM)
    - Assert all interactive buttons have computed min-width and min-height ≥ 44 px
    - _Requirements: 5.3, 5.4_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Wire `InlineReportForm` into `page.tsx`
  - [x] 8.1 Add report form state and dynamic import
    - Add `const [showReportForm, setShowReportForm] = useState(false)` and `const [reportUrl, setReportUrl] = useState("")`
    - Dynamic-import `InlineReportForm` with `dynamic(..., { ssr: false })` consistent with the existing `FeedbackModal` pattern
    - _Requirements: 1.1_

  - [x] 8.2 Wire state mutations into `handleStream` and URL input `onChange`
    - At the top of `handleStream` (before the fetch): add `setShowReportForm(false); setReportUrl("")`
    - After `setError(data.error || "Validation failed")` in the validate failure branch: add `setReportUrl(targetUrl); setShowReportForm(true)`
    - In the URL input `onChange` handler (alongside the existing `setError("")`): add `setShowReportForm(false); setReportUrl("")`
    - _Requirements: 1.1, 1.8_

  - [x] 8.3 Add `onFatalError` callback prop to `<CustomPlayer>` and render `<InlineReportForm>`
    - Implement `handleFatalError`: `(type, details) => { setError(\`Playback error: ${type} — ${details}\`); setReportUrl(url); setShowReportForm(true); }`
    - Pass `onFatalError={handleFatalError}` to `<CustomPlayer>`
    - Below the existing error banner (inside `AnimatePresence`), render: `{showReportForm && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}><InlineReportForm key={reportUrl} videoUrl={reportUrl} onDismiss={() => setShowReportForm(false)} /></motion.div>)}`
    - _Requirements: 1.1, 1.2, 1.6, 1.8, 2.6_

  - [ ]* 8.4 Write property test for report form state
    - **Property 8: Report form cleared on new submission** — at the start of every `handleStream()` call, `showReportForm` is `false` before the fetch begins; a stale report form is never visible alongside a new loading state
    - **Validates: Requirements 1.8**

  - [ ]* 8.5 Write integration tests for `page.tsx` report form wiring
    - Render `page.tsx` with mocked `/api/validate` returning non-ok; assert `InlineReportForm` appears below error banner with correct `videoUrl`
    - Trigger `onFatalError` on `CustomPlayer`; assert both error banner and `InlineReportForm` appear
    - Clear the URL input after an error; assert `InlineReportForm` is removed from the DOM
    - _Requirements: 1.1, 1.8, 2.6_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Tasks 4, 5, and 6 all modify `CustomPlayer.tsx` but touch independent sections (stats state/render, buffer bar state/render, controls layout) — they can be worked in parallel after Task 2 is complete
- Task 8 depends on Task 1 (`InlineReportForm` must exist before it can be imported in `page.tsx`)
- Each task references specific requirements for traceability
- Property tests use `fast-check` (available in the Next.js ecosystem)
- The `key={reportUrl}` pattern on `InlineReportForm` resets all internal form state on URL change without lifting state into `page.tsx`
- Read `node_modules/next/dist/docs/` before writing any Next.js-specific code to account for breaking changes in this version

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "2.3", "4.1", "5.1", "6.1"] },
    { "id": 3, "tasks": ["4.2", "5.2", "6.2"] },
    { "id": 4, "tasks": ["4.3", "4.4", "5.3", "5.4", "6.3", "8.1"] },
    { "id": 5, "tasks": ["8.2"] },
    { "id": 6, "tasks": ["8.3"] },
    { "id": 7, "tasks": ["8.4", "8.5"] }
  ]
}
```
