import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@moments/ui';

import { useAuth } from '../features/auth/AuthProvider';
import { NOTE_STEPS, type EnrichFlow, type EnrichmentType } from '../features/enrich/steps';
import { useRecordingSession } from '../features/recording/RecordingSessionProvider';
import type { SelectedAudioFile } from '../lib/audio';
import { uploadAudio } from '../lib/upload';
import { AddNoteScreen } from '../screens/AddNoteScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';
import { CompleteScreen } from '../screens/CompleteScreen';
import { EnrichScreen } from '../screens/EnrichScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ImportDetailsScreen } from '../screens/ImportDetailsScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { LogoRevealScreen } from '../screens/LogoRevealScreen';
import { NoteStep } from '../screens/NoteStep';
import { PlayerScreen } from '../screens/PlayerScreen';
import { RecordingScreen } from '../screens/RecordingScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { SavingScreen } from '../screens/SavingScreen';
import { ScriptureStep } from '../screens/ScriptureStep';
import { SignInUpScreen } from '../screens/SignInUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

export type RootStackParamList = {
  // Signed out
  Splash: undefined;
  LogoReveal: undefined;
  Welcome: undefined;
  SignInUp: undefined;
  // Signed in
  Home: undefined;
  Recording: undefined;
  AddNote: { timestamp: number };
  Review: undefined;
  Saving: { title: string };
  Enrich: { momentId: string };
  /** One enrichment step. `flow` is set in the post-recording wizard. */
  EnrichStep: { momentId: string; type: EnrichmentType; flow?: EnrichFlow };
  Complete: { momentId: string };
  /** `savedAt` changes after an enrichment is saved, prompting a refetch. */
  Player: { momentId: string; savedAt?: number };
  Collections: undefined;
  Import: undefined;
  ImportDetails: { file: SelectedAudioFile };
};

type Props<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
type Navigation = Props<keyof RootStackParamList>['navigation'];

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Replaces the stack with Home → `screen`, so Back from a new Moment goes Home. */
function resetFromHome(
  navigation: Navigation,
  screen: { name: 'Enrich' | 'Player'; params: { momentId: string } },
) {
  navigation.reset({ index: 1, routes: [{ name: 'Home' }, screen] });
}

// ---------------------------------------------------------------------------
// Signed-out routes
// ---------------------------------------------------------------------------

function SplashRoute({ navigation }: Props<'Splash'>) {
  return <SplashScreen onEnter={() => navigation.replace('LogoReveal')} />;
}

function LogoRevealRoute({ navigation }: Props<'LogoReveal'>) {
  return <LogoRevealScreen onDone={() => navigation.replace('Welcome')} />;
}

function WelcomeRoute({ navigation }: Props<'Welcome'>) {
  return <WelcomeScreen onStart={() => navigation.navigate('SignInUp')} />;
}

function SignInUpRoute({ navigation }: Props<'SignInUp'>) {
  return <SignInUpScreen onBack={() => navigation.goBack()} />;
}

// ---------------------------------------------------------------------------
// Signed-in routes
// ---------------------------------------------------------------------------

function HomeRoute({ navigation }: Props<'Home'>) {
  const { signOut } = useAuth();
  return (
    <HomeScreen
      onRecord={() => navigation.navigate('Recording')}
      onOpenMoment={(momentId) => navigation.navigate('Player', { momentId })}
      onSeeAll={() => navigation.navigate('Collections')}
      onImport={() => navigation.navigate('Import')}
      onCollections={() => navigation.navigate('Collections')}
      onSignOut={() => {
        signOut().catch((err: unknown) => console.warn('Sign out failed', err));
      }}
    />
  );
}

function RecordingRoute({ navigation }: Props<'Recording'>) {
  return (
    <RecordingScreen
      onBack={() => navigation.goBack()}
      onAddNote={(timestamp) => navigation.navigate('AddNote', { timestamp })}
      onStop={() => navigation.replace('Review')}
    />
  );
}

function AddNoteRoute({ navigation, route }: Props<'AddNote'>) {
  return (
    <AddNoteScreen
      timestamp={route.params.timestamp}
      onClose={() => navigation.goBack()}
      onSave={() => navigation.goBack()}
    />
  );
}

function ReviewRoute({ navigation }: Props<'Review'>) {
  return (
    <ReviewScreen
      onDiscard={() => navigation.popTo('Home')}
      onSave={(title) => navigation.replace('Saving', { title })}
    />
  );
}

function SavingRoute({ navigation, route }: Props<'Saving'>) {
  const { save } = useRecordingSession();
  const { title } = route.params;
  return (
    <SavingScreen
      save={() => save(title)}
      onDone={(momentId) => resetFromHome(navigation, { name: 'Enrich', params: { momentId } })}
      onCancel={() => navigation.replace('Review')}
    />
  );
}

