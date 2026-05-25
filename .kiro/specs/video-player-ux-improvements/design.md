# Design Document: Video Player UX Improvements

## Overview

This feature delivers four coordinated improvements to the FluxPlays streaming experience: an inline error-report form that surfaces immediately when a stream fails, tuned HLS.js buffering parameters for faster cold-start and fewer stalls, a live stats overlay showing bandwidth/quality/buffer health, and a fully responsive mobile layout for both the player and the surrounding page UI.

All changes are client-side TypeScript/React within the existing Next.js 16 app. No new API routes are required. The Google Forms submission pipeline from `FeedbackModal.tsx` is reused as-is.

---

## Architecture

```
page.tsx  (orchestrator)
│
├── <ErrorBanner />          — existing inline error div
├── <InlineReportForm />     — NEW: rendered below error banner when showReportForm=true
│
└── <CustomPlayer />         — existing player, extended with:
        ├── HLS config patch
        ├── onFatalError callback prop
        ├── Stats_Overlay (toggleable panel, top-right)
        └── Buffer_Bar (secondary seek-bar layer)
```

Data flows in one direction: `page.tsx` owns the error state and decides when to show `InlineReportForm`. `CustomPlayer` owns all playback state internally and surfaces fatal HLS errors upward via a single callback prop.

---

## Components and Interfaces

### 1. `InlineReportForm` (new — `src/components/InlineReportForm.tsx`)

#### Props

```typescript
interface InlineReportFormProps {
  videoUrl: string;          // pre-filled, read-only from the user's perspective
  onDismiss?: () => void;    // called when parent wants to hide the form
}
```

#### State

```typescript
interface InlineReportFormState {
  description: string;       // required, max 2000 chars
  email: string;             // optional, validated on submit
  isSubmitting: boolean;     // disables submit button during POST
  isSuccess: boolean;        // shows confirmation text when true
  submitError: string;       // inline error message on network failure
}
```

#### Behaviour

- Mounts with `feedbackType` hard-coded to `"⚡ Stream Performance Issue"` — not user-editable.
- `videoUrl` prop is passed directly into the Google Forms `entry.764717073` field; the field is not shown as an editable input (it is pre-filled silently).
- Email validation: `value.includes("@") && value.includes(".")` checked client-side before the POST fires. If invalid, an inline error is shown and the POST is not dispatched.
- Submit POST mirrors `FeedbackModal.handleSubmit` exactly — same `formUrl`, same `URLSearchParams` field names, same `mode: "no-cors"` fetch. Because `no-cors` responses are opaque, success is assumed after the fetch resolves without throwing.
- On success: `isSuccess = true`, form fields replaced by a single `<p>` confirmation (≤ 100 chars: `"Report sent — thanks! We'll look into this stream."`). The component stays mounted; parent controls dismissal.
- On network error (fetch throws): `submitError` is set, fields remain populated.
- Dismissal: parent passes a new `key` or sets `videoUrl` to `""` — the component unmounts/remounts cleanly. `onDismiss` is called when the user explicitly clicks a dismiss/close button if one is provided.
- Layout: single-column, `min-w-0 w-full`, works at 320 px. No grid or multi-column layout.

#### Google Forms field mapping (same as FeedbackModal)

| Form entry ID       | Value                              |
|---------------------|------------------------------------|
| `entry.1927203179`  | `"⚡ Stream Performance Issue"`    |
| `entry.764717073`   | `videoUrl` prop                    |
| `entry.1731587350`  | `""` (no photo proof in this form) |
| `entry.438806369`   | `description` state                |
| `entry.604396617`   | `email` state                      |

---

### 2. `page.tsx` changes

#### New state

```typescript
const [showReportForm, setShowReportForm] = useState(false);
const [reportUrl, setReportUrl] = useState("");
```

#### Error path (Validate_API failure)

```typescript
// inside handleStream, after setError(data.error || "Validation failed")
setReportUrl(targetUrl);
setShowReportForm(true);
```

#### HLS fatal error path

