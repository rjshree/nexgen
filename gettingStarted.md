# Getting Started

## Overview

This is a **Next.js** application with **Azure AD SSO** authentication and a **Material UI** dashboard that communicates with a Django REST API backend.

---

## Architecture & Workflow

```
pages/index.js
  └── MsalProvider (Azure AD SSO)
        └── AuthenticatedTemplate
              └── DashboardComponent.jsx
                    └── dashBoardAPI.js
                          └── GET http://localhost:8000/api/v1/dashboard/
                                (Authorization: Bearer <access_token>)
```

### 1. Entry Point — `pages/index.js`

- Wraps the app in `<MsalProvider>` using the MSAL instance from `authConfig.js`.
- Uses `<AuthenticatedTemplate>` to render content only after login.
- Unauthenticated users are redirected to Azure AD login.

### 2. Auth Configuration — `src/config/authConfig.js`

| Export             | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `msalConfig`       | MSAL browser config (clientId, authority, redirectUri)|
| `msalInstance`     | Singleton `PublicClientApplication` instance          |
| `loginRequest`     | Scopes for login (`User.Read`)                       |
| `apiRequest`       | Scopes for backend API (`api://<apiClientId>/Admin`)  |
| `API_SCOPE_READ`   | Scope string used when acquiring tokens for API calls |
| `initializeMSAL()` | Initializes MSAL — must be called before rendering    |

**Environment variables required** (in `.env` or `.env.local`):

```env
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<your-ui-client-id>
NEXT_PUBLIC_AZURE_API_CLIENT_ID=<your-api-client-id>
NEXT_PUBLIC_AZURE_REDIRECT_URI=https://localhost:3000
```

### 3. Dashboard Component — `src/components/dashboard/DashboardComponent.jsx`

- Uses `useMsal()` hook to get the current account.
- On mount, acquires a token silently via `instance.acquireTokenSilent()`.
- Passes the access token to `fetchDashboardData(token)`.
- Populates state for filters, charts (Bar, Pie, Line), and a DataGrid table.
- Supports client-side filtering by **Region**, **Year**, and **Route**.

### 4. API Layer — `src/components/dashboard/dashBoardAPI.js`

```javascript
export async function fetchDashboardData(token) {
  const res = await fetch("http://localhost:8000/api/v1/dashboard/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}
```

**Expected API response:**

```json
{
  "filters": {
    "regions": ["AF", "EU1", "FEA"],
    "years": ["2026", "2027"],
    "routes": ["BKK/HKG", "JED"]
  },
  "tableRows": [
    { "id": 1, "route": "BKK/HKG", "origin": "DXB", ... }
  ],
  "regionChartData": [{ "name": "FEA", "value": 85 }],
  "statusPieData": [{ "name": "Active", "value": 180, "color": "#4CAF50" }],
  "monthlyTrendData": [{ "name": "Jan", "active": 30, "expired": 10, "rejected": 5 }]
}
```

### 5. Token Flow

```
User opens app
  → MSAL checks session → if not logged in → redirect to Azure AD
  → User authenticates → redirect back with auth code
  → MSAL exchanges code for tokens (cached in sessionStorage)
  → Component calls acquireTokenSilent({ scopes: [API_SCOPE_READ] })
  → Token sent as Bearer header to Django API
  → Django validates token and returns data
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- Azure AD App Registration with:
  - UI client ID (`NEXT_PUBLIC_AZURE_AD_CLIENT_ID`)
  - API client ID (`NEXT_PUBLIC_AZURE_API_CLIENT_ID`)
  - Redirect URI set to `https://localhost:3000`

---

## Setup

```bash
# Clone and navigate
cd ro-apps-cs-ui

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Azure AD values
```

---

## Run — Development

```bash
npm run dev
```

- Starts Next.js with experimental HTTPS on **https://localhost:3000**
- Expects the API backend running on **http://localhost:8000**

---

## Run — Production

```bash
# Build
npm run build

# Start
npm run start
```

---

## Key Files

| File | Description |
|------|-------------|
| `pages/index.js` | App entry, MSAL provider wrapper |
| `src/config/authConfig.js` | Azure AD MSAL config, scopes, instance |
| `src/components/dashboard/DashboardComponent.jsx` | Main dashboard with charts, filters, grid |
| `src/components/dashboard/dashBoardAPI.js` | API fetch layer with Bearer token |
| `.env.local` | Environment variables (not committed) |
| `next.config.js` | Next.js configuration |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `AADSTS50011: reply URL mismatch` | Ensure `NEXT_PUBLIC_AZURE_REDIRECT_URI` matches Azure portal |
| `acquireTokenSilent failed` | User session expired — falls back to `acquireTokenPopup` |
| `CORS error on API call` | Add `https://localhost:3000` to Django `CORS_ALLOWED_ORIGINS` |
| `ERR_CERT_AUTHORITY_INVALID` | Accept the self-signed cert in browser |
| `EADDRINUSE :3000` | Kill the process using port 3000: `npx kill-port 3000` |