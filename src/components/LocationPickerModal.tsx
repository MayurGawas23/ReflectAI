import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, X, Navigation, Check, Search } from 'lucide-react';
import { JournalLocation } from '../types';

interface LocationPickerModalProps {
  currentLocation?: JournalLocation;
  onSaveLocation: (loc: JournalLocation | null) => void;
  onClose: () => void;
}

// Default center coordinates (e.g. San Francisco or user location)
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

// Curated peaceful reflection sanctuaries & prompt locations for quick selection
const QUICK_SANCTUARIES = [
  { name: 'Redwood Sanctuary', address: 'Muir Woods, Mill Valley, CA', lat: 37.8970, lng: -122.5811 },
  { name: 'Seaside Bluffs', address: 'Lands End Trail, San Francisco, CA', lat: 37.7845, lng: -122.5057 },
  { name: 'Botanical Garden Conservatory', address: 'Golden Gate Park, CA', lat: 37.7667, lng: -122.4665 },
  { name: 'High Mountain Overlook', address: 'Twin Peaks, San Francisco, CA', lat: 37.7544, lng: -122.4477 },
  { name: 'Quiet Corner Cafe', address: 'North Beach, San Francisco, CA', lat: 37.7999, lng: -122.4082 },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocation,
  onSaveLocation,
  onClose,
}) => {
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number }>(
    currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : DEFAULT_CENTER
  );
  const [placeName, setPlaceName] = useState(currentLocation?.placeName || '');
  const [address, setAddress] = useState(currentLocation?.formattedAddress || '');
  const [detecting, setDetecting] = useState(false);

  // Use Maps Demo Key or custom injected environment key
  const mapsApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const handleGetCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSelectedPos(newPos);
        setPlaceName('Current Location');
        setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setDetecting(false);
        console.warn('Geolocation failed or denied:', err);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectQuickPlace = (item: typeof QUICK_SANCTUARIES[0]) => {
    setSelectedPos({ lat: item.lat, lng: item.lng });
    setPlaceName(item.name);
    setAddress(item.address);
  };

  const handleSave = () => {
    if (!placeName.trim()) {
      onSaveLocation({
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        placeName: 'Pinned Sanctuary',
        formattedAddress: address || `${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`
      });
    } else {
      onSaveLocation({
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        placeName: placeName.trim(),
        formattedAddress: address
      });
    }
    onClose();
  };

  const handleRemove = () => {
    onSaveLocation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Pin Reflection Location</h3>
              <p className="text-[11px] text-stone-500">Attach geographic ambiance to your entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Map Canvas or Fallback View */}
        <div className="relative h-64 w-full bg-stone-100 border-b border-stone-100">
          {mapsApiKey ? (
            <APIProvider apiKey={mapsApiKey}>
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={selectedPos}
                center={selectedPos}
                defaultZoom={13}
                gestureHandling="cooperative"
                className="w-full h-full"
                onClick={(e: any) => {
                  if (e.detail?.latLng) {
                    const lat = e.detail.latLng.lat;
                    const lng = e.detail.latLng.lng;
                    setSelectedPos({ lat, lng });
                    if (!placeName) setPlaceName('Custom Pin');
                  }
                }}
              >
                <AdvancedMarker position={selectedPos}>
                  <Pin background="#059669" glyphColor="#ffffff" borderColor="#047857" />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-stone-800">
                {placeName || 'Select a Location or Use Device GPS'}
              </p>
              <p className="text-[11px] text-stone-500 mt-1 max-w-sm">
                Coordinates: {selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}
              </p>
            </div>
          )}

          {/* GPS Quick Action Overlay */}
          <button
            type="button"
            onClick={handleGetCurrentPosition}
            disabled={detecting}
            className="cursor-pointer absolute top-3 right-3 z-10 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-stone-200 text-stone-700 text-xs font-medium hover:bg-white shadow-sm disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Detecting...' : 'Use My GPS'}</span>
          </button>
        </div>

        {/* Input Details & Quick Suggestions */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Place or Setting Name
              </label>
              <input
                type="text"
                placeholder="e.g. Muir Woods, Quiet Desk, Coastline"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Address or Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near the redwood grove"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Quick Sanctuaries Presets */}
          <div>
            <span className="block text-[11px] font-medium text-stone-500 mb-2">
              Or pick from calming reflection settings:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SANCTUARIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickPlace(item)}
                  className="cursor-pointer text-[11px] px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition flex items-center space-x-1"
                >
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div>
            {currentLocation && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
              >
                Remove Location
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-1.5 text-xs rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="cursor-pointer inline-flex items-center space-x-1 px-4 py-1.5 text-xs font-medium rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Attach Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
