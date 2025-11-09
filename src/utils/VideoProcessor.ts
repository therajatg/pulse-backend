import VideoModel from "../models/Video";
import { getIO } from "../server";

export const processVideo = async (videoId: string) => {
  try {
    const io = getIO();
    const video = await VideoModel.findById(videoId);

    if (!video) {
      console.error("Video not found:", videoId);
      return;
    }

    // Emit processing started
    io.to(video.userId.toString()).emit("video:processing", {
      videoId: video._id,
      status: "processing",
      progress: 0,
    });

    const progressSteps = [25, 50, 75];

    for (const progress of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds per step

      io.to(video.userId.toString()).emit("video:progress", {
        videoId: video._id,
        progress,
      });
    }

    const sensitivity = Math.random() > 0.8 ? "flagged" : "safe";

    video.status = "completed";
    video.sensitivity = sensitivity;
    await video.save();

    io.to(video.userId.toString()).emit("video:completed", {
      videoId: video._id,
      status: "completed",
      sensitivity,
      progress: 100,
    });

    console.log(`Video processed: ${videoId} - ${sensitivity}`);
  } catch (error) {
    console.error("Video processing error:", error);

    try {
      const video = await VideoModel.findById(videoId);
      if (video) {
        video.status = "failed";
        await video.save();

        const io = getIO();
        io.to(video.userId.toString()).emit("video:failed", {
          videoId: video._id,
          status: "failed",
        });
      }
    } catch (updateError) {
      console.error("Failed to update video status:", updateError);
    }
  }
};
