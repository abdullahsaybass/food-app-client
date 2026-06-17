import { create } from 'zustand';

export interface PickedLocation {
  latitude: number;
  longitude: number;
  label: string;
  street: string;
  city: string;
  atoll: string;
  zip: string;
}

interface LocationPickerState {
  pickedLocation: PickedLocation | null;
  setPickedLocation: (location: PickedLocation) => void;
  clearPickedLocation: () => void;
}

export const useLocationPickerStore = create<LocationPickerState>((set) => ({
  pickedLocation: null,
  setPickedLocation: (location) => set({ pickedLocation: location }),
  clearPickedLocation: () => set({ pickedLocation: null }),
}));