/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Location, Measurement, PARAMETER_LABELS, PARAMETER_UNITS } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Wind, Droplets, Thermometer, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface LocationDetailsProps {
  location: Location;
  measurements: Measurement[];
  onClose: () => void;
}

export default function LocationDetails({ location, measurements, onClose }: LocationDetailsProps) {
  const getAQIColor = (value: number, parameter: string) => {
    if (parameter === 'pm25') {
      if (value <= 12) return 'bg-green-500';
      if (value <= 35.4) return 'bg-yellow-500';
      if (value <= 55.4) return 'bg-orange-500';
      if (value <= 150.4) return 'bg-red-500';
      return 'bg-purple-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-96 max-h-[calc(100vh-2rem)] flex flex-col pointer-events-auto">
      <Card className="shadow-2xl border-2 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold leading-tight">{location.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{location.city}, {location.state}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[60vh]">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {measurements.map((m) => (
                  <div key={m.parameter} className="p-3 rounded-lg border bg-card flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        {PARAMETER_LABELS[m.parameter] || m.parameter}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getAQIColor(m.value, m.parameter)}`} />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-mono font-bold tracking-tighter">{m.value}</span>
                      <span className="text-[10px] text-muted-foreground">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  Station Info
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Coordinates</span>
                    <span className="font-mono">{location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Last Updated</span>
                    <span>{format(new Date(location.lastUpdated), 'MMM dd, HH:mm')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Country</span>
                    <span>{location.country}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex gap-3">
                <Wind className="w-5 h-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium leading-none">Air Quality Status</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Data is fetched from the OAQ network. Values are updated hourly. 
                    Always refer to local health advisories.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
