"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Check, 
  Loader2, 
  Plus, 
  Minus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "leaflet/dist/leaflet.css";

export interface LocationPickerMapProps {
  initialAddress?: string;
  initialPosition?: [number, number];
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onRemove?: () => void;
  className?: string;
}

// Default center: Tehran [35.6892, 51.3890]
const DEFAULT_CENTER: [number, number] = [35.6892, 51.3890];

export default function LocationPickerMap({
  initialAddress = "",
  initialPosition,
  onLocationSelect,
  onRemove,
  className,
}: LocationPickerMapProps) {
  const t = useTranslations("Profile.actions");
  const locale = useLocale();
  const isFa = locale === "fa";

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  const [position, setPosition] = React.useState<[number, number] | null>(
    initialPosition || DEFAULT_CENTER
  );
  const [selectedAddress, setSelectedAddress] = React.useState<string>(initialAddress);
  const [isFetchingAddress, setIsFetchingAddress] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [searchResults, setSearchResults] = React.useState<Array<{ lat: string; lon: string; display_name: string }>>([]);
  const [showSearchResults, setShowSearchResults] = React.useState<boolean>(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [isLocating, setIsLocating] = React.useState<boolean>(false);

  // Reverse geocode latitude and longitude to human-readable address
  const reverseGeocode = React.useCallback(async (lat: number, lng: number) => {
    setIsFetchingAddress(true);
    try {
      const lang = isFa ? "fa" : "en";
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}&zoom=18`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          // Format address cleanly: road, suburb, city/town/village, province
          const addr = data.address || {};
          const parts: string[] = [];
          if (addr.state || addr.province) parts.push(addr.state || addr.province);
          if (addr.city || addr.town || addr.county) parts.push(addr.city || addr.town || addr.county);
          if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
          if (addr.road) parts.push(addr.road);
          if (addr.house_number) parts.push(addr.house_number);

          const formatted = parts.length > 0 ? parts.join("، ") : data.display_name;
          setSelectedAddress(formatted);
          onLocationSelect(lat, lng, formatted);
          return;
        }
      }
    } catch {
      // Fallback if network or rate limit fails
    } finally {
      setIsFetchingAddress(false);
    }

    // Fallback: Coordinates string
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setSelectedAddress(fallback);
    onLocationSelect(lat, lng, fallback);
  }, [isFa, onLocationSelect]);

  // Initialize Leaflet map
  React.useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

    let L: any;
    const initMap = async () => {
      L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const center = position || DEFAULT_CENTER;
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 13,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      // Clean, fast OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom animated pulse marker icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 36px; height: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3B82F6"/>
                <circle cx="12" cy="9" r="3.2" fill="#FFFFFF"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      // Create marker
      const marker = L.marker(center, {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Marker drag event
      marker.on("dragend", () => {
        const latlng = marker.getLatLng();
        setPosition([latlng.lat, latlng.lng]);
        reverseGeocode(latlng.lat, latlng.lng);
      });

      // Map click event
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // Force layout invalidation after render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Invalidate map size on expand/collapse
  React.useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
    }
  }, [isExpanded]);

  // Move marker and pan map
  const moveToLocation = (lat: number, lng: number, zoom = 15) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    markerRef.current.setLatLng([lat, lng]);
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  // Search places via Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const lang = isFa ? "fa" : "en";
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&accept-language=${lang}&limit=5`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
        setShowSearchResults(true);
      }
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  // Select place from search suggestions
  const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    moveToLocation(lat, lon, 16);
    setShowSearchResults(false);
    setSearchQuery(result.display_name.split(",")[0] || "");
  };

  // Get current user location via GPS
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        moveToLocation(latitude, longitude, 16);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Clear location
  const handleClear = () => {
    setSelectedAddress("");
    onRemove?.();
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border border-border/50 bg-card shadow-xs transition-all duration-300 flex flex-col",
        isExpanded ? "h-[520px]" : "h-80",
        className
      )}
    >
      {/* Top Search Bar & Controls Overlay */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-center gap-2 pointer-events-none">
        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative flex-1 pointer-events-auto shadow-md rounded-xl overflow-hidden bg-background/95 backdrop-blur-md border border-border/60"
        >
          <div className="flex items-center px-3 h-10 gap-2">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchOnMap")}
              className="flex-1 bg-transparent border-none text-xs outline-none text-foreground placeholder:text-muted-foreground/70"
            />
            {isSearching && <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="border-t border-border/40 bg-background/95 backdrop-blur-md divide-y divide-border/20 max-h-48 overflow-y-auto custom-scrollbar">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-start px-3 py-2 text-xs hover:bg-muted/70 transition-colors flex items-start gap-2 truncate"
                >
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="truncate flex-1 text-foreground/90">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* My Location GPS Button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={handleGetMyLocation}
          disabled={isLocating}
          title={t("myLocation")}
          className="size-10 pointer-events-auto rounded-xl shadow-md bg-background/95 backdrop-blur-md hover:bg-muted text-foreground border border-border/60 shrink-0"
        >
          {isLocating ? <Loader2 className="size-4 animate-spin text-primary" /> : <Crosshair className="size-4 text-primary" />}
        </Button>

        {/* Expand / Collapse Button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? t("collapseMap") : t("expandMap")}
          className="size-10 pointer-events-auto rounded-xl shadow-md bg-background/95 backdrop-blur-md hover:bg-muted text-foreground border border-border/60 shrink-0"
        >
          {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-[0]" />

      {/* Floating Zoom Controls (Bottom right/left based on layout) */}
      <div className="absolute bottom-16 ltr:right-3 rtl:left-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          className="size-8 rounded-lg bg-background/95 backdrop-blur-md border border-border/60 shadow-md text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="size-8 rounded-lg bg-background/95 backdrop-blur-md border border-border/60 shadow-md text-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
      </div>

      {/* Bottom Info Bar / Selected Location Preview */}
      <div className="absolute bottom-2 inset-x-2 z-[1000] pointer-events-auto">
        <div className="p-2.5 rounded-xl bg-background/95 backdrop-blur-md border border-border/60 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <MapPin className="size-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                {isFetchingAddress ? (
                  <>
                    <Loader2 className="size-3 animate-spin text-primary" />
                    <span>{t("fetchingAddress")}</span>
                  </>
                ) : (
                  <span>{t("mapHint")}</span>
                )}
              </span>
              <span className="text-xs font-semibold text-foreground truncate mt-0.5 fa-num">
                {selectedAddress || (position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1"
              >
                <Trash2 className="size-3.5" />
                <span>{t("remove")}</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (position) {
                  onLocationSelect(position[0], position[1], selectedAddress);
                }
              }}
              className="h-8 px-3 text-xs rounded-lg shadow-xs font-semibold gap-1.5"
            >
              <Check className="size-3.5" />
              <span>{t("save")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
