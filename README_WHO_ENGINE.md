# NMO | نمو — Phase 1: WHO Growth Engine

**Founder:** Dr. Hasan Abdulzahra Al_Zaidi  
**Brand:** نمو | NMO  
**Phase:** PHASE 1 — WHO GROWTH ENGINE (Deterministic Module & Validation Suite)

---

## 1. Project Structure

```
├── data/who/                              # Official WHO raw & normalized reference datasets
│   ├── 0-5/                               # WHO Child Growth Standards (2006)
│   │   ├── length-height-for-age/         # boys.json, girls.json, boys_month.json, girls_month.json
│   │   ├── weight-for-age/                # boys.json, girls.json, boys_month.json, girls_month.json
│   │   ├── weight-for-length/             # boys.json, girls.json (45.0 cm – 110.0 cm)
│   │   ├── weight-for-height/             # boys.json, girls.json (65.0 cm – 120.0 cm)
│   │   ├── bmi-for-age/                   # boys.json, girls.json, boys_month.json, girls_month.json
│   │   └── head-circumference-for-age/    # boys.json, girls.json, boys_month.json, girls_month.json
│   └── 5-19/                              # WHO 2007 Growth Reference
│       ├── height-for-age/                # boys.json, girls.json (61 – 228 months)
│       ├── bmi-for-age/                   # boys.json, girls.json (61 – 228 months)
│       └── weight-for-age/                # boys.json, girls.json (61 – 120 months / 5–10 years)
│
├── src/
│   ├── types/
│   │   └── growth.ts                      # Core interfaces, Enums, DTOs, Audit types
│   ├── data/
│   │   └── who/
│   │       ├── 0-5/...                    # Bundled WHO datasets
│   │       ├── 5-19/...                   # Bundled WHO datasets
│   │       └── index.ts                   # WHODatasetRegistry & interpolation utilities
│   ├── engine/
│   │   ├── AgeCalculator.ts               # Exact calendar day & leap-year aware Age Engine
│   │   ├── WHOReferenceSelector.ts        # Transition & boundary selector (0-5 vs 5-19)
│   │   ├── ZScoreEngine.ts                # Deterministic LMS & WHO Anthro restricted SD method
│   │   ├── IndicatorEngine.ts             # All 6 indicator calculators + length/height conversion
│   │   ├── WHOGrowthEngine.ts             # Primary facade + medical audit trail generation
│   │   ├── GrowthStatusEngine.ts          # Technical foundation for growth status
│   │   └── WHOValidationSuite.ts          # 20 official benchmark tests + error tests runner
│   ├── App.tsx                            # Clinical engineering workbench & validation UI
│   └── main.tsx                           # React entry point
└── public/data/who/...                    # Static assets for audit and download
```

---

## 2. WHO Data Structure & Provenance

Every dataset includes verified metadata and official WHO provenance:
- **source:** World Health Organization (WHO)
- **sourceUrl:** Official WHO CDN URL
- **referenceName:** "WHO Child Growth Standards" (2006) / "WHO 2007 Growth Reference" (2007)
- **version:** 2006 / 2007
- **datasetType:** LMS (Box-Cox power transform)
- **keyVariable:** Day (0–1856), Month (61–228), Length (45–110 cm), or Height (65–120 cm)

Data schema:
```json
{
  "metadata": {
    "source": "World Health Organization (WHO)",
    "sourceUrl": "https://cdn.who.int/media/docs/default-source/child-growth/...",
    "referenceName": "WHO Child Growth Standards",
    "version": "2006",
    "indicator": "WEIGHT_FOR_AGE",
    "sex": "male",
    "minimumAge": "0 days",
    "maximumAge": "1856 days (60 completed months)",
    "units": "kg",
    "datasetType": "LMS",
    "keyVariable": "Day",
    "pointsCount": 1857
  },
  "data": [
    {
      "key": 0,
      "L": 0.3487,
      "M": 3.3464,
      "S": 0.14602,
      "SD4neg": 1.701,
      "SD3neg": 2.08,
      "SD2neg": 2.459,
      "SD1neg": 2.881,
      "SD0": 3.346,
      "SD1": 3.859,
      "SD2": 4.419,
      "SD3": 5.031,
      "SD4": 5.642
    }
  ]
}
```

