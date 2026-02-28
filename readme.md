# My First Static Web App — Marathon

A React + Vite web app with an Express backend, deployable to Azure.

## Features

- React + Vite frontend with PWA support
- Express server with API endpoints
- **Upload Photo** — mobile-friendly image upload to Azure Blob Storage

## Upload Photo Feature

### How it works

1. The user picks an image file (JPEG, PNG, HEIC, or WebP, max 10 MB).
2. The frontend sends a `multipart/form-data` `POST` to `/api/photos`.
3. The Express server uploads the file directly to Azure Blob Storage.
4. A JSON record is returned and displayed in the UI.

### Azure Storage Setup

1. Create an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-create).
2. Create a Blob Storage container (e.g. `marathon-photos`).
3. Copy your connection string from **Access keys** in the Azure Portal.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AZURE_STORAGE_ACCOUNT_NAME` | Yes | Storage account name |
| `AZURE_STORAGE_CONTAINER_NAME` | Yes | Blob container name |
| `AZURE_STORAGE_CONNECTION_STRING` | Yes (dev) | Full connection string for local dev |

Create a `.env` file in the project root (never commit this file):

```env
AZURE_STORAGE_ACCOUNT_NAME=mystorageaccount
AZURE_STORAGE_CONTAINER_NAME=marathon-photos
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
```

> **Note:** In production, set these as app settings / environment variables on your hosting platform — never put storage keys in the browser bundle.

## Run Locally

```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# Start the server (reads .env automatically if you use dotenv or set vars in shell)
AZURE_STORAGE_ACCOUNT_NAME=... \
AZURE_STORAGE_CONTAINER_NAME=... \
AZURE_STORAGE_CONNECTION_STRING=... \
npm start
```

Then open <http://localhost:8080>.

For frontend development with HMR:

```bash
npm run dev
```

## Build & Lint

```bash
npm run build   # Vite production build → dist/
npm run lint    # ESLint
```

---

## React + Vite (original notes)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

