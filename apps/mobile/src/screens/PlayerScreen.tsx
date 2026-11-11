import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { colors, fonts, makeWaveformBars } from '@moments/ui';
import { Waveform, PlayerSheet, PaperGrain } from '@moments/ui';
import type {
  PlayerSheetAddOption,
  PlayerSheetSection,
} from '@moments/ui';
import type { MomentNote, MomentScripture } from '@moments/types';
import { getSignedAudioUrl } from '../lib/audio';
import { errorMessage } from '../lib/errors';
import type { EnrichmentType } from '../features/enrich/steps';
import { useMomentDetail } from '../features/moment/useMomentDetail';
import { EnrichmentDetail, type EnrichmentDetailData } from './EnrichmentDetail';
import { formatDuration, formatLongDate } from '../lib/format';


export interface PlayerScreenProps {
  momentId: string;
  /** Bump to refetch the moment's enrichments (e.g. after returning from an editor). */
  reloadKey?: number;
  onBack: () => void;
  onAddMore: () => void;
  onAddEnrichment: (type: EnrichmentType) => void;
}

function BackIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6 L9 12 L15 18"
        stroke={colors.cobalt}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 L12 15 M7 8 L12 3 L17 8 M5 19 L19 19"
        stroke={colors.cobalt}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Back15Icon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5 A7 7 0 1 1 5 12 M5 12 L2 9 M5 12 L8 9"
        stroke={colors.playerControl}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Forward15Icon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5 A7 7 0 1 0 19 12 M19 12 L22 9 M19 12 L16 9"
        stroke={colors.playerControl}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PauseIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6 L9 18 M15 6 L15 18"
        stroke={colors.playerControl}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5 L19 12 L8 19 Z"
        stroke={colors.playerControl}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const addOptions: (PlayerSheetAddOption & { type: EnrichmentType })[] = [
  { type: 'scripture', label: 'Scripture' },
  { type: 'prayer', label: 'Prayer' },
  { type: 'revelation', label: 'Revelation' },
  { type: 'reflection', label: 'Reflection' },
];

type EnrichmentNoteKind = Exclude<MomentNote['kind'], 'note'>;

const noteTitles: Record<EnrichmentNoteKind, string> = {
  prayer: 'Prayer',
  revelation: 'Revelation',
  reflection: 'Reflection',
};

