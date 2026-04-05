const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile, getPresignedUrl } = require("../config/r2Utils");

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

// Get presigned download URL
router.get("/download/:fileName", async (req, res) => {
  try {
    const url = await getPresignedUrl(req.params.fileName);
    res.json({ success: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Could not generate URL" });
  }
});

module.exports = router;