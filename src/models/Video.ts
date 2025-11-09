import mongoose, { Document, Schema, Types } from "mongoose";

export interface Video extends Document {
  _id: Types.ObjectId;
  title: string;
  filename: string;
  originalName: string;
  userId: mongoose.Types.ObjectId;
  status: "uploading" | "processing" | "completed" | "failed";
  sensitivity: "safe" | "flagged" | "pending";
  fileSize: number;
  duration?: number;
  mimeType: string;
  uploadedAt: Date;
}

const videoSchema = new Schema<Video>({
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["uploading", "processing", "completed", "failed"],
    default: "uploading",
  },
  sensitivity: {
    type: String,
    enum: ["safe", "flagged", "pending"],
    default: "pending",
  },
  fileSize: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
  },
  mimeType: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<Video>("Video", videoSchema);
