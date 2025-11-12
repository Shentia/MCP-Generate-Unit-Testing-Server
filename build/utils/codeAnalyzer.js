import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { readFileSync } from '../utils/fileUtils.js';
export async function analyzeCode(filePath) {
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
    const result = {
        filePath,
        language,
        functions: [],
        classes: [],
        imports: [],
        exports: []
    };
    traverse.default(ast, {
        ImportDeclaration(path) {
            const importInfo = {
                source: path.node.source.value,
                specifiers: [],
                isDefault: false
            };
            path.node.specifiers.forEach((spec) => {
                if (t.isImportDefaultSpecifier(spec)) {
                    importInfo.isDefault = true;
                    importInfo.specifiers.push(spec.local.name);
                }
                else if (t.isImportSpecifier(spec)) {
                    importInfo.specifiers.push(spec.local.name);
                }
            });
            result.imports.push(importInfo);
        },
        FunctionDeclaration(path) {
            const node = path.node;
            if (!node.id)
                return;
            const funcInfo = {
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
        ArrowFunctionExpression(path) {
            const parent = path.parent;
            if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
                const funcInfo = {
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
        ClassDeclaration(path) {
            const node = path.node;
            if (!node.id)
                return;
            const classInfo = {
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
            node.body.body.forEach((member) => {
                if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
                    const methodInfo = {
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
                }
                else if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
                    const propInfo = {
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
function extractParams(params) {
    return params.map(param => {
        const paramInfo = {
            name: '',
            optional: false
        };
        if (t.isIdentifier(param)) {
            paramInfo.name = param.name;
            paramInfo.type = extractTypeAnnotation(param);
            paramInfo.optional = param.optional || false;
        }
        else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
            paramInfo.name = param.left.name;
            paramInfo.optional = true;
            paramInfo.defaultValue = extractDefaultValue(param.right);
            paramInfo.type = extractTypeAnnotation(param.left);
        }
        else if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
            paramInfo.name = `...${param.argument.name}`;
            paramInfo.type = extractTypeAnnotation(param.argument);
        }
        return paramInfo;
    });
}
function extractReturnType(node) {
    if (node.returnType && t.isTSTypeAnnotation(node.returnType)) {
        return generateTypeString(node.returnType.typeAnnotation);
    }
    return undefined;
}
function extractTypeAnnotation(node) {
    if (node.typeAnnotation && t.isTSTypeAnnotation(node.typeAnnotation)) {
        return generateTypeString(node.typeAnnotation.typeAnnotation);
    }
    return undefined;
}
function generateTypeString(typeNode) {
    if (t.isTSStringKeyword(typeNode))
        return 'string';
    if (t.isTSNumberKeyword(typeNode))
        return 'number';
    if (t.isTSBooleanKeyword(typeNode))
        return 'boolean';
    if (t.isTSVoidKeyword(typeNode))
        return 'void';
    if (t.isTSAnyKeyword(typeNode))
        return 'any';
    if (t.isTSUnknownKeyword(typeNode))
        return 'unknown';
    if (t.isTSNullKeyword(typeNode))
        return 'null';
    if (t.isTSUndefinedKeyword(typeNode))
        return 'undefined';
    if (t.isTSArrayType(typeNode)) {
        return `${generateTypeString(typeNode.elementType)}[]`;
    }
    if (t.isTSTypeReference(typeNode) && t.isIdentifier(typeNode.typeName)) {
        return typeNode.typeName.name;
    }
    return 'any';
}
function extractDefaultValue(node) {
    if (t.isStringLiteral(node))
        return `"${node.value}"`;
    if (t.isNumericLiteral(node))
        return String(node.value);
    if (t.isBooleanLiteral(node))
        return String(node.value);
    if (t.isNullLiteral(node))
        return 'null';
    if (t.isIdentifier(node))
        return node.name;
    return 'undefined';
}
function isExported(path) {
    const parent = path.parent;
    return t.isExportNamedDeclaration(parent) || t.isExportDefaultDeclaration(parent);
}
function isVariableExported(path) {
    let current = path;
    while (current) {
        if (t.isExportNamedDeclaration(current.parent) || t.isExportDefaultDeclaration(current.parent)) {
            return true;
        }
        current = current.parentPath;
    }
    return false;
}
function isPrivateMethod(node) {
    // Check for TypeScript private modifier
    if (node.accessibility === 'private')
        return true;
    return false;
}
function extractComments(node) {
    if (!node.leadingComments)
        return [];
    return node.leadingComments.map((comment) => comment.value.trim());
}
//# sourceMappingURL=codeAnalyzer.js.map