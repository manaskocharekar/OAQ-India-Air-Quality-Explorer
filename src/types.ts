/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: string;
  parameters: string[];
}

export interface Measurement {
  locationId: string;
  parameter: string;
  value: number;
  unit: string;
  date: string;
}

export interface AirQualityData {
  location: Location;
  measurements: Measurement[];
}

export type Parameter = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';

export const PARAMETER_LABELS: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'O3',
  no2: 'NO2',
  so2: 'SO2',
  co: 'CO',
};

export const PARAMETER_UNITS: Record<string, string> = {
  pm25: 'µg/m³',
  pm10: 'µg/m³',
  o3: 'µg/m³',
  no2: 'µg/m³',
  so2: 'µg/m³',
  co: 'mg/m³',
};
