#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { detectProject, getRecommendedFramework, getInstallCommand } from './tools/detectProject.js';
import { generateUnitTest } from './tools/testGenerator.js';
import { docFetcher } from './resources/documentationFetcher.js';
import { TEST_GENERATION_PROMPTS, getTestGenerationPrompt } from './prompts/testPrompts.js';
// Create server instance
const server = new Server({
    name: 'mcp-generate-unit-testing',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {},
    },
});
// Tool: Detect Project
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'detect_project',
                description: 'Detect project type (Angular/React/Next.js) and testing framework',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Path to a file in the project',
                        },
                    },
                    required: ['filePath'],
                },
            },
            {
                name: 'install_test_framework',
                description: 'Check and install missing test framework with user permission',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: {
                            type: 'string',
                            description: 'Root path of the project',
                        },
                        framework: {
                            type: 'string',
                            enum: ['jest', 'karma', 'jasmine'],
                            description: 'Testing framework to install',
                        },
                        autoInstall: {
                            type: 'boolean',
                            description: 'Automatically install without confirmation',
                            default: false,
                        },
                    },
                    required: ['projectPath', 'framework'],
                },
            },
            {
                name: 'generate_unit_test',
                description: 'Generate unit tests for a source file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Path to the source file',
                        },
                        framework: {
                            type: 'string',
                            enum: ['jest', 'karma', 'jasmine'],
                            description: 'Testing framework to use',
                        },
                        coverageTarget: {
                            type: 'number',
                            description: 'Target coverage percentage (default: 85)',
                            default: 85,
                        },
                        generateForAllPublicMethods: {
                            type: 'boolean',
                            description: 'Generate tests for all public methods',
                            default: true,
                        },
                        includeEdgeCases: {
                            type: 'boolean',
                            description: 'Include edge case tests',
                            default: true,
                        },
                    },
                    required: ['filePath', 'framework'],
                },
            },
            {
                name: 'validate_test',
                description: 'Run generated tests and calculate coverage',
                inputSchema: {
                    type: 'object',
                    properties: {
                        testFilePath: {
                            type: 'string',
                            description: 'Path to the test file',
                        },
                        framework: {
                            type: 'string',
                            enum: ['jest', 'karma', 'jasmine'],
                            description: 'Testing framework',
                        },
                    },
                    required: ['testFilePath', 'framework'],
                },
            },
            {
                name: 'display_side_by_side',
                description: 'Display source and test code side by side for validation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourceFilePath: {
                            type: 'string',
                            description: 'Path to source file',
                        },
                        testFilePath: {
                            type: 'string',
                            description: 'Path to test file',
                        },
                    },
                    required: ['sourceFilePath', 'testFilePath'],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'detect_project': {
                const { filePath } = args;
                const projectInfo = await detectProject(filePath);
                const recommendedFramework = getRecommendedFramework(projectInfo);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                ...projectInfo,
                                recommendedFramework,
                                needsInstallation: projectInfo.testFramework === 'none',
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'install_test_framework': {
                const { projectPath, framework, autoInstall } = args;
                const projectInfo = await detectProject(projectPath);
                const commands = getInstallCommand(framework, projectInfo.type, projectInfo.packageManager);
                if (!autoInstall) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    message: 'Installation commands ready. Please confirm to proceed.',
                                    commands,
                                    packageManager: projectInfo.packageManager,
                                    requiresConfirmation: true,
                                }),
                            },
                        ],
                    };
                }
                // Execute installation
                const { execSync } = await import('child_process');
                try {
                    for (const cmd of commands) {
                        execSync(cmd, { cwd: projectPath, stdio: 'inherit' });
                    }
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    success: true,
                                    message: `${framework} installed successfully`,
                                    commands,
                                }),
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                    commands,
                                }),
                            },
                        ],
                    };
                }
            }
            case 'generate_unit_test': {
                const request = args;
                const result = await generateUnitTest(request);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'validate_test': {
                const { testFilePath, framework } = args;
                const { execSync } = await import('child_process');
                const path = await import('path');
                const projectRoot = path.dirname(testFilePath);
                try {
                    let output = '';
                    if (framework === 'jest') {
                        output = execSync(`npm test -- ${testFilePath} --coverage`, {
                            cwd: projectRoot,
                            encoding: 'utf-8',
                        });
                    }
                    else if (framework === 'karma') {
                        output = execSync('npm test', {
                            cwd: projectRoot,
                            encoding: 'utf-8',
                        });
                    }
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    success: true,
                                    output,
                                }),
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                }),
                            },
                        ],
                    };
                }
            }
            case 'display_side_by_side': {
                const { sourceFilePath, testFilePath } = args;
                const fs = await import('fs');
                const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');
                const testCode = fs.readFileSync(testFilePath, 'utf-8');
                // Create VS Code diff URI
                const diffUri = `vscode://vscode.diff/${encodeURIComponent(sourceFilePath)}/${encodeURIComponent(testFilePath)}?Source vs Tests`;
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                diffUri,
                                sourceCode,
                                testCode,
                                sourceFile: sourceFilePath,
                                testFile: testFilePath,
                            }),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: error instanceof Error ? error.message : String(error),
                    }),
                },
            ],
            isError: true,
        };
    }
});
// Resources: Documentation
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: 'docs://jest/latest',
                name: 'Jest Documentation',
                description: 'Latest Jest testing framework documentation',
                mimeType: 'text/plain',
            },
            {
                uri: 'docs://jasmine/latest',
                name: 'Jasmine Documentation',
                description: 'Latest Jasmine testing framework documentation',
                mimeType: 'text/plain',
            },
        ],
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === 'docs://jest/latest') {
        const docs = await docFetcher.fetchJestDocs();
        return {
            contents: [
                {
                    uri,
                    mimeType: 'text/plain',
                    text: docs,
                },
            ],
        };
    }
    if (uri === 'docs://jasmine/latest') {
        const docs = await docFetcher.fetchJasmineDocs();
        return {
            contents: [
                {
                    uri,
                    mimeType: 'text/plain',
                    text: docs,
                },
            ],
        };
    }
    throw new Error(`Unknown resource: ${uri}`);
});
// Prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: TEST_GENERATION_PROMPTS.generateUnitTest.name,
                description: TEST_GENERATION_PROMPTS.generateUnitTest.description,
                arguments: TEST_GENERATION_PROMPTS.generateUnitTest.arguments,
            },
            {
                name: TEST_GENERATION_PROMPTS.generateEdgeCases.name,
                description: TEST_GENERATION_PROMPTS.generateEdgeCases.description,
                arguments: TEST_GENERATION_PROMPTS.generateEdgeCases.arguments,
            },
            {
                name: TEST_GENERATION_PROMPTS.generateMocks.name,
                description: TEST_GENERATION_PROMPTS.generateMocks.description,
                arguments: TEST_GENERATION_PROMPTS.generateMocks.arguments,
            },
        ],
    };
});
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === TEST_GENERATION_PROMPTS.generateUnitTest.name) {
        const { sourceCode, framework, coverageTarget } = args;
        let docs = '';
        if (framework === 'jest') {
            docs = await docFetcher.fetchJestDocs();
        }
        else {
            docs = await docFetcher.fetchJasmineDocs();
        }
        const prompt = getTestGenerationPrompt(sourceCode, framework, docs, coverageTarget);
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: prompt,
                    },
                },
            ],
        };
    }
    throw new Error(`Unknown prompt: ${name}`);
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Generate Unit Testing Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map