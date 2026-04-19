# VEDA

**Scan anything. Know if it's safe. In your language.**

One app. Photo a label, scan a barcode, photograph a pill, or type a name — VEDA tells you what every ingredient is, whether it's dangerous, and how it interacts with your medications. In Kannada, Telugu, Hindi, or English.

---

## Three Engines

| Engine | What it does |
|--------|-------------|
| **Toxicology Engine** | Identifies every ingredient in a product, checks PubChem safety data, rates hazard (carcinogen, endocrine disruptor, allergen) |
| **Interaction Engine** | Checks your full stack: prescription drugs + OTC + Ayurvedic herbs + supplements + food. Alerts on dangerous combinations. |
| **Pill ID Engine** | Identifies an unmarked tablet or capsule from a photo using Claude vision |

## Tech Stack

- **Backend**: Python FastAPI + PostgreSQL + Redis
- **AI**: Claude API (`claude-sonnet-4-6`) — reasoning, multilingual reports, pill ID
- **OCR**: Google Cloud Vision (Hindi ✓ Telugu ✓ Kannada ✓)
- **Chemistry**: PubChem PUG REST API (free)
- **Barcode**: Open Food Facts API (free, 4M+ products)
- **Mobile**: React Native (Expo)

## The Moat

**Ayurvedic herb-drug interaction database** — 15 major Indian herbs × 50+ drug classes with clinical effects, mechanisms, and management. This curated database doesn't exist in any app today.

Examples seeded:
- Shankhapushpi + Phenytoin → **MAJOR**: reduces phenytoin by 30-50%, seizure risk
- Turmeric + Warfarin → **MAJOR**: significant bleeding risk
- Neem + Metformin → **MAJOR**: severe hypoglycemia risk
- Ashwagandha + Thyroid meds → MODERATE: alters hormone levels
- Garlic + HIV antiretrovirals → **MAJOR**: reduces drug levels by 50%+

## Project Structure

```
veda/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/   # SQLAlchemy ORM
│   │   ├── routers/  # API endpoints
│   │   ├── services/ # OCR, PubChem, Claude, interaction engine
│   │   ├── schemas/  # Pydantic models
│   │   └── data/     # Seed data (herbs, interactions)
│   └── docker-compose.yml
└── mobile/           # React Native (Expo)
    ├── app/          # Expo Router screens
    ├── components/   # UI components
    ├── hooks/        # Language, stack, user hooks
    └── api/          # API client
```

## Running Locally

### Backend
```bash
cd backend
cp .env.example .env  # Fill in API keys
docker-compose up     # Starts API + Postgres + Redis
```

### Seed the database
```bash
python -m app.data.seed_db
```

### Mobile
```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

## API Keys Needed

| Key | Where to get |
|-----|-------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google Cloud Console — enable Vision API |

## API Endpoints

```
POST /scan/label       # Photo of product label
POST /scan/barcode     # Barcode number
POST /scan/pill        # Photo of pill
POST /scan/text        # Drug/herb/ingredient name

POST /stack/user       # Create user
GET  /stack/{id}       # Get stack
POST /stack/{id}/add   # Add item (with instant interaction check)
GET  /stack/{id}/interactions  # Full interaction report

GET  /drug/search?q=   # Search drugs
GET  /herb/search?q=   # Search herbs (EN/HI/KN/TE)
GET  /chemical/search/{name}  # Chemical safety lookup
```
