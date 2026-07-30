document.addEventListener('DOMContentLoaded', () => {

    const maxPoints = 50;

    // --- 1. Multi-School Database State ---
    let schools = [
        {
            id: 1,
            name: "Manhilo Elementary School (Bldg A)",
            age: 28,
            occupancy: 420,
            structType: "Concrete Frame",
            pga: 0.02,
            freq: 12.4,
            state: "ambient",
            status: "Safe",
            score: 0,
            xBuffer: new Array(maxPoints).fill(0.01),
            yBuffer: new Array(maxPoints).fill(0.01),
            zBuffer: new Array(maxPoints).fill(0.98)
        },
        {
            id: 2,
            name: "Manhilo National High School",
            age: 18,
            occupancy: 650,
            structType: "Masonry / Concrete",
            pga: 0.02,
            freq: 11.8,
            state: "ambient",
            status: "Safe",
            score: 0,
            xBuffer: new Array(maxPoints).fill(0.01),
            yBuffer: new Array(maxPoints).fill(0.01),
            zBuffer: new Array(maxPoints).fill(0.98)
        },
        {
            id: 3,
            name: "Maasin City Central School",
            age: 35,
            occupancy: 910,
            structType: "Timber / Concrete Hybrid",
            pga: 0.02,
            freq: 13.1,
            state: "ambient",
            status: "Safe",
            score: 0,
            xBuffer: new Array(maxPoints).fill(0.01),
            yBuffer: new Array(maxPoints).fill(0.01),
            zBuffer: new Array(maxPoints).fill(0.98)
        },
        {
            id: 4,
            name: "Asuncion National High School",
            age: 12,
            occupancy: 310,
            structType: "Reinforced Concrete",
            pga: 0.02,
            freq: 10.5,
            state: "ambient",
            status: "Safe",
            score: 0,
            xBuffer: new Array(maxPoints).fill(0.01),
            yBuffer: new Array(maxPoints).fill(0.01),
            zBuffer: new Array(maxPoints).fill(0.98)
        }
    ];

    // --- 2. Build Multi-School Cards HTML dynamically ---
    function renderSchoolCards() {
        const container = document.getElementById('schools-grid');
        container.innerHTML = "";

        schools.forEach(school => {
            let cardStatusClass = "card-safe";
            let statusTagClass = "tag-safe";
            if (school.status === "Restricted Use") { cardStatusClass = "card-restricted"; statusTagClass = "tag-restricted"; }
            if (school.status === "Unsafe") { cardStatusClass = "card-unsafe"; statusTagClass = "tag-unsafe"; }

            const cardHTML = `
                <div class="card school-card ${cardStatusClass}" id="card-school-${school.id}">
                    <div class="school-card-header">
                        <div>
                            <div class="school-name">${school.name}</div>
                            <div class="school-meta">Age: ${school.age} yrs • Occupancy: ${school.occupancy} • ${school.structType}</div>
                        </div>
                        <span id="badge-status-${school.id}" class="tag ${statusTagClass}">${school.status}</span>
                    </div>

                    <!-- Live Metrics Row -->
                    <div class="telemetry-row">
                        <div class="telemetry-item">
                            <div class="telemetry-label">PGA Recorded</div>
                            <div id="pga-${school.id}" class="telemetry-val text-cyan">${school.pga} g</div>
                        </div>
                        <div class="telemetry-item">
                            <div class="telemetry-label">Frequency</div>
                            <div id="freq-${school.id}" class="telemetry-val text-purple">${school.freq} Hz</div>
                        </div>
                        <div class="telemetry-item">
                            <div class="telemetry-label">Rank Score</div>
                            <div id="score-${school.id}" class="telemetry-val text-amber">${school.score} pts</div>
                        </div>
                    </div>

                    <!-- Individual Canvas Waveform -->
                    <div class="school-canvas-container">
                        <canvas id="canvas-school-${school.id}"></canvas>
                    </div>

                    <!-- Per-School Simulation Button Panel -->
                    <div class="card-sim-controls">
                        <span class="sim-btn-label">Simulate Vibration for this Facility:</span>
                        <div class="button-group-compact">
                            <button onclick="setSchoolVibration(${school.id}, 'ambient')" class="btn-xs btn-slate">Ambient</button>
                            <button onclick="setSchoolVibration(${school.id}, 'moderate')" class="btn-xs btn-amber">Moderate</button>
                            <button onclick="setSchoolVibration(${school.id}, 'severe')" class="btn-xs btn-rose">Severe Quake</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

        // Resize contexts after building DOM
        setTimeout(() => {
            schools.forEach(school => {
                const canvas = document.getElementById(`canvas-school-${school.id}`);
                if (canvas) {
                    canvas.width = canvas.parentElement.clientWidth;
                    canvas.height = canvas.parentElement.clientHeight;
                }
            });
        }, 50);
    }

    // --- 3. Per-School Simulation Handler ---
    window.setSchoolVibration = function(schoolId, state) {
        const school = schools.find(s => s.id === schoolId);
        if (!school) return;

        school.state = state;

        if (state === 'ambient') {
            school.pga = parseFloat((Math.random() * 0.03 + 0.01).toFixed(2));
            school.freq = parseFloat((Math.random() * 4 + 10).toFixed(1));
            school.status = "Safe";
            addLogEntry(`[${school.name}] Shaking normalized to ambient levels.`, "INFO");
        } else if (state === 'moderate') {
            school.pga = parseFloat((Math.random() * 0.15 + 0.12).toFixed(2));
            school.freq = parseFloat((Math.random() * 3 + 3).toFixed(1));
            school.status = "Restricted Use";
            addLogEntry(`[${school.name}] Moderate shaking registered (PGA: ${school.pga}g). Dispatched Web Alert.`, "WARN");
        } else if (state === 'severe') {
            school.pga = parseFloat((Math.random() * 0.45 + 0.35).toFixed(2));
            school.freq = parseFloat((Math.random() * 2 + 1.2).toFixed(1));
            school.status = "Unsafe";
            addLogEntry(`[${school.name}] CRITICAL SEISMIC EXCEEDED (PGA: ${school.pga}g)! SMS Alert dispatched to LGU-DRRMO.`, "CRITICAL");
        }

        recalculateScoresAndSort();
        updateSchoolCardUI(school);
    };

    // Update single card UI elements without full grid rebuild
    function updateSchoolCardUI(school) {
        const card = document.getElementById(`card-school-${school.id}`);
        const pgaTxt = document.getElementById(`pga-${school.id}`);
        const freqTxt = document.getElementById(`freq-${school.id}`);
        const scoreTxt = document.getElementById(`score-${school.id}`);
        const badge = document.getElementById(`badge-status-${school.id}`);

        if (pgaTxt) pgaTxt.innerText = `${school.pga} g`;
        if (freqTxt) freqTxt.innerText = `${school.freq} Hz`;
        if (scoreTxt) scoreTxt.innerText = `${school.score} pts`;

        if (card && badge) {
            card.className = "card school-card";
            if (school.status === "Safe") {
                card.classList.add("card-safe");
                badge.className = "tag tag-safe";
            } else if (school.status === "Restricted Use") {
                card.classList.add("card-restricted");
                badge.className = "tag tag-restricted";
            } else {
                card.classList.add("card-unsafe");
                badge.className = "tag tag-unsafe";
            }
            badge.innerText = school.status;
        }
    }

    // --- 4. Prioritization Matrix Engine ---
    function calculatePriorityScore(school) {
        // Weighted formula: Severity PGA (40%) + Building Age (25%) + Occupancy (20%) + Structural Type (15%)
        let severityFactor = school.pga * 100 * 0.40;
        let ageFactor = Math.min(school.age, 40) * 0.25;
        let occupancyFactor = Math.min(school.occupancy / 100, 10) * 0.20;
        let typeFactor = (school.structType.includes("Timber") ? 10 : 5) * 0.15;

        return parseFloat((severityFactor + ageFactor + occupancyFactor + typeFactor).toFixed(1));
    }

    function recalculateScoresAndSort() {
        schools.forEach(school => {
            school.score = calculatePriorityScore(school);
            const scoreTxt = document.getElementById(`score-${school.id}`);
            if (scoreTxt) scoreTxt.innerText = `${school.score} pts`;
        });

        renderRankingTable();
    }

    function renderRankingTable() {
        // Sort descending by calculated weighted score
        const sortedSchools = [...schools].sort((a, b) => b.score - a.score);

        const tbody = document.getElementById('priorityTableBody');
        tbody.innerHTML = "";

        sortedSchools.forEach((school, index) => {
            let tagClass = "tag-safe";
            if (school.status === "Restricted Use") tagClass = "tag-restricted";
            if (school.status === "Unsafe") tagClass = "tag-unsafe";

            const isTopRank = index === 0 && school.pga > 0.05;

            const row = `
                <tr class="${isTopRank ? 'rank-top' : ''}">
                    <td class="text-cyan" style="font-weight: 800;">#${index + 1} ${isTopRank ? '⚠️ HIGHEST PRIORITY' : ''}</td>
                    <td style="font-weight: 700; color: #fff;">${school.name}</td>
                    <td style="font-family: monospace;" class="${school.pga > 0.10 ? 'text-rose' : ''}">${school.pga} g</td>
                    <td style="font-family: monospace;">${school.freq} Hz</td>
                    <td>${school.age} yrs</td>
                    <td>${school.occupancy} students</td>
                    <td><span class="tag ${tagClass}">${school.status}</span></td>
                    <td class="text-right text-amber" style="font-weight: 800; font-size: 0.85rem;">${school.score} pts</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    document.getElementById('btn-refresh').addEventListener('click', () => {
        recalculateScoresAndSort();
        addLogEntry("Manually re-indexed priority matrix.", "INFO");
    });

    // --- 5. Render Waveform Graphs for All Canvases ---
    function renderAllWaveforms() {
        schools.forEach(school => {
            const canvas = document.getElementById(`canvas-school-${school.id}`);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, w, h);

            // Draw gridline
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();

            // Draw X, Y, Z waveform buffers
            drawAxisLine(ctx, school.xBuffer, '#38bdf8', w, h);
            drawAxisLine(ctx, school.yBuffer, '#c084fc', w, h);
            drawAxisLine(ctx, school.zBuffer, '#34d399', w, h);
        });

        requestAnimationFrame(renderAllWaveforms);
    }

    function drawAxisLine(ctx, buffer, color, width, height) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;

        const step = width / (maxPoints - 1);
        const midY = height / 2;
        const scale = height / 3;

        for (let i = 0; i < buffer.length; i++) {
            const x = i * step;
            const y = midY - (buffer[i] * scale) + (color === '#34d399' ? scale * 0.8 : 0);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Stream Telemetry Data Simulation Loop
    setInterval(() => {
        schools.forEach(school => {
            let noiseX, noiseY, noiseZ;
            if (school.state === 'ambient') {
                noiseX = (Math.random() - 0.5) * 0.04;
                noiseY = (Math.random() - 0.5) * 0.04;
                noiseZ = 0.98 + (Math.random() - 0.5) * 0.04;
            } else if (school.state === 'moderate') {
                noiseX = (Math.random() - 0.5) * 0.35;
                noiseY = (Math.random() - 0.5) * 0.35;
                noiseZ = 0.98 + (Math.random() - 0.5) * 0.35;
            } else { // severe
                noiseX = (Math.random() - 0.5) * 0.90;
                noiseY = (Math.random() - 0.5) * 0.90;
                noiseZ = 0.98 + (Math.random() - 0.5) * 0.90;
            }

            school.xBuffer.push(noiseX); school.xBuffer.shift();
            school.yBuffer.push(noiseY); school.yBuffer.shift();
            school.zBuffer.push(noiseZ); school.zBuffer.shift();
        });
    }, 150);

    // --- 6. Helper Alert Log ---
    function addLogEntry(message, level) {
        const logContainer = document.getElementById('alert-log-list');
        const timeStr = new Date().toLocaleTimeString();

        let tagHTML = `<span class="tag tag-info">INFO</span>`;
        if (level === "WARN") tagHTML = `<span class="tag tag-warn">WARNING</span>`;
        else if (level === "CRITICAL") tagHTML = `<span class="tag tag-critical">SMS DISPATCHED</span>`;

        const item = `
            <div class="log-item">
                <div class="log-left">
                    <span class="log-time">${timeStr}</span>
                    ${tagHTML}
                    <span class="log-msg">${message}</span>
                </div>
                <span class="log-source">SIM800L / Web</span>
            </div>
        `;
        logContainer.innerHTML = item + logContainer.innerHTML;
    }

    // Initialize layout
    renderSchoolCards();
    recalculateScoresAndSort();
    requestAnimationFrame(renderAllWaveforms);
});