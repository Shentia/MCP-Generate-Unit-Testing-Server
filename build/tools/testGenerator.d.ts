import { TestGenerationRequest, TestGenerationResult } from '../types.js';
export declare function generateUnitTest(request: TestGenerationRequest): Promise<TestGenerationResult>;
export declare function generateEnhancedTest(request: TestGenerationRequest, llmPrompt: string): Promise<TestGenerationResult>;
//# sourceMappingURL=testGenerator.d.ts.map