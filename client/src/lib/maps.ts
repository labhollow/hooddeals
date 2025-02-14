import { Loader } from '@googlemaps/js-api-loader';
import type { Feature, Point, Polygon } from 'geojson';

let mapsLoader: Loader;
let loadPromise: Promise<void>;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (!loadPromise) {
    mapsLoader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "drawing"],
    });
    loadPromise = mapsLoader.load();
  }
  return loadPromise;
}

export function createGeoJSONCircle(center: [number, number], radiusInKm: number): Feature<Polygon> {
  const points = 64;
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };

  const km = radiusInKm;
  const ret: number[][] = [];
  const distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
  const distanceY = km/110.574;

  let theta, x, y;
  for(let i=0; i<points; i++) {
    theta = (i/points)*(2*Math.PI);
    x = distanceX*Math.cos(theta);
    y = distanceY*Math.sin(theta);
    ret.push([coords.longitude+x, coords.latitude+y]);
  }
  ret.push(ret[0]);

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [ret]
    }
  };
}

export function createGeoJSONPoint(coordinates: [number, number]): Feature<Point> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates
    }
  };
}