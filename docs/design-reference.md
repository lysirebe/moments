# Moments — design reference

> The original screen-by-screen design hand-off. The `.dc.html` screen specs and
> PNG exports it mentions live outside this repository. Where its stack
> suggestions differ from the code (e.g. expo-router, SQLite), the
> [architecture decision records](./decisions/README.md) are the source of truth.

A reference for building Moments screen by screen. It describes what each screen is, how it should look and behave, and where the exact values live. It does not prescribe a build order or ask for the whole app at once.

## 1. Product summary

Moments is an audio-first Christian worship journaling app. People record worship, prayer or spontaneous audio, add timestamped notes while recording, then enrich the saved Moment with Scripture, Prayer, Revelation, a Favourite Moment and a Reflection. Recordings can also be imported. It should feel quiet, intimate and unhurried. It is not a voice recorder and not social media.

Philosophy: "Moments aren't about being perfect. They're about being pure."

## 2. Suggested stack

- Expo, TypeScript, expo-router
- react-native-reanimated and react-native-svg for animation and drawn graphics
- react-native-gesture-handler for the swipe-up player sheet
- expo-audio (or expo-av) for recording with metering, and playback
- expo-sqlite for Moments, notes and enrichments; expo-file-system for audio files
- expo-document-picker for Import
- zustand for in-memory state (recording session, enrichment draft)
- @expo-google-fonts/cormorant-garamond, @expo-google-fonts/inter, @expo-google-fonts/reenie-beanie
- expo-haptics for light taps on record, stop and save

Target iPhone first (frame 393 × 852). Android should work too.

## 3. What is in this folder

| Path                        | What it is                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `design/*.dc.html`          | One file per screen at 393 × 852. Exact sizes, colours, radii, spacing and copy.              |
| `design/tokens.json`        | Colours, type, radii, spacing, motion values                                                  |
| `design/screens/`           | PNG exports of each screen (add them here). For look, a PNG wins; for numbers, the HTML wins. |
| `assets/logo.svg`           | The Moments logo, a single blue stroke                                                        |
| `assets/logo-original.jpg`  | Original logo artwork                                                                         |
| `assets/door-reference.jpg` | Style reference for the two door screens (composition only; keep the navy palette)            |

Reading the `.dc.html` files: `<x-dc>` is just the root, `<sc-for list="{{x}}" as="i">` is a loop (a `.map()`), `{{x}}` is a value, and generated bars, streaks and rays come from each file's `renderVals()` script. Treat them as a spec for numbers and structure; map them to `View`, `Text` and `Svg`.

## 4. Design rules

**Colours**

| Token     | Hex       | Use                                                    |
| --------- | --------- | ------------------------------------------------------ |
| navy      | `#071F49` | Splash, recording, saving; primary text on light       |
| darkBlue  | `#102F63` | Headings                                               |
| cobalt    | `#3156B8` | Primary actions, handwriting, selected states          |
| paleBlue  | `#E8F0FC` | Selected tiles, chips, welcome ground                  |
| warmWhite | `#FAF9F6` | Journaling and reading screens, with faint paper grain |
| logoBlue  | `#1A66FF` | Logo on light surfaces (`#CFE0FF` on navy)             |

Navy for immersive screens, warm white for journaling and reading. Gradients extremely subtle.

**Fonts**

- Cormorant Garamond: headings
- Inter: buttons, labels, timers, navigation, body
- Reenie Beanie: handwriting accents only (welcome message, greeting, note and journal content). Never on controls.

**Feel**: sketchbook, fine lines, low-opacity paper grain on light screens, generous whitespace, thin outlines, restrained blue. No glow effects, sparkles, floating particles, emoji or decorative icons beyond those in the designs.

**Accessibility**: touch targets at least 44 × 44, accessibility labels on icon-only buttons, text contrast at least 4.5:1, respect Reduce Motion (swap animations for simple fades).

**System UI**: no fake status bar or keyboard; use the real ones with safe-area insets.

## 5. Animation specification

The loading and transition screens are animated. Reference values are also in `design/tokens.json`.

