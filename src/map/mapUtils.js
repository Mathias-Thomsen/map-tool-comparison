
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';


// Eksempel på at indlæse og oprette funktioner fra GeoJSON data
const fetchGeoJSON = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return new GeoJSON().readFeatures(data, {
    featureProjection: 'EPSG:3857'
  });
};

// Definere style for VectorLayer og Overlay
const vectorStyle = new Style({
  fill: new Fill({
    color: 'rgba(0, 0, 0, 0)' // Ingen fyld
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 1)', // Sort kant
    width: 1
  })
});

const overlayStyle = new Style({
  fill: new Fill({
    color: '#f4f4f4' // Halvgennemsigtig grå farve
  })
});

export async function loadMapConfig() {
  const features = await fetchGeoJSON(`${process.env.PUBLIC_URL}/map1.geojson`);

  const vectorSource = new VectorSource({
    features: features
  });

  const worldWithHole = new Polygon([ // Verden med et hul for den relevante region
    [
      [-20026376.39, -20048966.10],
      [-20026376.39, 20048966.10],
      [20026376.39, 20048966.10],
      [20026376.39, -20048966.10],
      [-20026376.39, -20048966.10]
    ],
    ...features[0].getGeometry().getCoordinates() // Tilføj koordinater som hul
  ]);

  const overlaySource = new VectorSource({
    features: [new Feature(worldWithHole)]
  });

  return {
    
    vectorSource: new VectorLayer({
      source: vectorSource,
      style: vectorStyle
    }),
    overlay: new VectorLayer({
      source: overlaySource,
      style: overlayStyle,
      updateWhileAnimating: true,
      updateWhileInteracting: true
    }),
    extent: features[0].getGeometry().getExtent(), // Brug udstrækningen af den indlæste GeoJSON data

  };
}