```typescript
// CustomPlayer onFatalError callback
const handleFatalError = (type: string, details: string) => {
  setError(`Playback error: ${type} — ${details}`);
  setReportUrl(url);
  setShowReportForm(true);
};
```

#### Clearing the form

```typescript
// in the URL input onChange handler (already calls setError(""))
setShowReportForm(false);
setReportUrl("");

// at the top of handleStream, before the fetch
setShowReportForm(false);
setReportUrl("");
```

#### Render

```tsx
{error && (
  <motion.div ...existing error banner...>
    <AlertTriangle ... />
    <span>{error}</span>
  </motion.div>
)}

{showReportForm && (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    <InlineReportForm
      key={reportUrl}          // remounts if URL changes
      videoUrl={reportUrl}
      onDismiss={() => setShowReportForm(false)}
    />
  </motion.div>
)}
```

`InlineReportForm` is imported with `dynamic(..., { ssr: false })` consistent with the existing pattern for `FeedbackModal`.

#### Hero section mobile layout

The URL input `<div>` and the "Stream Now" `<button>` are already wrapped in a `flex flex-col md:flex-row` container. The button already has `w-full md:w-auto`. No structural change is needed — the existing classes already satisfy the ≥ 320 px stacking requirement. The only addition is ensuring the outer container has `min-w-0` so flex children don't overflow on very narrow viewports.

---

### 3. `CustomPlayer.tsx` changes

#### New prop

```typescript
interface CustomPlayerProps {
  src: string;
  onFatalError?: (type: string, details: string) => void;
}
```

#### HLS config patch

Replace the existing `new Hls({...})` config object:

```typescript
hls = new Hls({
  enableWorker: true,
  lowLatencyMode: true,
  progressive: true,
  // --- tuned values ---
  startLevel: 0,
  abrEwmaDefaultEstimate: 500_000,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  highBufferWatchdogPeriod: 2,
  nudgeMaxRetry: 5,
  fragLoadingMaxRetry: 6,
  levelLoadingMaxRetry: 6,
  // --- retained values ---
  backBufferLength: 5,
  maxStarvationDelay: 1,
  appendErrorMaxRetry: 8,
  liveSyncDurationCount: 2,
});
```

#### `preload` for non-HLS sources

In the `<video>` element JSX, change the static `preload="metadata"` to a dynamic value:

```tsx
preload={isHlsSource ? "metadata" : "auto"}
```

`isHlsSource` is derived from `src` the same way it is in `setupPlayback`. Lift the boolean into component-level state or derive it with `useMemo`:

```typescript
const isHlsSource = useMemo(
  () => src.includes('.m3u8') || src.includes('.ts'),
  [src]
);
```

#### Fatal error callback

Inside the `setupPlayback` effect, after `hls.attachMedia(video)`:

```typescript
hls.on(Hls.Events.ERROR, (_event, data) => {
  if (data.fatal) {
    props.onFatalError?.(data.type, data.details);
  }
});
```

#### Stats Overlay — new state

```typescript
const [showStats, setShowStats] = useState(false);
const [bandwidth, setBandwidth] = useState<number | null>(null);   // Mbps
const [qualityLabel, setQualityLabel] = useState<string | null>(null);
const [bufferHealth, setBufferHealth] = useState<number>(0);       // seconds
```

#### Stats Overlay — HLS event listeners

Added inside `setupPlayback`, after `hls.attachMedia(video)`:

```typescript
hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
  const bw = data.frag.stats.bwEstimate; // bits/s from hls.js
  if (bw && bw > 0) setBandwidth(bw / 1_000_000);
});

hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
  const level = hls.levels[data.level];
  setQualityLabel(level?.height ? `${level.height}p` : "Auto");
});
```

#### Stats Overlay — buffer health interval

```typescript
useEffect(() => {
  if (!showStats) return;
  const id = setInterval(() => {
    const video = videoRef.current;
    if (!video) return;
    const buf = video.buffered;
    const ct = video.currentTime;
    let health = 0;
    for (let i = 0; i < buf.length; i++) {
      if (buf.start(i) <= ct && ct <= buf.end(i)) {
        health = buf.end(i) - ct;
        break;
      }
    }
    setBufferHealth(health);
  }, 1000);
  return () => clearInterval(id);
}, [showStats]);
```