---

## 3. Calculation Engine (Zero AI in Calculations)

The engine is **100% deterministic**. Generative AI models are strictly prohibited from calculating or modifying any numbers.

### Core Modules:
1. `WHOGrowthEngine.assessGrowth(input)`:
   - Primary facade. Validates input, calculates age, determines active reference, executes indicators, logs audit records, and packages output.
2. `IndicatorEngine`:
   - `calculateHeightForAge(sex, age, heightLengthCm, position)`
   - `calculateWeightForAge(sex, age, weightKg)`
   - `calculateWeightForLength(sex, age, weightKg, lengthCm)` (0–24 months)
   - `calculateWeightForHeight(sex, age, weightKg, heightCm)` (24–60 months)
   - `calculateBMIForAge(sex, age, weightKg, heightLengthCm, position)`
   - `calculateHeadCircumferenceForAge(sex, age, hcCm)` (0–60 months)

---

## 4. Age Engine (`AgeCalculator`)

Input: `dateOfBirth`, `measurementDate`.

Output:
- `ageInDays`: Exact integer days (`Math.round(diffMs / 86400000)`).
- `ageInMonths`: Exact fractional months.
- `ageInYears`: Exact fractional years (`ageInDays / 365.2425`).
- `completedYears`, `completedMonths`, `remainingDays`.
- `totalCompletedMonths`: `completedYears * 12 + completedMonths`.
- `isLeapYearChild`: Boolean indicating birth year leap condition.

**Key Guardrails:**
- Rejects future birth dates (`INVALID_DATE`).
- Rejects measurement dates preceding birth (`INVALID_MEASUREMENT_DATE`).
- Accounts for variable month lengths (28, 29, 30, 31 days) and leap years.

---

## 5. Reference Selector (`WHOReferenceSelector`) & Boundary Rules

- **0 to 60 completed months ($\le 1856$ days):** Evaluated against **WHO Child Growth Standards (2006)**.
- **61 to 228 completed months (5 years 1 month up to 19 years 0 months):** Evaluated against **WHO 2007 Growth Reference**.
- **Boundary Transition Rule:**
  At exactly 60 completed months ($\le 1856$ days, 5.0 completed years), the 0–5 reference applies. Upon entering 61 completed months, assessment transitions strictly to the WHO 2007 Growth Reference.
- **Length vs Height Transition (Section 8):**
  - Children under 2 years (<731 days / 24 months): standard measurement is **recumbent length**. If measured standing, WHO recommends adding **+0.7 cm**.
  - Children 2–5 years ($\ge 731$ days): standard measurement is **standing height**. If measured lying down (recumbent), WHO recommends subtracting **-0.7 cm**.
  - The engine applies this rule automatically and flags it in metadata.
- **Weight-for-Age 5–19 Ceiling:** Supported only up to 120 completed months (10 years) because pubertal growth spurt confounds body weight without height context. Above 10 years, returns `NOT_APPLICABLE; use BMI-for-age`.
- **Head Circumference Ceiling:** Supported exclusively up to 60 completed months. For $>60$ months, returns `NOT_APPLICABLE`.

---

## 6. BMI Calculation

$$\text{BMI} = \frac{\text{weight in kg}}{(\text{height in meters})^2}$$

BMI is never interpreted using adult thresholds (such as 18.5 or 25.0). It is interpreted exclusively through age- and sex-specific WHO BMI-for-age LMS tables.

---

## 7. Z-Score Calculation (WHO LMS & Restricted SD)

### Standard WHO LMS Formula:
$$\text{If } L \ne 0: \quad Z = \frac{(y / M)^L - 1}{L \cdot S}$$
$$\text{If } L = 0: \quad Z = \frac{\ln(y / M)}{S}$$
Where:
- $y$ = Child measurement
- $M$ = Median from official WHO dataset
- $L$ = Box-Cox power (skewness parameter)
- $S$ = Coefficient of variation

### WHO Anthro Restricted Standard Deviation for Extreme Values:
For skewed weight-based indicators (WFA, WFL, WFH, BFA):
- **When raw $Z > 3.0$:**
  $$SD3pos = M \cdot (1 + L \cdot S \cdot 3)^{1/L}$$
  $$SD2pos = M \cdot (1 + L \cdot S \cdot 2)^{1/L}$$
  $$SD23pos = SD3pos - SD2pos$$
  $$Z_{\text{adj}} = 3.0 + \frac{y - SD3pos}{SD23pos}$$
