import { Command } from 'commander';

const program = new Command();

program
  .name('joysmith')
  .description('Scaffold and upgrade AI development harnesses')
  .version('0.1.0');

program
  .command('init')
  .description('Scaffold the Joysmith harness into the current project')
  .argument('[dir]', 'Target directory', '.')
  .option('--force', 'Overwrite existing files')
  .action(async (dir: string, opts: { force?: boolean }) => {
    const { init } = await import('./init.js');
    await init(dir, { force: opts.force ?? false });
  });

program
  .command('upgrade')
  .description('Upgrade installed Joysmith templates and skills to latest')
  .argument('[dir]', 'Target directory', '.')
  .option('--yes', 'Auto-accept all updates')
  .action(async (dir: string, opts: { yes?: boolean }) => {
    const { upgrade } = await import('./upgrade.js');
    await upgrade(dir, { yes: opts.yes ?? false });
  });

program.parse();
