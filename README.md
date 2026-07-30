# 🌋 Seismic Monitoring & Post-Earthquake Facility Prioritization System

> **A 100% offline-ready web dashboard and telemetry monitoring framework that visualizes multi-site tri-axial vibration data, evaluates structural risk using ATC-20/PHIVOLCS standards, and automatically ranks school facilities for emergency post-earthquake visual inspection.**

---

## 📌 Project Overview

Following a seismic event, Local Government Units (LGUs) and disaster risk reduction officers face the critical challenge of deciding **which public infrastructure to inspect first**. Traditional response relies on delayed manual reporting, which can leave high-risk facilities vulnerable to aftershocks.

This system addresses that gap by integrating **IoT edge telemetry** with a **dynamic inspection prioritization engine**. Using live tri-axial accelerometer data (X, Y, Z axes), the system calculates Peak Ground Acceleration (PGA) and applies a weighted scoring algorithm to rank facilities in real-time based on immediate structural threat, facility age, student occupancy, and building material type.

### 🎯 Key Target Stakeholders
* **DepEd CDRRM** (Division of City Schools Risk Reduction and Management)
* **LGU-DRRMO** (Maasin City, Southern Leyte)
* Rapid Damage Assessment and Needs Analysis (RDANA) Teams

---

## ✨ Key Features

* **🌐 100% Offline Deployment:** Built with zero external dependencies (no CDNs, web fonts, or JS libraries). Runs locally during grid power or internet failures.
* **📊 Multi-Site Live Waveform Graphs:** Powered by a custom, high-performance HTML5 Canvas 2D engine rendering $X, Y, Z$ sensor streams at 150ms intervals.
* **🧮 Automated Inspection Prioritization Matrix:** Instantly recalculates ranking scores based on real-time sensor inputs and facility vulnerability data.
* **🏷️ ATC-20 / PHIVOLCS Status Mapping:** Automatically classifies facility safety into three operational states:
  * 🟢 **SAFE (Green):** Normal operations / Occupancy permitted.
  * 🟡 **RESTRICTED USE (Yellow):** Caution advised / Engineering assessment queued.
  * 🔴 **UNSAFE (Red):** Evacuation required / High post-earthquake risk.
* **📡 GSM / SIM800L Alert Fallback:** Logs simulated cellular SMS alerts for direct alert dispatch to emergency personnel when local networks fail.
* **🎛️ Interactive Testing Rig:** Built-in simulation control panel for live demonstrations and testing during thesis evaluations.

---

## 🧮 Inspection Prioritization Scoring Formula

The automated ranking matrix calculates a **Weighted Priority Score ($S_{\text{priority}}$)** for each monitored building using four key parameters:

$$S_{\text{priority}} = (w_1 \cdot f_{\text{PGA}}) + (w_2 \cdot f_{\text{Age}}) + (w_3 \cdot f_{\text{Occupancy}}) + (w_4 \cdot f_{\text{Type}})$$

Where:
* **$f_{\text{PGA}}$ (40% Weight):** Peak Ground Acceleration recorded by the ADXL345 accelerometer ($g = \text{m/s}^2$).
* **$f_{\text{Age}}$ (25% Weight):** Building structural age in years (capped at 40 years).
* **$f_{\text{Occupancy}}$ (20% Weight):** Total student and faculty population density.
* **$f_{\text{Type}}$ (15% Weight):** Structural framing category (e.g., Timber/Masonry Hybrid vs. Reinforced Concrete).

$$\text{Weighted Factors: } w_1 = 0.40, \quad w_2 = 0.25, \quad w_3 = 0.20, \quad w_4 = 0.15$$

---

## 🛠️ Hardware & Telemetry Architecture

| Hardware Component | Function & Role |
| :--- | :--- |
| **ADXL345 Accelerometer** | High-resolution ($\pm 16g$), 3-axis digital vibration sampling via $I^2C$ interface. |
| **ESP32 Microcontroller** | Edge processor executing signal filtering (FFT noise reduction) and telemetry streaming. |
| **SIM800L GSM Module** | Cellular SMS fallback gateway for remote emergency notifications. |
| **Solar Power Management** | 3.7V Li-ion battery backup with solar charge controller for uninterrupted operation. |

---

## 📂 Project Structure

```text
seismic-monitoring-dashboard/
├── index.html        # Main dashboard markup & multi-site layout
├── styles.css        # Custom CSS design system (Dark Mode, responsive grid)
├── script.js        # HTML5 Canvas engine, telemetry loop, & prioritization logic
└── README.md         # System documentation & technical specifications