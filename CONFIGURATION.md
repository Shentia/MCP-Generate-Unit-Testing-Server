# MCP Configuration Examples

## Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "generate-unit-testing": {
      "command": "node",
      "args": [
        "/Users/ahmadreza/Documents/Development/project/MCPs/GenerateUnitTesting/build/index.js"
      ]
    }
  }
}
```

## VS Code MCP Configuration

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "generate-unit-testing": {
      "command": "node",
      "args": ["../GenerateUnitTesting/build/index.js"],
      "env": {}
    }
  }
}
```

## Usage Examples

### Example 1: Detect Project and Generate Tests

```
User: "Check my project and generate tests for src/components/Button.tsx"

Assistant will:
1. Call detect_project with filePath: "src/components/Button.tsx"
2. Identify project type (e.g., React with Jest)
3. If Jest is missing, call install_test_framework with permission request
4. Call generate_unit_test to create comprehensive tests
5. Call display_side_by_side to show results
```

### Example 2: Angular Component Testing

```
User: "Generate Karma tests for my Angular service"

Assistant will:
1. Detect Angular project with Karma/Jasmine
2. Fetch latest Jasmine documentation
3. Analyze the service code
4. Generate .spec.ts file with TestBed configuration
5. Include tests for all public methods
6. Display side-by-side comparison
```

### Example 3: Next.js with Jest

```
User: "I need tests for my Next.js API route in pages/api/users.ts"

Assistant will:
1. Detect Next.js project
2. Check for Jest installation
3. Fetch Jest docs including API testing best practices
4. Generate tests covering:
   - GET/POST/PUT/DELETE methods
   - Error handling
   - Request/response validation
   - Edge cases
5. Target >85% coverage
```

## Direct Tool Usage

### Detect Project

```typescript
// Request
{
  "tool": "detect_project",
  "arguments": {
    "filePath": "/path/to/your/project/src/app.ts"
  }
}

// Response
{
  "type": "react",
  "version": "^18.2.0",
  "testFramework": "jest",
  "testFrameworkVersion": "^29.5.0",
  "packageManager": "npm",
  "hasTestConfig": true,
  "configFiles": ["jest.config.js"],
  "recommendedFramework": "jest",
  "needsInstallation": false
}
```

### Install Test Framework

```typescript
// Request
{
  "tool": "install_test_framework",
  "arguments": {
    "projectPath": "/path/to/your/project",
    "framework": "jest",
    "autoInstall": false
  }
}

// Response (requires confirmation)
{
  "message": "Installation commands ready. Please confirm to proceed.",
  "commands": [
    "npm install --save-dev jest @testing-library/react @testing-library/jest-dom"
  ],
  "packageManager": "npm",
  "requiresConfirmation": true
}
```

### Generate Unit Test

```typescript
// Request
{
  "tool": "generate_unit_test",
  "arguments": {
    "filePath": "/path/to/your/project/src/utils/calculator.ts",
    "framework": "jest",
    "coverageTarget": 90,
    "generateForAllPublicMethods": true,
    "includeEdgeCases": true
  }
}

// Response
{
  "success": true,
  "testFilePath": "/path/to/your/project/src/utils/calculator.test.ts",
  "testCode": "import { add, subtract } from './calculator';\n\ndescribe('calculator', () => { ... }",
  "originalCode": "export function add(a: number, b: number) { ... }",
  "errors": []
}
```

### Validate Test

```typescript
// Request
{
  "tool": "validate_test",
  "arguments": {
    "testFilePath": "/path/to/your/project/src/utils/calculator.test.ts",
    "framework": "jest"
  }
}

// Response
{
  "success": true,
  "output": "PASS src/utils/calculator.test.ts\n  calculator\n    ✓ add should sum two numbers\n    ✓ subtract should subtract two numbers\n\nCoverage: 92%"
}
```

### Display Side-by-Side

```typescript
// Request
{
  "tool": "display_side_by_side",
  "arguments": {
    "sourceFilePath": "/path/to/your/project/src/utils/calculator.ts",
    "testFilePath": "/path/to/your/project/src/utils/calculator.test.ts"
  }
}

// Response
{
  "diffUri": "vscode://vscode.diff/...",
  "sourceCode": "export function add...",
  "testCode": "import { add }...",
  "sourceFile": "/path/to/your/project/src/utils/calculator.ts",
  "testFile": "/path/to/your/project/src/utils/calculator.test.ts"
}
```

## Resource Usage

### Fetch Jest Documentation

```typescript
// Request
{
  "resource": "docs://jest/latest"
}

// Response
{
  "contents": [
    {
      "uri": "docs://jest/latest",
      "mimeType": "text/plain",
      "text": "# Jest Documentation\n\nGetting Started..."
    }
  ]
}
```

### Fetch Jasmine Documentation

```typescript
// Request
{
  "resource": "docs://jasmine/latest"
}

// Response
{
  "contents": [
    {
      "uri": "docs://jasmine/latest",
      "mimeType": "text/plain",
      "text": "# Jasmine Documentation\n\nJasmine is a..."
    }
  ]
}
```

## Prompt Usage

### Generate Unit Test Prompt

```typescript
// Request
{
  "prompt": "generate-unit-test",
  "arguments": {
    "sourceCode": "export function multiply(a: number, b: number) { return a * b; }",
    "framework": "jest",
    "coverageTarget": 85
  }
}

// Response (ready to send to LLM)
{
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "You are an expert test engineer. Generate comprehensive unit tests for the following code...\n\nTESTING FRAMEWORK: jest\n\nFRAMEWORK DOCUMENTATION:\n...\n\nSOURCE CODE TO TEST:\n```\nexport function multiply(a: number, b: number) { return a * b; }\n```\n\nREQUIREMENTS:\n1. Generate tests for ALL public functions and methods\n2. Target minimum 85% code coverage\n..."
      }
    }
  ]
}
```

## Tips

1. **Always start with `detect_project`** to understand the project setup
2. **Request permission before installing** packages (set `autoInstall: false`)
3. **Use resources** to fetch latest documentation before generating tests
4. **Display side-by-side** to review generated tests before committing
5. **Run validation** to ensure tests pass and meet coverage targets

## Troubleshooting

### Issue: MCP server not connecting
**Solution**: Ensure the path to `build/index.js` is absolute and correct

### Issue: Dependencies not found
**Solution**: Run `npm install` in the GenerateUnitTesting directory

### Issue: Tests failing after generation
**Solution**: Use `validate_test` tool to see error details and regenerate with fixes

### Issue: Low coverage
**Solution**: Increase `coverageTarget` parameter or add `includeEdgeCases: true`