#### Stats Overlay — render

Positioned absolutely inside the player container, top-right, above video but below fullscreen button:

```tsx
{showStats && (
  <div
    className={[
      "absolute top-3 right-3 z-30",
      "bg-black/70 rounded-lg px-3 py-2",
      "text-white font-mono select-none pointer-events-none",
      "text-[11px] min-[480px]:text-xs",
      "min-p-1 sm:p-2",
    ].join(" ")}
    style={{ maxWidth: "33%" }}   // never overlaps centre third
  >
    <div className="flex flex-col gap-0.5">
      <span>BW: {bandwidth !== null ? `${bandwidth.toFixed(2)} Mbps` : isHlsSource ? "—" : "N/A"}</span>
      <span>Q: {qualityLabel !== null ? qualityLabel : isHlsSource ? "—" : "N/A"}</span>
      <span className={bufferHealth < 2 ? "text-amber-400" : "text-white"}>
        Buf: {bufferHealth.toFixed(1)}s
      </span>
    </div>
  </div>
)}
```

Z-index layering (existing + new):

| Layer              | z-index |
|--------------------|---------|
| `<video>`          | 0 (flow)|
| Buffering spinner  | 10      |
| Center overlay     | 20      |
| **Stats_Overlay**  | **30**  |
| Toast              | 50      |
| Controls bar       | 20 (pointer-events-auto inside) |
| Fullscreen button  | within controls bar |

#### Stats toggle button

Added to the right-side controls group, before the PiP button:

```tsx
<button
  onClick={() => setShowStats(s => !s)}
  className={`text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md ${showStats ? 'text-primary' : ''}`}
  title="Toggle stats overlay"
>
  <Activity size={20} />
</button>
```

`Activity` is already imported in `page.tsx`; add it to the `CustomPlayer.tsx` import from `lucide-react`.

---

#### Buffer Bar — new state

```typescript
const [bufferedPercent, setBufferedPercent] = useState(0);
```

#### Buffer Bar — event handler

```typescript
const handleProgress = () => {
  const video = videoRef.current;
  if (!video || !isFinite(video.duration) || isNaN(video.duration) || video.duration === 0) {
    setBufferedPercent(0);
    return;
  }
  const buf = video.buffered;
  const ct = video.currentTime;
  let end = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf.start(i) <= ct && ct <= buf.end(i)) {
      end = buf.end(i);
      break;
    }
  }
  setBufferedPercent((end / video.duration) * 100);
};
```

Attach to `<video onProgress={handleProgress} />`.

#### Buffer Bar — render

The Buffer_Bar is an absolutely-positioned `<div>` inside `Slider.Track`, rendered before `Slider.Range` so it sits behind the playback indicator:

```tsx
<Slider.Track className="bg-white/30 relative grow rounded-full h-1.5 transition-all group-hover:h-2">
  {/* Buffer Bar — hidden for live/infinite streams */}
  {isFinite(duration) && !isNaN(duration) && duration > 0 && (
    <div
      className="absolute left-0 top-0 h-full rounded-full bg-white/40 pointer-events-none"
      style={{ width: `${bufferedPercent}%` }}
    />
  )}
  <Slider.Range className="absolute bg-primary rounded-full h-full" />
</Slider.Track>
```

Colour contrast: `bg-white/40` (buffered, ~40% white) vs `bg-primary` (played, fully opaque brand colour). The luminance difference exceeds the 1.5:1 minimum contrast ratio requirement.

---

#### Mobile controls layout

The controls bar `<div className="flex items-center justify-between">` is split into two rows on small screens using `flex-wrap` and a separator:

```tsx
<div className="flex flex-wrap items-center gap-y-2">
  {/* Row 1 — always visible */}
  <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
    {/* play/pause, rewind, skip, time display */}
  </div>

  {/* Seek bar spans full width on its own row — already above controls */}

  {/* Row 2 — volume + settings, pushed to second line on mobile */}
  <div className="flex items-center gap-3 sm:gap-5 ml-auto flex-wrap justify-end">
    {/* volume, quality, speed, stats, pip, fullscreen */}
  </div>
</div>
```

