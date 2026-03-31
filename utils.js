export function excXml(s) {
  return s.replace(/[<>&'"]/g, c => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[c]));
}

export function getTs() {
  return new Date().toISOString().replace(/\D/g, '').slice(0, 12);
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function generateGpx(items) {
  let s = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="FieldCollector" xmlns="http://www.topografix.com/GPX/1/1">`;
  items.forEach(p => {
    const n = excXml(p.name);
    if (p.type === 'poly') {
      s += `<trk><name>${n}</name><trkseg>${p.path.map(c => `<trkpt lat="${c[0]}" lon="${c[1]}"></trkpt>`).join('')}</trkseg></trk>`;
    } else {
      s += `<wpt lat="${p.lat}" lon="${p.lon}"><name>${n}</name></wpt>`;
    }
  });
  s += '</gpx>';
  return s;
}

export function generateGeoJson(items) {
  return {
    type: 'FeatureCollection',
    features: items.map(p => ({
      type: 'Feature',
      geometry: p.type === 'poly'
        ? { type: 'Polygon', coordinates: [p.path.map(c => [c[1], c[0]])] }
        : { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { name: p.name, time: p.time }
    }))
  };
}
