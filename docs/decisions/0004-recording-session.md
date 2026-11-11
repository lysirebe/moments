# ADR-0004: Recording session state lives above the navigator

## Status

Accepted

## Context

Recording a Moment spans several screens: the recorder, an Add Note sheet that
opens on top of it while audio keeps capturing, a Review screen, and a Saving
screen that uploads the file and the notes. Each needs the same recorder
instance and the same draft notes.

Passing a recorder or a list of notes through navigation params doesn't work:
params must be serialisable, and a recorder unmounting with its screen would
stop the recording.

## Decision

A single `RecordingSessionProvider` owns the `expo-audio` recorder and the
draft notes. It is mounted above the `NavigationContainer`, and screens read
it with `useRecordingSession()`.

- Notes are pinned to the recorder's elapsed time when **Add notes** is
  tapped, not when the note is saved, so the marker lands where the thought
  happened.
- `save()` uploads the audio first, then inserts the notes. The uploaded
  Moment's ID is remembered, so retrying after a failed notes insert never
  creates a duplicate Moment.
- Navigation params carry only serialisable values (a title, a Moment ID).

## Consequences

- Only one recording can be in progress at a time, which matches the product.
- The provider is app-global, so it must reset itself after a save or
  discard. `reset()` handles both.
- Background recording with the screen locked needs `UIBackgroundModes` audio
  (already set) and testing on a device.