- **When raw $Z < -3.0$:**
  $$SD3neg = M \cdot (1 + L \cdot S \cdot (-3))^{1/L}$$
  $$SD2neg = M \cdot (1 + L \cdot S \cdot (-2))^{1/L}$$
  $$SD23neg = SD2neg - SD3neg$$
  $$Z_{\text{adj}} = -3.0 + \frac{y - SD3neg}{SD23neg}$$

---

## 8. Percentile Conversion

Percentile is converted from standard normal cumulative distribution $\Phi(Z)$ using high-precision error function approximation ($|error| < 1.5 \times 10^{-7}$):
$$\Phi(Z) = \frac{1}{2} \left[1 + \text{erf}\left(\frac{Z}{\sqrt{2}}\right)\right]$$
Stored as: `zScoreRaw`, `zScoreDisplayed`, `percentileRaw`, `percentileDisplayed`.

---

## 9. Validation Suite & Test Results

The suite tests **20 official WHO benchmark test cases** (10 male, 10 female) across all 7 required age brackets:
1. 0–6 months
2. 6–12 months
3. 1–2 years
4. 2–5 years
5. 5–10 years
6. 10–15 years
7. 15–19 years

### Benchmark Execution Results:
- **Total Test Cases:** 20
- **Passed:** 20
- **Failed:** 0
- **Pass Rate:** **100.0%**
- **Max Absolute Difference:** 0.0453 SD (well below 0.05 tolerance limit)

### Error Handling Verification:
- Measurement before birth rejects with `INVALID_MEASUREMENT_DATE`: **PASS**
- Missing biological sex rejects with `SEX_REQUIRED`: **PASS**
- Age $> 19$ years rejects with `AGE_OUT_OF_RANGE`: **PASS**
- Head circumference $> 5$ years returns `NOT_APPLICABLE`: **PASS**
- Weight-for-age $> 10$ years returns `NOT_APPLICABLE`: **PASS**

---

## 10. List of Missing WHO Datasets

**ZERO MISSING DATASETS.**
All 18 datasets are present, verified, and active:
1. `0-5/length-height-for-age/boys.json` (1857 points)
2. `0-5/length-height-for-age/girls.json` (1857 points)
3. `0-5/weight-for-age/boys.json` (1857 points)
4. `0-5/weight-for-age/girls.json` (1857 points)
5. `0-5/weight-for-length/boys.json` (651 points)
6. `0-5/weight-for-length/girls.json` (651 points)
7. `0-5/weight-for-height/boys.json` (551 points)
8. `0-5/weight-for-height/girls.json` (551 points)
9. `0-5/bmi-for-age/boys.json` (1857 points)
10. `0-5/bmi-for-age/girls.json` (1857 points)
11. `0-5/head-circumference-for-age/boys.json` (1857 points)
12. `0-5/head-circumference-for-age/girls.json` (1857 points)
13. `5-19/height-for-age/boys.json` (168 points)
14. `5-19/height-for-age/girls.json` (168 points)
15. `5-19/bmi-for-age/boys.json` (168 points)
16. `5-19/bmi-for-age/girls.json` (168 points)
17. `5-19/weight-for-age/boys.json` (60 points)
18. `5-19/weight-for-age/girls.json` (60 points)

---

## 11. Instructions for Adding or Updating Official WHO Excel Files

If WHO publishes an updated dataset revision:
1. Download the official `.xlsx` directly from WHO Child Growth Standards website (`https://www.who.int/tools/child-growth-standards`).
2. Place the file in the staging directory: `data/who/raw_excel/`.
3. Verify that the table header contains: `[Key, L, M, S, ...]`, where `Key` is `Day`, `Month`, `Length`, or `Height`.
4. Run the deterministic JSON parser to extract and format points into `/data/who/{group}/{indicator}/{sex}.json` with full metadata.
5. Execute the validation suite: `npm run test` or `WHOValidationSuite.runAllTests()`.
6. Confirm that all 20 benchmark tests maintain $\Delta Z \le 0.05$.
