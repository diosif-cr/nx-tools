import { existsSync, readFileSync } from 'node:fs';

async function checkLockFiles() {
  const errors = [];
  if (existsSync('yarn.lock')) {
    errors.push('Invalid occurence of "yarn.lock" file. Please remove it and use only "package-lock.json"');
  }
  if (existsSync('pnpm-lock.yaml')) {
    errors.push('Invalid occurence of "pnpm-lock.yaml" file. Please remove it and use only "package-lock.json"');
  }
  try {
    const content = readFileSync('package-lock.json', 'utf-8');
    if (content.match(/localhost:487/)) {
      errors.push(
        'The "package-lock.json" has reference to local npm repository ("localhost:4873"). Please use "registry.npmjs.org" in "package-lock.json"'
      );
    }

    const { default: packageJson } = await import('../../package-lock.json', { assert: { type: 'json' } });

    if (packageJson.lockfileVersion !== 3) {
      errors.push(
        'The "package-lock.json" file was generated by an old npm version. Please use npm 7 or greater and run "npm install" again'
      );
    }
  } catch {
    errors.push('The "package-lock.json" does not exist or cannot be read');
  }
  return errors;
}

console.log('🔒🔒🔒 Validating lock files 🔒🔒🔒\n');
const invalid = await checkLockFiles();

if (invalid.length > 0) {
  invalid.forEach((e) => console.log(e));
  process.exit(1);
} else {
  console.log('Lock file is valid 👍');
  process.exit(0);
}