All interactive buttons get `min-w-[44px] min-h-[44px]` to satisfy the 44 × 44 px touch target requirement. The existing `w-12 h-12` / `w-14 h-14` center overlay buttons already meet this; the bottom controls bar buttons need the `min-w`/`min-h` additions.

---

## Data Flow Diagrams

### Error → Report Form flow

```
User pastes URL → handleStream()
  │
  ├─ fetch /api/validate
  │     └─ !res.ok
  │           ├─ setError(message)
  │           ├─ setReportUrl(targetUrl)
  │           └─ setShowReportForm(true)
  │
  └─ CustomPlayer onFatalError(type, details)
        ├─ setError(`Playback error: ${type} — ${details}`)
        ├─ setReportUrl(url)
        └─ setShowReportForm(true)

page.tsx renders:
  <ErrorBanner>  ← error state
  <InlineReportForm videoUrl={reportUrl}>  ← showReportForm state

User clears input / submits new URL:
  setShowReportForm(false) + setReportUrl("")
```

### Stats Overlay data flow

```
HLS.js instance (hlsRef)
  │
  ├─ FRAG_LOADED  →  setBandwidth(bwEstimate / 1e6)
  ├─ LEVEL_SWITCHED  →  setQualityLabel(`${height}p`)
  └─ (non-HLS)  →  bandwidth="N/A", qualityLabel="N/A"

setInterval(1s, when showStats=true)
  └─ video.buffered + video.currentTime  →  setBufferHealth(seconds)

Stats_Overlay renders:
  BW: {bandwidth} Mbps | Q: {qualityLabel} | Buf: {bufferHealth}s
  bufferHealth < 2s  →  amber text
```

### Buffer Bar data flow

```
<video onProgress={handleProgress}>
  │
  └─ video.buffered + video.duration
        └─ setBufferedPercent((bufferedEnd / duration) * 100)

Slider.Track renders:
  <div style={{ width: `${bufferedPercent}%` }} />  ← Buffer_Bar (bg-white/40)
  <Slider.Range />                                   ← playback (bg-primary)

Live stream guard:
  !isFinite(duration) || isNaN(duration)  →  Buffer_Bar hidden
```

---

## Key Implementation Decisions

### Why `key={reportUrl}` on InlineReportForm

Using React's `key` prop to remount `InlineReportForm` when `reportUrl` changes is the simplest way to reset all internal form state (description, email, isSuccess, submitError) without lifting that state into `page.tsx`. This avoids a `useEffect` reset pattern and keeps the component self-contained.

### Why `no-cors` POST is assumed to succeed

Google Forms does not return a CORS-accessible response. The existing `FeedbackModal` already treats a resolved (non-throwing) fetch as success. `InlineReportForm` follows the same convention. A network-level failure (DNS, offline) will still throw and be caught, showing the inline error.

### Why `startLevel: 0` instead of `-1` (Auto)

`startLevel: -1` lets HLS.js pick the highest quality it thinks the connection can handle based on the cold-start bandwidth estimate. On a slow or variable connection this causes an immediate stall while the first high-quality segment downloads. `startLevel: 0` forces the lowest quality for the first segment, ensuring the fastest possible first-frame time. ABR takes over from the second segment onward.

### Why `abrEwmaDefaultEstimate: 500_000`

The default HLS.js EWMA estimate is 500 kbps, which is already conservative. Explicitly setting it documents the intent and guards against future HLS.js version changes that might raise the default.

### Why buffer health uses a `setInterval` rather than a video event

The `<video>` element does not fire a continuous event for buffer health changes between `progress` events. A 1-second interval is the standard approach and matches the 1-decimal-place display precision required. The interval is only active when `showStats` is true, so there is no overhead when the overlay is hidden.

### Why `maxWidth: "33%"` on Stats_Overlay

