// Database of Monitored School Facilities in Maasin City
const schools = [
    {
        id: 1,
        name: "Manhilo Elementary School (Bldg A)",
        age: 28,
        occupancy: 420,
        type: "Masonry / Concrete",
        typeWeight: 70,
        pga: 0.02,
        freq: 11.5,
        status: "Safe",
        score: 0,
        xBuffer: new Array(60).fill(0.0),
        yBuffer: new Array(60).fill(0.0),
        zBuffer: new Array(60).fill(0.0)
    },
    {
        id: 2,
        name: "Manhilo National High School",
        age: 18,
        occupancy: 650,
        type: "Reinforced Concrete",
        typeWeight: 50,
        pga: 0.02,
        freq: 12.1,
        status: "Safe",
        score: 0,
        xBuffer: new Array(60).fill(0.0),
        yBuffer: new Array(60).fill(0.0),
        zBuffer: new Array(60).fill(0.0)
    },
    {
        id: 3,
        name: "Maasin City Central School",
        age: 36,
        occupancy: 920,
        type: "Timber / Concrete Hybrid",
        typeWeight: 90,
        pga: 0.02,
        freq: 10.8,
        status: "Safe",
        score: 0,
        xBuffer: new Array(60).fill(0.0),
        yBuffer: new Array(60).fill(0.0),
        zBuffer: new Array(60).fill(0.0)
    },
    {
        id: 4,
        name: "Asuncion National High School",
        age: 12,
        occupancy: 310,
        type: "Reinforced Concrete Frame",
        typeWeight: 40,
        pga: 0.02,
        freq: 13.0,
        status: "Safe",
        score: 0,
        xBuffer: new Array(60).fill(0.0),
        yBuffer: new Array(60).fill(0.0),
        zBuffer: new Array(60).fill(0.0)
    }
];

// 1. Weighted Prioritization Algorithm
function computePriorityScore(school) {
    const pgaFactor = Math.min((school.pga / 0.50) * 100, 100) * 0.40;
    const ageFactor = Math.min((school.age / 40) * 100, 100) * 0.25;
    const occFactor = Math.min((school.occupancy / 1000) * 100, 100) * 0.20;
    const typeFactor = school.typeWeight * 0.15;
    return parseFloat((pgaFactor + ageFactor + occFactor + typeFactor).toFixed(1));
}

// 2. ATC-20 Classification
function classifyStatus(pga) {
    if (pga >= 0.25) return "Unsafe";
    if (pga >= 0.08) return "Restricted Use";
    return "Safe";
}

// 3. UI Renderer
function renderUI() {
    const grid = document.getElementById('facilityGrid');
    grid.innerHTML = '';

    schools.forEach(school => {
        school.status = classifyStatus(school.pga);
        school.score = computePriorityScore(school);

        let cardClass = "safe";
        let tagClass = "tag-safe";
        if (school.status === "Restricted Use") { cardClass = "restricted"; tagClass = "tag-restricted"; }
        if (school.status === "Unsafe") { cardClass = "unsafe"; tagClass = "tag-unsafe"; }

        const cardHTML = `
            <div class="card facility-card ${cardClass}" id="facility-card-${school.id}">
                <div class="card-head" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div class="facility-name">${school.name}</div>
                        <div class="facility-meta">Age: ${school.age} yrs • Occupancy: ${school.occupancy} • ${school.type}</div>
                    </div>
                    <span class="status-tag ${tagClass}">${school.status}</span>
                </div>

                <div class="metrics-row">
                    <div>
                        <div class="metric-label">Peak Accel</div>
                        <div class="metric-val">${school.pga.toFixed(2)} g</div>
                    </div>
                    <div>
                        <div class="metric-label">Dom. Freq</div>
                        <div class="metric-val">${school.freq.toFixed(1)} Hz</div>
                    </div>
                    <div>
                        <div class="metric-label">Score</div>
                        <div class="metric-val text-primary">${school.score} pts</div>
                    </div>
                </div>

                <div class="canvas-box">
                    <canvas id="canvas-${school.id}"></canvas>
                </div>

                <div class="slider-box">
                    <div class="slider-label">
                        <span>Simulation Override:</span>
                        <strong class="text-primary">${school.pga.toFixed(2)} g</strong>
                    </div>
                    <input type="range" min="0.01" max="0.50" step="0.01" value="${school.pga}" 
                           oninput="updateFacilityPGA(${school.id}, this.value)">
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    renderTable();
}

// 4. Render Table
function renderTable() {
    const sorted = [...schools].sort((a, b) => b.score - a.score);
    const tbody = document.getElementById('priorityTableBody');
    tbody.innerHTML = '';

    sorted.forEach((school, index) => {
        let tagClass = "tag-safe";
        if (school.status === "Restricted Use") tagClass = "tag-restricted";
        if (school.status === "Unsafe") tagClass = "tag-unsafe";

        const isTopAlert = index === 0 && school.pga >= 0.08;
        const scorePercent = Math.min((school.score / 100) * 100, 100);

        const rowHTML = `
            <tr class="clickable-row ${isTopAlert ? 'rank-top' : ''}" onclick="scrollToFacilityGraph(${school.id})">
                <td style="font-weight: 600;">#${index + 1}</td>
                <td style="color:#e6edef; font-weight:600;">${school.name}</td>
                <td style="font-family:monospace;">${school.pga.toFixed(2)} g</td>
                <td style="font-family:monospace;">${school.freq.toFixed(1)} Hz</td>
                <td>${school.age} yrs</td>
                <td>${school.occupancy}</td>
                <td><span class="status-tag ${tagClass}">${school.status}</span></td>
                <td>
                    <div class="score-badge-container">
                        <span style="font-weight:600; min-width: 40px;">${school.score}</span>
                        <div class="score-bar-bg">
                            <div class="score-bar-fill" style="width: ${scorePercent}%;"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHTML;
    });
}

