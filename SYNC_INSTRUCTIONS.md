# Olami Dashboard - Cross-Device Sync Setup

To enable data synchronization across different devices (Admin Panel <-> TV Dashboard), this application uses **Firebase Firestore**.

## Prerequisites

1.  A Google account.
2.  Node.js installed (for local development).

## Setup Instructions

### 1. Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Name your project (e.g., `olami-dashboard`) and continue.
4.  Disable Google Analytics (not needed for this feature) and click **"Create project"**.

### 2. Create a Firestore Database

1.  In your new project dashboard, go to **"Build"** -> **"Firestore Database"** in the left sidebar.
2.  Click **"Create database"**.
3.  Choose a location (e.g., `eur3` or `us-central1`).
4.  Start in **Test mode** (allows read/write for 30 days).
    *   *Note: For production, you will need to update Security Rules.*

### 3. Get API Keys

1.  Click the **Gear icon** (Project Settings) next to "Project Overview".
2.  Scroll down to the **"Your apps"** section.
3.  Click the **Web** icon (`</>`).
4.  Register the app (nickname: `Olami Dashboard`).
5.  You will see a `firebaseConfig` object. Keep this tab open.

### 4. Configure Environment Variables

1.  In the root of your project code, create a file named `.env` (if it doesn't exist).
2.  Copy the values from your Firebase config into the file using the following format:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Deploy / Run

*   **Local Development**: Run `npm run dev`.
*   **Production**: If deploying to Vercel/Netlify, add these same Environment Variables in the hosting provider's dashboard.

### 6. Verify Sync

1.  Open the dashboard on one device/browser (e.g., http://localhost:3000).
2.  Open the admin panel on another device/browser.
3.  Add an event or news item.
4.  The dashboard should update instantly!
5.  In the Admin Panel header, you will see a green **"Cloud"** badge if sync is active.

---

## Troubleshooting

*   **"Running in local mode"**: This means the environment variables are missing or incorrect. Check your `.env` file.
*   **Data not saving**: Ensure your Firestore Security Rules allow writes (Test Mode).
