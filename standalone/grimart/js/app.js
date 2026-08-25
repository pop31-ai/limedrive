const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');

const sadnessSlider = document.getElementById('sadness');
const intensitySlider = document.getElementById('intensity');
const tearSlider = document.getElementById('tear-amount');
const brushSlider = document.getElementById('brush-size');
const grimTypeSelect = document.getElementById('grim-type');
const resolutionSelect = document.getElementById('resolution');
const backgroundTypeSelect = document.getElementById('background-type');
const compositionTypeSelect = document.getElementById('composition-type');

sadnessSlider.addEventListener('input', () => {
    document.getElementById('sadness-val').textContent = sadnessSlider.value;
});
intensitySlider.addEventListener('input', () => {
    document.getElementById('intensity-val').textContent = intensitySlider.value;
});
tearSlider.addEventListener('input', () => {
    document.getElementById('tear-val').textContent = tearSlider.value;
});
brushSlider.addEventListener('input', () => {
    document.getElementById('brush-val').textContent = brushSlider.value;
});

document.getElementById('generate-btn').addEventListener('click', generate);
document.getElementById('random-btn').addEventListener('click', randomGenerate);
document.getElementById('export-png').addEventListener('click', exportPNG);
document.getElementById('export-svg').addEventListener('click', exportSVG);
document.getElementById('export-json').addEventListener('click', exportJSON);

function randomGenerate() {
    grimTypeSelect.value = ['pierrot', 'clown_sad', 'theater', 'melancholy', 'despair'][Math.floor(Math.random() * 5)];
    sadnessSlider.value = (Math.random() * 0.8 + 0.2).toFixed(2);
    intensitySlider.value = (Math.random() * 0.8 + 0.2).toFixed(2);
    tearSlider.value = Math.floor(Math.random() * 5);
    brushSlider.value = (Math.random() * 4 + 0.5).toFixed(1);
    sadnessSlider.dispatchEvent(new Event('input'));
    intensitySlider.dispatchEvent(new Event('input'));
    tearSlider.dispatchEvent(new Event('input'));
    brushSlider.dispatchEvent(new Event('input'));
    generate();
}

function generate() {
    loading.style.display = 'block';
    setTimeout(() => {
        const compositionType = compositionTypeSelect.value;
        const params = {
            grim_type: grimTypeSelect.value,
            sadness: parseFloat(sadnessSlider.value),
            intensity: parseFloat(intensitySlider.value),
            tear_amount: parseInt(tearSlider.value),
            brush_size: parseFloat(brushSlider.value),
            resolution: parseInt(resolutionSelect.value),
            background_type: backgroundTypeSelect.value,
            composition_type: compositionType
        };
        const strokes = generateGrimOnCanvas(params);
        renderStrokes(strokes, params.resolution, params.background_type);
        loading.style.display = 'none';
    }, 50);
}

function generateGrimOnCanvas(params) {
    const compositionType = params.composition_type || 'volga_river';
    const sceneTypes = ['engineering_drawing', 'technical_draft', 'annotation_scene'];
    if (sceneTypes.includes(compositionType)) {
        const { SceneComposition } = window.GrimArt;
        const composition = new SceneComposition(params.resolution, params.resolution);
        return composition.compose(params.sadness > 0.5 ? 'expressionist' : 'classical', params.sadness, compositionType);
    }
    const { BrushEngine } = window.GrimArt;
    const engine = new BrushEngine();
    return engine.generate_grim(params.sadness, params.intensity, params.grim_type);
}

function renderStrokes(strokes, resolution, backgroundType) {
    canvas.width = resolution;
    canvas.height = resolution;

    if (backgroundType && backgroundType !== 'none') {
        renderBackground(backgroundType, resolution);
    } else {
        ctx.fillStyle = '#f5f0eb';
        ctx.fillRect(0, 0, resolution, resolution);
    }

    for (const stroke of strokes) {
        const points = stroke.points;
        if (points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(points[0][0] * resolution / 100, points[0][1] * resolution / 100);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0] * resolution / 100, points[i][1] * resolution / 100);
        }
        ctx.strokeStyle = `rgba(${stroke.color[0]}, ${stroke.color[1]}, ${stroke.color[2]}, ${stroke.opacity})`;
        ctx.lineWidth = stroke.width * (resolution / 512);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
}

function renderBackground(bgType, resolution) {
    const bgColors = {
        'rainy_night': { top: [30, 35, 50], mid: [60, 65, 80], bottom: [80, 85, 100] },
        'rainy_window': { top: [80, 85, 100], mid: [100, 105, 115], bottom: [120, 125, 135] },
        'grey_dusk': { top: [100, 105, 115], mid: [110, 115, 125], bottom: [120, 125, 135] }
    };
    const colors = bgColors[bgType] || bgColors['grey_dusk'];
    for (let y = 0; y < resolution; y++) {
        const t = y / resolution;
        let r, g, b;
        if (t < 0.4) {
            r = Math.round(colors.top[0] + (colors.mid[0] - colors.top[0]) * (t / 0.4));
            g = Math.round(colors.top[1] + (colors.mid[1] - colors.top[1]) * (t / 0.4));
            b = Math.round(colors.top[2] + (colors.mid[2] - colors.top[2]) * (t / 0.4));
        } else {
            r = Math.round(colors.mid[0] + (colors.bottom[0] - colors.mid[0]) * ((t - 0.4) / 0.6));
            g = Math.round(colors.mid[1] + (colors.bottom[1] - colors.mid[1]) * ((t - 0.4) / 0.6));
            b = Math.round(colors.mid[2] + (colors.bottom[2] - colors.mid[2]) * ((t - 0.4) / 0.6));
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, y, resolution, 1);
    }

    if (bgType === 'rainy_night' || bgType === 'rainy_window') {
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * resolution;
            const y = Math.random() * resolution;
            const len = 5 + Math.random() * 20;
            const angle = (Math.random() - 0.5) * 10;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.sin(angle) * len, y + Math.cos(angle) * len);
            ctx.strokeStyle = `rgba(180, 200, 240, ${0.1 + Math.random() * 0.2})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    if (bgType === 'rainy_night') {
        const cx = resolution * 0.5;
        const cy = resolution * 0.3;
        const r = 150;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(255, 220, 150, 0.15)');
        grad.addColorStop(1, 'rgba(255, 220, 150, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
}

function exportPNG() {
    const link = document.createElement('a');
    link.download = 'grimart_output.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function exportSVG() {
    const strokes = window.lastStrokes || [];
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">`;
    svg += `<rect width="1024" height="1024" fill="#f5f0eb"/>`;
    for (const stroke of strokes) {
        const points = stroke.points;
        if (points.length < 2) continue;
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0] * 10.24} ${p[1] * 10.24}`).join(' ');
        svg += `<path d="${d}" stroke="rgb(${stroke.color[0]},${stroke.color[1]},${stroke.color[2]})" stroke-opacity="${stroke.opacity}" stroke-width="${stroke.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    svg += `</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'grimart_output.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
}

function exportJSON() {
    const params = {
        grim_type: grimTypeSelect.value,
        sadness: parseFloat(sadnessSlider.value),
        intensity: parseFloat(intensitySlider.value),
        tear_amount: parseInt(tearSlider.value),
        brush_size: parseFloat(brushSlider.value),
        resolution: parseInt(resolutionSelect.value),
        background_type: backgroundTypeSelect.value
    };
    const data = JSON.stringify(params, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'grimart_params.json';
    link.href = URL.createObjectURL(blob);
    link.click();
}