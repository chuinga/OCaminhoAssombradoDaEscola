/**
 * Optimized asset loading system with progressive loading and memory management
 */

export interface AssetConfig {
  key: string;
  url: string;
  type: 'image' | 'audio' | 'json' | 'atlas';
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}

export class AssetLoader {
  private scene: Phaser.Scene;
  private assets: Map<string, AssetConfig> = new Map();
  private loadedAssets: Set<string> = new Set();
  private loadingQueue: AssetConfig[] = [];
  private isLoading = false;
  private onProgress?: (progress: LoadingProgress) => void;
  private onComplete?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Register an asset for loading
   */
  registerAsset(config: AssetConfig): void {
    this.assets.set(config.key, config);
  }

  /**
   * Register multiple assets
   */
  registerAssets(configs: AssetConfig[]): void {
    configs.forEach(config => this.registerAsset(config));
  }

  /**
   * Load assets by priority
   */
  async loadAssets(
    priority: 'high' | 'medium' | 'low' = 'high',
    onProgress?: (progress: LoadingProgress) => void,
    onComplete?: () => void
  ): Promise<void> {
    this.onProgress = onProgress;
    this.onComplete = onComplete;

    // Filter assets by priority and loading status
    const assetsToLoad = Array.from(this.assets.values())
      .filter(asset => asset.priority === priority && !this.loadedAssets.has(asset.key))
      .sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority));

    if (assetsToLoad.length === 0) {
      onComplete?.();
      return;
    }

    this.loadingQueue = assetsToLoad;
    this.isLoading = true;

    return new Promise((resolve) => {
      this.loadNextBatch().then(() => {
        this.isLoading = false;
        onComplete?.();
        resolve();
      });
    });
  }

  /**
   * Load essential assets first (preload = true)
   */
  async loadEssentialAssets(): Promise<void> {
    const essentialAssets = Array.from(this.assets.values())
      .filter(asset => asset.preload && !this.loadedAssets.has(asset.key));

    if (essentialAssets.length === 0) return;

    return new Promise((resolve) => {
      let loaded = 0;
      const total = essentialAssets.length;

      const checkComplete = () => {
        loaded++;
        this.onProgress?.({
          loaded,
          total,
          percentage: (loaded / total) * 100,
          currentAsset: essentialAssets[loaded - 1]?.key,
        });

        if (loaded >= total) {
          resolve();
        }
      };

      essentialAssets.forEach(asset => {
        this.loadSingleAsset(asset).then(() => {
          this.loadedAssets.add(asset.key);
          checkComplete();
        });
      });
    });
  }

  /**
   * Load assets in batches to prevent blocking
   */
  private async loadNextBatch(batchSize: number = 3): Promise<void> {
    if (this.loadingQueue.length === 0) return;

    const batch = this.loadingQueue.splice(0, batchSize);
    const promises = batch.map(asset => this.loadSingleAsset(asset));

    await Promise.all(promises);

    // Mark as loaded
    batch.forEach(asset => this.loadedAssets.add(asset.key));

    // Update progress
    const totalAssets = Array.from(this.assets.values()).length;
    const loadedCount = this.loadedAssets.size;
    
    this.onProgress?.({
      loaded: loadedCount,
      total: totalAssets,
      percentage: (loadedCount / totalAssets) * 100,
      currentAsset: batch[batch.length - 1]?.key,
    });

    // Continue with next batch
    if (this.loadingQueue.length > 0) {
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 16));
      return this.loadNextBatch(batchSize);
    }
  }

  /**
   * Load a single asset based on its type
   */
  private async loadSingleAsset(asset: AssetConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        switch (asset.type) {
          case 'image':
            this.scene.load.image(asset.key, this.getOptimizedUrl(asset));
            break;
          case 'audio':
            this.scene.load.audio(asset.key, this.getOptimizedUrl(asset));
            break;
          case 'json':
            this.scene.load.json(asset.key, asset.url);
            break;
          case 'atlas':
            this.scene.load.atlas(
              asset.key,
              this.getOptimizedUrl(asset),
              asset.url.replace('.png', '.json')
            );
            break;
        }

        // Set up completion handler
        const onComplete = () => {
          this.scene.load.off('filecomplete-' + asset.type + '-' + asset.key, onComplete);
          resolve();
        };

        const onError = () => {
          this.scene.load.off('loaderror', onError);
          console.error(`Failed to load asset: ${asset.key}`);
          reject(new Error(`Failed to load asset: ${asset.key}`));
        };

        this.scene.load.on('filecomplete-' + asset.type + '-' + asset.key, onComplete);
        this.scene.load.on('loaderror', onError);

        // Start loading if not already started
        if (!this.scene.load.isLoading()) {
          this.scene.load.start();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get optimized asset URL based on device capabilities and quality settings
   */
  private getOptimizedUrl(asset: AssetConfig): string {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isHighDPI = devicePixelRatio > 1.5;
    const isMobile = window.innerWidth < 768;

    // For images, use different quality versions
    if (asset.type === 'image') {
      let quality = asset.quality || 'high';
      
      // Automatically adjust quality for mobile devices
      if (isMobile && quality === 'high') {
        quality = 'medium';
      }

      // Use appropriate resolution
      if (quality === 'low' || (isMobile && !isHighDPI)) {
        return asset.url.replace('.png', '_low.png').replace('.jpg', '_low.jpg');
      } else if (quality === 'medium' || !isHighDPI) {
        return asset.url.replace('.png', '_med.png').replace('.jpg', '_med.jpg');
      }
    }

    // For audio, use compressed formats on mobile
    if (asset.type === 'audio' && isMobile) {
      return asset.url.replace('.wav', '.mp3').replace('.ogg', '.mp3');
    }

    return asset.url;
  }

  /**
   * Get priority weight for sorting
   */
  private getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
    }
  }

  /**
   * Check if an asset is loaded
   */
  isAssetLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  /**
   * Unload assets to free memory
   */
  unloadAssets(keys: string[]): void {
    keys.forEach(key => {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
      if (this.scene.cache.audio.exists(key)) {
        this.scene.cache.audio.remove(key);
      }
      if (this.scene.cache.json.exists(key)) {
        this.scene.cache.json.remove(key);
      }
      
      this.loadedAssets.delete(key);
    });
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    totalAssets: number;
    loadedAssets: number;
    pendingAssets: number;
    isLoading: boolean;
  } {
    return {
      totalAssets: this.assets.size,
      loadedAssets: this.loadedAssets.size,
      pendingAssets: this.loadingQueue.length,
      isLoading: this.isLoading,
    };
  }

  /**
   * Clear all assets and reset loader
   */
  clear(): void {
    this.assets.clear();
    this.loadedAssets.clear();
    this.loadingQueue.length = 0;
    this.isLoading = false;
  }
}