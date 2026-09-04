# ReflectAI - User-Authenticated AI Reflections & Journal

ReflectAI is an intelligent, secure personal reflection companion powered by **Google Gemini**, **Cloud Firestore**, and **Firebase Authentication**. Users can log in with Google, compose multi-turn journal reflections, receive contextual AI reframings and coaching, brainstorm action plans, and synthesize sessions—with all documents isolated strictly to their verified identity.

GitHub Repository: [https://github.com/MayurGawas23/ReflectAI.git](https://github.com/MayurGawas23/ReflectAI.git)

---

## Key Capabilities & Security Highlights

1. **User Identity & Federated Auth**:
   - Google Sign-In via Firebase Auth.
   - Eliminates direct handling or storage of raw passwords in custom application code.
2. **User Data Isolation (Zero Insecure Defaults)**:
   - All reflections and dialogue interactions are stored under `/users/{userId}/interactions/{interactionId}`.
   - Enforced by owner-bound Firestore Security Rules: `allow read, write: if request.auth != null && request.auth.uid == userId;`.
3. **Location-Aware Reflections (Google Maps Platform)**:
   - Interactive place pinning with device GPS detection, coordinates, and reflection sanctuary tags.
   - Grounded Gemini reframing that incorporates the atmospheric setting and peaceful environment into reflection responses.
   - Built using `@vis.gl/react-google-maps` with Map ID and Advanced Markers.
4. **Admin Telemetry & Role-Based Access Control (RBAC)**:
   - Separate admin registry path (`/admins/{adminId}`) protecting administrative capabilities.
   - Zero-Trust Privacy Guarantee: Firestore security rules strictly prohibit admins from accessing private reflection texts under `/users/{userId}/*`. Only aggregate anonymized metrics and model fleet statuses are visible in the console.
5. **External Notifications & Insights Dispatch**:
   - Outbound dispatch to Slack (BlockKit formatted), Discord (Rich Embeds), and generic REST webhooks.
   - Cryptographic HMAC-SHA256 signature verification headers (`X-ReflectAI-Signature`).
   - Privacy-sanitized payloads: only synthesized executive summaries, thematic tags, and action items are transmitted—raw dialogue content is never exposed.
6. **Resilient Server-Side Gemini API Proxy**:
   - `GEMINI_API_KEY` remains strictly on the server (never exposed to client bundles).
   - Automated Fallback Ladder (`gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-flash-latest` → `gemini-2.5-pro`) handling rate limits, transient downtime, and model failovers gracefully.
7. **Zero-Crash Payload Hygiene**:
   - Strict undefined-stripping before Firestore document persistence.

---

## 1. Prerequisites & Environment Setup

Ensure the following Google Cloud and Firebase tools are configured:

```bash
# Set your active GCP project ID
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export REGION="asia-east1" # Or your target region (e.g. us-central1)

gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup

Store your Gemini API key in **Google Cloud Secret Manager** and grant access to the Cloud Run runtime service account:

```bash
# 1. Create the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your secret version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Retrieve your project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# 4. Grant Cloud Run Service Account permission to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration (Firestore Rules)

Deploy the owner-bound security rules to ensure complete user isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

To deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Installation & Development

Follow these steps to run the application locally:

```bash
# 1. Clone the repository
git clone https://github.com/MayurGawas23/ReflectAI.git
cd ReflectAI

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and set your GEMINI_API_KEY
echo 'GEMINI_API_KEY="your-gemini-api-key"' > .env

# 4. Build and start the development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 5. Cloud Run Deployment Flow

Build and deploy directly to Google Cloud Run with automatic secret injection:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to Cloud Run
gcloud run deploy reflect-ai \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### Mandatory Verification Labeling:
```bash
gcloud run services update reflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=$REGION
```

---

## 6. Git & GitHub Setup Instructions

To push this codebase to your GitHub repository:

```bash
# Initialize git repository
git init -b main

# Configure author details
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Stage all files
git add .

# Commit changes
git commit -m "Initial commit: ReflectAI with Gemini, Firebase Auth, and Firestore"

# Add the remote repository
git remote add origin https://github.com/MayurGawas23/ReflectAI.git

# Push to GitHub (requires GitHub Personal Access Token or SSH key)
git push -u origin main
```

---

## 7. Verification & End-to-End Test Walkthrough

| Test Case | Step / Action | Expected Result |
| :--- | :--- | :--- |
| **TC-01: Authentication Landing** | Navigate to root URL without active session. | Landing page is displayed with feature summary pills and a "Continue with Google" sign-in button. |
| **TC-02: Google Sign-In Flow** | Click "Continue with Google" button. | Google OAuth popup triggers; after successful authentication, private dashboard opens showing user avatar and email. |
| **TC-03: New Reflection Initialization** | Click "New Journal Entry" in sidebar. | Blank conversation canvas opens with inspiration starter prompts. |
| **TC-04: Journal Submission & Gemini Reply** | Type reflection text into composer and click Send (or Ctrl+Enter). | User entry renders immediately; Gemini indicator animates; Gemini replies with contextual reframing; entry updates in sidebar history. |
| **TC-05: Mode Switching** | Select "Brainstorm" or "Synthesize" mode and send a follow-up. | Gemini tailors response to the selected cognitive framing style. |
| **TC-06: Session Synthesis** | Click "Synthesize Session" button. | Gemini generates an executive summary, theme tags, and concrete action steps displayed in a dedicated session card. |
| **TC-07: Firestore Persistence & Cross-Session Reload** | Refresh the browser tab. | Past journal sessions persist and appear in sidebar history with timestamps and summaries. |
| **TC-08: User Data Isolation** | Log out and sign in with a different Google account. | Previous user's reflection records are not visible; new user starts with a clean, isolated history. |
| **TC-09: Permanent Deletion** | Click the trash icon on a history item and confirm prompt. | The interaction is deleted from Firestore and immediately removed from the sidebar. |
| **TC-10: Sign Out** | Click the "Sign Out" button in top navigation. | Session clears and user is redirected to the authentication landing page. |

