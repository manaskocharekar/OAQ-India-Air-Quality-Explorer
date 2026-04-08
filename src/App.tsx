/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import LocationDetails from './components/LocationDetails';
import { Location, Measurement } from './types';
import { Button } from '@/components/ui/button';
import { Key, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Mock Data for UI demonstration
const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Anand Vihar, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: { latitude: 28.6476, longitude: 77.3158 },
    lastUpdated: new Date().toISOString(),
    parameters: ['pm25', 'pm10', 'no2', 'so2'],
  },
  {
    id: '2',
    name: 'Bandra, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    coordinates: { latitude: 19.0596, longitude: 72.8295 },
    lastUpdated: new Date().toISOString(),
    parameters: ['pm25', 'pm10', 'o3'],
  },
  {
    id: '3',
    name: 'Siddhapura, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    coordinates: { latitude: 12.9482, longitude: 77.5883 },
    lastUpdated: new Date().toISOString(),
    parameters: ['pm25', 'pm10', 'co'],
  },
  {
    id: '4',
    name: 'Fort William, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: { latitude: 22.5542, longitude: 88.3359 },
    lastUpdated: new Date().toISOString(),
    parameters: ['pm25', 'pm10', 'no2'],
  },
  {
    id: '5',
    name: 'Manali, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    coordinates: { latitude: 13.1667, longitude: 80.2667 },
    lastUpdated: new Date().toISOString(),
    parameters: ['pm25', 'so2', 'o3'],
  }
];

const MOCK_MEASUREMENTS: Record<string, Measurement[]> = {
  '1': [
    { locationId: '1', parameter: 'pm25', value: 145, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '1', parameter: 'pm10', value: 210, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '1', parameter: 'no2', value: 45, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '1', parameter: 'so2', value: 12, unit: 'µg/m³', date: new Date().toISOString() },
  ],
  '2': [
    { locationId: '2', parameter: 'pm25', value: 65, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '2', parameter: 'pm10', value: 95, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '2', parameter: 'o3', value: 32, unit: 'µg/m³', date: new Date().toISOString() },
  ],
  '3': [
    { locationId: '3', parameter: 'pm25', value: 42, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '3', parameter: 'pm10', value: 68, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '3', parameter: 'co', value: 0.8, unit: 'mg/m³', date: new Date().toISOString() },
  ],
  '4': [
    { locationId: '4', parameter: 'pm25', value: 88, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '4', parameter: 'pm10', value: 120, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '4', parameter: 'no2', value: 28, unit: 'µg/m³', date: new Date().toISOString() },
  ],
  '5': [
    { locationId: '5', parameter: 'pm25', value: 54, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '5', parameter: 'so2', value: 18, unit: 'µg/m³', date: new Date().toISOString() },
    { locationId: '5', parameter: 'o3', value: 24, unit: 'µg/m³', date: new Date().toISOString() },
  ],
};

export default function App() {
  const [locations, setLocations] = useState<Location[]>(MOCK_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    // In a real app, this would trigger a new API fetch
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey.trim());
      setIsApiKeyDialogOpen(false);
      // Here you would normally trigger a fetch with the new key
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1500); // Simulate loading
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans antialiased">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 z-10">
        <Sidebar 
          locations={filteredLocations} 
          onLocationSelect={handleLocationSelect}
          onSearch={handleSearch}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* API Status Banner */}
        {!apiKey && (
          <div className="absolute top-4 left-4 z-[1000] right-4 pointer-events-none">
            <Alert className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/20 shadow-lg pointer-events-auto">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-sm font-bold">Demo Mode Active</AlertTitle>
              <AlertDescription className="text-xs flex items-center justify-between gap-4">
                <span>Showing mock data. Connect your OAQ API key to view real-time air quality data across India.</span>
                <Button 
                  size="sm" 
                  variant="default" 
                  className="h-8 text-xs"
                  onClick={() => setIsApiKeyDialogOpen(true)}
                >
                  <Key className="w-3 h-3 mr-2" />
                  Connect API
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Map */}
        <Map 
          locations={filteredLocations} 
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
        />

        {/* Location Details Overlay */}
        {selectedLocation && (
          <LocationDetails 
            location={selectedLocation}
            measurements={MOCK_MEASUREMENTS[selectedLocation.id] || []}
            onClose={() => setSelectedLocation(null)}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[2000] bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching live data...</p>
            </div>
          </div>
        )}
      </div>

      {/* API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter OAQ API Key</DialogTitle>
            <DialogDescription>
              Please provide your API key from the OAQ platform to access live data.
              Your key will be stored locally in this session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your key here..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveApiKey}>Save Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
