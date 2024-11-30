export class DataValidator {
  private rules: any[] = [];
  private errors: any[] = [];

  validate(data: any): boolean {
    this.errors = [];
    // ... 其他代码
    return this.errors.length === 0;
  }
} 