import * as fs from 'fs';
import * as path from 'path';
export function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch {
        return false;
    }
}
export function readFileSync(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}
export function writeFileSync(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
}
export function readJsonFile(filePath) {
    try {
        const content = readFileSync(filePath);
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export function findFileUp(fileName, startDir) {
    let currentDir = startDir;
    const root = path.parse(currentDir).root;
    while (currentDir !== root) {
        const filePath = path.join(currentDir, fileName);
        if (fileExists(filePath)) {
            return filePath;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}
export function getProjectRoot(filePath) {
    const dir = path.dirname(filePath);
    const packageJsonPath = findFileUp('package.json', dir);
    return packageJsonPath ? path.dirname(packageJsonPath) : dir;
}
export function ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
export function getRelativePath(from, to) {
    const relative = path.relative(from, to);
    return relative.startsWith('.') ? relative : `./${relative}`;
}
export function replaceExtension(filePath, newExt) {
    const parsed = path.parse(filePath);
    return path.join(parsed.dir, `${parsed.name}${newExt}`);
}
export function getTestFileName(sourceFile, framework) {
    const parsed = path.parse(sourceFile);
    const ext = parsed.ext;
    if (framework === 'karma' || framework === 'jasmine') {
        return path.join(parsed.dir, `${parsed.name}.spec${ext}`);
    }
    // Jest default
    return path.join(parsed.dir, `${parsed.name}.test${ext}`);
}
//# sourceMappingURL=fileUtils.js.map