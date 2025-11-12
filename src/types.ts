export interface ProjectInfo {
  type: 'angular' | 'react' | 'nextjs' | 'unknown';
  version: string;
  testFramework: 'jest' | 'karma' | 'jasmine' | 'vitest' | 'none';
  testFrameworkVersion?: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  hasTestConfig: boolean;
  configFiles: string[];
}

export interface TestGenerationRequest {
  filePath: string;
  framework: 'jest' | 'karma' | 'jasmine';
  coverageTarget: number;
  generateForAllPublicMethods: boolean;
  includeEdgeCases: boolean;
}

export interface CodeAnalysisResult {
  filePath: string;
  language: 'typescript' | 'javascript';
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
}

export interface FunctionInfo {
  name: string;
  params: ParamInfo[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  leadingComments?: string[];
}

export interface ClassInfo {
  name: string;
  methods: MethodInfo[];
  properties: PropertyInfo[];
  isExported: boolean;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface MethodInfo {
  name: string;
  params: ParamInfo[];
  returnType?: string;
  isAsync: boolean;
  isPublic: boolean;
  isStatic: boolean;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface PropertyInfo {
  name: string;
  type?: string;
  isPublic: boolean;
}

export interface ParamInfo {
  name: string;
  type?: string;
  optional: boolean;
  defaultValue?: string;
}

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'variable';
}

export interface TestGenerationResult {
  success: boolean;
  testFilePath: string;
  testCode: string;
  originalCode: string;
  coverage?: CoverageInfo;
  errors?: string[];
}

export interface CoverageInfo {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface DocumentationCache {
  jest?: string;
  jasmine?: string;
  lastFetched: {
    jest?: Date;
    jasmine?: Date;
  };
}
