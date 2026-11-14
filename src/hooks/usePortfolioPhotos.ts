import { useCallback, useEffect, useState } from "react";
import { DEMO_ALBUMS, DEMO_PHOTOS } from "../data/demoPhotos";
import type { Photo, PortfolioFeedResponse } from "../types/photo";

export type DataSourceMode = "drive" | "demo" | "fallback";

export interface UsePortfolioPhotosResult {
  photos: Photo[];
  albums: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  sourceMode: DataSourceMode;
  hasConfiguredEndpoint: boolean;
  refresh: (forceDriveCacheClear?: boolean) => Promise<void>;
}

function getConfiguredEndpoint(): string {
  const raw = import.meta.env.VITE_APPS_SCRIPT_URL;
  return typeof raw === "string" ? raw.trim() : "";
}

function buildRequestUrl(baseUrl: string, forceRefresh: boolean): string {
  const url = new URL(baseUrl);
  if (forceRefresh) {
    url.searchParams.set("refresh", "1");
    url.searchParams.set("_t", String(Date.now()));
  }
  return url.toString();
}

export function usePortfolioPhotos(): UsePortfolioPhotosResult {
  const endpoint = getConfiguredEndpoint();
  const hasConfiguredEndpoint = endpoint.length > 0;

  const [photos, setPhotos] = useState<Photo[]>(() =>
    hasConfiguredEndpoint ? [] : DEMO_PHOTOS
  );
  const [albums, setAlbums] = useState<string[]>(() =>
    hasConfiguredEndpoint ? [] : DEMO_ALBUMS
  );
  const [isLoading, setIsLoading] = useState<boolean>(hasConfiguredEndpoint);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<DataSourceMode>(
    hasConfiguredEndpoint ? "drive" : "demo"
  );

  const loadFromAppsScript = useCallback(
    async (forceRefresh = false) => {
      if (!endpoint) {
        setPhotos(DEMO_PHOTOS);
        setAlbums(DEMO_ALBUMS);
        setSourceMode("demo");
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Requête GET simple sans en-têtes personnalisés pour éviter le preflight CORS OPTIONS
        // non pris en charge par les applications Web Google Apps Script.
        const requestUrl = buildRequestUrl(endpoint, forceRefresh);
        const response = await fetch(requestUrl, {
          method: "GET",
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error(`Réponse HTTP ${response.status}`);
        }

        const payload = (await response.json()) as PortfolioFeedResponse;

        if (!payload.ok) {
          throw new Error(payload.error || "Erreur retournée par Apps Script.");
        }

        const nextPhotos = Array.isArray(payload.photos) ? payload.photos : [];
        const derivedAlbums =
          Array.isArray(payload.albums) && payload.albums.length > 0
            ? payload.albums
            : Array.from(new Set(nextPhotos.map((p) => p.album).filter(Boolean)));

        setPhotos(nextPhotos);
        setAlbums(derivedAlbums);
        setSourceMode("drive");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Impossible de charger les photographies depuis Google Drive.";
        setError(message);

        // Si le chargement initial échoue, on bascule gracieusement vers la démo pour ne pas bloquer l'affichage.
        setPhotos((current) => (current.length > 0 ? current : DEMO_PHOTOS));
        setAlbums((current) => (current.length > 0 ? current : DEMO_ALBUMS));
        setSourceMode("fallback");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    if (hasConfiguredEndpoint) {
      void loadFromAppsScript(false);
    }
  }, [hasConfiguredEndpoint, loadFromAppsScript]);

  return {
    photos,
    albums,
    isLoading,
    isRefreshing,
    error,
    sourceMode,
    hasConfiguredEndpoint,
    refresh: loadFromAppsScript,
  };
}
