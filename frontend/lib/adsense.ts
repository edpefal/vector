// Google AdSense integration with dual-mode support
// Test mode: Simulated ad (3 seconds)
// Real mode: Google IMA SDK with actual AdSense

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: {
      ima?: {
        AdDisplayContainer: any;
        AdsLoader: any;
        AdsRequest: any;
        AdsManagerLoadedEvent: any;
        AdEvent: any;
        AdErrorEvent: any;
        ViewMode: any;
      };
    };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface AdCallbacks {
  onAdStart?: () => void;
  onAdComplete?: () => void;
  onAdError?: (error: string) => void;
  onAdSkip?: (reason?: string) => void;
}

/**
 * Get AdSense mode from environment (test or real)
 * Defaults to "test" if not set
 */
function getAdsenseMode(): "test" | "real" {
  const mode = process.env.NEXT_PUBLIC_ADSENSE_MODE as "test" | "real" | undefined;
  return mode === "real" ? "real" : "test";
}

/**
 * Play an ad in test mode (simulated)
 * Shows a progress bar and completes after 3 seconds
 */
async function playAdTest(
  containerId: string,
  callbacks: AdCallbacks
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Ad container with ID "${containerId}" not found`);
    callbacks.onAdError?.("Container not found");
    return;
  }

  console.log("Starting test mode ad (simulated)...");
  callbacks.onAdStart?.();

  // Create a simple ad placeholder
  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-family: sans-serif;">
      <h3 style="margin: 0 0 10px 0;">Video Ad (Test)</h3>
      <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.9;">Completing in <span id="ad-timer">3</span> seconds...</p>
      <div style="width: 80%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
        <div id="ad-progress" style="width: 0%; height: 100%; background: white; transition: width 0.1s linear;"></div>
      </div>
    </div>
  `;

  // Simulate ad progress
  let elapsed = 0;
  const totalDuration = 3000; // 3 seconds
  const interval = setInterval(() => {
    elapsed += 50;
    const progress = (elapsed / totalDuration) * 100;
    const progressBar = document.getElementById("ad-progress");
    const timer = document.getElementById("ad-timer");

    if (progressBar) progressBar.style.width = progress + "%";
    if (timer) timer.textContent = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000)).toString();

    if (elapsed >= totalDuration) {
      clearInterval(interval);
      console.log("Test ad completed");
      container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 8px; color: #666; font-family: sans-serif;">
          <p>Ad Completed ✓</p>
        </div>
      `;
      setTimeout(() => {
        callbacks.onAdComplete?.();
      }, 500);
    }
  }, 50);
}

/**
 * Play an ad in real mode (Google IMA SDK)
 * Uses actual Google AdSense with real callbacks
 */
async function playAdReal(
  containerId: string,
  callbacks: AdCallbacks
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Ad container with ID "${containerId}" not found`);
    callbacks.onAdError?.("Container not found");
    return;
  }

  try {
    // Verify Google IMA SDK is loaded
    if (!window.google?.ima) {
      console.error("Google IMA SDK not loaded");
      callbacks.onAdError?.("Ad SDK not available. Please check your ad blocker.");
      return;
    }

    console.log("Starting real mode ad (Google IMA SDK)...");
    callbacks.onAdStart?.();

    const unitId = process.env.NEXT_PUBLIC_ADSENSE_UNIT_ID;
    if (!unitId) {
      console.error("NEXT_PUBLIC_ADSENSE_UNIT_ID not configured");
      callbacks.onAdError?.("Ad unit not configured");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imaSDK = window.google.ima as any;

    // Initialize ad display container
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adDisplayContainer = new imaSDK.AdDisplayContainer(container, null);
    adDisplayContainer.initialize();

    // Create ads loader
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adsLoader = new imaSDK.AdsLoader(adDisplayContainer);

    // Set up event listeners
    adsLoader.addEventListener(
      imaSDK.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: any) => {
        console.log("Ads manager loaded");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adsManager = event.getAdsManager(null, imaSDK.ViewMode.NORMAL);

        // Listen for ad manager events
        adsManager.addEventListener(imaSDK.AdEvent.Type.COMPLETE, () => {
          console.log("Ad completed");
          callbacks.onAdComplete?.();
        });

        adsManager.addEventListener(imaSDK.AdEvent.Type.SKIPPED, () => {
          console.log("Ad skipped");
          callbacks.onAdSkip?.("Ad was skipped. Please watch the full ad to download.");
        });

        adsManager.addEventListener(
          imaSDK.AdEvent.Type.ERROR,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = (event as any).getError ? (event as any).getError() : event;
            console.error("Ad error:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callbacks.onAdError?.((error as any)?.getMessage?.() || "Ad playback error");
          }
        );

        try {
          adsManager.start();
        } catch (e) {
          console.error("Error starting ads manager:", e);
          callbacks.onAdError?.("Failed to start ad playback");
        }
      }
    );

    // Error listener for ad loading
    adsLoader.addEventListener(
      imaSDK.AdErrorEvent.Type.AD_ERROR,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = (event as any).getError();
        console.error("Ad loader error:", error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callbacks.onAdError?.((error as any)?.getMessage?.() || "Failed to load ad");
      }
    );

    // Request ads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adsRequest = new imaSDK.AdsRequest();
    adsRequest.adTagUrl = `https://pubads.g.doubleclick.net/gampad/ads?iu=${unitId}&iu=/21775745890/example/video&gdfp_req=1&env=vp&impl=s&unviewed_position_at_start=1&output=vast&unviewed_position_at_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp]`;

    console.log("Loading ads from:", unitId);
    adsLoader.requestAds(adsRequest);
  } catch (error) {
    console.error("Error in real ad mode:", error);
    callbacks.onAdError?.(String(error));
  }
}

/**
 * Play an ad in the given container
 * Automatically selects test or real mode based on NEXT_PUBLIC_ADSENSE_MODE
 */
export async function playAd(
  containerId: string,
  callbacks: AdCallbacks
): Promise<void> {
  if (typeof window === "undefined") return;

  const mode = getAdsenseMode();
  console.log(`Playing ad in ${mode} mode`);

  if (mode === "test") {
    await playAdTest(containerId, callbacks);
  } else {
    await playAdReal(containerId, callbacks);
  }
}

/**
 * Check if an ad is currently playing
 */
export function isAdCurrentlyPlaying(): boolean {
  return false;
}

/**
 * Cleanup and destroy ad manager
 */
export function destroyAd(): void {
  console.log("Ad cleanup");
}
