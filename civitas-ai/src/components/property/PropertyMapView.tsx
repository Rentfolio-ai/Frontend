/**
 * PropertyMapView -- Clean real estate map (Zillow / Google Maps style).
 *
 * - Supercluster-based clustering with plain dark circles
 * - Flat price pins with subtle shadow
 * - Simple hover tooltip and click popup
 * - Auto-fits to data when properties change
 * - No fog, terrain, 3D buildings, gold gradients, or decorative overlays
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
} from 'react-map-gl/mapbox';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { Home, MapPin, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PropertyCardData } from '../chat/tool-cards/PropertyGridCard';

/* ── Constants & helpers ──────────────────────────────────────────── */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const getId = (p: PropertyCardData) => p.listing_id || p.id || p.property_id || p.address;

const fmtPrice = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
};

const fmtCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs}`;
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

/* ── Types ─────────────────────────────────────────────────────────── */

interface PropertyMapViewProps {
  properties: PropertyCardData[];
  hoveredPropertyId?: string | null;
  onHoverProperty?: (id: string | null) => void;
  onSelectProperty?: (id: string) => void;
  className?: string;
}

type PropertyFeature = Supercluster.PointFeature<{
  index: number;
  price: number;
  id: string;
}>;

/* ── Cluster Pin ──────────────────────────────────────────────────── */

const ClusterPin: React.FC<{
  count: number;
  onClick: () => void;
}> = ({ count, onClick }) => {
  const size = count < 10 ? 36 : count < 25 ? 42 : 50;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="rounded-full flex items-center justify-center font-bold cursor-pointer
        transition-all duration-150 hover:scale-110 active:scale-95
        bg-card border border-black/[0.10] text-foreground/70 shadow-md"
      style={{ width: size, height: size, fontSize: size < 42 ? 11 : 13 }}
    >
      {count}
    </button>
  );
};

/* ── Price Pin ────────────────────────────────────────────────────── */

const PricePin: React.FC<{
  price: number;
  isHovered: boolean;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}> = ({ price, isHovered, isActive, onMouseEnter, onMouseLeave, onClick }) => {
  const active = isHovered || isActive;
  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <button
        className={cn(
          'relative rounded-full px-2.5 py-1 text-[11px] font-bold',
          'transition-all duration-150 cursor-pointer whitespace-nowrap shadow-md',
          active
            ? 'bg-white text-[#111114] scale-110 -translate-y-0.5 shadow-lg'
            : 'bg-card border border-black/[0.10] text-foreground',
        )}
      >
        {fmtPrice(price)}
      </button>
      <div className={cn(
        'absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 shadow-sm',
        active ? 'bg-white' : 'bg-card border-r border-b border-black/[0.10]',
      )} />
    </div>
  );
};

/* ── Hover Tooltip ────────────────────────────────────────────────── */

const HoverTooltip: React.FC<{ property: PropertyCardData }> = ({ property }) => {
  const photo = property.photos?.[0] || property.image_url || property.photo_url;
  const price = property.price || 0;
  const address = property.address || property.formattedAddress || '';
  const beds = property.bedrooms ?? property.beds;
  const baths = property.bathrooms ?? property.baths;
  const shortAddr = address.length > 24 ? address.slice(0, 24) + '...' : address;

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-elevated border border-black/[0.08] shadow-xl w-[200px]">
      {photo ? (
        <img
          src={photo}
          alt=""
          className="w-10 h-10 rounded object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-card flex items-center justify-center flex-shrink-0">
          <Home className="w-4 h-4 text-muted-foreground/30" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-foreground">{fmtPrice(price)}</p>
        <p className="text-[10px] text-muted-foreground/70 truncate">{shortAddr}</p>
        {(beds != null || baths != null) && (
          <p className="text-[9px] text-muted-foreground/50 mt-0.5">
            {beds != null ? `${beds}bd` : ''}{beds != null && baths != null ? ' · ' : ''}{baths != null ? `${baths}ba` : ''}
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Popup Card ───────────────────────────────────────────────────── */

const PopupCard: React.FC<{
  property: PropertyCardData;
  onAction?: (id: string) => void;
}> = ({ property, onAction }) => {
  const photo = property.photos?.[0] || property.image_url || property.photo_url;
  const address = property.address || property.formattedAddress || '';
  const city = property.city || '';
  const price = property.price || 0;
  const beds = property.bedrooms ?? property.beds;
  const baths = property.bathrooms ?? property.baths;
  const sqft = property.sqft || property.squareFootage;

  const metrics = property.calculated_metrics;
  const capRate = metrics?.cap_rate ?? property.analysis?.cap_rate ?? property.analysis?.gross_yield;
  const cashFlow = property.financial_snapshot?.estimated_monthly_cash_flow ?? metrics?.monthly_cash_flow;
  const isPositiveCF = (cashFlow ?? 0) >= 0;

  const specsText = [
    beds != null ? `${beds} bd` : null,
    baths != null ? `${baths} ba` : null,
    sqft ? `${sqft.toLocaleString()} sqft` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="w-[280px] rounded-lg overflow-hidden bg-surface-elevated border border-black/[0.08] shadow-xl">
      {/* Photo */}
      <div className="relative h-[130px]">
        {photo ? (
          <img src={photo} alt={address} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-card flex items-center justify-center">
            <Home className="w-7 h-7 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute bottom-2 left-3 text-[17px] font-bold text-white drop-shadow-md">
          ${price.toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-[12px] text-muted-foreground truncate mb-0.5">{address}{city ? `, ${city}` : ''}</p>
        {specsText && <p className="text-[10px] text-muted-foreground/50 mb-2.5">{specsText}</p>}

        {(capRate != null || cashFlow != null) && (
          <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground/70 mb-2.5">
            {capRate != null && <span>{fmtPct(capRate)} cap</span>}
            {cashFlow != null && (
              <span className={isPositiveCF ? 'text-emerald-400/70' : 'text-rose-400/70'}>
                {isPositiveCF ? '+' : '-'}{fmtCompact(cashFlow)}/mo
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => onAction?.(getId(property))}
          className="w-full py-2 rounded-md text-[11px] font-semibold transition-colors
            bg-black/[0.05] hover:bg-black/[0.07] text-muted-foreground hover:text-foreground/80"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* ── Main Map Component ────────────────────────────────────────────── */

export const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  properties,
  hoveredPropertyId,
  onHoverProperty,
  onSelectProperty,
  className,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [clickedProperty, setClickedProperty] = useState<PropertyCardData | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<PropertyCardData | null>(null);
  const [viewState, setViewState] = useState({ zoom: 12, bounds: null as [number, number, number, number] | null });
  const [mapReady, setMapReady] = useState(false);

  const mappableProperties = useMemo(() =>
    properties.filter(p => p.lat != null && p.lng != null && p.lat !== 0 && p.lng !== 0),
    [properties]
  );

  /* ── Supercluster ── */
  const clusterIndex = useMemo(() => {
    const pts: PropertyFeature[] = mappableProperties.map((p, i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng!, p.lat!] },
      properties: { index: i, price: p.price || 0, id: getId(p) },
    }));

    const idx = new Supercluster<PropertyFeature['properties']>({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
    });
    idx.load(pts);
    return idx;
  }, [mappableProperties]);

  const clusters = useMemo(() => {
    if (!viewState.bounds) return [];
    return clusterIndex.getClusters(viewState.bounds, Math.floor(viewState.zoom));
  }, [clusterIndex, viewState]);

  const initialViewState = useMemo(() => {
    if (mappableProperties.length === 0) {
      return { latitude: 39.8283, longitude: -98.5795, zoom: 4 };
    }
    const lats = mappableProperties.map(p => p.lat!);
    const lngs = mappableProperties.map(p => p.lng!);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      zoom: 12,
    };
  }, [mappableProperties]);

  /* ── Auto-fit when data changes ── */
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (!mapReady || !mapRef.current || mappableProperties.length === 0) return;
    if (mappableProperties.length === prevCountRef.current) return;
    prevCountRef.current = mappableProperties.length;

    const lats = mappableProperties.map(p => p.lat!);
    const lngs = mappableProperties.map(p => p.lng!);
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 50, duration: 600 }
    );
  }, [mapReady, mappableProperties]);

  /* ── Map event handlers ── */
  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    setViewState({
      zoom: evt.viewState.zoom,
      bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
    });
  }, []);

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (b) {
      setViewState({
        zoom: map.getZoom(),
        bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      });
    }
    setMapReady(true);
  }, []);

  const handleClusterClick = useCallback((clusterId: number, lng: number, lat: number) => {
    const expansionZoom = Math.min(clusterIndex.getClusterExpansionZoom(clusterId), 16);
    mapRef.current?.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
  }, [clusterIndex]);

  const handlePinHover = useCallback((property: PropertyCardData | null) => {
    setHoveredProperty(property);
    onHoverProperty?.(property ? getId(property) : null);
  }, [onHoverProperty]);

  const handlePinClick = useCallback((property: PropertyCardData) => {
    setClickedProperty(property);
    setHoveredProperty(null);
  }, []);

  const handlePopupAction = useCallback((id: string) => {
    onSelectProperty?.(id);
    setClickedProperty(null);
  }, [onSelectProperty]);

  const handleFitAll = useCallback(() => {
    if (!mapRef.current || mappableProperties.length === 0) return;
    const lats = mappableProperties.map(p => p.lat!);
    const lngs = mappableProperties.map(p => p.lng!);
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 50, duration: 600 }
    );
  }, [mappableProperties]);

  /* ── Empty / error states ── */
  if (mappableProperties.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-background h-full w-full relative overflow-hidden', className)}>
        {/* Placeholder Map Pattern */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F0D0B] via-transparent to-[#1A1816]/50 mix-blend-overlay"></div>

        <div className="text-center p-8 z-10 relative">
          <div className="w-20 h-20 mx-auto rounded-[24px] bg-gradient-to-b from-[#1E1A17] to-[#12100E] border border-black/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.8)] flex items-center justify-center mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-[#C08B5C]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MapPin className="w-8 h-8 text-[#C08B5C] drop-shadow-[0_0_12px_rgba(192,139,92,0.6)] group-hover:scale-110 transition-transform duration-500" />
          </div>
          <p className="text-[20px] font-bold text-foreground tracking-tight mb-2 drop-shadow-md">No map data available</p>
          <p className="text-[14px] text-[#A89E92] max-w-sm mx-auto font-medium leading-relaxed drop-shadow-sm">Properties don't have location coordinates or a valid search wasn't performed.</p>
        </div>
      </div>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-background h-full w-full relative overflow-hidden', className)}>
        {/* Placeholder Map Pattern */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F0D0B] via-transparent to-[#1A1816]/50 mix-blend-overlay"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 z-10">
          <div className="w-20 h-20 rounded-[24px] bg-gradient-to-b from-[#1E1A17] to-[#12100E] border border-black/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.8)] flex items-center justify-center mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-[#C08B5C]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MapPin className="w-8 h-8 text-[#C08B5C] drop-shadow-[0_0_12px_rgba(192,139,92,0.6)] group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h2 className="text-[28px] font-black text-foreground tracking-tight mb-3 drop-shadow-md">Interactive Map</h2>
          <p className="text-[16px] text-[#A89E92] max-w-md font-medium leading-relaxed drop-shadow-sm">
            Map requires a Mapbox token. Map View gives you an immersive visualization of all your scouted deals.
          </p>
          <button className="mt-8 px-8 py-3.5 rounded-[12px] bg-black/[0.05] border border-black/[0.08] text-foreground/80 font-bold hover:bg-black/[0.07] hover:text-foreground transition-all shadow-md active:scale-95">
            Add VITE_MAPBOX_TOKEN to .env
          </button>
        </div>
      </div>
    );
  }

  const clickedId = clickedProperty ? getId(clickedProperty) : null;
  const totalProperties = properties.length;
  const onMap = mappableProperties.length;

  return (
    <div className={cn(
      'relative overflow-hidden border border-black/[0.06]',
      '[&_.mapboxgl-popup]:!z-[9999]',
      '[&_.mapboxgl-ctrl-group]:!bg-surface-elevated [&_.mapboxgl-ctrl-group]:!border-black/[0.08] [&_.mapboxgl-ctrl-group]:!rounded-md [&_.mapboxgl-ctrl-group]:!shadow-md',
      '[&_.mapboxgl-ctrl-icon]:!invert [&_.mapboxgl-ctrl-icon]:!opacity-40',
      className,
    )}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onMove={handleMove}
        onLoad={handleLoad}
        cursor="grab"
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {clusters.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties as any;

          if (props.cluster) {
            const clusterId = props.cluster_id as number;
            const count = props.point_count as number;
            return (
              <Marker key={`cluster-${clusterId}`} latitude={lat} longitude={lng} anchor="center">
                <ClusterPin
                  count={count}
                  onClick={() => handleClusterClick(clusterId, lng, lat)}
                />
              </Marker>
            );
          }

          const property = mappableProperties[props.index];
          if (!property) return null;
          const id = props.id;
          const isHovered = hoveredPropertyId === id || (hoveredProperty && getId(hoveredProperty) === id);
          const isActive = clickedId === id;

          return (
            <Marker
              key={`pin-${id}`}
              latitude={lat}
              longitude={lng}
              anchor="bottom"
              style={{ zIndex: isActive ? 100 : isHovered ? 50 : 1 }}
            >
              <PricePin
                price={property.price}
                isHovered={!!isHovered}
                isActive={!!isActive}
                onMouseEnter={() => handlePinHover(property)}
                onMouseLeave={() => handlePinHover(null)}
                onClick={() => handlePinClick(property)}
              />
            </Marker>
          );
        })}

        {/* Hover tooltip */}
        {hoveredProperty && !clickedProperty && hoveredProperty.lat && hoveredProperty.lng && (
          <Popup
            latitude={hoveredProperty.lat}
            longitude={hoveredProperty.lng}
            anchor="top"
            offset={12}
            closeOnClick={false}
            closeButton={false}
            className="[&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!shadow-none [&_.mapboxgl-popup-tip]:!border-b-border [&_.mapboxgl-popup-tip]:!border-t-transparent"
          >
            <HoverTooltip property={hoveredProperty} />
          </Popup>
        )}

        {/* Click popup */}
        {clickedProperty && clickedProperty.lat && clickedProperty.lng && (
          <Popup
            latitude={clickedProperty.lat}
            longitude={clickedProperty.lng}
            anchor="bottom"
            offset={24}
            closeOnClick={true}
            closeButton={true}
            onClose={() => setClickedProperty(null)}
            className={cn(
              '[&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!shadow-none',
              '[&_.mapboxgl-popup-tip]:!border-t-border',
              '[&_.mapboxgl-popup-close-button]:!text-muted-foreground/70 [&_.mapboxgl-popup-close-button]:!text-lg [&_.mapboxgl-popup-close-button]:!right-2 [&_.mapboxgl-popup-close-button]:!top-2 [&_.mapboxgl-popup-close-button]:!z-10',
            )}
          >
            <PopupCard property={clickedProperty} onAction={handlePopupAction} />
          </Popup>
        )}
      </Map>

      {/* Property count badge */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-surface-elevated/90 border border-black/[0.06] text-[11px] text-muted-foreground font-medium z-30 shadow-md">
        {onMap < totalProperties
          ? <span>{onMap} of {totalProperties} on map</span>
          : <span>{onMap} properties</span>
        }
      </div>

      {/* Fit all button */}
      <div className="absolute top-3 right-3 z-30">
        <button
          onClick={handleFitAll}
          className="p-1.5 rounded-md bg-surface-elevated/90 border border-black/[0.06] text-muted-foreground/70 hover:text-foreground/70 transition-colors shadow-md"
          title="Fit all properties"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PropertyMapView;
