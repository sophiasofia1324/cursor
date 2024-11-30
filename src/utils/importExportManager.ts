import { utils, write } from 'xlsx';

interface ExportOptions {
  format: 'xlsx' | 'csv' | 'json';
  filename?: string;
  sheets?: {
    [key: string]: any[];
  };
}

interface ImportResult {
  success: boolean;
  data: any;
  errors?: string[];
}

export class ImportExportManager {
  private static instance: ImportExportManager;

  static getInstance() {
    if (!ImportExportManager.instance) {
      ImportExportManager.instance = new ImportExportManager();
    }
    return ImportExportManager.instance;
  }

  async exportData(data: any, options: ExportOptions): Promise<void> {
    const filename = options.filename || `export-${Date.now()}`;

    switch (options.format) {
      case 'xlsx':
        await this.exportToExcel(data, filename, options.sheets);
        break;
      case 'csv':
        await this.exportToCSV(data, filename);
        break;
      case 'json':
        await this.exportToJSON(data, filename);
        break;
    }
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

  async importData(file: File): Promise<ImportResult> {
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
      }, {});
    });
  }

  private async importFromJSON(file: File): Promise<any> {
    const text = await file.text();
    return JSON.parse(text);
  }
}

export const importExportManager = ImportExportManager.getInstance(); 