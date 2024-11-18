import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const generateFileName = (originalname) => {
  const timestamp = Date.now();
  const hash = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  return `${timestamp}-${hash}${ext}`;
};

export const uploadFile = async (file, type = 'document') => {
  const filename = generateFileName(file.originalname);
  let processedFile = file.buffer;
  let thumbnailBuffer;

  // Process images and create thumbnails
  if (type === 'image') {
    processedFile = await sharp(file.buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    thumbnailBuffer = await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 60 })
      .toBuffer();
  }

  // Upload original file
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: processedFile,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }));

  let thumbnailUrl;
  if (thumbnailBuffer) {
    const thumbnailName = `thumbnails/${filename}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: thumbnailName,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }));
    thumbnailUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailName}`;
  }

  return {
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`,
    thumbnailUrl,
    filename,
    mimetype: file.mimetype,
    size: file.size
  };
};