import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';
import { excXml, getTs, generateId, generateGpx, generateGeoJson } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const gpsPill = document.getElementById('gpsPill'), gpsLabel = document.getElementById('gpsLabel'), registerBtn = document.getElementById('registerBtn');
    const ptList = document.getElementById('ptList'), ptCount = document.getElementById('ptCount'), exportBtn = document.getElementById('exportBtn'), exportMenu = document.getElementById('exportMenu');
    const purgeAllBtn = document.getElementById('purgeAllBtn');
    const confirmModal = document.getElementById('confirmModal'), confirmMsg = document.getElementById('confirmMsg'), confirmOk = document.getElementById('confirmOk'), confirmCancel = document.getElementById('confirmCancel');
    const doGpx = document.getElementById('doGpx'), doGeojson = document.getElementById('doGeojson'), toasts = document.getElementById('toasts');
    const sheet = document.getElementById('sheet'), sheetHandle = document.getElementById('sheetHandle'), scrim = document.getElementById('scrim');
    const helpBtn = document.getElementById('helpBtn'), helpModal = document.getElementById('helpModal'), helpClose = document.getElementById('helpClose');
    const locateBtn = document.getElementById('locateBtn'), zoomIn = document.getElementById('zoomIn'), zoomOut = document.getElementById('zoomOut');
    const layerBtn = document.getElementById('layerBtn'), layerIcon = document.getElementById('layerIcon');
    const nameDialogBg = document.getElementById('nameDialogBg'), ndInput = document.getElementById('ndInput'), ndSkip = document.getElementById('ndSkip'), ndSave = document.getElementById('ndSave');
    const modePt = document.getElementById('modePt'), modePoly = document.getElementById('modePoly'), polyBar = document.getElementById('polyBar'), polyUndo = document.getElementById('polyUndo'), polyFinish = document.getElementById('polyFinish'), polyCancel = document.getElementById('polyCancel');
    const cookieBanner = document.getElementById('cookieBanner'), cbAccept = document.getElementById('cbAccept');

    let map, tileLayer, locMarker, currentCoords = null, items = [], counter = 1, sheetOpen = false, expOpen = false, pendingPoint = null, collectionMode = 'point', polyPoints = [], activePolyLine = null, activePolyArea = null, vertexMarkers = [];

    const TILE_ORDER = ['colour', 'sat', 'dark'];
    const TILES = {
        colour: { 
            url: import.meta.env.VITE_TILE_COLOUR || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', 
            attr: import.meta.env.VITE_TILE_COLOUR_ATTR || '&copy; CARTO', 
            icon: 'fa-layer-group', label: 'STREET' 
        },
        sat: { 
            url: import.meta.env.VITE_TILE_SAT || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
            attr: import.meta.env.VITE_TILE_SAT_ATTR || 'Esri', 
            icon: 'fa-satellite', label: 'SATELLITE' 
        },
        dark: { 
            url: import.meta.env.VITE_TILE_DARK || 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', 
            attr: import.meta.env.VITE_TILE_DARK_ATTR || '&copy; CARTO', 
            icon: 'fa-moon', label: 'DARK' 
        }
    };
    let activeTile = 'colour';
    const DB_KEY = 'field_collector_data';

    function saveItems() {
        localStorage.setItem(DB_KEY, JSON.stringify({
            items: items.map(p => {
                const { marker, ...rest } = p;
                return rest;
            }),
            counter
        }));
    }

    function loadItems() {
        const data = localStorage.getItem(DB_KEY);
        if (data && map) {
            try {
                const parsed = JSON.parse(data);
                counter = parsed.counter || 1;
                parsed.items.forEach(p => {
                    let marker;
                    if (p.type === 'poly') {
                        marker = L.polygon(p.path, { className:'poly-shape' }).addTo(map).bindPopup(`<strong>${p.name}</strong><br><button class="popup-del" data-id="${p.id}">DELETE</button>`);
                    } else {
                        const icon = L.divIcon({ className:'', html:'<div class="pin"></div>', iconSize:[20,20], iconAnchor:[10,20] });
                        marker = L.marker([p.lat, p.lon], { icon }).addTo(map).bindPopup(`<strong>${p.name}</strong><br><button class="popup-del" data-id="${p.id}">DELETE</button>`);
                    }
                    items.push({ ...p, marker });
                });
                renderList();
            } catch (e) { console.error('DB_LOAD_FAIL', e); }
        }
    }



    function toast(msg, type = 'info') {
        const el = document.createElement('div'); el.className = `toast t-${type}`;
        el.innerHTML = `<span>${msg}</span><i class="fas fa-xmark t-close"></i>`;
        el.querySelector('.t-close').onclick = () => el.remove();
        toasts.appendChild(el); setTimeout(() => { if(el.parentNode){ el.classList.add('out'); el.addEventListener('animationend', () => el.remove()); } }, 4000);
    }

    let confirmCallback = null;
    function showConfirm(msg, onOk) {
        confirmMsg.textContent = msg;
        confirmCallback = onOk;
        confirmModal.classList.add('on');
    }
    confirmOk.onclick = () => { confirmModal.classList.remove('on'); if (confirmCallback) { confirmCallback(); confirmCallback = null; } };
    confirmCancel.onclick = () => { confirmModal.classList.remove('on'); confirmCallback = null; };

    function setSheet(open) { sheetOpen = open; sheet.classList.toggle('open', open); scrim.classList.toggle('on', open); }
    sheetHandle.addEventListener('click', () => setSheet(!sheetOpen)); scrim.addEventListener('click', () => setSheet(false));

    function setMode(m) {
        if (polyPoints.length > 0 && m === 'point' && !confirm('Discard active drawing?')) return;
        collectionMode = m; modePt.classList.toggle('on', m === 'point'); modePoly.classList.toggle('on', m === 'poly');
        polyBar.classList.toggle('active', m === 'poly'); if (m === 'point') cancelPoly();
        toast(`MODE: ${m.toUpperCase()}`);
    }
    modePt.addEventListener('click', () => setMode('point')); modePoly.addEventListener('click', () => setMode('poly'));

    function updatePolyDraw() {
        if (activePolyLine) map.removeLayer(activePolyLine); if (activePolyArea) map.removeLayer(activePolyArea);
        if (polyPoints.length > 1) activePolyLine = L.polyline(polyPoints, { className: 'active-line' }).addTo(map);
        if (polyPoints.length > 2) activePolyArea = L.polygon(polyPoints, { className: 'poly-shape', fillOpacity: 0.1 }).addTo(map);
        polyFinish.disabled = polyPoints.length < 3;
    }
    function clearPolyMarkers() { vertexMarkers.forEach(m => map.removeLayer(m)); vertexMarkers = []; }
    function addVertexMarker(ll) {
        const dot = L.divIcon({ className: 'vertex-dot', iconSize: [8, 8], iconAnchor: [4, 4] });
        const m = L.marker(ll, { icon: dot, interactive: false }).addTo(map);
        vertexMarkers.push(m);
    }
    function cancelPoly() { polyPoints = []; if (activePolyLine) map.removeLayer(activePolyLine); if (activePolyArea) map.removeLayer(activePolyArea); activePolyLine = activePolyArea = null; polyFinish.disabled = true; clearPolyMarkers(); }
    polyUndo.addEventListener('click', () => { 
        polyPoints.pop(); 
        const m = vertexMarkers.pop(); if(m) map.removeLayer(m);
        updatePolyDraw(); 
    });
    polyCancel.addEventListener('click', () => cancelPoly());
    polyFinish.addEventListener('click', () => showNameDialog(0,0,'POLY'));

    // Keep name dialog above the software keyboard on mobile
    if (window.visualViewport) {
        const shiftDialogAboveKeyboard = () => {
            if (!nameDialogBg.classList.contains('on')) return;
            const vv = window.visualViewport;
            const keyboardH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
            nameDialogBg.style.paddingBottom = keyboardH > 50 ? keyboardH + 'px' : '';
        };
        window.visualViewport.addEventListener('resize', shiftDialogAboveKeyboard);
        window.visualViewport.addEventListener('scroll', shiftDialogAboveKeyboard);
    }

    function showNameDialog(lat, lon, src) {
        pendingPoint = { lat, lon, src };
        ndInput.value = `${collectionMode === 'poly'?'BOUND':'TRK'}-${String(counter).padStart(3,'0')}`;
        nameDialogBg.classList.add('on'); setTimeout(() => ndInput.focus(), 100);
    }
    function commitEntry() {
        if (!pendingPoint) return;
        const name = ndInput.value.trim() || ndInput.value;
        nameDialogBg.classList.remove('on');
        nameDialogBg.style.paddingBottom = '';
        if (collectionMode === 'poly') addPolygon(name); else addPoint(pendingPoint.lat, pendingPoint.lon, name);
        pendingPoint = null;
    }
    ndSave.addEventListener('click', commitEntry); ndSkip.addEventListener('click', commitEntry);
    ndInput.onkeydown = e => { if (e.key==='Enter') commitEntry(); };

    function initMap(lat, lon) {
        map = L.map('map', { zoomControl: false }).setView([lat, lon], 18);
        tileLayer = L.tileLayer(TILES[activeTile].url, { maxZoom: 20, attribution: TILES[activeTile].attr }).addTo(map);
        const locIcon = L.divIcon({ className: '', html: '<div style="position:relative;width:20px;height:20px"><div class="loc-ring"></div><div class="loc-dot"></div></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
        locMarker = L.marker([lat, lon], { icon: locIcon, zIndexOffset: 1000 }).addTo(map);
        registerBtn.disabled = false;
        map.on('click', e => { 
            if (collectionMode==='point') showNameDialog(e.latlng.lat, e.latlng.lng, 'MAP'); 
            else { polyPoints.push(e.latlng); addVertexMarker(e.latlng); updatePolyDraw(); } 
        });
        zoomIn.onclick = () => map.zoomIn(); zoomOut.onclick = () => map.zoomOut();
        locateBtn.onclick = () => { if (currentCoords) map.flyTo([currentCoords.latitude, currentCoords.longitude], 18); };
        map.getContainer().addEventListener('click', e => {
            const btn = e.target.closest('.popup-del');
            if (btn) {
                const id = btn.dataset.id, idx = items.findIndex(p => p.id === id);
                if (idx !== -1) { showConfirm(`DELETE "${items[idx].name}"?`, () => { map.removeLayer(items[idx].marker); items.splice(idx, 1); renderList(); saveItems(); toast('PURGED'); }); }
            }
        });
        loadItems();
    }

    layerBtn.onclick = () => {
        activeTile = TILE_ORDER[(TILE_ORDER.indexOf(activeTile)+1)%3];
        map.removeLayer(tileLayer); tileLayer = L.tileLayer(TILES[activeTile].url).addTo(map).bringToBack();
        layerIcon.className = `fas ${TILES[activeTile].icon}`;
    };

    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(pos => {
            currentCoords = pos.coords; gpsPill.classList.add('locked'); gpsLabel.textContent = `ACC: ±${pos.coords.accuracy.toFixed(0)}M`;
            if (!map) initMap(pos.coords.latitude, pos.coords.longitude); else locMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
        }, () => { if (!map) initMap(51.5, -0.1); }, { enableHighAccuracy: true });
    } else { initMap(51.5, -0.1); }

    registerBtn.onclick = () => { if (currentCoords) showNameDialog(currentCoords.latitude, currentCoords.longitude, 'HW'); };

    function addPoint(lat, lon, name) {
        const id = generateId();
        const icon = L.divIcon({ className:'', html:'<div class="pin"></div>', iconSize:[20,20], iconAnchor:[10,20] });
        const marker = L.marker([lat, lon], { icon }).addTo(map).bindPopup(`<strong>${name}</strong><br><button class="popup-del" data-id="${id}">DELETE</button>`);
        items.push({ id, type: 'point', name, lat, lon, time: new Date().toISOString(), marker });
        counter++; renderList(); saveItems(); toast('COMMITTED');
    }
    function addPolygon(name) {
        const id = generateId();
        const marker = L.polygon(polyPoints.map(p=>[p.lat,p.lng]), { className:'poly-shape' }).addTo(map).bindPopup(`<strong>${name}</strong><br><button class="popup-del" data-id="${id}">DELETE</button>`);
        const c = marker.getBounds().getCenter();
        items.push({ id, type: 'poly', name, path: polyPoints.map(p=>[p.lat,p.lng]), lat: c.lat, lon: c.lng, time: new Date().toISOString(), marker });
        counter++; cancelPoly(); renderList(); saveItems(); toast('COMMITTED');
    }

    purgeAllBtn.onclick = () => {
        showConfirm(`PURGE ALL ${items.length} RECORD(S)? THIS CANNOT BE UNDONE.`, () => {
            items.forEach(p => map.removeLayer(p.marker));
            items = []; counter = 1; localStorage.removeItem(DB_KEY); renderList(); toast('DATABASE CLEARED', 'info');
        });
    };

    function renderList() {
        ptCount.textContent = items.length; exportBtn.disabled = items.length === 0; purgeAllBtn.disabled = items.length === 0;
        ptList.innerHTML = items.length ? '' : '<div class="empty">NO_DATA</div>';
        items.slice().reverse().forEach((p, i) => {
            const el = document.createElement('div'); el.className = 'pt-card';
            el.innerHTML = `<div class="pt-icon"><i class="fas ${p.type==='poly'?'fa-draw-polygon':'fa-microchip'}"></i></div><div class="pt-info"><div><span class="type-badge">${p.type==='poly'?'PLY':'PNT'}</span><strong>${p.name}</strong></div><div class="pt-meta">${p.lat.toFixed(4)}N // ${new Date(p.time).toLocaleTimeString()}</div></div><div class="pt-actions"><button class="pt-show" data-id="${p.id}"><i class="fas fa-crosshairs"></i></button><button class="pt-del" data-id="${p.id}"><i class="fas fa-trash"></i></button></div>`;
            ptList.appendChild(el);
        });
    }

    ptList.onclick = e => {
        const id = e.target.closest('[data-id]')?.dataset.id; if (!id) return;
        const item = items.find(p => p.id === id);
        if (e.target.closest('.pt-show')) { setSheet(false); map.flyTo([item.lat, item.lon], 18); item.marker.openPopup(); }
        if (e.target.closest('.pt-del')) { showConfirm(`DELETE "${item.name}"?`, () => { map.removeLayer(item.marker); items.splice(items.indexOf(item), 1); renderList(); toast('PURGED'); }); }
    };

    exportBtn.onclick = e => { e.stopPropagation(); expOpen = !expOpen; exportMenu.style.display = expOpen ? 'block' : 'none'; };
    document.onclick = () => { exportMenu.style.display = 'none'; expOpen = false; };
    
    function dlFile(name, content, mime) {
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(new Blob([content], { type: mime })),
            download: name
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    doGpx.onclick = () => {
        const gpx = generateGpx(items);
        dlFile(`survey_${getTs()}.gpx`, gpx, 'application/gpx+xml');
        toast('GPX_EXPORT_COMPLETE', 'success');
    };
    doGeojson.onclick = () => {
        const gj = generateGeoJson(items);
        dlFile(`survey_${getTs()}.geojson`, JSON.stringify(gj), 'application/geo+json');
        toast('GEOJSON_EXPORT_COMPLETE', 'success');
    };

    helpBtn.onclick = () => helpModal.classList.add('on');
    helpClose.onclick = () => helpModal.classList.remove('on');

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .catch(err => console.error('SERVICE_WORKER_OFFLINE', err));
        });
    }

    // PRIVACY BANNER LOGIC
    if (!localStorage.getItem('field_collector_consent')) {
        cookieBanner.style.display = 'block';
    }
    cbAccept.onclick = () => {
        localStorage.setItem('field_collector_consent', 'true');
        cookieBanner.style.display = 'none';
    };
});
