/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Location } from '@/src/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SidebarProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onSearch: (query: string) => void;
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export default function Sidebar({ locations, onLocationSelect, onSearch, onDateChange }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-4 border-bottom space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">OAQ India</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Filter by Date Range
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date.from}
                selected={{ from: date.from, to: date.to }}
                onSelect={(range) => {
                  const newRange = { from: range?.from, to: range?.to };
                  setDate(newRange);
                  onDateChange(newRange);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Locations ({locations.length})
          </h2>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {locations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No locations found.
              </div>
            ) : (
              locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => onLocationSelect(location)}
                  className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors group"
                >
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {location.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {location.city}, {location.state}
                  </div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {location.parameters.map((p) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 bg-muted rounded uppercase font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
