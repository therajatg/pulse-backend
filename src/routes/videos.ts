import express, { Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import VideoModel from "../models/Video";
import { protect, authorize, AuthRequest } from "../middleware/auth";
import { processVideo } from "../utils/VideoProcessor";

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Upload video - only editors and admins
router.post(
  "/upload",
  protect,
  authorize("editor", "admin"),
  upload.single("video"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }

      const { title } = req.body;

      if (!title) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Title is required" });
      }

      // Create video entry
      const video = await VideoModel.create({
        title,
        filename: req.file.filename,
        originalName: req.file.originalname,
        userId: req.user!._id,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: "processing",
      });

      // Start processing in background
      processVideo(video._id.toString());

      res.status(201).json({
        message: "Video uploaded successfully",
        video: {
          _id: video._id,
          title: video.title,
          status: video.status,
          sensitivity: video.sensitivity,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status, sensitivity } = req.query;

    const query: any = { userId: req.user!._id };

    if (status) query.status = status;
    if (sensitivity) query.sensitivity = sensitivity;

    const videos = await VideoModel.find(query)
      .select("-__v")
      .sort({ uploadedAt: -1 });

    res.json({ videos });
  } catch (error: any) {
    console.error("Fetch videos error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Stream video with range requests
router.get("/stream/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const video = await VideoModel.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user owns the video (unless admin)
    if (
      req.user!.role !== "admin" &&
      video.userId.toString() !== req.user!._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this video" });
    }

    // Check if video is ready for streaming
    if (video.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Video is not ready for streaming" });
    }

    const videoPath = path.join(__dirname, "../../uploads", video.filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": video.mimeType,
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": video.mimeType,
      });

      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error: any) {
    console.error("Stream video error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single video details
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const video = await VideoModel.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user owns the video (unless admin)
    if (
      req.user!.role !== "admin" &&
      video.userId.toString() !== req.user!._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this video" });
    }

    res.json({ video });
  } catch (error: any) {
    console.error("Get video error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
