import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { WebGLTile } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { loadMapConfig } from './mapUtils';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';

export function useMapSetup(mapRef, onSearch) {
    const map = useRef(null);
    const mapConfig = useRef(null);
    const markerLayer = useRef(new VectorLayer({
        source: new VectorSource(),
        style: new Style({ image: new Icon({ anchor: [0.5, 1], src: '/maps-and-flags.png', scale: 0.1 }) })
    }));

    const [viewState, setViewState] = useState({
        center: [1182564.7940925972, 7599552.305414335],
        zoom: 7.627584922759944
    });

    useEffect(() => {
        const setupMap = () => {
            if (!mapRef.current || !mapConfig.current) {
                return;
            }

            const layers = [
                new WebGLTile({ source: new OSM(), preload: 4, cacheSize: 2048 }),
                mapConfig.current.vectorSource,
                mapConfig.current.overlay,
                markerLayer.current
            ];

            map.current = new Map({
                target: mapRef.current,
                layers,
                view: new View({
                    center: viewState.center, // Use state for center
                    zoom: viewState.zoom, // Use state for zoom
                    maxZoom: 20,
                    minZoom: 3,
                    extent: mapConfig.current.extent,
                    constrainOnlyCenter: true,
                    enableRotation: false
                }),
                controls: []
            });

            const logView = (view) => {
                if (view) {
                    const center = view.getCenter();
                    const zoom = view.getZoom();
                    console.log('Current View:', { center, zoom });
                }
            };

            // Log initial view settings
            logView(map.current.getView());
        };

        loadMapConfig().then(config => {
            console.log('Loaded Map Config:', config);
            mapConfig.current = config;
            setupMap();
        });

        onSearch.current = (address) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=dk`;
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    if (json.length > 0) {
                        const location = fromLonLat([parseFloat(json[0].lon), parseFloat(json[0].lat)]);

                        // Create a new view
                        const newView = new View({
                            center: location,
                            zoom: 19,
                            maxZoom: 20,
                            minZoom: 3,
                            extent: mapConfig.current.extent,
                            constrainOnlyCenter: true,
                            enableRotation: false
                        });

                        // Set the new view on the map
                        console.log('Setting new view:', newView);
                        map.current.setView(newView);

                        // Update state
                        setViewState({
                            center: location,
                            zoom: 19
                        });

                        // Add marker to map
                        const marker = new Feature({ geometry: new Point(location) });
                        markerLayer.current.getSource().clear();
                        markerLayer.current.getSource().addFeature(marker);

                        // Manually update the view without animation
                        newView.setCenter(location);
                        newView.setZoom(19);

                        // Force update and render the map
                        map.current.updateSize();
                        map.current.renderSync();

                        console.log('New view set:', newView);
                    }
                })
                .catch(error => {
                    console.error('Error during Nominatim search:', error);
                });
        };

        return () => {
            if (map.current) {
                map.current.setTarget(null);
            }
        };
    }, [mapRef, onSearch]);

    useEffect(() => {
        if (map.current) {
            // Log view after update
            const logView = (view) => {
                if (view) {
                    const center = view.getCenter();
                    const zoom = view.getZoom();
                    console.log('Current View:', { center, zoom });
                }
            };

            logView(map.current.getView());
        }
    }, [viewState]);

    useEffect(() => {
        if (map.current) {
            console.log('Updating map size...');
            map.current.updateSize();
        }
    }, [viewState.center, viewState.zoom]);

    return map.current; // Return map instance if needed
}