| Screen / element        | Behaviour                                                                                                                                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Splash (door)           | Navy night scene: arched door on a horizon over still water, thin concentric rings, light streaks on the water. Door light and rings pulse (opacity about .35 to .9, around 4.5s ease-in-out, looping). Water streaks shimmer slowly. "tap to enter" fades in after about 1s.                |
| Door opens, logo reveal | The door leaf swings open on the right in perspective (about 900ms ease-out), light floods the arch, rays fade in, the logo rises into the doorway with "moments" beneath. Hold about 1.2s, then fade to Welcome.                                                                            |
| Saving your Moment      | Faint logo outline (`#4A6FC4`) with a solid `#CFE0FF` copy revealed left to right through an animated clip that follows the logo's real shape. A thin 120px progress line sits under the text. Driven by real save progress, with a minimum duration of about 1.8s. Auto-advances to Enrich. |
| Home orb                | Idle pulse, scale 1 to 1.045, about 4.2s ease-in-out loop. The three concentric rings stay still.                                                                                                                                                                                            |
| Recording waveform      | About 68 thin vertical bars driven by live input metering, smoothed, wavy overall silhouette. Pause freezes bars and timer.                                                                                                                                                                  |
| Note saved toast        | Slides in above the timer, holds about 2s, fades out.                                                                                                                                                                                                                                        |
| Player sheet            | Swipe up from the grabber to expand with a spring; snaps collapsed or expanded; velocity-aware.                                                                                                                                                                                              |
| Screen transitions      | Short fades or small slides (200–300ms). Navy to warm-white transitions fade through navy.                                                                                                                                                                                                   |

## 6. Screen reference

Each entry names the design file and what the screen contains.

**Onboarding**

- `Main.dc.html` Splash. See section 5. Tap anywhere to continue.
- `S1b-Logo-Reveal.dc.html` Door opens, logo and wordmark "moments".
- `S1c-Welcome.dc.html` Pale-blue paper, handwritten welcome message, cobalt Start button (Inter).

**Home**

- `S2-Home.dc.html` Greeting with the user's first name. Psalm 42:1–2 handwriting repeats faintly across the background (about 13% opacity). Recording orb opens the recorder. A "Recent Moments" row of horizontally scrolling cards (title, "Today, 10:00am" style time, chevron) with the next card peeking at the edge; "See all" opens Collections. Bottom nav: Import (bottom left), centre Record orb, Collections. There is no Archive tab.

**Recording**

- `S3-Recording.dc.html` Navy. Timer (mm:ss) with milliseconds beneath, "Recording" label, waveform, outlined "Add notes" button, round Pause and Stop. No quote beneath the waveform. Recording continues while the note sheet is open.
- `S4-Add-Note.dc.html` Note sheet over the recorder, about 65% height, navy screen blurred behind. Live timer, "at 04:32" (timestamp captured when the sheet opened), Close and "Save note". Ruled journal lines, handwriting placeholder "Type what's on your heart...". No Scripture or Prayer buttons here.
- `S4b-Note-Saved.dc.html` Back on the recorder with the "Note saved" toast.

**Review and save**

- `S5-Review.dc.html` Editable title, compact player, "NOTES SAVED" list of timestamped notes (each opens for editing), large circular Save Moment button with a check.
- `S6-Saving.dc.html` Animated saving screen. See section 5.

**Enrich**

- `S7-Enrich.dc.html` Two-column grid of square tiles: Scripture, Prayer, Revelation, Favourite Moment, Reflection. Multi-select; selected tiles get a pale-blue fill and a check badge. "Continue with selected" and a quiet "Maybe later".
- Step form (reusable): shows only the selected types, in fixed order Prayer, Scripture, Revelation, Favourite Moment, Reflection. Step dots and "n of N" at the top. Back, Save (saves a draft and exits), Next, and Finish on the last step.
  - `S8a-Prayer.dc.html`, `S8b-Scripture.dc.html`, `S8c-Revelation.dc.html`, `S8d-Favourite.dc.html`, `S8e-Reflection.dc.html`
  - Scripture step: search field with translation selector, results dropdown, preview card of the chosen passage, remove button.
  - Favourite Moment step: waveform with a draggable start/end range, Start and End time boxes, play-selection button, optional title.
  - Note: 08a–c show the Prayer + Scripture + Revelation path ("1 of 3"); 08d–e show a Favourite Moment + Reflection path ("1 of 2"). The step count follows the selection.
- `S8f-Complete.dc.html` Confirmation with "View Moment".

**Listening to a Moment**

