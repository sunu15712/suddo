import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

// Repo-bundled files, used to seed ~/.config/suddo on first run.
// Resolves to the repo root from both src/ (tsx) and dist/ (compiled).
export const templateConfigPath = join(
    moduleDir,
    "..",
    "config.json"
);

export const templateSchemaPath = join(
    moduleDir,
    "..",
    "config.schema.json"
);

export const configPath = join(
    homedir(),
    ".config",
    "suddo",
    "config.json"
);

export const schemaPath = join(
    homedir(),
    ".config",
    "suddo",
    "config.schema.json"
);

