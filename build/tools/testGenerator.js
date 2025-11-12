import { analyzeCode } from '../utils/codeAnalyzer.js';
import { getTemplate } from '../templates/testTemplates.js';
import { getTestFileName, writeFileSync } from '../utils/fileUtils.js';
import { docFetcher } from '../resources/documentationFetcher.js';
export async function generateUnitTest(request) {
    try {
        // Step 1: Analyze the source code
        const analysis = await analyzeCode(request.filePath);
        // Step 2: Fetch latest documentation for the framework
        let docs = '';
        if (request.framework === 'jest') {
            docs = await docFetcher.fetchJestDocs();
        }
        else if (request.framework === 'jasmine' || request.framework === 'karma') {
            docs = await docFetcher.fetchJasmineDocs();
        }
        // Step 3: Get the appropriate template
        const template = getTemplate(request.framework);
        // Step 4: Generate imports
        const imports = template.generateImports(analysis, request.framework);
        // Step 5: Generate test suite
        const testSuite = template.generateTestSuite(analysis, request.framework);
        // Step 6: Combine into complete test file
        const testCode = `${imports}\n\n${testSuite}`;
        // Step 7: Determine test file path
        const testFilePath = getTestFileName(request.filePath, request.framework);
        // Step 8: Write test file
        writeFileSync(testFilePath, testCode);
        // Step 9: Read original code for comparison
        const fs = await import('fs');
        const originalCode = fs.readFileSync(request.filePath, 'utf-8');
        return {
            success: true,
            testFilePath,
            testCode,
            originalCode,
            errors: []
        };
    }
    catch (error) {
        return {
            success: false,
            testFilePath: '',
            testCode: '',
            originalCode: '',
            errors: [error instanceof Error ? error.message : String(error)]
        };
    }
}
export async function generateEnhancedTest(request, llmPrompt) {
    try {
        // Analyze code
        const analysis = await analyzeCode(request.filePath);
        // Fetch documentation
        let docs = '';
        if (request.framework === 'jest') {
            docs = await docFetcher.fetchJestDocs();
        }
        else {
            docs = await docFetcher.fetchJasmineDocs();
        }
        // Get template-generated base
        const template = getTemplate(request.framework);
        const baseImports = template.generateImports(analysis, request.framework);
        const baseTests = template.generateTestSuite(analysis, request.framework);
        // Prepare context for LLM
        const fs = await import('fs');
        const sourceCode = fs.readFileSync(request.filePath, 'utf-8');
        const context = {
            sourceCode,
            analysis,
            framework: request.framework,
            docs: docs.substring(0, 10000), // Limit doc size
            baseTests,
            coverageTarget: request.coverageTarget,
            includeEdgeCases: request.includeEdgeCases
        };
        // In a real implementation, this would call the LLM via MCP
        // For now, we'll use the template-based approach
        const testCode = `${baseImports}\n\n${baseTests}`;
        const testFilePath = getTestFileName(request.filePath, request.framework);
        writeFileSync(testFilePath, testCode);
        return {
            success: true,
            testFilePath,
            testCode,
            originalCode: sourceCode,
            errors: []
        };
    }
    catch (error) {
        return {
            success: false,
            testFilePath: '',
            testCode: '',
            originalCode: '',
            errors: [error instanceof Error ? error.message : String(error)]
        };
    }
}
//# sourceMappingURL=testGenerator.js.map