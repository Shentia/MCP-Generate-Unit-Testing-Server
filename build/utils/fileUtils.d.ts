export declare function fileExists(filePath: string): boolean;
export declare function readFileSync(filePath: string): string;
export declare function writeFileSync(filePath: string, content: string): void;
export declare function readJsonFile<T>(filePath: string): T | null;
export declare function findFileUp(fileName: string, startDir: string): string | null;
export declare function getProjectRoot(filePath: string): string;
export declare function ensureDirectory(dirPath: string): void;
export declare function getRelativePath(from: string, to: string): string;
export declare function replaceExtension(filePath: string, newExt: string): string;
export declare function getTestFileName(sourceFile: string, framework: string): string;
//# sourceMappingURL=fileUtils.d.ts.map