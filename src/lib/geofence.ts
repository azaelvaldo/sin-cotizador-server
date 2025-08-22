import * as turf from '@turf/turf';

// Define GeoJSON types
interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

interface GeoJSONFeature {
  type: 'Feature';
  properties?: Record<string, any>;
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon;
}

export interface GeofenceValidationResult {
  isValid: boolean;
  errors: string[];
  calculatedArea?: number; // in hectares
}

export interface GeofenceAreaConstraints {
  minHectares?: number;
  maxHectares?: number;
}

/**
 * Validate geofence and calculate area
 * @param geofence - GeoJSON Feature with Polygon or MultiPolygon geometry
 * @param constraints - Optional area constraints (default: 1-1000 hectares)
 * @returns Validation result with calculated area and any errors
 */
export function validateGeofence(
  geofence: GeoJSONFeature,
  constraints: GeofenceAreaConstraints = {}
): GeofenceValidationResult {
  const { minHectares = 1, maxHectares = 1000 } = constraints;
  const errors: string[] = [];

  try {
    // Validate GeoJSON Feature structure
    if (!geofence || !geofence.type || !geofence.geometry) {
      errors.push('Estructura de geocerca inválida: debe ser un GeoJSON Feature');
      return { isValid: false, errors };
    }

    if (geofence.type !== 'Feature') {
      errors.push('La geocerca debe ser un GeoJSON Feature');
      return { isValid: false, errors };
    }

    const geometry = geofence.geometry;

    if (!geometry || !geometry.type || !geometry.coordinates) {
      errors.push('Estructura de geometría inválida en el GeoJSON Feature');
      return { isValid: false, errors };
    }

    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
      errors.push('La geometría debe ser un Polígono o MultiPolígono');
      return { isValid: false, errors };
    }

    // Create Turf polygon for area calculation
    let polygon: any;

    if (geometry.type === 'Polygon') {
      polygon = turf.polygon(geometry.coordinates);
    } else {
      polygon = turf.multiPolygon(geometry.coordinates);
    }

    // Validate polygon geometry
    if (!turf.booleanValid(polygon)) {
      errors.push('Geometría de polígono inválida');
      return { isValid: false, errors };
    }

    // Calculate area in square meters
    const areaInSquareMeters = turf.area(polygon);

    // Convert to hectares (1 hectare = 10,000 square meters)
    const areaInHectares = areaInSquareMeters / 10000;

    // Validate area constraints
    if (areaInHectares < minHectares) {
      errors.push(
        `El área de la geocerca (${areaInHectares.toFixed(2)} ha) debe ser al menos ${minHectares} hectárea${minHectares > 1 ? 's' : ''}`
      );
      return { isValid: false, errors, calculatedArea: areaInHectares };
    }

    if (areaInHectares > maxHectares) {
      errors.push(
        `El área de la geocerca (${areaInHectares.toFixed(2)} ha) no puede exceder ${maxHectares} hectáreas`
      );
      return { isValid: false, errors, calculatedArea: areaInHectares };
    }

    return {
      isValid: true,
      errors: [],
      calculatedArea: areaInHectares,
    };
  } catch (error) {
    errors.push(
      `Error de validación de geocerca: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
    return { isValid: false, errors };
  }
}

/**
 * Calculate area of geofence without validation
 * @param geofence - GeoJSON Feature with Polygon or MultiPolygon geometry
 * @returns Area in hectares
 */
export function calculateGeofenceArea(geofence: GeoJSONFeature): number {
  try {
    const geometry = geofence.geometry;
    let polygon: any;

    if (geometry.type === 'Polygon') {
      polygon = turf.polygon(geometry.coordinates);
    } else {
      polygon = turf.multiPolygon(geometry.coordinates);
    }

    const areaInSquareMeters = turf.area(polygon);
    return areaInSquareMeters / 10000; // Convert to hectares
  } catch (error) {
    throw new Error(
      `Error al calcular el área de la geocerca: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Check if geofence is valid GeoJSON Feature structure
 * @param geofence - Any object to validate
 * @returns True if valid GeoJSON Feature with Polygon or MultiPolygon geometry
 */
export function isValidGeofenceStructure(geofence: any): boolean {
  return (
    geofence &&
    typeof geofence === 'object' &&
    geofence.type === 'Feature' &&
    geofence.geometry &&
    (geofence.geometry.type === 'Polygon' || geofence.geometry.type === 'MultiPolygon') &&
    Array.isArray(geofence.geometry.coordinates) &&
    geofence.geometry.coordinates.length > 0
  );
}
