# Design – Forsvarets visuelle identitet

This document describes the design assets available in the `design/` folder and how to use them in the application.

---

## Fargepalett

The official Forsvaret colour palette is defined in `design/FARGEPALETT/Forsvarets farger.pdf`. Use the link in `Forsvarets farger (lenke).webloc` to access the online brand portal.

Primary colours used across the Forsvaret identity:

| Token            | Hex       | Usage                          |
| ---------------- | --------- | ------------------------------ |
| `--fv-green`     | `#4a5c38` | Primary brand / backgrounds    |
| `--fv-dark`      | `#1c2212` | Dark text / hero backgrounds   |
| `--fv-sand`      | `#c8b99a` | Secondary / warm accent        |
| `--fv-light`     | `#f5f2ed` | Page backgrounds               |
| `--fv-white`     | `#ffffff` | Reversed text and icons        |
| `--fv-black`     | `#000000` | Body text / dark icons         |

> **Note:** Verify exact hex values against the official PDF or brand portal before shipping to production.

---

## Typografi

Forsvaret font files are located in `design/TYPOGRAFI/FORSVARET/`.

| File            | Weight / Style | CSS `font-weight` |
| --------------- | -------------- | ----------------- |
| `FORSLGT_.ttf`  | Light          | 300               |
| `FORSARR_.ttf`  | Regular        | 400               |
| `FORSMED_.ttf`  | Medium         | 500               |
| `FORSBLD.ttf`   | Bold           | 700               |

### Usage example

```css
@font-face {
  font-family: "Forsvaret";
  src: url("/fonts/FORSLGT_.ttf") format("truetype");
  font-weight: 300;
}

@font-face {
  font-family: "Forsvaret";
  src: url("/fonts/FORSARR_.ttf") format("truetype");
  font-weight: 400;
}

@font-face {
  font-family: "Forsvaret";
  src: url("/fonts/FORSMED_.ttf") format("truetype");
  font-weight: 500;
}

@font-face {
  font-family: "Forsvaret";
  src: url("/fonts/FORSBLD.ttf") format("truetype");
  font-weight: 700;
}
```

---

## Logoer

Logo files are organised by intended medium.

### Skjerm (screen – RGB)

Located in `design/LOGOVARIANTER/Logo Skjerm/`. Use PNG or EPS for digital surfaces.

| File                                               | Layout      | Colour  |
| -------------------------------------------------- | ----------- | ------- |
| `Forsvaret_logo_venstre_stilt_RGB_slagord_sort.png` | Left-align  | Black   |
| `Forsvaret_logo_venstre_stilt_RGB_slagord_hvit.png` | Left-align  | White   |
| `Forsvarets_logo_midtstilt_RGB_slagord_sort.png`    | Centred     | Black   |
| `Forsvarets_logo_midtstilt_RGB_slagord_hvit.png`    | Centred     | White   |

### Trykk (print – CMYK / PMS / B&W)

Located in `design/LOGOVARIANTER/Logo Trykk/`. EPS files for offset and digital print.

Variants available per layout:
- `cmyk` – four-colour process
- `PMS` – Pantone spot colour
- `sorthvit` – black and white

### Sosiale medier (social media)

Located in `design/LOGOVARIANTER/Logoer SoMe/`.

| File                                   | Use                  |
| -------------------------------------- | -------------------- |
| `Forsvarets_logo_midtstilt_RGB.jpg`    | General social share |
| `forsvaret_facebook_profilbilde.jpg`   | Facebook profile     |
| `forsvaret_instagram_profilbilde.jpg`  | Instagram profile    |

---

## Ikoner

A library of **~140 icons** is available in three formats:

| Folder                        | Format | Background |
| ----------------------------- | ------ | ---------- |
| `design/IKONER/SVG sort/`     | SVG    | Dark (sort) |
| `design/IKONER/PDF sort/`     | PDF    | Dark (sort) |
| `design/IKONER/PDF hvit/`     | PDF    | Light (hvit) |

An overview spread is in `design/IKONER/Ikoner Oversikt.pdf`. A PowerPoint source file is available at `design/IKONER/ikoner.pptx`.

Icons are grouped alphabetically (A–N), 15 per group. Selected icons by category:

**Militær / forsvar**
`A1 fallskjerm`, `A4 soldat`, `A10 stridsvogn`, `A15 kamphelikopter`, `B2 fly`, `B12 poseidon`, `D11 sverd krysslagt`, `K9 ubåt`, `K10 rakett`, `L6 manøver`, `L7 håndvåpen`, `M5 anker`, `M7 atom`, `M8 eksplosjon`

**Kommunikasjon / teknologi**
`A2 brev`, `A9 dialog`, `B4 mobil chat`, `E2 radar`, `F3 telefon`, `F7 mobil`, `F9 laptop`, `G1 wifi`, `G2 pc desktop`, `J1 dialog`, `M1 sonar`, `M6 headset`, `N2 drone`, `N3 antenne`, `N9 satellitt`

**Logistikk / transport**
`A3 båt`, `C11 truck`, `C12 container tog`, `C13 container kran`, `C14 roro`, `C15 container bil`, `D7 lastebil side`, `D10 lastebil`, `E1 bil`, `E6 kart`, `K4 eske`

**Helse / beredskap**
`C8 stetoskop`, `D15 pandemi munn test`, `E11 pandemi nese test`, `E12 hoste`, `G11 termometer`, `G12 sprøyte`, `G13 munnbind`, `J5 beskyttelse`, `J6 livbøye`, `N6 sanitet`, `N8 advarsel`

**Natur / miljø**
`E3 sky`, `E15 snøskred`, `F11 ras`, `F12 skogbrann`, `F13 lyn`, `F14 vind`, `F15 tåke`, `G10 fjell`, `G14 oljesøl`, `I9 grantre`, `L9 snøkrystall`, `N10 blomst`

### Using SVG icons

```tsx
// Example – inline SVG via Vite import
import FallskjermIcon from "/design/IKONER/SVG sort/Forsvaret ikoner_A1 fallskjerm.svg?react";

<FallskjermIcon className="w-6 h-6" />
```

---

## Illustrasjoner

An overview of all illustration sets is in `design/ILLUSTRASJONER/Plansjer.pdf`.

### Isometriske illustrasjoner

Located in `design/ILLUSTRASJONER/mat_Isometriske/`.

| Subfolder | Style              |
| --------- | ------------------ |
| `color/`  | Full colour        |
| `line/`   | Line / outline     |

Subjects include land vehicles (CV90, Amaroc, K9, M109, Scania), aircraft (F-35, C-130, P-8), naval (frigate, corvette, submarine, coast guard), space assets (satellite, dish, dome), weapons (HK416, Glock P80, Minimi), and personnel.

### Profiler (personnel illustrations)

Located in `design/ILLUSTRASJONER/mat_Profiler/`.

| Subfolder | Background     |
| --------- | -------------- |
| `light/`  | Light / white  |
| `gray/`   | Grey           |
| `dark/`   | Dark           |

Personnel types: soldiers, specialists, technicians, military police, medics, civilians.

### Material-ikoner

Located in `design/ILLUSTRASJONER/mat_Ikoner/`.

| Subfolder | Background |
| --------- | ---------- |
| `light/`  | Light      |
| `dark/`   | Dark       |

---

## Videoer

Forsvaret video templates are referenced in `design/Forsvarets videomaler (lenke).webloc`.

---

## Eksterne lenker

- **Fargepalett:** `design/FARGEPALETT/Forsvarets farger (lenke).webloc`
- **Videoer:** `design/Forsvarets videomaler (lenke).webloc`
