import { CodeAnalysisResult, FunctionInfo, ClassInfo, MethodInfo } from '../types.js';
export interface TestTemplate {
    generateImports(analysis: CodeAnalysisResult, testFramework: string): string;
    generateTestSuite(analysis: CodeAnalysisResult, framework: string): string;
    generateFunctionTest(func: FunctionInfo, sourceFile: string): string;
    generateClassTest(cls: ClassInfo, sourceFile: string): string;
    generateMethodTest(method: MethodInfo, className: string): string;
}
export declare class JestTemplate implements TestTemplate {
    generateImports(analysis: CodeAnalysisResult, testFramework: string): string;
    generateTestSuite(analysis: CodeAnalysisResult, framework: string): string;
    generateFunctionTest(func: FunctionInfo, sourceFile: string): string;
    generateClassTest(cls: ClassInfo, sourceFile: string): string;
    generateMethodTest(method: MethodInfo, className: string): string;
    private generateFunctionCall;
    private generateMethodCall;
    private generateConstructorParams;
    private generateEdgeCaseTests;
    private getMockValue;
}
export declare class JasminKarmaTemplate implements TestTemplate {
    generateImports(analysis: CodeAnalysisResult, testFramework: string): string;
    generateTestSuite(analysis: CodeAnalysisResult, framework: string): string;
    generateFunctionTest(func: FunctionInfo, sourceFile: string): string;
    generateClassTest(cls: ClassInfo, sourceFile: string): string;
    generateMethodTest(method: MethodInfo, className: string): string;
    private generateFunctionCall;
    private generateMethodCall;
    private generateConstructorParams;
    private getMockValue;
}
export declare function getTemplate(framework: 'jest' | 'karma' | 'jasmine'): TestTemplate;
//# sourceMappingURL=testTemplates.d.ts.map