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
import { Home, Maximize2 } from 'lucide-react';
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
        bg-[#23232b] border border-white/[0.12] text-white/70 shadow-md"
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
            : 'bg-[#23232b] border border-white/[0.12] text-white/90',
        )}
      >
        {fmtPrice(price)}
      </button>
      <div className={cn(
        'absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 shadow-sm',
        active ? 'bg-white' : 'bg-[#23232b] border-r border-b border-white/[0.12]',
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
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#1e1e24] border border-white/[0.08] shadow-xl w-[200px]">
      {photo ? (
        <img
          src={photo}
          alt=""
          className="w-10 h-10 rounded object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-[#16161a] flex items-center justify-center flex-shrink-0">
          <Home className="w-4 h-4 text-white/10" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-white/90">{fmtPrice(price)}</p>
        <p className="text-[10px] text-white/40 truncate">{shortAddr}</p>
        {(beds != null || baths != null) && (
          <p className="text-[9px] text-white/25 mt-0.5">
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
    <div className="w-[280px] rounded-lg overflow-hidden bg-[#1e1e24] border border-white/[0.08] shadow-xl">
      {/* Photo */}
      <div className="relative h-[130px]">
        {photo ? (
          <img src={photo} alt={address} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#16161a] flex items-center justify-center">
            <Home className="w-7 h-7 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute bottom-2 left-3 text-[17px] font-bold text-white drop-shadow-md">
          ${price.toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-[12px] text-white/60 truncate mb-0.5">{address}{city ? `, ${city}` : ''}</p>
        {specsText && <p className="text-[10px] text-white/30 mb-2.5">{specsText}</p>}

        {(capRate != null || cashFlow != null) && (
          <div className="flex items-center gap-4 text-[11px] font-mono text-white/40 mb-2.5">
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
            bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white/80"
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
  if (!MAPBOX_TOKEN) {
    return (
      <div className={cn('flex items-center justify-center bg-[#16161a] border border-white/[0.06]', className)}>
        <div className="text-center p-8">
          <p className="text-[13px] text-white/30 mb-1">Map requires Mapbox token</p>
          <p className="text-[11px] text-white/15">Add VITE_MAPBOX_TOKEN to your .env file</p>
        </div>
      </div>
    );
  }

  if (mappableProperties.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-[#16161a] border border-white/[0.06]', className)}>
        <div className="text-center p-8">
          <p className="text-[13px] text-white/30 mb-1">No map data available</p>
          <p className="text-[11px] text-white/15">Properties don't have location coordinates</p>
        </div>
      </div>
    );
  }

  const clickedId = clickedProperty ? getId(clickedProperty) : null;
  const totalProperties = properties.length;
  const onMap = mappableProperties.length;

  return (
    <div className={cn(
      'relative overflow-hidden border border-white/[0.06]',
      '[&_.mapboxgl-popup]:!z-[9999]',
      '[&_.mapboxgl-ctrl-group]:!bg-[#1e1e24] [&_.mapboxgl-ctrl-group]:!border-white/[0.08] [&_.mapboxgl-ctrl-group]:!rounded-md [&_.mapboxgl-ctrl-group]:!shadow-md',
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
            className="[&_.mapboxgl-popup-content]:!bg-transparent [&_.mapboxgl-popup-content]:!p-0 [&_.mapboxgl-popup-content]:!shadow-none [&_.mapboxgl-popup-tip]:!border-b-[#1e1e24] [&_.mapboxgl-popup-tip]:!border-t-transparent"
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
              '[&_.mapboxgl-popup-tip]:!border-t-[#1e1e24]',
              '[&_.mapboxgl-popup-close-button]:!text-white/40 [&_.mapboxgl-popup-close-button]:!text-lg [&_.mapboxgl-popup-close-button]:!right-2 [&_.mapboxgl-popup-close-button]:!top-2 [&_.mapboxgl-popup-close-button]:!z-10',
            )}
          >
            <PopupCard property={clickedProperty} onAction={handlePopupAction} />
          </Popup>
        )}
      </Map>

      {/* Property count badge */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1e1e24]/90 border border-white/[0.06] text-[11px] text-white/50 font-medium z-30 shadow-md">
        {onMap < totalProperties
          ? <span>{onMap} of {totalProperties} on map</span>
          : <span>{onMap} properties</span>
        }
      </div>

      {/* Fit all button */}
      <div className="absolute top-3 right-3 z-30">
        <button
          onClick={handleFitAll}
          className="p-1.5 rounded-md bg-[#1e1e24]/90 border border-white/[0.06] text-white/40 hover:text-white/70 transition-colors shadow-md"
          title="Fit all properties"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PropertyMapView;
