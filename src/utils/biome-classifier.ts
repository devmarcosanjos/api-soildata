interface BiomeFeature {
  type: string;
  properties: {
    name?: string;
    Name?: string;
    Bioma?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface BiomeGeoJSON {
  type: string;
  features: BiomeFeature[];
}

const BIOMES_GEOJSON: BiomeGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Amazônia", Name: "Amazônia" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-73.9, -18.0], [-73.9, 5.3], [-44.0, 5.3], [-44.0, -18.0], [-73.9, -18.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Cerrado", Name: "Cerrado" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-60.0, -24.0], [-60.0, -2.0], [-41.0, -2.0], [-41.0, -24.0], [-60.0, -24.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Mata Atlântica", Name: "Mata Atlântica" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-54.0, -33.8], [-54.0, -5.0], [-34.8, -5.0], [-34.8, -33.8], [-54.0, -33.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Caatinga", Name: "Caatinga" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-48.0, -17.0], [-48.0, -2.8], [-34.8, -2.8], [-34.8, -17.0], [-48.0, -17.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Pampa", Name: "Pampa" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-57.6, -33.8], [-57.6, -28.0], [-49.7, -28.0], [-49.7, -33.8], [-57.6, -33.8]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Pantanal", Name: "Pantanal" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-58.5, -22.0], [-58.5, -15.0], [-55.0, -15.0], [-55.0, -22.0], [-58.5, -22.0]
        ]]
      }
    }
  ]
};

function pointInPolygon(lon: number, lat: number, coordinates: number[][][]): boolean {
  if (!coordinates || coordinates.length === 0) return false;
  
  const polygon = coordinates[0];
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

export function getBiomeFromCoordinates(lon: number, lat: number): string | null {
  for (const feature of BIOMES_GEOJSON.features) {
    if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
      if (pointInPolygon(lon, lat, feature.geometry.coordinates)) {
        return feature.properties.Bioma || feature.properties.name || feature.properties.Name || null;
      }
    }
  }
  return null;
}

export function getAvailableBiomes(): string[] {
  const biomes = new Set<string>();
  for (const feature of BIOMES_GEOJSON.features) {
    const biome = feature.properties.Bioma || feature.properties.name || feature.properties.Name;
    if (biome) {
      biomes.add(biome);
    }
  }
  return Array.from(biomes).sort();
}


