import * as path from 'path';
import { fileExists, readJsonFile, getProjectRoot } from '../utils/fileUtils.js';
export async function detectProject(filePath) {
    const projectRoot = getProjectRoot(filePath);
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const projectInfo = {
        type: 'unknown',
        version: '',
        testFramework: 'none',
        packageManager: detectPackageManager(projectRoot),
        hasTestConfig: false,
        configFiles: []
    };
    // Read package.json
    const packageJson = readJsonFile(packageJsonPath);
    if (!packageJson) {
        return projectInfo;
    }
    // Detect project type
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps['@angular/core']) {
        projectInfo.type = 'angular';
        projectInfo.version = deps['@angular/core'];
    }
    else if (deps['next']) {
        projectInfo.type = 'nextjs';
        projectInfo.version = deps['next'];
    }
    else if (deps['react']) {
        projectInfo.type = 'react';
        projectInfo.version = deps['react'];
    }
    // Detect test framework
    if (deps['jest'] || deps['@jest/core']) {
        projectInfo.testFramework = 'jest';
        projectInfo.testFrameworkVersion = deps['jest'] || deps['@jest/core'];
    }
    else if (deps['karma'] || deps['karma-jasmine']) {
        projectInfo.testFramework = 'karma';
        projectInfo.testFrameworkVersion = deps['karma'];
    }
    else if (deps['jasmine']) {
        projectInfo.testFramework = 'jasmine';
        projectInfo.testFrameworkVersion = deps['jasmine'];
    }
    else if (deps['vitest']) {
        projectInfo.testFramework = 'vitest';
        projectInfo.testFrameworkVersion = deps['vitest'];
    }
    // Check for test configuration files
    const configFiles = [
        'jest.config.js',
        'jest.config.ts',
        'jest.config.json',
        'karma.conf.js',
        'jasmine.json',
        'vitest.config.js',
        'vitest.config.ts'
    ];
    for (const configFile of configFiles) {
        const configPath = path.join(projectRoot, configFile);
        if (fileExists(configPath)) {
            projectInfo.hasTestConfig = true;
            projectInfo.configFiles.push(configFile);
        }
    }
    // Check angular.json for Angular projects
    if (projectInfo.type === 'angular') {
        const angularJsonPath = path.join(projectRoot, 'angular.json');
        if (fileExists(angularJsonPath)) {
            projectInfo.configFiles.push('angular.json');
        }
    }
    return projectInfo;
}
function detectPackageManager(projectRoot) {
    if (fileExists(path.join(projectRoot, 'pnpm-lock.yaml'))) {
        return 'pnpm';
    }
    if (fileExists(path.join(projectRoot, 'yarn.lock'))) {
        return 'yarn';
    }
    return 'npm';
}
export function getRecommendedFramework(projectInfo) {
    // If already has a framework, use it
    if (projectInfo.testFramework === 'jest' ||
        projectInfo.testFramework === 'karma' ||
        projectInfo.testFramework === 'jasmine') {
        return projectInfo.testFramework;
    }
    // Recommendations based on project type
    switch (projectInfo.type) {
        case 'angular':
            return 'karma'; // Angular traditionally uses Karma/Jasmine
        case 'nextjs':
        case 'react':
            return 'jest'; // React/Next.js typically use Jest
        default:
            return 'jest'; // Jest is most popular
    }
}
export function getInstallCommand(framework, projectType, packageManager) {
    const commands = [];
    const installCmd = packageManager === 'yarn' ? 'yarn add -D' :
        packageManager === 'pnpm' ? 'pnpm add -D' :
            'npm install --save-dev';
    switch (framework) {
        case 'jest':
            if (projectType === 'nextjs') {
                commands.push(`${installCmd} jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`);
            }
            else if (projectType === 'react') {
                commands.push(`${installCmd} jest @testing-library/react @testing-library/jest-dom @babel/preset-react`);
            }
            else if (projectType === 'angular') {
                commands.push(`${installCmd} jest @types/jest jest-preset-angular`);
            }
            else {
                commands.push(`${installCmd} jest @types/jest`);
            }
            break;
        case 'karma':
            commands.push(`${installCmd} karma karma-jasmine karma-chrome-launcher jasmine-core @types/jasmine`);
            break;
        case 'jasmine':
            commands.push(`${installCmd} jasmine @types/jasmine`);
            break;
    }
    return commands;
}
//# sourceMappingURL=detectProject.js.map