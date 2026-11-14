export type ThemeMode = "dark" | "light";

export interface PhotoExif {
  time: string | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lens: string | null;
  focalLength: number | null;
  aperture: number | null;
  exposureTime: number | null;
  isoSpeed: number | null;
}

export interface Photo {
  id: string;
  album: string;
  title: string;
  isHero: boolean;
  thumbUrl: string;
  fullUrl: string;
  width: number | null;
  height: number | null;
  exif: PhotoExif;
}

export interface PortfolioFeedResponse {
  ok: boolean;
  generatedAt?: string;
  cached?: boolean;
  albums: string[];
  total: number;
  photos: Photo[];
  error?: string;
}
