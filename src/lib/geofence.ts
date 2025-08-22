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
 * @param geofence - GeoJSON Polygon or MultiPolygon
 * @param constraints - Optional area constraints (default: 1-1000 hectares)
 * @returns Validation result with calculated area and any errors
 */
export function validateGeofence(
  geofence: GeoJSONPolygon | GeoJSONMultiPolygon,
  constraints: GeofenceAreaConstraints = {}
): GeofenceValidationResult {
  const { minHectares = 1, maxHectares = 1000 } = constraints;
  const errors: string[] = [];

  try {
    // Validate GeoJSON structure
    if (!geofence || !geofence.type || !geofence.coordinates) {
      errors.push('Invalid geofence structure');
      return { isValid: false, errors };
    }

    if (geofence.type !== 'Polygon' && geofence.type !== 'MultiPolygon') {
      errors.push('Geofence must be a Polygon or MultiPolygon');
      return { isValid: false, errors };
    }

    // Create Turf polygon for area calculation
    let polygon: any;

    if (geofence.type === 'Polygon') {
      polygon = turf.polygon(geofence.coordinates);
    } else {
      polygon = turf.multiPolygon(geofence.coordinates);
    }

    // Validate polygon geometry
    if (!turf.booleanValid(polygon)) {
      errors.push('Invalid polygon geometry');
      return { isValid: false, errors };
    }

    // Calculate area in square meters
    const areaInSquareMeters = turf.area(polygon);

    // Convert to hectares (1 hectare = 10,000 square meters)
    const areaInHectares = areaInSquareMeters / 10000;

    // Validate area constraints
    if (areaInHectares < minHectares) {
      errors.push(
        `Geofence area (${areaInHectares.toFixed(2)} ha) must be at least ${minHectares} hectare${minHectares > 1 ? 's' : ''}`
      );
      return { isValid: false, errors, calculatedArea: areaInHectares };
    }

    if (areaInHectares > maxHectares) {
      errors.push(
        `Geofence area (${areaInHectares.toFixed(2)} ha) cannot exceed ${maxHectares} hectares`
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
      `Geofence validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return { isValid: false, errors };
  }
}

/**
 * Calculate area of geofence without validation
 * @param geofence - GeoJSON Polygon or MultiPolygon
 * @returns Area in hectares
 */
export function calculateGeofenceArea(geofence: GeoJSONPolygon | GeoJSONMultiPolygon): number {
  try {
    let polygon: any;

    if (geofence.type === 'Polygon') {
      polygon = turf.polygon(geofence.coordinates);
    } else {
      polygon = turf.multiPolygon(geofence.coordinates);
    }

    const areaInSquareMeters = turf.area(polygon);
    return areaInSquareMeters / 10000; // Convert to hectares
  } catch (error) {
    throw new Error(
      `Failed to calculate geofence area: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if geofence is valid GeoJSON structure
 * @param geofence - Any object to validate
 * @returns True if valid GeoJSON Polygon or MultiPolygon
 */
export function isValidGeofenceStructure(geofence: any): boolean {
  return (
    geofence &&
    typeof geofence === 'object' &&
    (geofence.type === 'Polygon' || geofence.type === 'MultiPolygon') &&
    Array.isArray(geofence.coordinates) &&
    geofence.coordinates.length > 0
  );
}
