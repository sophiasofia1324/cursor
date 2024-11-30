import CryptoJS from 'crypto-js';

export class EncryptionManager {
  private static instance: EncryptionManager;
  private readonly salt = 'your-salt-here';
  private localKey: string | null = null;

  static getInstance() {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  setEncryptionKey(key: string) {
    this.localKey = CryptoJS.PBKDF2(key, this.salt, {
      keySize: 256 / 32,
      iterations: 1000
    }).toString();
  }

  encrypt(data: any): string {
    if (!this.localKey) throw new Error('Encryption key not set');
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, this.localKey).toString();
  }

  decrypt(encryptedData: string): any {
    if (!this.localKey) throw new Error('Encryption key not set');
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.localKey);
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }

  generateSecureKey(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }
}

export const encryptionManager = EncryptionManager.getInstance(); 