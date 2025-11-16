
import { useState, useEffect } from 'react';
import type { GeolocationState } from '../types';

export const useGeolocation = (): GeolocationState => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    timestamp: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp,
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setLocation(prev => ({ ...prev, error: error.message }));
    };

    const watcher = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
    
    // Clean up the watcher when the component unmounts
    return () => navigator.geolocation.clearWatch(watcher);

  }, []);

  return location;
};
