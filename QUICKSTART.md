# Quick Start Guide

## Installation

1. **Clone or navigate to the project:**
```bash
cd /Users/ahmadreza/Documents/Development/project/MCPs/GenerateUnitTesting
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

## Configuration

### For Claude Desktop

1. Open Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the MCP server configuration:
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

3. Restart Claude Desktop

## Basic Usage Flow

### Step 1: Detect Your Project

Ask Claude:
```
"Can you check my project at /path/to/my/project/src/app.ts and tell me what testing setup I have?"
```

Claude will use the `detect_project` tool and respond with:
- Project type (Angular/React/Next.js)
- Current testing framework (if any)
- Recommended testing framework
- Whether installation is needed

### Step 2: Install Testing Framework (if needed)

If no testing framework is detected, Claude will ask:
```
"Your project doesn't have Jest installed. Would you like me to install it?"
```

Respond: `"Yes, please install Jest"`

Claude will use `install_test_framework` to set up the testing environment.

### Step 3: Generate Tests

Ask Claude:
```
"Generate unit tests for my calculator.ts file with >85% coverage"
```

Claude will:
1. Fetch the latest Jest/Jasmine documentation
2. Analyze your source code
3. Generate comprehensive tests
4. Create the test file

### Step 4: Review Results

Claude will automatically display the results side-by-side, showing:
- Original source code
- Generated test code
- Coverage information

### Step 5: Validate Tests

Ask Claude:
```
"Run the tests and show me the coverage report"
```

Claude will use `validate_test` to execute the tests and report results.

## Example Conversations

### Example 1: React Component Testing

**You:**
```
I have a React Button component in src/components/Button.tsx. 
Can you generate comprehensive Jest tests for it?
```

**Claude:**
```
I'll help you generate tests for your Button component. Let me first check your project setup.

[Calls detect_project]

I see you're using React 18.2.0 with Jest already configured. Great! 
Now I'll fetch the latest Jest documentation and analyze your Button component.

[Calls generate_unit_test with React Testing Library patterns]

I've generated comprehensive tests for your Button component. The tests include:

1. Rendering tests
2. Click event handling
3. Disabled state testing
4. Variant prop testing
5. Accessibility tests

The test file has been created at: src/components/Button.test.tsx

Would you like me to show you the side-by-side comparison?
```

### Example 2: Angular Service Testing

**You:**
```
Generate Karma/Jasmine tests for my UserService in Angular
```

**Claude:**
```
I'll create tests for your Angular UserService using Karma and Jasmine.

[Calls detect_project - finds Angular with Karma/Jasmine]
[Fetches Jasmine documentation]
[Analyzes UserService code]
[Generates .spec.ts file with TestBed configuration]

I've generated tests covering:
- Service instantiation
- HTTP calls (with HttpClientTestingModule)
- Error handling
- Observable streams
- Public methods

The test file has been created at: src/services/user.service.spec.ts

Coverage: 92%
```

### Example 3: Next.js API Route Testing

**You:**
```
I need tests for my Next.js API route in pages/api/users.ts
```

**Claude:**
```
I'll generate Jest tests for your Next.js API route.

[Detects Next.js project]
[Checks for Jest - installs if needed]
[Generates tests for API handlers]

Tests created covering:
- GET request handling
- POST request with validation
- Error responses (400, 404, 500)
- Request body parsing
- Query parameter handling
- Edge cases

Coverage: 88%

Test file: pages/api/users.test.ts
```

## Testing the Examples

The project includes example files you can use to test the MCP server:

### Test the Calculator Example

```bash
# In Claude, ask:
"Generate tests for the calculator.ts file in the examples directory"
```

Expected output: Tests for Calculator class and utility functions

### Test the React Button Example

```bash
# In Claude, ask:
"Generate React Testing Library tests for examples/Button.tsx"
```

Expected output: Tests for Button and Counter components

## Command Line Testing (Development)

While the MCP server is designed to be used through Claude Desktop or other MCP clients, you can test individual functions during development:

```bash
# Build the project
npm run build

# Run the built server (will wait for stdio input)
npm start
```

## Troubleshooting

### Issue: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution:**
```bash
npm install
npm run build
```

### Issue: "MCP server not responding in Claude"

**Solution:**
1. Check Claude Desktop logs
2. Verify the path in configuration is absolute and correct
3. Ensure the build folder exists: `ls build/index.js`
4. Restart Claude Desktop

### Issue: "Tests fail after generation"

**Solution:**
1. Ask Claude to validate: `"Run the tests and show errors"`
2. Ask for fixes: `"The tests are failing with [error]. Can you fix them?"`
3. Check that dependencies are installed in your target project

### Issue: "Coverage below target"

**Solution:**
Ask Claude: `"The coverage is only 75%. Can you add more tests to reach 85%?"`

## Advanced Usage

### Custom Coverage Targets

```
"Generate tests with 95% coverage target for my critical business logic file"
```

### Edge Case Focus

```
"Generate tests focusing on edge cases and error scenarios for my validation functions"
```

### Mock-Heavy Testing

```
"Generate tests for my service that uses multiple external APIs - please include proper mocks"
```

### Framework-Specific Patterns

```
"Generate Angular tests using ComponentFixture and TestBed for my component with ViewChild"
```

## Best Practices

1. **Always start with project detection** - Let Claude understand your setup first
2. **Review generated tests** - Use the side-by-side display before committing
3. **Iterate if needed** - Ask Claude to add more tests or fix issues
4. **Run validation** - Always validate tests pass before committing
5. **Keep docs fresh** - The server fetches latest docs automatically each time

## Next Steps

1. Try generating tests for your own project files
2. Experiment with different coverage targets
3. Ask Claude to explain the generated tests
4. Request modifications to match your team's testing patterns
5. Share feedback to improve the MCP server

## Support

If you encounter issues:
1. Check the logs in Claude Desktop
2. Verify your project structure matches Angular/React/Next.js patterns
3. Ensure testing frameworks are properly configured
4. Ask Claude for help - it can diagnose many issues using the MCP tools

Happy Testing! 🎉
