import React, { useRef } from 'react';
import MapViewer from './MapViewer';
import SearchBar from './SearchBar';

const MapPage = () => {
    const handleSearch = useRef();

    return (
        <div className="map-page">
            <MapViewer onAddressSearch={handleSearch} />
            <SearchBar onSearch={address => handleSearch.current?.(address) } />
        </div>
    );
};

export default MapPage;
