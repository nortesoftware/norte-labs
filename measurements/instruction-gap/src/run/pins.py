"""ecosystems/npm option 3: which release installs a project under each rule (the plan's tables).
Shared by path A (rules.py) and path B (replicas.py); neither decides what runs here."""
import re


def release_a(manager):
    """Rule A: the newest release of the manager whose lockfile the project commits."""
    return {'npm': 'npm-12.2.1', 'pnpm': 'pnpm-12.14.0', 'yarn': 'yarn-1.22.22', 'yarn-berry': 'yarn-4.18.1',
            'bun': 'bun-1.4.3'}[manager]


def release_for_pin(pm):
    """Rule B: the last release of the line a packageManager value pins, or None when it names none here."""
    m = re.match(r'^(npm|pnpm|yarn|bun)@(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$', pm or '')
    if not m:
        return None
    name, major, minor = m.group(1), int(m.group(2)), int(m.group(3))
    if name == 'npm':
        return 'npm-12.2.1' if major >= 12 else 'npm-11.21.1' if (major == 11 and minor >= 16) else 'npm-10.9.9'
    if name == 'pnpm':
        return 'pnpm-12.14.0' if major >= 11 else 'pnpm-10.34.7' if major == 10 else 'pnpm-9.15.9'
    if name == 'yarn':
        if major == 1:
            return 'yarn-1.22.22'
        return 'yarn-4.18.1' if (major > 4 or (major == 4 and minor >= 14)) else 'yarn-4.13.0'
    return 'bun-1.4.3'