/** Strip HTML tags (e.g. api.bible's `<p>`, `<span>`) to render as plain text. */
function stripHtml(html: string): string {
  return html
    // Remove verse-number spans entirely (e.g. <span class="v">1</span>).
    .replace(/<span[^>]*class="v"[^>]*>.*?<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

interface SheetItem {
  section: PlayerSheetSection;
  detail: EnrichmentDetailData;
}

function formatAddedAt(iso: string): string {
  return `Added ${formatLongDate(iso)}`;
}

function buildItems(
  notes: MomentNote[],
  scriptures: MomentScripture[],
): SheetItem[] {
  const result: SheetItem[] = [];

  const recordingNotes = notes
    .filter((n) => n.isDuringRecording)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
  if (recordingNotes.length > 0) {
    const first = recordingNotes[0]?.timestamp;
    result.push({
      section: {
        type: 'notes',
        title: 'Notes',
        preview: `${recordingNotes.length} ${recordingNotes.length === 1 ? 'note' : 'notes'} saved`,
        time: first !== undefined ? formatDuration(first) : undefined,
      },
      detail: {
        label: 'Notes',
        entries: recordingNotes.map((n) => ({
          time: n.timestamp !== undefined ? formatDuration(n.timestamp) : undefined,
          text: n.content,
        })),
      },
    });
  }

  for (const s of scriptures) {
    const text = s.text ? stripHtml(s.text) : '';
    result.push({
      section: {
        type: 'scripture',
        title: 'Scripture',
        preview: text ? `${s.reference} · ${text}` : s.reference,
      },
      detail: {
        label: 'Scripture',
        quote: true,
        body: text || s.reference,
        reference: `${s.reference} · ${s.translation}`,
        meta: s.note,
      },
    });
  }

  const enrichmentNotes = notes.filter(
    (note): note is MomentNote & { kind: EnrichmentNoteKind } =>
      !note.isDuringRecording && note.kind !== 'note',
  );
  for (const n of enrichmentNotes) {
    result.push({
      section: { type: n.kind, title: noteTitles[n.kind], preview: n.content },
      detail: {
        label: noteTitles[n.kind],
        body: n.content,
        meta: formatAddedAt(n.createdAt),
      },
    });
  }

  return result;
}

/**
 * Player (S9.dc.html): back/share, handwritten title, waveform, controls, sheet.
 */
export function PlayerScreen({
  momentId,
  reloadKey,
  onBack,
  onAddMore,
  onAddEnrichment,
}: PlayerScreenProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string>();
  const [audioError, setAudioError] = useState<string>();
  const [openDetail, setOpenDetail] = useState<EnrichmentDetailData | null>(null);
  const { moment, notes, scriptures, error: loadError } = useMomentDetail(momentId, reloadKey);
  const error = loadError ?? audioError;

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // Configure the audio session for playback (not recording) so audio plays
    // in silent mode and routes through the speaker rather than the earpiece.
    setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(
      (err: unknown) => console.warn('Could not set audio mode', err),
    );
  }, []);

  const audioPath = moment?.audio?.path;
  useEffect(() => {
    if (!audioPath) return;
    let cancelled = false;
    setAudioError(undefined);
    getSignedAudioUrl(audioPath)
      .then((url) => {
        if (!cancelled) setSignedUrl(url);
      })
      .catch((err: unknown) => {
        if (!cancelled) setAudioError(errorMessage(err, 'Could not load the audio.'));
      });
    return () => {
      cancelled = true;
    };
  }, [audioPath]);

  useEffect(() => {
    if (signedUrl) {
      player.replace({ uri: signedUrl });
    }
  }, [signedUrl, player]);

  const togglePlay = () => {
    if (!signedUrl || !status.isLoaded) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seekBy = (seconds: number) => {
    if (!status.isLoaded || status.duration <= 0) return;
    const target = Math.max(0, Math.min(status.duration, status.currentTime + seconds));
    player.seekTo(target);
  };

  const items = useMemo(() => buildItems(notes, scriptures), [notes, scriptures]);
  const sections = useMemo(() => items.map((i) => i.section), [items]);

  const title = moment?.title ?? '';
  const date = moment ? formatLongDate(moment.date) : '';
  const durationSeconds = status.duration > 0 ? status.duration : (moment?.audio?.duration ?? 0);
  // Notes written while recording become markers on the waveform.
  const markers = durationSeconds > 0
    ? notes
        .filter((n) => n.timestamp !== undefined)
        .map((n) => Math.min(1, (n.timestamp ?? 0) / durationSeconds))
    : [];
  const duration = formatDuration(durationSeconds);
  const currentTime = formatDuration(status.currentTime);
  const progress = durationSeconds > 0 ? Math.min(1, status.currentTime / durationSeconds) : 0;

  const bars = makeWaveformBars(64, 200, 5, colors.playerBar, {
    frequency: 1.6,
    phase: -0.9,
    power: 1.4,
    wave: 12,
    waveFrequency: 1.2,
    wavePhase: 0.3,
    minHeight: 6,
    playhead: progress,
    playedOpacity: 1,
    unplayedOpacity: 0.28,
  });

  return (
    <View style={styles.container}>
      <PaperGrain opacity={0.35} />

      <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.iconBtn}
        >
          <BackIcon />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share"
          style={styles.iconBtn}
        >
          <ShareIcon />
        </Pressable>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.meta}>{duration} · Private</Text>
      </View>

      <View style={styles.waveWrap}>
        <Waveform
          bars={bars}
          height={200}
          barWidth={2}
          gap={2}
          paddingHorizontal={28}
        />
        <View style={[styles.progress, { width: `${progress * 100}%` }]} />
        {markers.map((position, i) => (
          <View key={i} style={[styles.marker, { left: `${position * 100}%` }]} />
        ))}
      </View>

      <View style={styles.times}>
        <Text style={styles.time}>{currentTime}</Text>
        <Text style={styles.time}>{duration}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back 15 seconds"
          onPress={() => seekBy(-15)}
          style={styles.control}
        >
          <Back15Icon />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={status.playing ? 'Pause' : 'Play'}
          onPress={togglePlay}
          style={styles.control}
        >
          {status.playing ? <PauseIcon /> : <PlayIcon />}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Forward 15 seconds"
          onPress={() => seekBy(15)}
          style={styles.control}
        >
          <Forward15Icon />
        </Pressable>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <View style={styles.secondary}>
        <Text style={styles.secondaryText}>1x</Text>
        <Text style={styles.secondaryText}>Favourite</Text>
        <Text style={styles.secondaryText}>Add note</Text>
      </View>

      <PlayerSheet
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        sections={sections}
        onAddMore={onAddMore}
        // Editing enrichments needs a saved moment to attach them to.
        addOptions={addOptions}
        onAddOption={(type) => onAddEnrichment(type as EnrichmentType)}
        onPressSection={(index) => setOpenDetail(items[index]?.detail ?? null)}
      />

      <EnrichmentDetail
        detail={openDetail}
        onClose={() => setOpenDetail(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.handwriting,
    fontSize: 46,
    color: colors.playerTitle,
    textAlign: 'center',
  },
  date: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.playerDate,
    marginTop: 6,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.playerMeta,
    marginTop: 2,
  },
  waveWrap: {
    marginTop: 32,
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    left: 28,
    width: '35.5%',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(49,86,184,0.2)',
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.playerMarker,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginTop: 12,
  },
  time: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.playerTime,
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 28,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    marginTop: 24,
  },
  control: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 16,
  },
  secondaryText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.playerSpeed,
  },
});
