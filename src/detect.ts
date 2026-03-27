import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface TestingStrategy {
  backbone: 'playwright' | 'maestro' | 'api' | 'native';
  testFormat: string;
  layers: ('ui' | 'api' | 'logic' | 'static')[];
}

export interface StackInfo {
  language: string;
  packageManager: string;
  commands: {
    build?: string;
    test?: string;
    lint?: string;
    typecheck?: string;
    deploy?: string;
  };
  framework?: string;
  testingStrategy?: TestingStrategy;
}

const WEB_FRAMEWORKS = new Set(['Next.js', 'Nuxt', 'Remix', 'React', 'Vue', 'Svelte']);
const API_FRAMEWORKS = new Set(['Express', 'Fastify', 'FastAPI', 'Django', 'Flask', 'Gin', 'Fiber', 'Echo', 'Actix', 'Axum', 'Rocket']);

function buildTestingStrategy(backbone: TestingStrategy['backbone']): TestingStrategy {
  switch (backbone) {
    case 'playwright':
      return { backbone, testFormat: '.spec.ts', layers: ['ui', 'api', 'logic', 'static'] };
    case 'maestro':
      return { backbone, testFormat: '.yaml', layers: ['ui', 'api', 'logic', 'static'] };
    case 'api':
      return { backbone, testFormat: '.test.ts', layers: ['api', 'logic', 'static'] };
    case 'native':
      return { backbone, testFormat: '.test.ts', layers: ['logic', 'static'] };
  }
}

function readFile(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

function detectNodeFramework(pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }): string | undefined {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (allDeps['next']) return 'Next.js';
  if (allDeps['nuxt']) return 'Nuxt';
  if (allDeps['@remix-run/node'] || allDeps['@remix-run/react']) return 'Remix';
  if (allDeps['express']) return 'Express';
  if (allDeps['fastify']) return 'Fastify';
  if (allDeps['react']) return 'React';
  if (allDeps['vue']) return 'Vue';
  if (allDeps['svelte']) return 'Svelte';
  return undefined;
}

function detectNodeTestFramework(pkg: { devDependencies?: Record<string, string>; dependencies?: Record<string, string> }): string | undefined {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (allDeps['vitest']) return 'vitest';
  if (allDeps['jest']) return 'jest';
  if (allDeps['mocha']) return 'mocha';
  return undefined;
}

function detectNodePackageManager(dir: string): string {
  if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(dir, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(dir, 'bun.lockb')) || existsSync(join(dir, 'bun.lock'))) return 'bun';
  return 'npm';
}

function detectNode(dir: string): StackInfo | null {
  const raw = readFile(join(dir, 'package.json'));
  if (raw === null) return null;

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(raw);
  } catch {
    return null;
  }

  const pm = detectNodePackageManager(dir);
  const run = pm === 'npm' ? 'npm run' : pm;
  const scripts = (pkg.scripts ?? {}) as Record<string, string>;
  const framework = detectNodeFramework(pkg as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> });
  const testFramework = detectNodeTestFramework(pkg as { devDependencies?: Record<string, string>; dependencies?: Record<string, string> });

  const commands: StackInfo['commands'] = {};
  if (scripts.build) commands.build = `${run} build`;
  else commands.build = `${run} build`;
  if (scripts.test) commands.test = `${run} test`;
  else if (testFramework) commands.test = `${run} test`;
  else commands.test = `${pm === 'npm' ? 'npm' : pm} test`;
  if (scripts.lint) commands.lint = `${run} lint`;
  if (scripts.typecheck) commands.typecheck = `${run} typecheck`;
  else if ((pkg.devDependencies as Record<string, string> | undefined)?.['typescript']) {
    commands.typecheck = 'tsc --noEmit';
  }

  const allDeps = { ...(pkg.dependencies as Record<string, string> | undefined), ...(pkg.devDependencies as Record<string, string> | undefined) };
  let testingStrategy: TestingStrategy;
  if (allDeps['react-native']) {
    testingStrategy = buildTestingStrategy('maestro');
  } else if (framework && WEB_FRAMEWORKS.has(framework)) {
    testingStrategy = buildTestingStrategy('playwright');
  } else if (framework && API_FRAMEWORKS.has(framework)) {
    testingStrategy = buildTestingStrategy('api');
  } else {
    testingStrategy = buildTestingStrategy('native');
  }

  return {
    language: 'node',
    packageManager: pm,
    commands,
    framework,
    testingStrategy,
  };
}

function detectPythonFramework(content: string): string | undefined {
  if (/fastapi/i.test(content)) return 'FastAPI';
  if (/django/i.test(content)) return 'Django';
  if (/flask/i.test(content)) return 'Flask';
  return undefined;
}

