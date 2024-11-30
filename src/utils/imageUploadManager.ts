interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  compression?: {
    enabled: boolean;
    quality: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  storage: 'local' | 'cloud';
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    type: string;
    width: number;
    height: number;
  };
}

export class ImageUploadManager {
  private static instance: ImageUploadManager;
  private config: UploadConfig = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    compression: {
      enabled: true,
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080
    },
    storage: 'cloud'
  };

  static getInstance() {
    if (!ImageUploadManager.instance) {
      ImageUploadManager.instance = new ImageUploadManager();
    }
    return ImageUploadManager.instance;
  }

  async uploadImage(file: File): Promise<UploadResult> {
    try {
      // 验证文件
      const validationError = this.validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // 压缩图片
      const processedFile = await this.processImage(file);

      // 上传图片
      const url = await this.uploadToStorage(processedFile);

      // 获取元数据
      const metadata = await this.getImageMetadata(processedFile);

      return {
        success: true,
        url,
        metadata
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      return {
        success: false,
        error: error.message
      };
    }
  }

  private validateFile(file: File): string | null {
    if (file.size > this.config.maxSize) {
      return `File size exceeds ${this.config.maxSize / 1024 / 1024}MB limit`;
    }

    if (!this.config.allowedTypes.includes(file.type)) {
      return 'Unsupported file type';
    }

    return null;
  }

  private async processImage(file: File): Promise<File> {
    if (!this.config.compression?.enabled) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 调整尺寸
        if (this.config.compression?.maxWidth && width > this.config.compression.maxWidth) {
          height *= this.config.compression.maxWidth / width;
          width = this.config.compression.maxWidth;
        }

        if (this.config.compression?.maxHeight && height > this.config.compression.maxHeight) {
          width *= this.config.compression.maxHeight / height;
          height = this.config.compression.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          this.config.compression?.quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async uploadToStorage(file: File): Promise<string> {
    if (this.config.storage === 'local') {
      return this.uploadToLocal(file);
    } else {
      return this.uploadToCloud(file);
    }
  }

  private async uploadToLocal(file: File): Promise<string> {
    // 实现本地存储逻辑
    return '';
  }

  private async uploadToCloud(file: File): Promise<string> {
    // 实现云存储逻辑
    return '';
  }

  private async getImageMetadata(file: File): Promise<UploadResult['metadata']> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  updateConfig(config: Partial<UploadConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const imageUploadManager = ImageUploadManager.getInstance(); 