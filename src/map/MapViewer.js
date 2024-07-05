import React, { useRef } from 'react';
import { useMapSetup } from './useMapSetup';

const MapViewer = ({ onAddressSearch }) => {
  const mapRef = useRef();
  useMapSetup(mapRef, onAddressSearch);

  return <div ref={mapRef} style={{ height: '100vh', width: '100vw'}}></div>;
};

export default MapViewer;