The requirement states the overlay must not overlap the horizontal centre third of the player. Capping the overlay width at 33% of the container and anchoring it `right-3` ensures it stays within the rightmost third regardless of player width.

### Why Buffer_Bar is inside `Slider.Track` rather than a sibling

Radix UI's `Slider.Track` is `position: relative`. Placing the Buffer_Bar as an absolutely-positioned child of `Slider.Track` (before `Slider.Range`) means it inherits the track's border-radius and height automatically, and the z-order is controlled purely by DOM order — no explicit `z-index` needed.

---

## File Change Summary

| File | Change type | Summary |
|------|-------------|---------|
| `src/components/InlineReportForm.tsx` | **New** | Standalone inline report form; Google Forms POST; success/error states; single-column layout |
| `src/components/CustomPlayer.tsx` | **Modified** | Add `onFatalError` prop; patch HLS config; add `preload` logic; add Stats_Overlay + toggle; add Buffer_Bar; mobile controls layout; 44px touch targets |
| `src/app/page.tsx` | **Modified** | Add `showReportForm`/`reportUrl` state; wire `onFatalError` callback; render `<InlineReportForm>` below error banner; clear form on new submission/input clear; dynamic import `InlineReportForm` |

No changes to API routes, CSS globals, Tailwind config, or other components.

---

## Data Models

### InlineReportForm submission payload

```typescript
// Sent as URLSearchParams to Google Forms (no-cors POST)
interface ReportPayload {
  "entry.1927203179": "⚡ Stream Performance Issue";  // feedbackType — fixed
  "entry.764717073": string;   // videoUrl — from prop
  "entry.1731587350": "";      // photoProof — always empty in this form
  "entry.438806369": string;   // description — required, max 2000 chars
  "entry.604396617": string;   // email — optional, validated format
}
```

### CustomPlayer extended props

```typescript
interface CustomPlayerProps {
  src: string;
  onFatalError?: (type: string, details: string) => void;
}
```

`type` maps to `Hls.ErrorTypes` (e.g. `"networkError"`, `"mediaError"`).  
`details` maps to `Hls.ErrorDetails` (e.g. `"fragLoadError"`, `"bufferStalledError"`).

### Stats Overlay display model

```typescript
interface StatsDisplayState {
  bandwidth: number | null;    // Mbps; null = no FRAG_LOADED event yet
  qualityLabel: string | null; // e.g. "720p", "Auto"; null = no LEVEL_SWITCHED yet
  bufferHealth: number;        // seconds ahead of currentTime that are buffered
}
```

### page.tsx report form state

```typescript
interface ReportFormState {
  showReportForm: boolean;
  reportUrl: string;           // the URL that triggered the error
}
```

---

## Correctness Properties

Property 1: For any `videoUrl` prop value `v`, the Google Forms POST body dispatched by `InlineReportForm` must contain `entry.764717073 === v` and `entry.1927203179 === "⚡ Stream Performance Issue"`.

**Validates: Requirements 1.2, 1.3, 1.5**

Property 2: The submit button is disabled whenever `isSubmitting === true` or `description.trim() === ""`. It is never enabled while a POST is in flight.

**Validates: Requirements 1.4, 1.5**

Property 3: If `email.length > 0` and `(!email.includes("@") || !email.includes("."))`, the form must not dispatch a POST and must display an inline error message.

**Validates: Requirements 1.10**

Property 4: If `!isFinite(duration) || isNaN(duration)`, the Buffer_Bar element must not be present in the DOM.

**Validates: Requirements 4.6**

Property 5: The Stats_Overlay has `z-index` 30, which is greater than the video element (0) and less than the toast (50). The overlay uses `pointer-events-none` so it never blocks player controls.

**Validates: Requirements 3.7, 3.8**

Property 6: When `bufferHealth < 2`, the buffer health value is rendered with `text-amber-400`. When `bufferHealth >= 2`, it is rendered with `text-white`. These two cases are exhaustive and mutually exclusive.

**Validates: Requirements 3.6**

Property 7: Every HLS error event where `data.fatal === true` must invoke `onFatalError(data.type, data.details)` exactly once. Events where `data.fatal === false` must not invoke the callback.

