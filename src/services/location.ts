import { LocationCoords } from '../types';

// Laos province/district fallback coords (used for manual picker)
export const DEFAULT_LAOS_COORDS: LocationCoords = {
  lat: 17.9712,
  lng: 102.6174,
  accuracy: undefined,
  address: 'ນະຄອນຫຼວງວຽງຈັນ',
  province: 'ນະຄອນຫຼວງວຽງຈັນ',
  district: 'ຈັນທະບູລີ',
  village: '',
};

// ─── Location State ─────────────────────────────────────────────────────────
export type LocationStatus =
  | 'idle'       // not started yet
  | 'searching'  // currently requesting
  | 'found'      // GPS fix received
  | 'timeout'    // GPS timed out (no fix)
  | 'denied'     // user denied permission
  | 'blocked'    // permission previously denied/blocked by browser policy
  | 'unavailable'// geolocation API not present or hardware unavailable
  | 'manual';    // user manually picked a location

export interface GeolocationResult {
  coords: LocationCoords | null;  // null if unavailable; caller uses DEFAULT_LAOS_COORDS
  source: 'gps' | 'fallback' | 'manual';
  status: LocationStatus;
  error?: string;
}

/**
 * Resolves the current Permissions API state for geolocation.
 * Returns null if Permissions API is unavailable.
 */
export async function queryLocationPermission(): Promise<PermissionState | null> {
  if (typeof navigator === 'undefined' || !navigator.permissions) return null;
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted' | 'prompt' | 'denied'
  } catch {
    return null;
  }
}

/**
 * Request the current GPS position. Returns a typed GeolocationResult.
 * - Never silently falls back to a mock location — returns coords:null on failure.
 * - Caller decides how to handle null (use manual picker or DEFAULT_LAOS_COORDS flagged as fallback).
 */
export const getCurrentLocation = async (timeoutMs = 10000): Promise<GeolocationResult> => {
  // 1. API unavailable
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { coords: null, source: 'fallback', status: 'unavailable', error: 'Geolocation API unavailable' };
  }

  // 2. Check permission state first (non-blocking, best-effort)
  const permState = await queryLocationPermission();
  if (permState === 'denied') {
    return { coords: null, source: 'fallback', status: 'blocked', error: 'Permission denied' };
  }

  // 3. Request position
  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            address: 'ຈຸດພິກັດ GPS',
          },
          source: 'gps',
          status: 'found',
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ coords: null, source: 'fallback', status: 'denied', error: 'Permission denied' });
        } else if (error.code === error.TIMEOUT) {
          resolve({ coords: null, source: 'fallback', status: 'timeout', error: 'GPS timeout' });
        } else {
          // POSITION_UNAVAILABLE — hardware/OS level
          resolve({ coords: null, source: 'fallback', status: 'unavailable', error: 'Position unavailable' });
        }
      },
      options,
    );
  });
};

/**
 * Watch position continuously. Returns an unsubscribe function.
 */
export function watchLocation(
  onUpdate: (result: GeolocationResult) => void,
  onError: (status: LocationStatus) => void,
): () => void {
  if (!navigator.geolocation) {
    onError('unavailable');
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        coords: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          address: 'ຈຸດພິກັດ GPS',
        },
        source: 'gps',
        status: 'found',
      });
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) onError('denied');
      else if (err.code === err.TIMEOUT) onError('timeout');
      else onError('unavailable');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}
