import { utils, write, read } from 'xlsx';

interface ExportConfig {
  format: 'xlsx' | 'csv' | 'json';
  filename?: string;
  sheets?: {
    [key: string]: any[];
  };
  encryption?: {
    enabled: boolean;
    password?: string;
  };
}

interface ImportConfig {
  format: 'xlsx' | 'csv' | 'json';
  validation?: {
    enabled: boolean;
    schema?: any;
  };
}

interface ImportResult {
  success: boolean;
  data: any;
  errors?: string[];
}

export class DataTransferManager {
  private static instance: DataTransferManager;

  static getInstance() {
    if (!DataTransferManager.instance) {
      DataTransferManager.instance = new DataTransferManager();
    }
    return DataTransferManager.instance;
  }

  async exportData(data: any, config: ExportConfig): Promise<void> {
    const filename = config.filename || `export-${Date.now()}`;

    let processedData = data;
    if (config.encryption?.enabled) {
      processedData = await this.encryptData(data, config.encryption.password);
    }

    switch (config.format) {
      case 'xlsx':
        await this.exportToExcel(processedData, filename, config.sheets);
        break;
      case 'csv':
        await this.exportToCSV(processedData, filename);
        break;
      case 'json':
        await this.exportToJSON(processedData, filename);
        break;
    }
  }

  private async encryptData(data: any, password?: string): Promise<any> {
    // 实现数据加密
    return data;
  }

  private async exportToExcel(data: any, filename: string, sheets?: { [key: string]: any[] }) {
    const wb = utils.book_new();

    if (sheets) {
      Object.entries(sheets).forEach(([name, data]) => {
        const ws = utils.json_to_sheet(data);
        utils.book_append_sheet(wb, ws, name);
      });
    } else {
      const ws = utils.json_to_sheet(Array.isArray(data) ? data : [data]);
      utils.book_append_sheet(wb, ws, 'Sheet1');
    }

    const buffer = write(wb, { bookType: 'xlsx', type: 'array' });
    this.downloadFile(new Blob([buffer]), `${filename}.xlsx`);
  }

  private async exportToCSV(data: any[], filename: string) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row)
        .map(value => `"${value}"`)
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    this.downloadFile(new Blob([csv]), `${filename}.csv`);
  }

  private async exportToJSON(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(new Blob([json]), `${filename}.json`);
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importData(file: File, config: ImportConfig): Promise<ImportResult> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let data: any;

      switch (extension) {
        case 'xlsx':
          data = await this.importFromExcel(file);
          break;
        case 'csv':
          data = await this.importFromCSV(file);
          break;
        case 'json':
          data = await this.importFromJSON(file);
          break;
        default:
          throw new Error('Unsupported file format');
      }

      if (config.validation?.enabled) {
        this.validateData(data, config.validation.schema);
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [error.message]
      };
    }
  }

  private async importFromExcel(file: File): Promise<any> {
    const arrayBuffer = await file.arrayBuffer();
    const wb = read(arrayBuffer);
    const sheets: { [key: string]: any[] } = {};

    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      sheets[name] = utils.sheet_to_json(ws);
    });

    return sheets;
  }

  private async importFromCSV(file: File): Promise<any[]> {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim();
        return obj;
      }, {} as any);
    });
  }

  private async importFromJSON(file: File): Promise<any> {
    const text = await file.text();
    return JSON.parse(text);
  }

  private validateData(data: any, schema: any) {
    // 实现数据验证逻辑
  }
}

export const dataTransferManager = DataTransferManager.getInstance(); 