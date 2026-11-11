interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'limit' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

const DEFAULT_CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'desa-dadapayu';

/**
 * Mengoptimalkan URL gambar menggunakan Cloudinary Image Delivery CDN.
 * Mendukung URL langsung Cloudinary, publicId, atau external URL fallback.
 */
export function getOptimizedImageUrl(
  imageSource?: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!imageSource || imageSource.trim() === '') {
    return '/images/placeholder-umkm.jpg';
  }

  // Jika berupa URL eksternal (misal: Unsplash untuk demo data), kembalikan langsung dengan param optimasi sederhana
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    // Jika merupakan URL dari domain Cloudinary resmi (res.cloudinary.com)
    if (imageSource.includes('res.cloudinary.com')) {
      const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
      } = options;

      const transforms = [
        `f_${format}`,
        `q_${quality}`,
        width ? `w_${width}` : '',
        height ? `h_${height}` : '',
        (width || height) ? `c_${crop}` : '',
      ]
        .filter(Boolean)
        .join(',');

      // Sisipkan transformasi ke URL Cloudinary setelah /upload/
      if (imageSource.includes('/upload/')) {
        return imageSource.replace('/upload/', `/upload/${transforms}/`);
      }
    }
    return imageSource;
  }

  // Jika berupa public_id Cloudinary murni
  const cloudName = DEFAULT_CLOUD_NAME;
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    (width || height) ? `c_${crop}` : '',
  ]
    .filter(Boolean)
    .join(',');

  const cleanPublicId = imageSource.startsWith('/') ? imageSource.slice(1) : imageSource;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${cleanPublicId}`;
}
