# MCP Generate Unit Testing Server

An intelligent Model Context Protocol (MCP) server that automatically generates comprehensive unit tests for Angular, React, and Next.js projects using Jest, Karma/Jasmine, or other testing frameworks.

<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/cbc6b944-52cd-4247-88ff-c6111f43555d" />



## Features

- 🔍 **Automatic Project Detection** - Detects Angular, React, or Next.js projects and their versions
- 📦 **Framework Management** - Checks for testing frameworks and offers automated installation
- 📚 **Live Documentation Fetching** - Retrieves latest Jest and Jasmine documentation before generating tests
- 🤖 **LLM-Powered Generation** - Uses Claude Sonnet 4.5+ for intelligent test generation
- 🎯 **High Coverage Target** - Generates tests targeting >85% code coverage
- ✅ **All Public Methods** - Creates tests for all exported functions and public class methods
- 🔄 **Side-by-Side Validation** - Displays source and test code for easy review
- 🛠️ **Multiple Frameworks** - Supports Jest, Karma/Jasmine, and Vitest

## Installation

```bash
npm install
npm run build
```

## Usage

### As MCP Server

Add to your MCP client configuration (e.g., Claude Desktop, VS Code with MCP):

```json
{
  "mcpServers": {
    "generate-unit-testing": {
      "command": "node",
      "args": ["/path/to/GenerateUnitTesting/build/index.js"]
    }
  }
}
```

### Available Tools

#### 1. `detect_project`
Detects the project type and testing framework.

```typescript
{
  "filePath": "/path/to/your/project/src/component.ts"
}
```

#### 2. `install_test_framework`
Installs missing testing framework with user permission.

```typescript
{
  "projectPath": "/path/to/your/project",
  "framework": "jest",
  "autoInstall": false
}
```

#### 3. `generate_unit_test`
Generates comprehensive unit tests for a source file.

```typescript
{
  "filePath": "/path/to/your/project/src/component.ts",
  "framework": "jest",
  "coverageTarget": 85,
  "generateForAllPublicMethods": true,
  "includeEdgeCases": true
}
```

#### 4. `validate_test`
Runs generated tests and calculates coverage.

```typescript
{
  "testFilePath": "/path/to/your/project/src/component.test.ts",
  "framework": "jest"
}
```

#### 5. `display_side_by_side`
Creates side-by-side comparison of source and test code.

```typescript
{
  "sourceFilePath": "/path/to/your/project/src/component.ts",
  "testFilePath": "/path/to/your/project/src/component.test.ts"
}
```

### Available Resources

- `docs://jest/latest` - Latest Jest documentation
- `docs://jasmine/latest` - Latest Jasmine documentation

### Available Prompts

- `generate-unit-test` - Comprehensive unit test generation prompt
- `generate-edge-cases` - Edge case test generation prompt
- `generate-mocks` - Mock generation prompt

## Architecture

```
src/
├── index.ts                 # Main MCP server entry point
├── types.ts                 # TypeScript type definitions
├── tools/
│   ├── detectProject.ts     # Project and framework detection
│   └── testGenerator.ts     # Test generation logic
├── resources/
│   └── documentationFetcher.ts  # Live doc fetching from Jest/Jasmine
├── templates/
│   └── testTemplates.ts     # Framework-specific test templates
├── prompts/
│   └── testPrompts.ts       # LLM prompts for test generation
└── utils/
    ├── fileUtils.ts         # File system utilities
    └── codeAnalyzer.ts      # AST-based code analysis
```

## Workflow

1. **Project Detection** - Analyzes `package.json` to identify project type and existing test setup
2. **Framework Check** - Verifies testing framework installation, prompts for installation if missing
3. **Documentation Fetch** - Retrieves latest framework documentation from official sources
4. **Code Analysis** - Parses source code using Babel to extract functions, classes, and methods
5. **Test Generation** - Uses LLM with context (code + docs + templates) to generate comprehensive tests
6. **Validation** - Runs tests and calculates coverage
7. **Display** - Shows side-by-side comparison for developer review

## Supported Frameworks

### Jest
- React and Next.js projects
- TypeScript/JavaScript
- Modern async/await patterns
- Mock functions and spies

### Karma/Jasmine
- Angular projects
- Component testing with TestBed
- Service and pipe testing
- Traditional describe/it syntax

## Coverage Goals

The server targets **>85% code coverage** by generating:

- Tests for all public functions
- Tests for all public class methods
- Edge case scenarios
- Error handling tests
- Async operation tests
- Mock implementations for dependencies

## Example Output

For a React component:

```typescript
// Original: Button.tsx
export const Button = ({ onClick, label }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

Generated test:

```typescript
// Generated: Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with label', () => {
    const { getByText } = render(<Button label="Click me" onClick={() => {}} />);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(<Button label="Click me" onClick={handleClick} />);
    fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ... more tests for edge cases;
```

## Requirements

- Node.js 18+
- TypeScript 5+
- MCP client (Claude Desktop, VS Code with MCP extension, etc.)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Start server
npm start
```

## Configuration

The server automatically detects:
- Package manager (npm, yarn, pnpm)
- Project type (Angular, React, Next.js)
- Existing test framework
- TypeScript/JavaScript

No manual configuration required!

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Code follows existing patterns
- Tests are included for new features
- Documentation is updated

## Support

- For issues or questions, please open an issue on the repository.
- Author: Ahmadreza Shamimi (https://github.com/shentia)
