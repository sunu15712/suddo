// src/config.ts

import { readFile, mkdir, copyFile } from "node:fs/promises";
import { dirname } from "node:path";

import { parse } from "jsonc-parser";
import Ajv2020 from "ajv/dist/2020.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AjvClass = Ajv2020 as unknown as new (...args: any[]) => any;

import type { SuddoConfig, Rule } from "./types.js";

import { configPath, schemaPath, templateConfigPath, templateSchemaPath } from "./env.js";

async function ensureConfigExists(): Promise<void> {
    try {
        await readFile(configPath, "utf8");
    } catch {
        await mkdir(dirname(configPath), { recursive: true });
        await copyFile(templateConfigPath, configPath);
        await copyFile(templateSchemaPath, schemaPath);
    }
}

export async function loadConfig(): Promise<SuddoConfig> {
    await ensureConfigExists();

    const configText = await readFile(
        configPath,
        "utf8"
    );

    const schemaText = await readFile(
        schemaPath,
        "utf8"
    );

    const config = parse(configText);
    const schema = JSON.parse(schemaText);

    const ajv = new AjvClass({
        allErrors: true,
        strictTuples: false
    });

    const validate = ajv.compile(schema);

    if (!validate(config)) {
        throw new Error(
            `Invalid config:\n${ajv.errorsText(validate.errors)}`
        );
    }

    return convertConfig(config);
}

function convertConfig(raw: { rules: Rule[] }): SuddoConfig {
    const rules: Rule[] = [];

    for (const rule of raw.rules) {
        if (rule.default) {
            rules.push({
                default: rule.default
            });

            continue;
        }

        rules.push({
            name: rule.name,
            command: rule.command,
            action: rule.action
        });
    }

    return {
        rules
    };
}