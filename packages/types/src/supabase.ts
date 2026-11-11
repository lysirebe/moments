/**
 * Database types for the Supabase client.
 *
 * Mirrors the schema in `supabase/migrations`. Regenerate from a running local
 * database with `npm run supabase:gen:types`. The output replaces this file and
 * keeps the same export names.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type MomentType =
  | 'quiet_time'
  | 'prayer'
  | 'living_room'
  | 'conference'
  | 'spontaneous'
  | 'worship'
  | 'other';

type AudioFormat = 'm4a' | 'mp3' | 'wav' | 'aac' | 'ogg';

type MomentNoteKind = 'note' | 'prayer' | 'revelation' | 'reflection';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      moments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          place: string | null;
          people: Json;
          type: MomentType;
          artwork_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date?: string;
          place?: string | null;
          people?: Json;
          type?: MomentType;
          artwork_path?: string | null;
        };
        Update: {
          title?: string;
          date?: string;
          place?: string | null;
          people?: Json;
          type?: MomentType;
          artwork_path?: string | null;
        };
        Relationships: [];
      };
      moments_audio: {
        Row: {
          id: string;
          moment_id: string;
          user_id: string;
          storage_path: string;
          file_name: string | null;
          format: AudioFormat;
          duration: number;
          size: number;
          waveform: Json | null;
          transcribed: boolean;
          transcript: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moment_id: string;
          user_id: string;
          storage_path: string;
          file_name?: string | null;
          format?: AudioFormat;
          duration?: number;
          size?: number;
          waveform?: Json | null;
          transcribed?: boolean;
          transcript?: string | null;
        };
        Update: {
          waveform?: Json | null;
          transcribed?: boolean;
          transcript?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'moments_audio_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: true;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
        ];
      };
      moment_notes: {
        Row: {
          id: string;
          moment_id: string;
          user_id: string;
          kind: MomentNoteKind;
          is_during_recording: boolean;
          timestamp: number | null;
          is_updated: boolean;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          moment_id: string;
          user_id: string;
          kind: MomentNoteKind;
          is_during_recording?: boolean;
          timestamp?: number | null;
          is_updated?: boolean;
          content: string;
        };
        Update: {
          content?: string;
          is_updated?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'moment_notes_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
        ];
      };
      moment_scriptures: {
        Row: {
          id: string;
          moment_id: string;
          reference: string;
          translation: string;
          text: string | null;
          note: string | null;
          passage_key: string | null;
          bible_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moment_id: string;
          reference: string;
          translation?: string;
          text?: string | null;
          note?: string | null;
          passage_key?: string | null;
          bible_id?: string | null;
        };
        Update: {
          text?: string | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'moment_scriptures_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      moment_type: MomentType;
      audio_format: AudioFormat;
      moment_note_kind: MomentNoteKind;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

/** Convenience accessor for a table's row type. */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
