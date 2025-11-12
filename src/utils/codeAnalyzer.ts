import * as parser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { CodeAnalysisResult, FunctionInfo, ClassInfo, MethodInfo, PropertyInfo, ParamInfo, ImportInfo, ExportInfo } from '../types.js';
import { readFileSync } from '../utils/fileUtils.js';

export async function analyzeCode(filePath: string): Promise<CodeAnalysisResult> {
  const code = readFileSync(filePath);
  const language = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'typescript' : 'javascript';
  
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'typescript',
      'jsx',
      'decorators-legacy',
      'classProperties',
      'asyncGenerators',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'objectRestSpread',
      'optionalChaining',
      'nullishCoalescingOperator'
    ]
  });

  const result: CodeAnalysisResult = {
    filePath,
    language,
    functions: [],
    classes: [],
    imports: [],
    exports: []
  };

  (traverse as any).default(ast, {
    ImportDeclaration(path: any) {
      const importInfo: ImportInfo = {
        source: path.node.source.value,
        specifiers: [],
        isDefault: false
      };

      path.node.specifiers.forEach((spec: any) => {
        if (t.isImportDefaultSpecifier(spec)) {
          importInfo.isDefault = true;
          importInfo.specifiers.push(spec.local.name);
        } else if (t.isImportSpecifier(spec)) {
          importInfo.specifiers.push(spec.local.name);
        }
      });

      result.imports.push(importInfo);
    },

    FunctionDeclaration(path: any) {
      const node = path.node;
      if (!node.id) return;

      const funcInfo: FunctionInfo = {
        name: node.id.name,
        params: extractParams(node.params),
        returnType: extractReturnType(node),
        isAsync: node.async || false,
        isExported: isExported(path),
        location: {
          start: { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 },
          end: { line: node.loc?.end.line || 0, column: node.loc?.end.column || 0 }
        },
        leadingComments: extractComments(node)
      };

      result.functions.push(funcInfo);

      if (funcInfo.isExported) {
        result.exports.push({ name: funcInfo.name, type: 'function' });
      }
    },

    ArrowFunctionExpression(path: any) {
      const parent = path.parent;
      if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
        const funcInfo: FunctionInfo = {
          name: parent.id.name,
          params: extractParams(path.node.params),
          returnType: extractReturnType(path.node),
          isAsync: path.node.async || false,
          isExported: isVariableExported(path),
          location: {
            start: { line: path.node.loc?.start.line || 0, column: path.node.loc?.start.column || 0 },
            end: { line: path.node.loc?.end.line || 0, column: path.node.loc?.end.column || 0 }
          },
          leadingComments: extractComments(path.node)
        };

        result.functions.push(funcInfo);

        if (funcInfo.isExported) {
          result.exports.push({ name: funcInfo.name, type: 'function' });
        }
      }
    },

    ClassDeclaration(path: any) {
      const node = path.node;
      if (!node.id) return;

      const classInfo: ClassInfo = {
        name: node.id.name,
        methods: [],
        properties: [],
        isExported: isExported(path),
        location: {
          start: { line: node.loc?.start.line || 0, column: node.loc?.start.column || 0 },
          end: { line: node.loc?.end.line || 0, column: node.loc?.end.column || 0 }
        }
      };

      // Extract methods and properties
      node.body.body.forEach((member: any) => {
        if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
          const methodInfo: MethodInfo = {
            name: member.key.name,
            params: extractParams(member.params),
            returnType: extractReturnType(member),
            isAsync: member.async || false,
            isPublic: !member.key.name.startsWith('_') && !isPrivateMethod(member),
            isStatic: member.static || false,
            location: {
              start: { line: member.loc?.start.line || 0, column: member.loc?.start.column || 0 },
              end: { line: member.loc?.end.line || 0, column: member.loc?.end.column || 0 }
            }
          };
          classInfo.methods.push(methodInfo);
        } else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
          const propInfo: PropertyInfo = {
            name: member.key.name,
            type: extractTypeAnnotation(member),
            isPublic: !member.key.name.startsWith('_')
          };
          classInfo.properties.push(propInfo);
        }
      });

      result.classes.push(classInfo);

      if (classInfo.isExported) {
        result.exports.push({ name: classInfo.name, type: 'class' });
      }
    }
  });

  return result;
}

function extractParams(params: any[]): ParamInfo[] {
  return params.map(param => {
    const paramInfo: ParamInfo = {
      name: '',
      optional: false
    };

    if (t.isIdentifier(param)) {
      paramInfo.name = param.name;
      paramInfo.type = extractTypeAnnotation(param);
      paramInfo.optional = param.optional || false;
    } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
      paramInfo.name = param.left.name;
      paramInfo.optional = true;
      paramInfo.defaultValue = extractDefaultValue(param.right);
      paramInfo.type = extractTypeAnnotation(param.left);
    } else if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
      paramInfo.name = `...${param.argument.name}`;
      paramInfo.type = extractTypeAnnotation(param.argument);
    }

    return paramInfo;
  });
}

function extractReturnType(node: any): string | undefined {
  if (node.returnType && t.isTSTypeAnnotation(node.returnType)) {
    return generateTypeString(node.returnType.typeAnnotation);
  }
  return undefined;
}

function extractTypeAnnotation(node: any): string | undefined {
  if (node.typeAnnotation && t.isTSTypeAnnotation(node.typeAnnotation)) {
    return generateTypeString(node.typeAnnotation.typeAnnotation);
  }
  return undefined;
}

function generateTypeString(typeNode: any): string {
  if (t.isTSStringKeyword(typeNode)) return 'string';
  if (t.isTSNumberKeyword(typeNode)) return 'number';
  if (t.isTSBooleanKeyword(typeNode)) return 'boolean';
  if (t.isTSVoidKeyword(typeNode)) return 'void';
  if (t.isTSAnyKeyword(typeNode)) return 'any';
  if (t.isTSUnknownKeyword(typeNode)) return 'unknown';
  if (t.isTSNullKeyword(typeNode)) return 'null';
  if (t.isTSUndefinedKeyword(typeNode)) return 'undefined';
  if (t.isTSArrayType(typeNode)) {
    return `${generateTypeString(typeNode.elementType)}[]`;
  }
  if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.name;
  }
  return 'any';
}

function extractDefaultValue(node: any): string {
  if (t.isStringLiteral(node)) return `"${node.value}"`;
  if (t.isNumericLiteral(node)) return String(node.value);
  if (t.isBooleanLiteral(node)) return String(node.value);
  if (t.isNullLiteral(node)) return 'null';
  if (t.isIdentifier(node)) return node.name;
  return 'undefined';
}

function isExported(path: any): boolean {
  const parent = path.parent;
  return t.isExportNamedDeclaration(parent) || t.isExportDefaultDeclaration(parent);
}

function isVariableExported(path: any): boolean {
  let current = path;
  while (current) {
    if (t.isExportNamedDeclaration(current.parent) || t.isExportDefaultDeclaration(current.parent)) {
      return true;
    }
    current = current.parentPath;
  }
  return false;
}

function isPrivateMethod(node: any): boolean {
  // Check for TypeScript private modifier
  if (node.accessibility === 'private') return true;
  return false;
}

function extractComments(node: any): string[] {
  if (!node.leadingComments) return [];
  return node.leadingComments.map((comment: any) => comment.value.trim());
}
