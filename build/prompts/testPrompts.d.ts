export declare const TEST_GENERATION_PROMPTS: {
    generateUnitTest: {
        name: string;
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
    };
    generateEdgeCases: {
        name: string;
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
    };
    generateMocks: {
        name: string;
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
    };
};
export declare function getTestGenerationPrompt(sourceCode: string, framework: string, docs: string, coverageTarget?: number): string;
export declare function getEdgeCasePrompt(functionCode: string, framework: string): string;
export declare function getMockGenerationPrompt(dependencies: string[], framework: string): string;
//# sourceMappingURL=testPrompts.d.ts.map