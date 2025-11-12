import { CodeAnalysisResult, FunctionInfo, ClassInfo, MethodInfo } from '../types.js';

export interface TestTemplate {
  generateImports(analysis: CodeAnalysisResult, testFramework: string): string;
  generateTestSuite(analysis: CodeAnalysisResult, framework: string): string;
  generateFunctionTest(func: FunctionInfo, sourceFile: string): string;
  generateClassTest(cls: ClassInfo, sourceFile: string): string;
  generateMethodTest(method: MethodInfo, className: string): string;
}

export class JestTemplate implements TestTemplate {
  generateImports(analysis: CodeAnalysisResult, testFramework: string): string {
    const imports: string[] = [];
    
    // Import the module under test
    const moduleName = analysis.filePath.split('/').pop()?.replace(/\.(ts|js)x?$/, '') || 'module';
    
    // Collect all exports to import
    const exportedItems = analysis.exports.map(e => e.name);
    if (exportedItems.length > 0) {
      imports.push(`import { ${exportedItems.join(', ')} } from './${moduleName}';`);
    }

    return imports.join('\n');
  }

  generateTestSuite(analysis: CodeAnalysisResult, framework: string): string {
    const moduleName = analysis.filePath.split('/').pop()?.replace(/\.(ts|js)x?$/, '') || 'module';
    let tests = '';

    tests += `describe('${moduleName}', () => {\n`;

    // Generate tests for functions
    for (const func of analysis.functions.filter(f => f.isExported)) {
      tests += this.generateFunctionTest(func, moduleName);
    }

    // Generate tests for classes
    for (const cls of analysis.classes.filter(c => c.isExported)) {
      tests += this.generateClassTest(cls, moduleName);
    }

    tests += `});\n`;

    return tests;
  }

  generateFunctionTest(func: FunctionInfo, sourceFile: string): string {
    const testCases: string[] = [];
    
    testCases.push(`
  describe('${func.name}', () => {
    it('should be defined', () => {
      expect(${func.name}).toBeDefined();
    });

    it('should execute without errors', ${func.isAsync ? 'async ' : ''}() => {
      ${this.generateFunctionCall(func)}
    });

    ${this.generateEdgeCaseTests(func)}
  });
`);

    return testCases.join('\n');
  }

  generateClassTest(cls: ClassInfo, sourceFile: string): string {
    let test = `
  describe('${cls.name}', () => {
    let instance: ${cls.name};

    beforeEach(() => {
      instance = new ${cls.name}(${this.generateConstructorParams(cls)});
    });

    it('should create an instance', () => {
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(${cls.name});
    });
`;

    // Generate tests for public methods
    const publicMethods = cls.methods.filter(m => m.isPublic && m.name !== 'constructor');
    for (const method of publicMethods) {
      test += this.generateMethodTest(method, cls.name);
    }

    test += `  });\n`;
    return test;
  }

  generateMethodTest(method: MethodInfo, className: string): string {
    return `
    describe('${method.name}', () => {
      it('should be defined', () => {
        expect(instance.${method.name}).toBeDefined();
      });

      it('should execute without errors', ${method.isAsync ? 'async ' : ''}() => {
        ${this.generateMethodCall(method)}
      });

      ${this.generateEdgeCaseTests(method)}
    });
`;
  }

  private generateFunctionCall(func: FunctionInfo): string {
    const params = func.params.map(p => this.getMockValue(p.type)).join(', ');
    const call = `${func.name}(${params})`;
    
    if (func.isAsync) {
      return `const result = await ${call};\n      expect(result).toBeDefined();`;
    }
    return `const result = ${call};\n      expect(result).toBeDefined();`;
  }

  private generateMethodCall(method: MethodInfo): string {
    const params = method.params.map(p => this.getMockValue(p.type)).join(', ');
    const call = `instance.${method.name}(${params})`;
    
    if (method.isAsync) {
      return `const result = await ${call};\n        expect(result).toBeDefined();`;
    }
    return `const result = ${call};\n        expect(result).toBeDefined();`;
  }

  private generateConstructorParams(cls: ClassInfo): string {
    // Try to find constructor in methods
    const constructor = cls.methods.find(m => m.name === 'constructor');
    if (constructor) {
      return constructor.params.map(p => this.getMockValue(p.type)).join(', ');
    }
    return '';
  }

  private generateEdgeCaseTests(func: FunctionInfo | MethodInfo): string {
    const tests: string[] = [];

    // Test with null/undefined if params accept it
    if (func.params.length > 0) {
      tests.push(`
    it('should handle edge cases', () => {
      // TODO: Add edge case tests for different input scenarios
      expect(true).toBe(true);
    });`);
    }

    return tests.join('\n');
  }