// 5. Scroll and Pulse function
window.scrollToFacilityGraph = function(schoolId) {
    const card = document.getElementById(`facility-card-${schoolId}`);
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    card.classList.remove('card-pulse');
    void card.offsetWidth; // Force CSS reflow
    card.classList.add('card-pulse');

    const school = schools.find(s => s.id === schoolId);
    if (school) {
        addLogEntry(`Navigated to waveform graph for [${school.name}].`, "SYS");
    }
};

// 6. Interactive Controls
function updateFacilityPGA(schoolId, value) {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    const oldStatus = school.status;
    school.pga = parseFloat(value);
    school.freq = parseFloat((12.0 - (school.pga * 10)).toFixed(1));

    renderUI();

    const newStatus = classifyStatus(school.pga);
    if (oldStatus !== newStatus && newStatus === "Unsafe") {
        addLogEntry(`CRITICAL: [${school.name}] Unsafe threshold exceeded. SMS sent.`, "SMS");
    } else if (oldStatus !== newStatus && newStatus === "Restricted Use") {
        addLogEntry(`WARNING: [${school.name}] Restricted use threshold crossed.`, "WEB");
    }
}

function triggerPreset(type) {
    schools.forEach(school => {
        if (type === 'ambient') {
            school.pga = parseFloat((Math.random() * 0.02 + 0.01).toFixed(2));
        } else if (type === 'moderate') {
            school.pga = parseFloat((Math.random() * 0.08 + 0.12).toFixed(2));
        } else if (type === 'severe') {
            const severity = school.typeWeight > 60 ? 0.42 : 0.32;
            school.pga = parseFloat((severity + (Math.random() * 0.05)).toFixed(2));
        }
        school.freq = parseFloat((12.0 - (school.pga * 10)).toFixed(1));
    });

    renderUI();

    if (type === 'ambient') addLogEntry("All sensor nodes normalized to ambient.", "SYS");
    if (type === 'moderate') addLogEntry("Moderate earthquake simulated.", "WEB");
    if (type === 'severe') addLogEntry("SEVERE EARTHQUAKE SIMULATED! SMS alerts sent.", "SMS");
}

