// Placeholder — implemented in Phase 1A
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
}

export async function detectStack(_dir: string): Promise<StackInfo> {
  return { language: 'unknown', packageManager: '', commands: {} };
}
