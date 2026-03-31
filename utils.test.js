import { describe, it, expect } from 'vitest';
import { excXml, getTs, generateGpx, generateGeoJson } from './utils.js';

describe('Utility Functions', () => {
  it('should escape XML special characters correctly', () => {
    expect(excXml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&apos;');
  });

  it('should generate a valid timestamp format', () => {
    const ts = getTs();
    expect(ts).toMatch(/^\d{12}$/);
  });

  it('should generate correct GPX format for points', () => {
    const items = [{ type: 'point', name: 'Test Point', lat: 51.5, lon: -0.1 }];
    const gpx = generateGpx(items);
    expect(gpx).toContain('<wpt lat="51.5" lon="-0.1">');
    expect(gpx).toContain('<name>Test Point</name>');
    expect(gpx).toContain('</gpx>');
  });

  it('should generate correct GPX format for polygons', () => {
    const items = [
      { 
        type: 'poly', 
        name: 'Test Poly', 
        path: [[51.5, -0.1], [51.6, -0.1], [51.6, 0]] 
      }
    ];
    const gpx = generateGpx(items);
    expect(gpx).toContain('<trk><name>Test Poly</name><trkseg>');
    expect(gpx).toContain('<trkpt lat="51.5" lon="-0.1"></trkpt>');
  });

  it('should generate correct GeoJSON structure', () => {
    const items = [{ type: 'point', name: 'Test Point', lat: 51.5, lon: -0.1, time: '2023-01-01T00:00:00Z' }];
    const gj = generateGeoJson(items);
    expect(gj.type).toBe('FeatureCollection');
    expect(gj.features[0].geometry.type).toBe('Point');
    expect(gj.features[0].geometry.coordinates).toEqual([-0.1, 51.5]);
    expect(gj.features[0].properties.name).toBe('Test Point');
  });
});
