import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';


function FullScreenMap() {
  const mapRef = useRef();

  useEffect(() => {
    // Fetch GeoJSON data from public folder
    fetch(`${process.env.PUBLIC_URL}/map1.geojson`)
      .then(response => response.json())
      .then(data => {
        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857'
          })
        });

        const features = new GeoJSON().readFeatures(data, {
          featureProjection: 'EPSG:3857'
        });

        const denmarkCoordinates = features[0].getGeometry().getCoordinates();

        // Create the world polygon with a hole for Denmark
        const worldWithHole = new Polygon([
          [
            [-20026376.39, -20048966.10],
            [-20026376.39, 20048966.10],
            [20026376.39, 20048966.10],
            [20026376.39, -20048966.10],
            [-20026376.39, -20048966.10]
          ],
          ...denmarkCoordinates // Add the coordinates of Denmark as a hole
        ]);


        // Koordinater for den definerede region
        const boundaryCoordinates = [
            [ 7.253606273412174,  57.906398730798344],
            [16.396100544470414, 57.84848123888355],
            [16.428945389291755, 54.542134314272346],
            [16.462166383859824, 54.18121714494936],
            [7.010015299571847,   54.13211179650412],
            [7.069408882275297, 57.904143054440226],
            [7.228490480090102, 57.91303574736165]
            
          ].map(coord => fromLonLat(coord));
  
          const polygon = new Polygon([boundaryCoordinates]);
          const extent = polygon.getExtent();

        // Set initial center and zoom
        const initialCenter = [1182564.7940925972, 7599552.305414335];
        const initialZoom = 7.627584922759944;

        // Define the extent (bounding box) to limit the view to a specific area
        

        // Create the map with the OSM layer and the Denmark vector layer
        const map = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM()
            }),
            new VectorLayer({
              source: vectorSource,
              style: new Style({
                fill: new Fill({
                  color: 'rgba(0, 0, 0, 0)' // Ingen fyld i området
                }),
                stroke: new Stroke({
                  color: 'rgba(0, 0, 0, 1)', // Sort kant
                  width: 1
                })
              })
            })
          ],
          view: new View({
            center: initialCenter,
            zoom: initialZoom,
            minZoom: initialZoom, // Prevent zooming out
            extent: extent, // Restrict panning
            constrainOnlyCenter: true,
            enableRotation: false // Disable map rotation
          }),
          controls: []
        });

        // Add event listener to log center and zoom level
        map.on('moveend', () => {
          const view = map.getView();
          const center = view.getCenter();
          const zoom = view.getZoom();
          console.log('Center:', center, 'Zoom:', zoom);
        });

        // Add a global overlay that makes the rest of the map gray
        const overlay = new VectorLayer({
          source: new VectorSource({
            features: [new Feature(worldWithHole)]
          }),
          style: new Style({
            fill: new Fill({
              color: 'rgba(0, 0, 0, 0.5)' // Grå farve uden gennemsigtighed
            })
          }),
          updateWhileAnimating: true, // Ensure overlay stays during animations
          updateWhileInteracting: true // Ensure overlay stays during interactions
        });

        map.addLayer(overlay);

        return () => map.setTarget(undefined);
      })
      .catch(error => {
        console.error('Error fetching GeoJSON data:', error);
      });
  }, []);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}

export default FullScreenMap;
