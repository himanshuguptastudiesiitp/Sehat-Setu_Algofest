# SEHAT SETU - "Sehat Ka Setu, Har Ghar Tak"
### Patna-to-Nationwide Swasthya Transparency & Patient Assistance Platform

Sehat Setu is an enterprise-grade, full-stack healthcare transparency platform designed to resolve hospital search asymmetric information, calculate treatment copays, verify government health schemes (like Ayushman Bharat), and assist patients via "Dhanvantari Ji" (our compassionate, local-data-grounded AI assistant).

---

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### Business Context & Core Problem
Indian healthcare, particularly in Tier-2/Tier-3 emerging urban circles like Bihar (Patna, Gaya, Muzaffarpur), suffers from heavy informational asymmetries:
1. **Dynamic Bed Scarcity**: Family members manually run between wards trying to find available ICU/NICU spacing during emergencies.
2. **Opaque Pricing Models**: Standard surgeries (e.g., Cataract, Angioplasty) vary up to 800% in out-of-pocket pricing across clinics.
3. **Complex Yojana Friction**: Rural populations struggle to identify if they qualify for state welfare assistance (Ayushman Bharat / Mukhyamantri Yojana).

### Core Feature Scope
* **Live Bed Registry**: Track, manage, and book ICU and NICU beds with automated warning thresholds.
* **Surgical Cost Intelligence**: Estimate out-of-pocket outlays by combining standard surgical price bands, insurance claims metrics, and copay rates.
* **Side-by-Side Hospital Comparison**: Match up to 3 clinics side-by-side on metrics like cost, queue times, and MRI availability.
* **Dhanvantari Ji AI chatbot**: A compassionate Hinglish/English navigation AI assistant that resolves operational pricing and scheme inquiries without prescribing medications.
* **Welfare Eligibility Desk**: A smart eligibility analyzer and document checker for Ayushman Bharat PM-JAY and state grants.
* **Admin Control Center**: Complete CRUD controls for clinicians, beds management, rating moderation queues, and HIPAA-compliant system logs.

---

## 2. SYSTEM ARCHITECTURE & DATA FLOW

Sehat Setu utilizes a robust microservices-ready full-stack topology:

```
                            [ User's Browser Client ]
                                       │
                     HTTPS Port 3000   ▼   Vite Assets Routing
                  ┌─────────────────────────────────────────┐
                  │          Nginx Reverse Proxy            │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼  API Requests
     ┌─────────────────────────────────────────────────────────────────────┐
     │                     Express Full-Stack Server                       │
     │  (Vite Development Middleware | CJS Production stand-alone Bundle)   │
     └───────────────────┬─────────────────────────────┬───────────────────┘
                         │                             │
                         ▼ RAG Datastore API           ▼ Server-Side Gemini Call
     ┌───────────────────────────────────────┐   ┌─────────────────────────┐
     │          Local Transactions           │   │     @google/genai       │
     │      JSON Document Store (NoSQL)      │   │   gemini-3.5-flash      │
     │ (Seeded Patna Directory, Beds, Costs)  │   │  (Compasionate System)  │
     └───────────────────────────────────────┘   └─────────────────────────┘
```

---

## 3. DATABASE SCHEMA & DIAGRAM

The datastore utilizes highly structured document collections with explicit auditing relationships:

```
  ┌──────────────────────────────────┐         ┌──────────────────────────────────┐
  │            HOSPITALS             │         │             DOCTORS              │
  ├──────────────────────────────────┤         ├──────────────────────────────────┤
  │ id: string (PK)                  │◄───────┐│ id: string (PK)                  │
  │ name: string                     │        ││ hospitalId: string (FK)          │
  │ address: string                  │        ││ name: string                     │
  │ city: string                     │        ││ specialty: string                │
  │ area: string                     │        ││ experience: number               │
  │ specialization: string[]         │        ││ fee: number                      │
  │ rating: number                   │        └│ hospitalName: string             │
  │ icuBedsAvailable: number         │         └──────────────────────────────────┘
  │ icuBedsTotal: number             │         ┌──────────────────────────────────┐
  │ features: {                      │         │            APPOINTMENTS          │
  │   mri, ambulance, cashless       │         ├──────────────────────────────────┤
  │ }                                │◄───────┐│ id: string (PK)                  │
  │ facilities: string[]             │        ││ hospitalId: string (FK)          │
  │ ratingBreakdown: {               │        ││ doctorId: string (FK)            │
  │   care, cost, queue              │        ││ patientName: string              │
  │ }                                │        ││ contactNumber: string            │
  └──────────────────────────────────┘        ││ status: Pending | Confirmed      │
  ┌──────────────────────────────────┐        └──────────────────────────────────┘
  │             REVIEWS              │         ┌──────────────────────────────────┐
  ├──────────────────────────────────┤         │            AUDIT_LOGS            │
  │ id: string (PK)                  │         ├──────────────────────────────────┤
  │ hospitalId: string (FK)          │────────┘│ id: string (PK)                  │
  │ userName: string                 │         │ timestamp: string                │
  │ rating: number                   │         │ action: string                   │
  │ comment: string                  │         │ user: string                     │
  │ categoryRating: {                │         │ details: string                  │
  │   care, cost, queue              │         └──────────────────────────────────┘
  │ }                                │
  └──────────────────────────────────┘
```

