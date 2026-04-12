const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { uploadFile } = require("../config/r2Utils");
const { r2Client, bucket } = require("../config/r2");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Upload attachment
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const fileName = `${Date.now()}-${originalname}`;
    await uploadFile(buffer, fileName, mimetype);
    res.json({ success: true, fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// Stream file directly from R2 to the client
router.get("/download/:fileName", async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.fileName);
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await r2Client.send(command);

    const mimeType = response.ContentType || "application/octet-stream";
    const inline = /^(image\/|video\/|audio\/|text\/plain$|application\/pdf$)/.test(mimeType);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `${inline ? "inline" : "attachment"}; filename="${key.split("/").pop()}"`);
    if (response.ContentLength) res.setHeader("Content-Length", response.ContentLength);

    response.Body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Could not download file" });
  }
});

module.exports = router;