- `S9-View-Moment.dc.html` Player, sheet collapsed: back, share, handwritten title, date, duration and privacy, large wavy bar waveform (played bars solid, unplayed about 28%), timeline with draggable playhead and small note markers, back 15, play/pause, forward 15, then a row with speed (1x), favourite heart and add-note-at-current-time. A white sheet peeks from the bottom with a grabber, "Reflect on your moment" and a summary line.
- `S9b-Moment-Sheet.dc.html` Sheet swiped up: the player compresses above it. The sheet header has "Reflect on your moment" and an "Add more" pill. Content scrolls and shows only sections that have content: Notes first (each note's time chip seeks the audio), then Scripture, Prayer, Revelation, Favourite Moment, Reflection as rows (pale-blue icon circle, Cormorant title, two-line preview, chevron). Swipe down or tap the grabber to collapse.

**Collections**

- `S10-Collections.dc.html` Search field and filter, vertical list of Moment cards (thumbnail, title, date, duration, privacy, arrow). Tapping opens the player. Data is structured so named collections can be added later.

**Import**

- `S11a-Import.dc.html` "Choose from Files" (M4A, MP3, WAV) and "Voice Memos". Bottom nav with Import active.
- `S11b-Import-Details.dc.html` File card (name, duration, size, mini waveform, "Change"), editable title (defaults to the file name), "Recorded on" date, hint "You can add notes, Scripture and more after importing.", and an "Import Moment" pill. Import then leads to the animated saving screen and the enrich step, and imported Moments behave like recorded ones.

**Handoff**

- `Tokens.dc.html` Colours, type scale, shapes and spacing, components, motion, flow and an illustrative Bible API shape.

## 7. Navigation map

Splash → Logo reveal → Welcome → Home.
Home: orb or Record → Recording; Recent card → Player; See all → Collections; Import → Import.
Recording: Add notes → Note sheet → Note saved; Stop → Review.
Review: Save Moment → Saving → Enrich.
Enrich: Continue with selected → Steps → Complete → Player; Maybe later → Player.
Player: swipe up sheet; Add more → Enrich.
Collections: card → Player.
Import: Files or Voice Memos → Import details → Saving → Enrich.

## 8. Data model reference (expo-sqlite)

- `moments`: id, title, created_at, recorded_at, duration_ms, audio_uri, source (`recorded` | `imported`), peaks_json, privacy (`private` | `shared`), cover_seed
- `notes`: id, moment_id, at_ms, text, created_at
- `enrichments`: id, moment_id, type (`scripture` | `prayer` | `revelation` | `favourite` | `reflection`), body_json, updated_at
  - scripture body: { reference, book, chapter, verse_start, verse_end, translation, text }
  - favourite body: { start_ms, end_ms, title? }
- `collections`, `collection_moments`: for later; not used in the UI yet

Sample data used in the designs: Saturday morning worship, Quiet time, Night prayer, Spontaneous flow, Sunday worship.

## 9. Bible service reference

The Scripture step talks to an interface so any provider can be added later:

```ts
export type Translation = { id: string; label: string };
export type Passage = {
  reference: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  translation: string;
  text: string;
};
export interface BibleService {
  translations(): Promise<Translation[]>;
  search(query: string, translation: string): Promise<Passage[]>;
  get(reference: string, translation: string): Promise<Passage>;
}
```

A mock with Psalm 23:1–2, Psalm 42:1, John 15:5 and Isaiah 40:31 matches the designs. The sample verse text uses NIV wording for layout only; check the licence of every translation before shipping.

## 10. Import reference

- Files: pick `audio/*` with expo-document-picker, copy into the app's document directory, read duration with expo-audio. Show a friendly message for unsupported or unreadable files.
- Voice Memos: same flow from the system picker.
- Generate waveform peaks once at import and store them in `peaks_json`.
- Imported Moments default to private.

## 11. Suggested structure

```
app/            expo-router routes
components/     Waveform, Orb, DoorScene, MomentsLogo, StepDots, Tile, NoteRow, PlayerCard, PlayerSheet, ...
theme/          tokens.ts (from design/tokens.json), fonts.ts
services/       audio.ts, db.ts, bible.ts, import.ts
store/          recording.ts, enrichment.ts
assets/         logo.svg
```

`MomentsLogo` works well as a component taking `color`, `width` and a `progress` prop (0 to 1) for the left-to-right fill.

## 12. Acceptance checklist

- Each screen matches its design file and PNG.
- Splash, door-open, saving, orb and recording animations behave as in section 5.
- A real recording can be made, noted, saved, enriched and played back, and survives an app restart.
- The player sheet swipes smoothly; notes seek the audio; Import produces a playable Moment.
- No handwriting font on any control; colours and fonts come from the tokens only.
- TypeScript compiles without errors.
