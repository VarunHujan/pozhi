// ==========================================
// UPLOAD CONTROLLER - POZHI SMART STORAGE
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';

const MB_20_IN_BYTES = 20 * 1024 * 1024; // 20MB threshold

/**
 * Upload files with SMART STORAGE LOGIC
 * - Single file < 20MB → Supabase
 * - Single file ≥ 20MB → Cloudflare R2
 * - Multiple files → Cloudflare R2
 * 
 * @route POST /api/v1/upload
 * @access Private (authenticated users only)
 */
export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    // Check if files exist (multer middleware should handle this)
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new ApiError(400, 'No files uploaded');
    }

    logger.info('Upload request', {
      userId,
      fileCount: files.length,
      sizes: files.map(f => f.size)
    });

    const uploads = [];

    // SMART LOGIC: Determine storage provider
    let storageProvider: 'supabase' | 'cloudflare_r2';

    if (files.length > 1) {
      // Multiple files → Always Cloudflare R2
      storageProvider = 'cloudflare_r2';
    } else if (files[0].size >= MB_20_IN_BYTES) {
      // Single large file → Cloudflare R2
      storageProvider = 'cloudflare_r2';
    } else {
      // Single small file → Supabase
      storageProvider = 'supabase';
    }

    logger.info('Storage provider selected', { storageProvider, fileCount: files.length });

    // Process each file
    for (const file of files) {
      let uploadResult;

      if (storageProvider === 'supabase') {
        uploadResult = await uploadToSupabase(file, userId);
      } else {
        uploadResult = await uploadToCloudflareR2(file, userId);
      }

      // Save to database
      const { data: upload, error: dbError } = await supabase
        .from('user_uploads')
        .insert({
          user_id: userId,
          storage_provider: storageProvider,
          storage_url: uploadResult.url,
          storage_path: uploadResult.path,
          original_filename: file.originalname,
          sanitized_filename: uploadResult.sanitizedFilename,
          mime_type: file.mimetype,
          file_size_bytes: file.size,
          width: uploadResult.width,
          height: uploadResult.height,
          processing_status: 'completed'
        })
        .select()
        .single();

      if (dbError) {
        logger.error('Failed to save upload to database', { error: dbError.message });
        throw new ApiError(500, 'Failed to save upload metadata');
      }

      uploads.push({
        id: upload.id,
        storage_provider: storageProvider,
        storage_url: upload.storage_url,
        file_size_bytes: upload.file_size_bytes,
        original_filename: upload.original_filename
      });

      logger.info('File uploaded successfully', {
        uploadId: upload.id,
        provider: storageProvider,
        size: file.size
      });
    }

    res.status(201).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      data: {
        uploads,
        storage_provider: storageProvider
      }
    });

  } catch (error) {
    logger.error('Upload failed', { error, userId: req.user?.id });
    next(error);
  }
};

/**
 * Get user's uploads
 * @route GET /api/v1/upload
 * @access Private
 */
export const getUserUploads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: uploads, error } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch uploads', { error: error.message });
      throw new ApiError(500, 'Failed to fetch uploads');
    }

    res.status(200).json({
      success: true,
      count: uploads?.length || 0,
      data: uploads || []
    });

  } catch (error) {
    logger.error('Failed to get uploads', { error, userId: req.user?.id });
    next(error);
  }
};

/**
 * Delete an upload
 * @route DELETE /api/v1/upload/:uploadId
 * @access Private
 */
export const deleteUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const { uploadId } = req.params;
    if (!uploadId) {
      throw new ApiError(400, 'Upload ID is required');
    }

    // Get upload details
    const { data: upload, error: fetchError } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !upload) {
      throw new ApiError(404, 'Upload not found');
    }

    // Delete from storage
    if (upload.storage_provider === 'supabase') {
      await deleteFromSupabase(upload.storage_path);
    } else {
      await deleteFromCloudflareR2(upload.storage_path);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('user_uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('Failed to delete upload from database', { error: deleteError.message });
      throw new ApiError(500, 'Failed to delete upload');
    }

    logger.info('Upload deleted', { uploadId, userId });

    res.status(200).json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete upload', { error, uploadId: req.params.uploadId });
    next(error);
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Upload file to Supabase Storage
 */
async function uploadToSupabase(file: Express.Multer.File, userId: string) {
  const sanitizedFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${userId}/${sanitizedFilename}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    logger.error('Supabase upload failed', { error: error.message });
    throw new ApiError(500, 'Failed to upload to Supabase');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  // Get image dimensions if it's an image
  let width, height;
  if (file.mimetype.startsWith('image/')) {
    // Placeholder - implement with sharp or similar
    width = null;
    height = null;
  }

  return {
    url: urlData.publicUrl,
    path: filePath,
    sanitizedFilename,
    width,
    height
  };
}

/**
 * Upload file to Cloudflare R2
 * TODO: Implement Cloudflare R2 SDK integration
 */
async function uploadToCloudflareR2(file: Express.Multer.File, userId: string) {
  // Placeholder implementation
  // You need to install @aws-sdk/client-s3 and configure R2 credentials

  const sanitizedFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${userId}/${sanitizedFilename}`;

  logger.warn('Cloudflare R2 upload not yet implemented, using Supabase fallback');

  // Fallback to Supabase for now
  return await uploadToSupabase(file, userId);

  // TODO: Implement actual R2 upload:
  /*
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    }
  });

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: filePath,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  return {
    url: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filePath}`,
    path: filePath,
    sanitizedFilename,
    width: null,
    height: null
  };
  */
}

/**
 * Delete file from Supabase
 */
async function deleteFromSupabase(filePath: string) {
  const { error } = await supabase.storage
    .from('uploads')
    .remove([filePath]);

  if (error) {
    logger.error('Failed to delete from Supabase', { error: error.message });
  }
}

/**
 * Delete file from Cloudflare R2
 * TODO: Implement R2 delete
 */
async function deleteFromCloudflareR2(filePath: string) {
  logger.warn('Cloudflare R2 delete not yet implemented');
  // TODO: Implement with AWS SDK
}