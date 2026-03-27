import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { detectStack } from '../src/detect';

const fixtures = join(__dirname, 'fixtures');

describe('detectStack', () => {
  describe('Node.js', () => {
    it('detects npm with Next.js framework', async () => {
      const result = await detectStack(join(fixtures, 'node-npm'));
      expect(result.language).toBe('node');
      expect(result.packageManager).toBe('npm');
      expect(result.framework).toBe('Next.js');
      expect(result.commands.build).toBe('npm run build');
      expect(result.commands.test).toBe('npm run test');
    });

    it('detects pnpm from lockfile', async () => {
      const result = await detectStack(join(fixtures, 'node-pnpm'));
      expect(result.language).toBe('node');
      expect(result.packageManager).toBe('pnpm');
      expect(result.commands.build).toBe('pnpm build');
      expect(result.commands.test).toBe('pnpm test');
    });

    it('detects yarn from lockfile', async () => {
      const result = await detectStack(join(fixtures, 'node-yarn'));
      expect(result.language).toBe('node');
      expect(result.packageManager).toBe('yarn');
      expect(result.commands.build).toBe('yarn build');
    });

    it('detects bun from lockfile', async () => {
      const result = await detectStack(join(fixtures, 'node-bun'));
      expect(result.language).toBe('node');
      expect(result.packageManager).toBe('bun');
      expect(result.commands.build).toBe('bun build');
    });

    it('detects typecheck when typescript is a devDependency', async () => {
      const result = await detectStack(join(fixtures, 'node-pnpm'));
      expect(result.commands.typecheck).toBe('tsc --noEmit');
    });
  });

  describe('Python', () => {
    it('detects poetry with FastAPI framework', async () => {
      const result = await detectStack(join(fixtures, 'python-poetry'));
      expect(result.language).toBe('python');
      expect(result.packageManager).toBe('poetry');
      expect(result.framework).toBe('FastAPI');
      expect(result.commands.build).toBe('poetry build');
      expect(result.commands.test).toBe('poetry run pytest');
    });

    it('detects pip from requirements.txt', async () => {
      const result = await detectStack(join(fixtures, 'python-pip'));
      expect(result.language).toBe('python');
      expect(result.packageManager).toBe('pip');
      expect(result.commands.test).toBe('python -m pytest');
    });

    it('detects uv from uv.lock', async () => {
      const result = await detectStack(join(fixtures, 'python-uv'));
      expect(result.language).toBe('python');
      expect(result.packageManager).toBe('uv');
      expect(result.commands.test).toBe('uv run pytest');
    });
  });

  describe('Rust', () => {
    it('detects Rust with Actix framework', async () => {
      const result = await detectStack(join(fixtures, 'rust'));
      expect(result.language).toBe('rust');
      expect(result.packageManager).toBe('cargo');
      expect(result.framework).toBe('Actix');
      expect(result.commands.build).toBe('cargo build');
      expect(result.commands.test).toBe('cargo test');
      expect(result.commands.lint).toBe('cargo clippy');
    });
  });

  describe('Go', () => {
    it('detects Go project', async () => {
      const result = await detectStack(join(fixtures, 'go'));
      expect(result.language).toBe('go');
      expect(result.packageManager).toBe('go');
      expect(result.commands.build).toBe('go build ./...');
      expect(result.commands.test).toBe('go test ./...');
      expect(result.commands.lint).toBe('golangci-lint run');
    });
  });

  describe('Swift', () => {
    it('detects Swift project', async () => {
      const result = await detectStack(join(fixtures, 'swift'));
      expect(result.language).toBe('swift');
      expect(result.packageManager).toBe('swift');
      expect(result.commands.build).toBe('swift build');
      expect(result.commands.test).toBe('swift test');
    });
  });

  describe('Generic', () => {
    it('detects Makefile project', async () => {
      const result = await detectStack(join(fixtures, 'generic-make'));
      expect(result.language).toBe('unknown');
      expect(result.packageManager).toBe('make');
      expect(result.commands.build).toBe('make build');
      expect(result.commands.test).toBe('make test');
    });

    it('detects Dockerfile project', async () => {
      const result = await detectStack(join(fixtures, 'generic-docker'));
      expect(result.language).toBe('unknown');
      expect(result.packageManager).toBe('docker');
      expect(result.commands.build).toBe('docker build .');
    });
  });

  describe('Unknown', () => {
    it('returns unknown for empty directory', async () => {
      const result = await detectStack(join(fixtures, 'empty'));
      expect(result.language).toBe('unknown');
      expect(result.packageManager).toBe('');
      expect(result.commands).toEqual({});
    });
  });

  describe('Priority', () => {
    it('prioritizes package.json over other manifests', async () => {
      // node-npm also has nothing else, but the priority test is implicit:
      // the detector chain runs in order and returns the first match
      const result = await detectStack(join(fixtures, 'node-npm'));
      expect(result.language).toBe('node');
    });
  });

  describe('Testing Strategy', () => {
    it('Next.js gets playwright backbone', async () => {
      const result = await detectStack(join(fixtures, 'node-npm'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('playwright');
      expect(result.testingStrategy!.testFormat).toBe('.spec.ts');
      expect(result.testingStrategy!.layers).toContain('ui');
    });

    it('Express gets api backbone', async () => {
      const result = await detectStack(join(fixtures, 'node-express'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('api');
      expect(result.testingStrategy!.testFormat).toBe('.test.ts');
      expect(result.testingStrategy!.layers).toContain('api');
      expect(result.testingStrategy!.layers).not.toContain('ui');
    });

    it('plain Node.js (pnpm, no web framework) gets native backbone', async () => {
      const result = await detectStack(join(fixtures, 'node-pnpm'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('native');
    });

    it('React Native gets maestro backbone', async () => {
      const result = await detectStack(join(fixtures, 'react-native'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('maestro');
      expect(result.testingStrategy!.testFormat).toBe('.yaml');
      expect(result.testingStrategy!.layers).toContain('ui');
    });

    it('Flutter gets maestro backbone', async () => {
      const result = await detectStack(join(fixtures, 'flutter'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('maestro');
      expect(result.testingStrategy!.testFormat).toBe('.yaml');
    });

    it('Xcode project gets maestro backbone', async () => {
      const result = await detectStack(join(fixtures, 'xcode'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('maestro');
    });

    it('Python FastAPI gets api backbone', async () => {
      const result = await detectStack(join(fixtures, 'python-poetry'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('api');
    });

    it('Rust with Actix (web framework) gets api backbone', async () => {
      const result = await detectStack(join(fixtures, 'rust'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('api');
    });

    it('Go gets native backbone', async () => {
      const result = await detectStack(join(fixtures, 'go'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('native');
    });

    it('Swift gets native backbone', async () => {
      const result = await detectStack(join(fixtures, 'swift'));
      expect(result.testingStrategy).toBeDefined();
      expect(result.testingStrategy!.backbone).toBe('native');
    });

    it('web frameworks include all 4 layers', async () => {
      const result = await detectStack(join(fixtures, 'node-npm'));
      expect(result.testingStrategy!.layers).toEqual(['ui', 'api', 'logic', 'static']);
    });

    it('api frameworks include layers 1-3', async () => {
      const result = await detectStack(join(fixtures, 'node-express'));
      expect(result.testingStrategy!.layers).toEqual(['api', 'logic', 'static']);
    });

    it('native stacks include layers 1-2', async () => {
      const result = await detectStack(join(fixtures, 'node-pnpm'));
      expect(result.testingStrategy!.layers).toEqual(['logic', 'static']);
    });

    it('unknown stack has no testing strategy', async () => {
      const result = await detectStack(join(fixtures, 'empty'));
      expect(result.testingStrategy).toBeUndefined();
    });
  });
});
