/** User-related types for the Moments platform. */

/** A user's public profile. */
export interface Profile {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}
