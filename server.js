import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Vite build output
const distPath = path.join(__dirname, "dist");

// Allowed image MIME types
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/webp",
]);

// Multer: memory storage, 10 MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// In-memory photo store (TODO: replace with DB persistence)
const photoStore = [];

// POST /api/photos — upload a photo to Azure Blob Storage
app.post("/api/photos", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo file provided." });
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!accountName || !containerName || !connectionString) {
    return res.status(500).json({
      error:
        "Azure Storage is not configured. Set AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_CONTAINER_NAME, and AZURE_STORAGE_CONNECTION_STRING.",
    });
  }

  try {
    const parts = req.file.originalname.split(".");
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
    if (!ext) {
      return res.status(400).json({ error: "Could not determine file extension from filename." });
    }
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const blobName = `photos/${yyyy}/${mm}/${dd}/${uuidv4()}.${ext}`;

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    const uploadedAt = now.toISOString();
    const id = uuidv4();

    const record = {
      id,
      blobName,
      urlOrSignedUrl: blobUrl,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedAt,
    };

    photoStore.push(record);

    return res.status(201).json(record);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed.", detail: err.message });
  }
});

// Multer error handler
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith("Unsupported")) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error." });
});

app.use(express.static(distPath));

// SPA fallback (so /about, /dashboard, etc. work)
// IMPORTANT: use a regex instead of "*" to avoid path-to-regexp errors
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