function detectPython(dir: string): StackInfo | null {
  const pyproject = readFile(join(dir, 'pyproject.toml'));
  if (pyproject !== null) {
    const isPoetry = /\[tool\.poetry\]/.test(pyproject);
    const isUv = existsSync(join(dir, 'uv.lock'));

    let pm: string;
    let run: string;
    if (isUv) {
      pm = 'uv';
      run = 'uv run';
    } else if (isPoetry) {
      pm = 'poetry';
      run = 'poetry run';
    } else {
      pm = 'pip';
      run = 'python -m';
    }

    const framework = detectPythonFramework(pyproject);
    const hasPytest = /pytest/i.test(pyproject);

    const testingStrategy = framework && API_FRAMEWORKS.has(framework)
      ? buildTestingStrategy('api')
      : buildTestingStrategy('native');

    return {
      language: 'python',
      packageManager: pm,
      commands: {
        build: `${pm === 'poetry' ? 'poetry' : pm} build`,
        test: hasPytest ? `${run} pytest` : `${run} pytest`,
        lint: `${run} ruff check .`,
      },
      framework,
      testingStrategy,
    };
  }

  const requirements = readFile(join(dir, 'requirements.txt'));
  if (requirements !== null) {
    const framework = detectPythonFramework(requirements);
    const testingStrategy = framework && API_FRAMEWORKS.has(framework)
      ? buildTestingStrategy('api')
      : buildTestingStrategy('native');

    return {
      language: 'python',
      packageManager: 'pip',
      commands: {
        build: 'pip install -e .',
        test: 'python -m pytest',
        lint: 'python -m ruff check .',
      },
      framework,
      testingStrategy,
    };
  }

  return null;
}

function detectRust(dir: string): StackInfo | null {
  const cargo = readFile(join(dir, 'Cargo.toml'));
  if (cargo === null) return null;

  let framework: string | undefined;
  if (/actix-web/.test(cargo)) framework = 'Actix';
  else if (/axum/.test(cargo)) framework = 'Axum';
  else if (/rocket/.test(cargo)) framework = 'Rocket';

  const testingStrategy = framework && API_FRAMEWORKS.has(framework)
    ? buildTestingStrategy('api')
    : buildTestingStrategy('native');

  return {
    language: 'rust',
    packageManager: 'cargo',
    commands: {
      build: 'cargo build',
      test: 'cargo test',
      lint: 'cargo clippy',
    },
    framework,
    testingStrategy,
  };
}

function detectGo(dir: string): StackInfo | null {
  const gomod = readFile(join(dir, 'go.mod'));
  if (gomod === null) return null;

  let framework: string | undefined;
  if (/github\.com\/gin-gonic\/gin/.test(gomod)) framework = 'Gin';
  else if (/github\.com\/gofiber\/fiber/.test(gomod)) framework = 'Fiber';
  else if (/github\.com\/labstack\/echo/.test(gomod)) framework = 'Echo';

  const testingStrategy = framework && API_FRAMEWORKS.has(framework)
    ? buildTestingStrategy('api')
    : buildTestingStrategy('native');

  return {
    language: 'go',
    packageManager: 'go',
    commands: {
      build: 'go build ./...',
      test: 'go test ./...',
      lint: 'golangci-lint run',
    },
    framework,
    testingStrategy,
  };
}

function detectSwift(dir: string): StackInfo | null {
  const pkg = readFile(join(dir, 'Package.swift'));
  if (pkg === null) return null;

  return {
    language: 'swift',
    packageManager: 'swift',
    commands: {
      build: 'swift build',
      test: 'swift test',
    },
    testingStrategy: buildTestingStrategy('native'),
  };
}

function detectFlutter(dir: string): StackInfo | null {
  const pubspec = readFile(join(dir, 'pubspec.yaml'));
  if (pubspec === null) return null;
  if (!/flutter/i.test(pubspec)) return null;

  return {
    language: 'dart',
    packageManager: 'flutter',
    commands: {
      build: 'flutter build',
      test: 'flutter test',
      lint: 'flutter analyze',
    },
    framework: 'Flutter',
    testingStrategy: buildTestingStrategy('maestro'),
  };
}

function detectXcode(dir: string): StackInfo | null {
  // Check for .xcodeproj or .xcworkspace directories
  try {
    const entries = readdirSync(dir);
    const hasXcode = entries.some(e => e.endsWith('.xcodeproj') || e.endsWith('.xcworkspace'));
    if (!hasXcode) return null;
  } catch {
    return null;
  }

  return {
    language: 'swift',
    packageManager: 'xcode',
    commands: {
      build: 'xcodebuild build',
      test: 'xcodebuild test',
    },
    testingStrategy: buildTestingStrategy('maestro'),
  };
}

function detectMakefile(dir: string): StackInfo | null {
  const makefile = readFile(join(dir, 'Makefile'));
  if (makefile === null) return null;

  const commands: StackInfo['commands'] = {};
  commands.build = 'make build';
  if (/^test:/m.test(makefile)) commands.test = 'make test';
  if (/^lint:/m.test(makefile)) commands.lint = 'make lint';

  return {
    language: 'unknown',
    packageManager: 'make',
    commands,
  };
}

function detectDockerfile(dir: string): StackInfo | null {
  if (!existsSync(join(dir, 'Dockerfile'))) return null;

  return {
    language: 'unknown',
    packageManager: 'docker',
    commands: {
      build: 'docker build .',
    },
  };
}

export async function detectStack(dir: string): Promise<StackInfo> {
  const detectors = [
    detectNode,
    detectPython,
    detectRust,
    detectGo,
    detectFlutter,
    detectSwift,
    detectXcode,
    detectMakefile,
    detectDockerfile,
  ];

  for (const detect of detectors) {
    const result = detect(dir);
    if (result) return result;
  }

  return { language: 'unknown', packageManager: '', commands: {} };
}
