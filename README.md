# 🌋 Solar-Powered Seismic Vibration Monitoring System with Rule-Based Inspection Prioritization

> **An offline-ready decision-support dashboard and telemetry monitoring framework designed for public school infrastructure in Maasin City, Southern Leyte.**

---

## 📌 Project Overview

Following a major seismic event, local disaster risk reduction officers (LGU-DRRMO) and Department of Education (DepEd) engineers face the critical challenge of determining **which public school buildings require visual inspection first**[cite: 1, 2, 3]. Traditional response relies on delayed manual reporting or visual walkthroughs, leaving high-risk facilities vulnerable to aftershocks[cite: 2, 3].

This system integrates **low-cost MEMS edge telemetry** (ADXL345 accelerometer + ESP32) with an **automated inspection prioritization engine**[cite: 1, 2, 3]. Using live tri-axial vibration data, the system computes Peak Ground Acceleration (PGA) in units of standard gravity ($g$) and applies a weighted scoring algorithm to rank facilities in real time based on immediate structural threat, facility age, student occupancy, and building construction type[cite: 1, 3, 6].

### 🎯 Key Stakeholders & Target Users
* **DepEd CDRRM** (Division of City Schools Risk Reduction and Management)[cite: 3]
* **LGU-DRRMO** (Maasin City, Southern Leyte)[cite: 2, 3]
* **Rapid Damage Assessment and Needs Analysis (RDANA) Teams**

---

## ✨ Key Features

* **🌐 100% Offline-Ready Web App:** Built using native HTML5, CSS3, and JavaScript with zero external CDN dependencies[cite: 6]. Runs completely offline during post-disaster power grid or internet blackouts[cite: 2, 3, 6].
* **⚡ Panel Demonstration Control Panel:** Built-in seismic event simulator allowing thesis panelists to test ambient shaking, moderate quakes (~0.15g), and severe earthquakes (~0.38g).
* **🧮 Automated Inspection Prioritization Matrix:** Instantly ranks monitored school facilities by inspection urgency using a dynamic weighted algorithm[cite: 1, 3].
* **📊 Real-Time Oscilloscope Waveform Canvases:** Renders live tri-axial accelerometer streams ($X, Y, Z$) on an expanded HTML5 Canvas bounded by exact ATC-20 threshold lines ($0.25g$, $0.08g$, $0g$)[cite: 1, 3].
* **🎯 Interactive Click-to-Scroll Navigation:** Clicking any facility row in the priority ranking table smoothly scrolls the page down and pulse-highlights that building's real-time waveform graph.
* **📡 Dual-Path Fallback Logging:** Visualizes alert dispatches over local web network and logs simulated SMS emergency alerts sent via GSM gateway (SIM800L)[cite: 1, 3, 6].

---

## 🧮 Prioritization Scoring Formula

The automated ranking matrix calculates a **Weighted Priority Score ($S_{\text{priority}}$)** for each monitored building using four key structural parameters[cite: 1, 3, 6]:

$$S_{\text{priority}} = (0.40 \cdot f_{\text{PGA}}) + (0.25 \cdot f_{\text{Age}}) + (0.20 \cdot f_{\text{Occupancy}}) + (0.15 \cdot f_{\text{Type}})$$

Where:
* **$f_{\text{PGA}}$ (40% Weight):** Peak Ground Acceleration recorded by the ADXL345 accelerometer ($g = 9.81 \text{ m/s}^2$)[cite: 3, 6].
* **$f_{\text{Age}}$ (25% Weight):** Building structural age in years (scaled up to 40 years)[cite: 3, 6].
* **$f_{\text{Occupancy}}$ (20% Weight):** Student and personnel population density[cite: 3, 6].
* **$f_{\text{Type}}$ (15% Weight):** Structural framing vulnerability category (e.g., Timber/Concrete Hybrid vs. Reinforced Concrete Frame)[cite: 3, 6].

---

## 🏷️ ATC-20 / PHIVOLCS Severity Scale Mapping

| Safety Status | ATC-20 Placard | PGA Threshold ($g$) | Operational Assessment & Protocol |
| :--- | :--- | :--- | :--- |
| 🟢 **SAFE** | Green | $\text{PGA} < 0.08g$ | **Normal Operations.** Ambient vibration levels[cite: 1, 3]. Occupancy permitted[cite: 2, 3]. |
| 🟡 **RESTRICTED USE** | Yellow | $0.08g \le \text{PGA} < 0.25g$ | **Caution / Limited Access.** Entry restricted until visual inspection by engineer[cite: 1, 3]. |
| 🔴 **UNSAFE** | Red | $\text{PGA} \ge 0.25g$ | **Evacuate Immediately.** Critical seismic thresholds exceeded[cite: 1, 3]. Triggers automated SMS alert[cite: 1, 3]. |

---

## 🛠️ Hardware & Telemetry Architecture

| Hardware Component | Function & Role |
| :--- | :--- |
| **ADXL345 Accelerometer** | High-resolution ($\pm 16g$), 3-axis digital vibration sampling via $I^2C$ interface[cite: 3]. |
| **ESP32 Microcontroller** | Main processing core executing onboard FFT signal filtering and web telemetry streaming[cite: 1, 3]. |
| **SIM800L GSM Module** | Cellular SMS fallback gateway for direct emergency notifications during internet outages[cite: 1, 3]. |
| **Solar Power System** | 3.7V 18650 Li-ion battery backup with solar charge controller for off-grid continuous operation[cite: 1, 3]. |

---

## 🚀 How to Run the Web Application

1. **Clone or Download** this repository to your local computer.
2. Open the project folder.
3. Double-click **`index.html`** to open the dashboard directly in any modern web browser (Chrome, Edge, Firefox, Safari).
4. *No server installation, Node.js, or internet connection is required.*

---

## 📄 License & Legal Safeguards

**Decision-Support System Disclaimer:** Automated risk classifications and priority rankings generated by this software provide data-driven recommendations to assist DRRM personnel[cite: 3]. Final certified structural safety determinations remain the sole responsibility of licensed civil/structural engineers[cite: 3].