// Database of Monitored School Facilities in Maasin City
const schools = [
    {
        id: 1,
        name: "Manhilo Elementary School (Bldg A)",
        age: 28, // years
        occupancy: 420, // students & personnel
        type: "Masonry / Concrete",
        typeWeight: 70, // Vulnerability weight
        pga: 0.02,
        freq: 11.5,
        status: "Safe",
        score: 0,
        xBuffer: new Array(60).fill(0.0),
        yBuffer: new Array(60).fill(0.0),
        zBuffer: new Array(60).fill(0.0) // Dynamic AC acceleration centered at 0g
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

// --- 1. Weighted Prioritization Algorithm ---
function computePriorityScore(school) {
    const pgaFactor = Math.min((school.pga / 0.50) * 100, 100) * 0.40;
    const ageFactor = Math.min((school.age / 40) * 100, 100) * 0.25;
    const occFactor = Math.min((school.occupancy / 1000) * 100, 100) * 0.20;
    const typeFactor = school.typeWeight * 0.15;

    return parseFloat((pgaFactor + ageFactor + occFactor + typeFactor).toFixed(1));
}

// --- 2. ATC-20 / PHIVOLCS Classification Engine ---
function classifyStatus(pga) {
    if (pga >= 0.25) return "Unsafe";
    if (pga >= 0.08) return "Restricted Use";
    return "Safe";
}

// --- 3. UI Renderer for Bottom Facility Cards ---
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
                        <div class="metric-val text-primary">${school.pga.toFixed(2)} g</div>
                    </div>
                    <div>
                        <div class="metric-label">Dom. Freq</div>
                        <div class="metric-val text-accent">${school.freq.toFixed(1)} Hz</div>
                    </div>
                    <div>
                        <div class="metric-label">Priority Score</div>
                        <div class="metric-val text-primary">${school.score} pts</div>
                    </div>
                </div>

                <!-- Custom Threshold Oscilloscope Canvas (340px) -->
                <div class="canvas-box">
                    <canvas id="canvas-${school.id}"></canvas>
                </div>

                <!-- Individual Shaking Level Control Slider -->
                <div class="slider-box">
                    <div class="slider-label">
                        <span>Simulate Acceleration for this Facility:</span>
                        <strong class="text-accent">${school.pga.toFixed(2)} g</strong>
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

// --- 4. Render Prioritization Ranking Table with Click-to-Scroll ---
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
                <td class="text-primary" style="font-weight: 800; font-size: 14px;">#${index + 1} ${isTopAlert ? '⚠️ PRIORITY 1' : ''}</td>
                <td style="color:#e6edef; font-weight:700; font-size: 14px;">${school.name}</td>
                <td style="font-family:monospace; font-size: 14px;" class="${school.pga >= 0.25 ? 'text-accent' : ''}">${school.pga.toFixed(2)} g</td>
                <td style="font-family:monospace; font-size: 14px;">${school.freq.toFixed(1)} Hz</td>
                <td style="font-size: 14px;">${school.age} yrs</td>
                <td style="font-size: 14px;">${school.occupancy} occupants</td>
                <td><span class="status-tag ${tagClass}">${school.status}</span></td>
                <td>
                    <div class="score-badge-container">
                        <span class="text-primary" style="font-weight:800; min-width: 45px; font-size: 14px;">${school.score} pts</span>
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

// --- 5. Interactive Scroll-to-Graph Function ---
window.scrollToFacilityGraph = function(schoolId) {
    const card = document.getElementById(`facility-card-${schoolId}`);
    if (!card) return;

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    card.classList.remove('card-pulse');
    void card.offsetWidth; // Force CSS reflow
    card.classList.add('card-pulse');

    const school = schools.find(s => s.id === schoolId);
    if (school) {
        addLogEntry(`🎯 Navigated to real-time waveform graph for [${school.name}].`, "SYS");
    }
};

// --- 6. Interactive Control Handlers ---
function updateFacilityPGA(schoolId, value) {
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;

    const oldStatus = school.status;
    school.pga = parseFloat(value);
    school.freq = parseFloat((12.0 - (school.pga * 10)).toFixed(1));

    renderUI();

    const newStatus = classifyStatus(school.pga);
    if (oldStatus !== newStatus && newStatus === "Unsafe") {
        addLogEntry(`🔴 CRITICAL: [${school.name}] Exceeded Unsafe Threshold (${school.pga}g)! Dispatching fallback SMS via SIM800L to LGU-DRRMO.`, "SMS");
    } else if (oldStatus !== newStatus && newStatus === "Restricted Use") {
        addLogEntry(`🟡 WARNING: [${school.name}] Structural shaking registered (${school.pga}g). Dispatched web dashboard alert to DepEd Engineer.`, "WEB");
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

    if (type === 'ambient') addLogEntry("ℹ️ All sensor nodes normalized to ambient baseline readings.", "SYS");
    if (type === 'moderate') addLogEntry("⚠️ Moderate earthquake simulated. Web alerts dispatched to DepEd SDO.", "WEB");
    if (type === 'severe') addLogEntry("🚨 SEVERE EARTHQUAKE SIMULATED! Automated SMS alerts sent to LGU-DRRMO & DepEd Engineers for Top Priority sites.", "SMS");
}

// --- 7. ACCELEROMETER GRAPH RENDERING ENGINE ---
function animateWaveforms() {
    schools.forEach(school => {
        const pga = school.pga;
        const timeFactor = Date.now() * 0.015;
        const mainOscillation = Math.sin(timeFactor * (school.freq / 4));

        // X Axis (Lateral)
        const noiseX = (pga * mainOscillation * 1.4) + ((Math.random() - 0.5) * pga * 0.6);
        // Y Axis (Longitudinal)
        const noiseY = (pga * Math.cos(timeFactor * (school.freq / 4)) * 1.4) + ((Math.random() - 0.5) * pga * 0.6);
        // Z Axis (Vertical Dynamic Shaking centered at 0g)
        const noiseZ = (pga * Math.sin(timeFactor * (school.freq / 3)) * 1.2) + ((Math.random() - 0.5) * pga * 0.5);

        school.xBuffer.push(noiseX); school.xBuffer.shift();
        school.yBuffer.push(noiseY); school.yBuffer.shift();
        school.zBuffer.push(noiseZ); school.zBuffer.shift();

        const canvas = document.getElementById(`canvas-${school.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.parentElement.clientWidth;
        const h = canvas.height = canvas.parentElement.clientHeight;

        // Domain bounds: -0.35g to +0.35g
        const maxG = 0.35;
        const leftMargin = 55;
        const rightMargin = 15;
        const topMargin = 25;
        const bottomMargin = 20;

        // 1. Background
        ctx.fillStyle = '#020506';
        ctx.fillRect(0, 0, w, h);

        // 2. Custom Threshold Layout Lines
        drawCustomThresholdLayout(ctx, w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG);

        // 3. Draw Tri-Axial Signal Lines (X = RED, Y = GREEN, Z = BLUE)
        drawSignalLine(ctx, school.xBuffer, '#ef4444', w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG, 2.0); // X-Axis (Red)
        drawSignalLine(ctx, school.yBuffer, '#10b981', w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG, 2.0); // Y-Axis (Green)
        drawSignalLine(ctx, school.zBuffer, '#3b82f6', w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG, 2.2); // Z-Axis (Blue)

        // 4. Legend Overlay
        drawLegendOverlay(ctx, w);
    });

    requestAnimationFrame(animateWaveforms);
}

// Helper: Threshold Grid & Axis Lines Matching Design
function drawCustomThresholdLayout(ctx, w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG) {
    const plotW = w - leftMargin - rightMargin;
    const plotH = h - topMargin - bottomMargin;
    const plotRight = w - rightMargin;

    // Outer Bounding Box Frame
    ctx.strokeStyle = 'rgba(149, 201, 220, 0.3)';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(leftMargin, topMargin, plotW, plotH);

    // Threshold Reference Lines
    const levels = [
        { g: 0.25,  label: "0.25g", color: "#ef4444", width: 1.8, dash: [] },      // Top Unsafe Threshold Line (Red)
        { g: 0.08,  label: "0.08g", color: "#f59e0b", width: 1.8, dash: [] },      // Upper Restricted Threshold Line (Yellow)
        { g: 0.00,  label: "0g",    color: "#95c9dc", width: 2.0, dash: [5, 5] },  // Center Baseline (Primary)
        { g: -0.08, label: "0.08g", color: "#f59e0b", width: 1.8, dash: [] },      // Lower Restricted Threshold Line (Yellow)
        { g: -0.25, label: "0.25g", color: "#ef4444", width: 1.8, dash: [] }       // Bottom Unsafe Threshold Line (Red)
    ];

    ctx.font = '12px monospace';
    ctx.textAlign = 'right';

    levels.forEach(item => {
        const yRatio = (maxG - item.g) / (maxG * 2);
        const y = topMargin + (yRatio * plotH);

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

// Helper: Glowing Signal Line Rendering with Context Clipping
function drawSignalLine(ctx, buffer, color, w, h, leftMargin, rightMargin, topMargin, bottomMargin, maxG, lineWidth) {
    const plotW = w - leftMargin - rightMargin;
    const plotH = h - topMargin - bottomMargin;
    const step = plotW / (buffer.length - 1);

    ctx.save();

    // CLIPPING MASK: Strictly confines rendering inside the bounding box
    ctx.beginPath();
    ctx.rect(leftMargin, topMargin, plotW, plotH);
    ctx.clip(); // Lines exceeding 0.35g or 0.25g will be trimmed neatly at the box wall

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;

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

// Helper: Top-Right Graph Legend
function drawLegendOverlay(ctx, w) {
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'right';

    ctx.fillStyle = '#ef4444';
    ctx.fillText('━ X (Lat)', w - 140, 16);

    ctx.fillStyle = '#10b981';
    ctx.fillText('━ Y (Long)', w - 75, 16);

    ctx.fillStyle = '#3b82f6';
    ctx.fillText('━ Z (Vert)', w - 15, 16);
}

// --- 8. Activity Log Helper ---
function addLogEntry(msg, type) {
    const logBox = document.getElementById('activityLog');
    const time = new Date().toLocaleTimeString();
    let badge = `<span class="text-primary">[SYSTEM]</span>`;
    if (type === "SMS") badge = `<span class="text-accent">[GSM SMS DISPATCH]</span>`;
    if (type === "WEB") badge = `<span class="text-secondary">[WEB ALERT]</span>`;

    const item = `
        <div class="log-item">
            <div><span class="log-time">${time}</span> ${badge} ${msg}</div>
            <span style="font-size:14px; color:var(--text-muted);">ESP32 -> SIM800L</span>
        </div>
    `;
    logBox.innerHTML = item + logBox.innerHTML;
}

// Initial Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderUI();
    addLogEntry("System active. Connected to 4 remote school monitoring nodes via local network.", "SYS");
    requestAnimationFrame(animateWaveforms);
});