function EnrichRoute({ navigation, route }: Props<'Enrich'>) {
  const { momentId } = route.params;
  return (
    <EnrichScreen
      onBack={() => navigation.popTo('Home')}
      onContinue={([first, ...remaining]) => {
        if (!first) return;
        navigation.navigate('EnrichStep', {
          momentId,
          type: first,
          flow: { remaining, step: 0, total: remaining.length + 1 },
        });
      }}
      onLater={() => resetFromHome(navigation, { name: 'Player', params: { momentId } })}
    />
  );
}

function EnrichStepRoute({ navigation, route }: Props<'EnrichStep'>) {
  const { momentId, type, flow } = route.params;

  const finish = () => navigation.replace('Complete', { momentId });

  const next = () => {
    if (!flow) {
      // Editing a saved Moment: return to its player and refetch.
      navigation.popTo('Player', { momentId, savedAt: Date.now() });
      return;
    }
    const [nextType, ...remaining] = flow.remaining;
    if (!nextType) {
      finish();
      return;
    }
    navigation.push('EnrichStep', {
      momentId,
      type: nextType,
      flow: { remaining, step: flow.step + 1, total: flow.total },
    });
  };

  const shared = {
    momentId,
    flow,
    onBack: () => navigation.goBack(),
    onNext: next,
    onFinish: flow ? finish : undefined,
  };

  return type === 'scripture' ? (
    <ScriptureStep {...shared} />
  ) : (
    <NoteStep {...shared} copy={NOTE_STEPS[type]} />
  );
}

function CompleteRoute({ navigation, route }: Props<'Complete'>) {
  const { momentId } = route.params;
  return (
    <CompleteScreen
      onViewMoment={() => resetFromHome(navigation, { name: 'Player', params: { momentId } })}
      onHome={() => navigation.popTo('Home')}
    />
  );
}

function PlayerRoute({ navigation, route }: Props<'Player'>) {
  const { momentId, savedAt } = route.params;
  return (
    <PlayerScreen
      momentId={momentId}
      reloadKey={savedAt}
      onBack={() => navigation.goBack()}
      onAddMore={() => navigation.navigate('Enrich', { momentId })}
      onAddEnrichment={(type) => navigation.navigate('EnrichStep', { momentId, type })}
    />
  );
}

function CollectionsRoute({ navigation }: Props<'Collections'>) {
  return (
    <CollectionsScreen
      onBack={() => navigation.goBack()}
      onOpenMoment={(momentId) => navigation.navigate('Player', { momentId })}
      onRecord={() => navigation.navigate('Recording')}
      onImport={() => navigation.navigate('Import')}
    />
  );
}

function ImportRoute({ navigation }: Props<'Import'>) {
  const openDetails = (file: SelectedAudioFile) => navigation.navigate('ImportDetails', { file });
  return (
    <ImportScreen
      onBack={() => navigation.goBack()}
      onChooseFiles={openDetails}
      onVoiceMemos={openDetails}
      onRecord={() => navigation.replace('Recording')}
      onCollections={() => navigation.replace('Collections')}
    />
  );
}

function ImportDetailsRoute({ navigation, route }: Props<'ImportDetails'>) {
  return (
    <ImportDetailsScreen
      file={route.params.file}
      onBack={() => navigation.goBack()}
      onImport={async (selected, title) => {
        const { momentId } = await uploadAudio({
          uri: selected.uri,
          duration: selected.duration,
          format: selected.format,
          fileName: selected.fileName,
          title,
        });
        resetFromHome(navigation, { name: 'Enrich', params: { momentId } });
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Navigator
// ---------------------------------------------------------------------------

/**
 * Auth-gated root stack. Signed-out users only have the intro and sign-in
 * screens; signing in or out swaps the screen set, and React Navigation moves
 * to the first screen of the new set automatically.
 */
export function RootNavigator() {
  const { session, loading } = useAuth();

  // Keep the native splash up until the stored session has been restored, so
  // a signed-in user never sees the sign-in flow flash.
  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.navy },
        animation: 'fade',
        animationDuration: 250,
      }}
    >
      {session ? (
        <>
          <Stack.Screen name="Home" component={HomeRoute} />
          <Stack.Screen name="Recording" component={RecordingRoute} />
          <Stack.Screen
            name="AddNote"
            component={AddNoteRoute}
            options={{ presentation: 'formSheet', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Review" component={ReviewRoute} />
          <Stack.Screen name="Saving" component={SavingRoute} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Enrich" component={EnrichRoute} />
          <Stack.Screen name="EnrichStep" component={EnrichStepRoute} />
          <Stack.Screen name="Complete" component={CompleteRoute} />
          <Stack.Screen name="Player" component={PlayerRoute} />
          <Stack.Screen name="Collections" component={CollectionsRoute} />
          <Stack.Screen name="Import" component={ImportRoute} />
          <Stack.Screen name="ImportDetails" component={ImportDetailsRoute} />
        </>
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashRoute} />
          <Stack.Screen name="LogoReveal" component={LogoRevealRoute} />
          <Stack.Screen name="Welcome" component={WelcomeRoute} />
          <Stack.Screen name="SignInUp" component={SignInUpRoute} />
        </>
      )}
    </Stack.Navigator>
  );
}