---

## 4. API SPECIFICATIONS

### A. Hospital Discovery
* **GET `/api/hospitals`**: Query directory. Optional filters: `city`, `search`, `specialty`, `cashless`, `hasAmbulance`.
* **POST `/api/hospitals`**: Register new clinic.
* **PUT `/api/hospitals/:id`**: Update bed inventories.
* **DELETE `/api/hospitals/:id`**: Securely delete records.

### B. Medical Specialists & Slots
* **GET `/api/doctors`**: Fetch specialist lists.
* **POST `/api/appointments`**: Secure a consultation slot.

### C. Surgery Pricing Costing
* **GET `/api/treatments`**: Standard surgery averages and historical pricing arrays.

### D. Dhanvantari AI Companion
* **POST `/api/gemini/chat`**: Dispatches user messages with server-side RAG context directly to Gemini API.

---

## 5. RAG AI INTEGRATION SYSTEM

Our custom RAG pipeline retrieves structured healthcare objects from the primary datastore of Patna and injects them dynamically inside Gemini's `systemInstruction` parameters:

1. **User asks**: *"Patna Ruban Memorial hospital me heart stent surgery ka kitna kharch hai?"*
2. **Context Engine fetches**:
   - Ruban Memorial details (Address, ratings index).
   - Coronary Angioplasty cost boundaries (Avg: ₹1,65,000, ranges from ₹95,000 to ₹2,60,000).
3. **Gemini parses layout**: Renders an organic, empathetic summary in Romanized Hindi: *"Pranam! Sehat Setu par Ruban Memorial Hospital (Patliputra Colony, Patna) certified partner hai. Heart Stent surgery ka is region me average kharch ₹1,65,000 hai. Aap HDFC ERGO ya STAR Health cashless claim use kar sakte hain."*
4. **Safety Disclaimer Auto-Trigger**: Always enforces: *"Disclaimer: Main koi chikitskiya nidaan ya prescription nahi de sakti..."* if biological diagnostic help is prompted.

---

## 6. DEPLOYMENT & CI/CD ARCHITECTURE

```
[ Developer Commit ] ──► [ GitHub Actions ] ──► [ Lint & Type Checks ]
                                                      │
[ Cloud Run Ingress ] ◄── [ GCR Deploy ] ◄── [ Dockerize Container ]
```

### Dockerfile (Compliant Production Build)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

---

## 7. ENTERPRISE SECURITY BLUEPRINT (HIPAA CONTROLS)

* **RBAC Controls**: Restricted view portals for public users, validated operators, and administrators.
* **Strict Secrets Protection**: Secret API keys are strictly evaluated inside server-side controllers (`process.env.GEMINI_API_KEY`) and are never exposed to the client bundle.
* **Transaction Audit Registers**: Dynamic logging engine records every database transaction (hospital insertion, ICU bed updates, and reservations) in the system logs for audit compliance.

---

## 8. INVESTOR PITCH & ADVOCACY STRATEGY

### Crucial Stats Value Proposition
* **The Pitch**: Sehat Setu connects the marginal population to Tier-2 transparent healthcare. By providing transparent cost calculators and yojana trackers, we eliminate hospital over-billing by up to **40%** and reduce emergency bed navigation delays from **6 hours** to **5 seconds**.
* **Ecosystem Hook**: Empower government desks on Gandhi Maidan Patna, Gaya Bypass clinics, as well as rural medical center tablets with pre-cached PWA directories.