  private getMockValue(type?: string): string {
    if (!type) return "''";
    
    switch (type.toLowerCase()) {
      case 'string': return "'test'";
      case 'number': return '42';
      case 'boolean': return 'true';
      case 'array':
      case 'any[]':
      case 'string[]':
      case 'number[]': return '[]';
      case 'object': return '{}';
      case 'date': return 'new Date()';
      case 'promise': return 'Promise.resolve()';
      case 'void': return '';
      default: return '{}';
    }
  }
}

export class JasminKarmaTemplate implements TestTemplate {
  generateImports(analysis: CodeAnalysisResult, testFramework: string): string {
    const imports: string[] = [];
    
    const moduleName = analysis.filePath.split('/').pop()?.replace(/\.(ts|js)x?$/, '') || 'module';
    const exportedItems = analysis.exports.map(e => e.name);
    
    if (exportedItems.length > 0) {
      imports.push(`import { ${exportedItems.join(', ')} } from './${moduleName}';`);
    }

    return imports.join('\n');
  }

  generateTestSuite(analysis: CodeAnalysisResult, framework: string): string {
    const moduleName = analysis.filePath.split('/').pop()?.replace(/\.(ts|js)x?$/, '') || 'module';
    let tests = '';

    tests += `describe('${moduleName}', () => {\n`;

    // Generate tests for functions
    for (const func of analysis.functions.filter(f => f.isExported)) {
      tests += this.generateFunctionTest(func, moduleName);
    }

    // Generate tests for classes
    for (const cls of analysis.classes.filter(c => c.isExported)) {
      tests += this.generateClassTest(cls, moduleName);
    }

    tests += `});\n`;

    return tests;
  }

  generateFunctionTest(func: FunctionInfo, sourceFile: string): string {
    return `
  describe('${func.name}', () => {
    it('should be defined', () => {
      expect(${func.name}).toBeDefined();
    });

    it('should execute without errors', ${func.isAsync ? 'async ' : ''}() => {
      ${this.generateFunctionCall(func)}
    });
  });
`;
  }

  generateClassTest(cls: ClassInfo, sourceFile: string): string {
    let test = `
  describe('${cls.name}', () => {
    let instance: ${cls.name};

    beforeEach(() => {
      instance = new ${cls.name}(${this.generateConstructorParams(cls)});
    });

    it('should create an instance', () => {
      expect(instance).toBeDefined();
    });
`;

    const publicMethods = cls.methods.filter(m => m.isPublic && m.name !== 'constructor');
    for (const method of publicMethods) {
      test += this.generateMethodTest(method, cls.name);
    }

    test += `  });\n`;
    return test;
  }

  generateMethodTest(method: MethodInfo, className: string): string {
    return `
    it('${method.name} should be defined', () => {
      expect(instance.${method.name}).toBeDefined();
    });

    it('${method.name} should execute without errors', ${method.isAsync ? 'async ' : ''}() => {
      ${this.generateMethodCall(method)}
    });
`;
  }

  private generateFunctionCall(func: FunctionInfo): string {
    const params = func.params.map(p => this.getMockValue(p.type)).join(', ');
    const call = `${func.name}(${params})`;
    
    if (func.isAsync) {
      return `const result = await ${call};\n      expect(result).toBeDefined();`;
    }
    return `const result = ${call};\n      expect(result).toBeDefined();`;
  }

  private generateMethodCall(method: MethodInfo): string {
    const params = method.params.map(p => this.getMockValue(p.type)).join(', ');
    const call = `instance.${method.name}(${params})`;
    
    if (method.isAsync) {
      return `const result = await ${call};\n      expect(result).toBeDefined();`;
    }
    return `const result = ${call};\n      expect(result).toBeDefined();`;
  }

  private generateConstructorParams(cls: ClassInfo): string {
    const constructor = cls.methods.find(m => m.name === 'constructor');
    if (constructor) {
      return constructor.params.map(p => this.getMockValue(p.type)).join(', ');
    }
    return '';
  }

  private getMockValue(type?: string): string {
    if (!type) return "''";
    
    switch (type.toLowerCase()) {
      case 'string': return "'test'";
      case 'number': return '42';
      case 'boolean': return 'true';
      case 'array':
      case 'any[]': return '[]';
      case 'object': return '{}';
      default: return '{}';
    }
  }
}

export function getTemplate(framework: 'jest' | 'karma' | 'jasmine'): TestTemplate {
  if (framework === 'jest') {
    return new JestTemplate();
  }
  return new JasminKarmaTemplate();
}
