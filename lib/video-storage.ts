import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from './firebase';

export interface VideoMetadata {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  duration?: number;
  file_size?: string;
  status: 'completed';
}

/**
 * Fetch all videos for a specific user from Firebase Storage
 * Files are stored in the structure: users/{userId}/sessions/{sessionId}/final_video/
 */
export async function fetchUserVideosFromStorage(userId: string): Promise<VideoMetadata[]> {
  try {
    const videos: VideoMetadata[] = [];
    
    // Reference to the user's sessions folder
    const userSessionsRef = ref(storage, `users/${userId}/sessions`);
    
    // List all session folders
    const sessionsList = await listAll(userSessionsRef);
    
    // Process each session folder
    for (const sessionRef of sessionsList.prefixes) {
      try {
        // Look for final_video folder in each session
        const finalVideoRef = ref(storage, `${sessionRef.fullPath}/final_video`);
        const finalVideoList = await listAll(finalVideoRef);
        
        // Process video files in the final_video folder
        for (const videoFileRef of finalVideoList.items) {
          if (videoFileRef.name.toLowerCase().includes('.mp4') || 
              videoFileRef.name.toLowerCase().includes('.mov') ||
              videoFileRef.name.toLowerCase().includes('.avi') ||
              videoFileRef.name.toLowerCase().includes('.webm')) {
            
            try {
              // Get download URL and metadata
              const videoUrl = await getDownloadURL(videoFileRef);
              const metadata = await getMetadata(videoFileRef);
              
              // Extract session ID from path
              const pathParts = sessionRef.fullPath.split('/');
              const sessionId = pathParts[pathParts.length - 1];
              
              // Create video metadata object
              const video: VideoMetadata = {
                id: `${sessionId}_${videoFileRef.name}`,
                title: generateVideoTitle(videoFileRef.name, sessionId),
                video_url: videoUrl,
                created_at: metadata.timeCreated || new Date().toISOString(),
                file_size: formatFileSize(metadata.size || 0),
                status: 'completed'
              };
              
              // Try to find thumbnail
              try {
                const thumbnailRef = ref(storage, `${sessionRef.fullPath}/thumbnail`);
                const thumbnailList = await listAll(thumbnailRef);
                
                if (thumbnailList.items.length > 0) {
                  const thumbnailUrl = await getDownloadURL(thumbnailList.items[0]);
                  video.thumbnail_url = thumbnailUrl;
                }
              } catch (error) {
                // Thumbnail not found, that's okay
                console.log(`No thumbnail found for session ${sessionId}`);
              }
              
              videos.push(video);
            } catch (error) {
              console.error(`Error processing video file ${videoFileRef.name}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing session ${sessionRef.name}:`, error);
      }
    }
    
    // Sort videos by creation date (newest first)
    return videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
  } catch (error) {
    console.error('Error fetching videos from Firebase Storage:', error);
    throw error;
  }
}

/**
 * Generate a user-friendly title from filename and session ID
 */
function generateVideoTitle(filename: string, sessionId: string): string {
  // Remove file extension
  let title = filename.replace(/\.(mp4|mov|avi|webm)$/i, '');
  
  // If filename is generic, use session-based title
  if (title.toLowerCase().includes('final_video') || 
      title.toLowerCase().includes('output') || 
      title.length < 5) {
    const date = new Date().toLocaleDateString();
    return `AI Video - ${date} (${sessionId.slice(-8)})`;
  }
  
  // Clean up filename
  title = title.replace(/[_-]/g, ' ');
  title = title.replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
  
  return title;
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extract duration from video metadata if available
 * Note: This requires additional processing and may not be available from Storage metadata
 */
export function extractDurationFromMetadata(metadata: any): number | undefined {
  // Duration extraction would require additional video processing
  // For now, we'll return undefined and potentially implement this later
  return undefined;
}
