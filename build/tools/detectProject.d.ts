import { ProjectInfo } from '../types.js';
export declare function detectProject(filePath: string): Promise<ProjectInfo>;
export declare function getRecommendedFramework(projectInfo: ProjectInfo): 'jest' | 'karma' | 'jasmine';
export declare function getInstallCommand(framework: 'jest' | 'karma' | 'jasmine', projectType: string, packageManager: string): string[];
//# sourceMappingURL=detectProject.d.ts.map