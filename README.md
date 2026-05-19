my work

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/AnR2QgvN)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=22925822&assignment_repo_type=AssignmentRepo)
# 🌐 IoT Elective Project 2026
### Cape Peninsula University of Technology — IT Diploma
**Module:** Internet of Things (IoT) Elective | **Year:** 2026

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Group Members](#group-members)
3. [Project Idea & Problem Statement](#project-idea--problem-statement)
4. [System Architecture & Design](#system-architecture--design)
5. [Hardware Components](#hardware-components)
6. [Software & Technologies](#software--technologies)
7. [Circuit Diagram / Wiring](#circuit-diagram--wiring)
8. [Build Process (with photos)](#build-process-with-photos)
9. [Code Documentation](#code-documentation)
10. [Testing & Results](#testing--results)
11. [Challenges & Solutions](#challenges--solutions)
12. [Project Demonstration](#project-demonstration)
13. [References](#references)
14. [Assessment Rubric](#assessment-rubric)
15. [Embedding Images in Your README](#embedding-images-in-your-readme)

---

## 📌 Project Overview

**Project Title:** `Smart Attendance System`  
**Group Name / Number:** `Fantastic Four`  
**Presentation Date:** 20 May 2026 — 10:00 to 15:00 (SAST)

---

## 🗓️ Presentation Schedule — 20 May 2026

> 📍 **Date:** Wednesday, 20 May 2026  
> 🕙 **Time:** 10:00 – 15:00 (South Africa Standard Time, UTC+2)  
> ⏱️ **Slot duration:** 15 minutes per group  
> ⚠️ **All groups must be present and ready before their slot.**

| Slot | Time (SAST) | Group |
|------|-------------|-------|
| 1 | 10:00 – 10:15 | Group 1 |
| 2 | 10:15 – 10:30 | Group 2 |
| 3 | 10:30 – 10:45 | Group 3 |
| — | 10:45 – 11:00 | ☕ Short Break |
| 4 | 11:00 – 11:15 | Group 4 |
| 5 | 11:15 – 11:30 | Group 5 |
| — | 11:30 – 12:30 | 🍽️ Lunch Break |
| 6 | 12:30 – 12:45 | Group 6 |
| 7 | 12:45 – 13:00 | Group 7 |
| — | 13:00 – 15:00 | 🧑‍🏫 Moderation / Feedback Session |

> 📌 Group numbers will be replaced with actual group names once confirmed with the lecturer.

---

# 👥 Group Members

| Student Name | Student Number | Role / Responsibility |
|---|---|---|
| Redah Gamieldien | 222641681 | Testing Lead |
| Lyle Solomons | 230123872 | Software Lead |
| Qaasim Isaacs | 222544422 | Hardware Lead |
| Ethan Williams | 221454780 | Documentation Lead |

---

## 💡 Project Idea & Problem Statement
## Problem Statement

Currently, student identification cards are mainly used only to access campus facilities. However, classroom attendance is still recorded manually using attendance sheets.

This creates several problems:

- Attendance sheets can be lost or damaged  
- Students may sign attendance for absent friends  
- Manual attendance recording is time consuming  
- Attendance tracking becomes unreliable and prone to human error  

---

## Proposed Solution

We developed a **Smart Attendance System** using RFID and ESP32 with real-time monitoring.

### System Flow:
- RFID card is scanned
- ESP32 reads UID
- Attendance is recorded automatically
- LED + buzzer provide feedback
- Data is sent via Wi-Fi
- GitHub stores project documentation

---

## Objectives

1. Automate attendance tracking  
2. Improve accuracy and efficiency  
3. Prevent proxy attendance  
4. Demonstrate IoT application in education  

---


# 🏗️ System Architecture & Design

![System Architecture](image/System_Architecture.png)

## Design Decisions

- ESP32 chosen for Wi-Fi + processing power  
- MFRC522 used for RFID scanning  
- SPI communication ensures fast data transfer  
- LEDs + buzzer for feedback system  
- GitHub for version control  
- Designed for scalability  
---

## 🔧 Hardware Components

| Component | Description | Quantity | Purpose |
|---|---|---|---|
| ESP32 | Microcontroller | 1 | Main controller |
| MFRC522 | RFID reader | 1 | Reads student cards |
| RFID Tags | Student cards | Multiple | Identification |
| Green LED | Indicator | 1 | Success signal |
| Red LED | Indicator | 1 | Failure signal |
| Buzzer | Sound output | 1 | Audio feedback |
| 220Ω Resistors | Protection | 2 | LED safety |
| Jumper Wires | Connections | Multiple | Wiring |
| Breadboard | Prototype | 1 | Testing |
| Enclosure | Housing | 1 | Final casing |

---

## 💻 Software & Technologies

| Tool | Purpose |
|---|---|
| Arduino IDE | Programming ESP32 |
| GitHub | Version control |
| Wokwi | Simulation |
| C++ | Firmware language |
| ESP32 Wi-Fi Library | Connectivity |
| MFRC522 Library | RFID communication |

---

## 🔌 Circuit Diagram / Wiring

![Circuit Diagram](image/Circuit_Diagram.jpeg)

| Component Pin | ESP32 Pin |
|---|---|
| SDA | GPIO 5 |
| SCK | GPIO 18 |
| MOSI | GPIO 23 |
| MISO | GPIO 19 |
| RST | GPIO 22 |
| VCC | 3.3V |
| GND | GND |
| Green LED | GPIO 13 |
| Red LED | GPIO 12 |
| Buzzer | GPIO 14 |
---

## 🏭 Build Process (with photos)

## Step 1: Install Esp32 to breadboard
![Step 1](image/1.jpeg)

## Step 2:  Install MFRC522 RFID Scanner to the breadboard
![Step 2](image/2.jpeg)

## Step 3:Connect Esp32 to MFRC522 RFID scanner
![Step 3](image/3.jpeg)

## Step 4: Install the Green LED with the appropriate Ohms resistor to the breadboard
![Step 4](image/4.jpeg)

## Step 5: Install the Red LED with the appropriate Ohms resistor to the breadboard
![Step 5](image/5.jpeg)

## Step 6: Mount the Buzzer into the breadboard
![Step 6](image/6.jpeg)

## Step 7: Set up database 
![Step 7](image/7.jpeg)

## Step 8: Ensure Database is capable of logging data
![Step 8](image/8.jpeg)

## Step 9: Basic UI to test if the front-end interacts with the backend
![Step 9](image/9.jpeg)

## Step 10: Final UI Dashboard
![Step 10](image/10.jpeg)

## Step 11: Housing Unit Components
![Step 11](image/11.jpeg)

## Step 12: Complete Housing Unit Assembly
![Step 12](image/12.jpeg)
![Step 12](image/13.jpeg)

---

## 🖥️ Code Documentation

### Main Firmware (e.g., `main.ino`)

```cpp
void setup() {
  Serial.begin(9600);
  // Initialize sensors and pins here
}

void loop() {
  // Main logic here
}
```

### Key Functions

| Function Name | Description |
|---|---|
| `setup()` | Initializes hardware peripherals and serial communication |
| `loop()` | Main execution loop |
| `[yourFunction()]` | [Describe it] |

---

## 🧪 Testing & Results

| Test # | Description | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | ESP32 startup | Works | Works | ✅ |
| 2 | RFID scan | Detect card | Works | ✅ |
| 3 | UID transfer | Correct | Correct | ✅ |
| 4 | Green LED | On success | Works | ✅ |
| 5 | Red LED | On fail | Works | ✅ |
| 6 | Buzzer | Sound | Fixed | ✅ |
| 7 | SPI | Stable | Stable | ✅ |
---

## ⚠️ Challenges & Solutions

| Challenge | Solution |
|---|---|
| ESP32 crash | Fixed code |
| RFID issues | Fixed wiring |
| LED errors | Correct GPIO |
| Buzzer weak | Fixed polarity |
| Upload error | Fixed COM port |

---

## 🎥 Project Demonstration

- 📹 **Demo Video:** [Demo Video](Video/Live_Demonstration.mp4)
- 📊 **Presentation Slides:** [Insert link here]
- 🔗 **Live Dashboard (if applicable):** [Insert link here]

---

## 📚 References

1. ESP32 Docs – https://docs.espressif.com/projects/esp-idf/en/latest/esp32/  
2. MFRC522 Library – https://github.com/miguelbalboa/rfid  
3. Arduino IDE – https://www.arduino.cc/en/software  
4. Wokwi – https://wokwi.com/
---

## 📊 Assessment Rubric

> ⚠️ **Students: Do NOT modify this section.**

### 📝 T1 — 50 Marks

| Criteria | Excellent (5) | Good (4) | Satisfactory (3) | Needs Improvement (2) | Incomplete (0-1) | Marks |
|---|---|---|---|---|---|---|
| Project Proposal & Problem Statement | Clear, detailed, well-researched | Clear with minor gaps | Stated but lacks depth | Vague | Not submitted | /5 |
| System Design & Architecture | Detailed diagram + design decisions | Good diagram with some docs | Basic diagram | Incomplete | Not submitted | /5 |
| Hardware Component Selection | All justified with images | Most documented | Listed not justified | Incomplete | Not attempted | /5 |
| Circuit Diagram / Wiring | Complete + pin mapping | Mostly complete | Partial | Incomplete | Not submitted | /5 |
| GitHub Repository Setup | Well-structured, clear commits | Good with minor issues | Basic structure | Minimal | Repo not set up | /5 |
| Markdown Documentation Quality | Excellent: headings, tables, images, code | Good with minor issues | Basic Markdown | Minimal | None | /5 |
| GitHub Commit History (T1) | Regular commits, all members | Regular, most members | Some commits | Few | None | /5 |
| Initial Code / Prototype | Working + well-commented | Working + some comments | Partial prototype | Started, not working | None | /5 |
| Group Collaboration Evidence | Issues, PRs, commits from all | Good evidence | Some evidence | Minimal | None | /5 |
| Build Progress Photos | Step-by-step + descriptions | Good photos | Photos, few descriptions | Few photos | None | /5 |
| | | | | | | **T1 Total** | **/50** |

---

### 📝 T2 — 50 Marks *(Final Presentation: 20 May 2026, 10:00–15:00 SAST)*

| Criteria | Excellent (5) | Good (4) | Satisfactory (3) | Needs Improvement (2) | Incomplete (0-1) | Marks |
|---|---|---|---|---|---|---|
| Final Working Project | Fully functional | Mostly functional | Partially functional | Limited functionality | Not functional | /5 |
| Live Demonstration | Confident, all features | Good, minor issues | Core features shown | Partial/unclear | No demonstration | /5 |
| Testing & Results Documentation | All tests + analysis | Most documented | Some documented | Minimal | None | /5 |
| Code Quality & Comments | Clean, structured, fully commented | Good, most commented | Works, lacks comments | Messy/partial | None | /5 |
| Markdown Documentation Quality (T2) | Complete professional README | Good with minor gaps | Most sections filled | Incomplete | Minimal/none | /5 |
| GitHub Commit History (T2) | Consistent, all members | Good, most members | Some commits | Few | None | /5 |
| Challenges & Solutions | All documented with solutions | Most documented | Some documented | Vague | Not documented | /5 |
| System Architecture (Final) | Updated, matches build | Mostly matches | Partially updated | Outdated | Not present | /5 |
| Presentation Quality | Professional, all members | Good, all contribute | Acceptable | Weak/incomplete | None | /5 |
| References & Attribution | All properly listed | Most listed | Some listed | Minimal | None | /5 |
| | | | | | | **T2 Total** | **/50** |

---

### 🏆 Final Mark Summary

| Term | Marks Available | Marks Achieved |
|---|---|---|
| T1 | 50 | /50 |
| T2 | 50 | /50 |
| **Total** | **100** | **/100** |

---

> 📌 **Assessed by:** `[Lecturer Name]`  
> 📅 **Presentation Date:** 20 May 2026, 10:00–15:00 (SAST)  
> 📅 **Final Submission Deadline:** 20 May 2026  
> 🏫 **Institution:** Cape Peninsula University of Technology (CPUT)

---

## 🖼️ Embedding Images in Your README

> 💡 This guide is for all groups — use it to add photos, diagrams, and screenshots to your README.

### Method 1: Upload images to the `images/` folder in your repo ✅ *(Recommended)*

1. In your repository, create a folder called `images/`
2. Upload your image files (`.jpg`, `.png`, `.gif`) into that folder
3. Reference them in your README using a **relative path**:

```markdown
![Alt text describing the image](images/your-image-filename.png)
```

**Example:**
```markdown
![Circuit Diagram](images/circuit_diagram.png)
![Build Step 1](images/build_step1.jpg)
![System Architecture](images/architecture_diagram.png)
```

---

### Method 2: Drag & Drop into a GitHub Issue or PR (then copy the link)

1. Open any **Issue** or **Pull Request** in your repo
2. Drag and drop your image into the text box — GitHub will auto-upload it
3. GitHub generates a URL like:
   ```
   https://user-images.githubusercontent.com/.../.../image.png
   ```
4. Copy that URL and paste it into your README:

```markdown
![My Image](https://user-images.githubusercontent.com/your-generated-link-here.png)
```

---

### Method 3: Use a full GitHub URL (after uploading to the repo)

If your image is already in the repo (e.g., `images/photo.jpg` on the `main` branch):

```markdown
![Photo](https://github.com/cput-it-diploma/cput-it-diploma-iot-project_2026-iot_elective_project_2026-IoT_2026/blob/main/images/photo.jpg?raw=true)
```

> ⚠️ Always add `?raw=true` at the end when using a full GitHub blob URL, otherwise the image won't render.

---

### ✅ Image Embedding Checklist

- [ ] Image file is uploaded to the `images/` folder in your repo
- [ ] File name has **no spaces** (use underscores: `circuit_diagram.png` ✅, not `circuit diagram.png` ❌)
- [ ] You used the correct Markdown syntax: `![Alt text](path/to/image.png)`
- [ ] The path is correct (check uppercase/lowercase — GitHub paths are case-sensitive)
- [ ] Image renders correctly when you preview the README

---

### 📐 Resizing Images (optional)

Markdown doesn't support resizing natively, but you can use HTML inside your README:

```html
<img src="images/circuit_diagram.png" alt="Circuit Diagram" width="600"/>
```

This sets the image width to 600px. Adjust as needed.

---

*Documented using Markdown on GitHub — CPUT IT Diploma IoT Elective 2026* 🚀