**Validates: Requirements 2.6**

Property 8: At the start of every `handleStream()` call, `showReportForm` is set to `false` before the fetch begins, ensuring a stale report form is never visible alongside a new loading state.

**Validates: Requirements 1.8**

---

## Error Handling

### InlineReportForm — network failure on submit

**Condition**: The `fetch()` to Google Forms throws (offline, DNS failure, timeout).  
**Response**: Catch block sets `submitError` to a user-readable message; `isSubmitting` is reset to `false`.  
**Recovery**: Fields remain populated. User can retry by clicking Submit again.

### InlineReportForm — invalid email

**Condition**: `email.length > 0` and email does not contain `"@"` and `"."`.  
**Response**: `submitError` is set before the POST fires; POST is not dispatched.  
**Recovery**: User corrects the email field and resubmits.

### CustomPlayer — HLS fatal error

**Condition**: `hls.on(Hls.Events.ERROR)` fires with `data.fatal === true`.  
**Response**: `onFatalError(data.type, data.details)` is called; `page.tsx` sets `error` state and `showReportForm = true`.  
**Recovery**: User can clear the URL and try a different stream, or submit a report via `InlineReportForm`.

### CustomPlayer — HLS non-fatal error

**Condition**: `data.fatal === false`.  
**Response**: HLS.js handles recovery internally (retry logic configured via `fragLoadingMaxRetry: 6`, `levelLoadingMaxRetry: 6`). No UI change.  
**Recovery**: Automatic — HLS.js retries the failed segment or manifest request.

### Stats Overlay — no HLS events yet

**Condition**: `FRAG_LOADED` or `LEVEL_SWITCHED` has not fired (e.g. stream just started).  
**Response**: Display `"—"` placeholder for bandwidth and quality fields.  
**Recovery**: Values populate automatically once the first fragment loads.

### Stats Overlay — non-HLS source

**Condition**: `isHlsSource === false` (MP4/WEBM direct URL).  
**Response**: Display `"N/A"` for bandwidth and quality. Buffer health still computed from `video.buffered`.  
**Recovery**: N/A — these fields are not applicable to non-HLS sources.

---

## Testing Strategy

### Unit testing approach

Each new piece of logic should be tested in isolation:

- `InlineReportForm`: render with a `videoUrl` prop and assert the hidden field value; submit with empty description and assert button stays disabled; submit with invalid email and assert error message; mock `fetch` to throw and assert fields remain populated; mock `fetch` to resolve and assert success state.
- `handleProgress` (Buffer Bar): unit-test the pure calculation `(bufferedEnd / duration) * 100` with edge cases: no buffered ranges, `duration = Infinity`, `duration = NaN`, `currentTime` outside all buffered ranges.
- `handleFatalError` in `page.tsx`: assert that `showReportForm` becomes `true` and `reportUrl` is set to the current `url` state value.

### Property-based testing approach

**Property test library**: `fast-check` (already available in the Next.js ecosystem).

- **Buffer percent is always in [0, 100]**: For any finite positive `duration` and any `bufferedEnd` in `[0, duration]`, `(bufferedEnd / duration) * 100` must be in `[0, 100]`.
- **Email validation is consistent**: For any string `s`, if `s.includes("@") && s.includes(".")` then validation passes; otherwise it fails. No string should both pass and fail.
- **Stats colour threshold is total**: For any `bufferHealth: number`, exactly one of `bufferHealth < 2` (amber) or `bufferHealth >= 2` (white) is true.

### Integration testing approach

- Render `page.tsx` with a mocked `/api/validate` that returns a non-ok response; assert `InlineReportForm` appears below the error banner with the correct `videoUrl`.
- Render `page.tsx`, trigger `onFatalError` on `CustomPlayer`; assert error banner and `InlineReportForm` both appear.
- Clear the URL input after an error; assert `InlineReportForm` is removed from the DOM.
- Render `CustomPlayer` with an HLS source; toggle the stats button; assert the Stats_Overlay appears; toggle again and assert it disappears.
