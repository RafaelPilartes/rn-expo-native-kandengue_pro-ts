import { TrackRideContext } from '@/context/TrackRideContext';
import { useContext } from 'react';

export const useTrackRide = () => useContext(TrackRideContext);
