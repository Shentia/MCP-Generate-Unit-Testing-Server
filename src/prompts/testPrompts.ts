export const TEST_GENERATION_PROMPTS = {
  generateUnitTest: {
    name: 'generate-unit-test',
    description: 'Generate comprehensive unit tests for a given source file',
    arguments: [
      {
        name: 'sourceCode',
        description: 'The source code to generate tests for',
        required: true
      },
      {
        name: 'framework',
        description: 'Testing framework (jest, jasmine, karma)',
        required: true
      },
      {
        name: 'projectType',
        description: 'Project type (angular, react, nextjs)',
        required: false
      },
      {
        name: 'coverageTarget',
        description: 'Target coverage percentage (default: 85)',
        required: false
      }
    ]
  },

  generateEdgeCases: {
    name: 'generate-edge-cases',
    description: 'Generate edge case tests for a function',
    arguments: [
      {
        name: 'functionCode',
        description: 'The function code to test',
        required: true
      },
      {
        name: 'framework',
        description: 'Testing framework',
        required: true
      }
    ]
  },

  generateMocks: {
    name: 'generate-mocks',
    description: 'Generate mock implementations for dependencies',
    arguments: [
      {
        name: 'dependencies',
        description: 'List of dependencies to mock',
        required: true
      },
      {
        name: 'framework',
        description: 'Testing framework',
        required: true
      }
    ]
  }
};

export function getTestGenerationPrompt(
  sourceCode: string,
  framework: string,
  docs: string,
  coverageTarget: number = 85
): string {
  return `You are an expert test engineer. Generate comprehensive unit tests for the following code.

TESTING FRAMEWORK: ${framework}

FRAMEWORK DOCUMENTATION:
${docs}

SOURCE CODE TO TEST:
\`\`\`
${sourceCode}
\`\`\`

REQUIREMENTS:
1. Generate tests for ALL public functions and methods
2. Target minimum ${coverageTarget}% code coverage
3. Include edge cases and error handling tests
4. Use appropriate matchers and assertions
5. Follow ${framework} best practices
6. Include setup and teardown where needed
7. Mock external dependencies
8. Test both success and failure scenarios

Generate ONLY the test code, properly formatted and ready to run.`;
}

export function getEdgeCasePrompt(functionCode: string, framework: string): string {
  return `Generate edge case tests for this function using ${framework}:

\`\`\`
${functionCode}
\`\`\`

Include tests for:
- Null/undefined inputs
- Empty strings/arrays
- Boundary values
- Type errors
- Invalid inputs
- Async errors (if applicable)`;
}

export function getMockGenerationPrompt(dependencies: string[], framework: string): string {
  return `Generate mock implementations for these dependencies using ${framework}:

${dependencies.join('\n')}

Create realistic mocks with:
- Proper method signatures
- Spy/mock functions
- Return value configuration
- Call verification`;
}