// 7. Graph Engine
function animateWaveforms() {
    schools.forEach(school => {
        const pga = school.pga;
        const timeFactor = Date.now() * 0.015;
        const mainOscillation = Math.sin(timeFactor * (school.freq / 4));

        // X Axis (Lateral)
        const noiseX = (pga * mainOscillation * 1.4) + ((Math.random() - 0.5) * pga * 0.6);
        // Y Axis (Longitudinal)
        const noiseY = (pga * Math.cos(timeFactor * (school.freq / 4)) * 1.4) + ((Math.random() - 0.5) * pga * 0.6);
        // Z Axis (Vertical)
        const noiseZ = (pga * Math.sin(timeFactor * (school.freq / 3)) * 1.2) + ((Math.random() - 0.5) * pga * 0.5);

        school.xBuffer.push(noiseX); school.xBuffer.shift();
        school.yBuffer.push(noiseY); school.yBuffer.shift();
        school.zBuffer.push(noiseZ); school.zBuffer.shift();

        const canvas = document.getElementById(`canvas-${school.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.parentElement.clientWidth;
        const h = canvas.height = canvas.parentElement.clientHeight;

        const maxG = 0.35;
        const leftMargin = 50;
        const rightMargin = 15;
        const topMargin = 25;
        const bottomMargin = 20;

        ctx.fillStyle = '#020506'; // Solid deep dark background
        ctx.fillRect(0, 0, w, h);

        drawCustomThresholdLayout(ctx, w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG);

        // Crisp, un-blurred lines (X = Red, Y = Green, Z = Blue)
        drawSignalLine(ctx, school.xBuffer, '#ef4444', w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG);
        drawSignalLine(ctx, school.yBuffer, '#10b981', w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG);
        drawSignalLine(ctx, school.zBuffer, '#3b82f6', w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG);

        drawLegendOverlay(ctx, w);
    });

    requestAnimationFrame(animateWaveforms);
}

// Crisp Threshold Layout
function drawCustomThresholdLayout(ctx, w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG) {
    const plotW = w - leftMargin - rightMargin;
    const plotH = h - topMargin - bottomMargin;
    const plotRight = w - rightMargin;

    // Solid Inner Frame
    ctx.strokeStyle = '#14282f';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(leftMargin, topMargin, plotW, plotH);

    const levels = [
        { g: 0.25,  label: "0.25g", color: "#ef4444", width: 1.0, dash: [] },
        { g: 0.08,  label: "0.08g", color: "#f59e0b", width: 1.0, dash: [] },
        { g: 0.00,  label: "0g",    color: "#7899a6", width: 1.0, dash: [4, 4] },
        { g: -0.08, label: "0.08g", color: "#f59e0b", width: 1.0, dash: [] },
        { g: -0.25, label: "0.25g", color: "#ef4444", width: 1.0, dash: [] }
    ];

    ctx.font = '11px monospace';
    ctx.textAlign = 'right';

    levels.forEach(item => {
        const yRatio = (maxG - item.g) / (maxG * 2);
        const y = Math.round(topMargin + (yRatio * plotH)) + 0.5; // Sharp line trick

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.width;
        if (item.dash.length > 0) ctx.setLineDash(item.dash);
        ctx.moveTo(leftMargin, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = item.color;
        ctx.fillText(item.label, leftMargin - 8, y + 4);
    });
}

// Solid Signal Line (Removed shadowBlur and shadowColor completely)
function drawSignalLine(ctx, buffer, color, w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG) {
    const plotW = w - leftMargin - rightMargin;
    const plotH = h - topMargin - bottomMargin;
    const step = plotW / (buffer.length - 1);

    ctx.save();

    // Clipping Mask
    ctx.beginPath();
    ctx.rect(leftMargin, topMargin, plotW, plotH);
    ctx.clip(); 

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5; // Clean, thin technical line

    for (let i = 0; i < buffer.length; i++) {
        const x = leftMargin + (i * step);
        const gVal = buffer[i];
        
        const yRatio = (maxG - gVal) / (maxG * 2);
        const y = topMargin + (yRatio * plotH);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
}

// Top-Right Legend
function drawLegendOverlay(ctx, w) {
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';

    ctx.fillStyle = '#ef4444';
    ctx.fillText('━ X (Lat)', w - 140, 16);

    ctx.fillStyle = '#10b981';
    ctx.fillText('━ Y (Long)', w - 75, 16);

    ctx.fillStyle = '#3b82f6';
    ctx.fillText('━ Z (Vert)', w - 15, 16);
}

// 8. Log Helper
function addLogEntry(msg, type) {
    const logBox = document.getElementById('activityLog');
    const time = new Date().toLocaleTimeString();
    let badge = `<span style="color:#95c9dc">[SYS]</span>`;
    if (type === "SMS") badge = `<span style="color:#ef4444">[GSM]</span>`;
    if (type === "WEB") badge = `<span style="color:#f59e0b">[WEB]</span>`;

    const item = `
        <div class="log-item">
            <div><span class="log-time">${time}</span> ${badge} ${msg}</div>
        </div>
    `;
    logBox.innerHTML = item + logBox.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    renderUI();
    addLogEntry("System active. Monitoring 4 nodes.", "SYS");
    requestAnimationFrame(animateWaveforms);
});