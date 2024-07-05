// MapboxMap.js
import React, { useState } from 'react';
import MapGL from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Udskift med din Mapbox API-nøgle

const MapboxMap = () => {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onViewportChange={nextViewport => setViewport(nextViewport)}
      />
    </div>
  );
};

export default MapboxMap;
