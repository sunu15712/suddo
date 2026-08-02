import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { ExecutionResult } from "./types.js";

const execFileAsync = promisify(execFile);

export default async function execute(command: string[]): Promise<ExecutionResult> {
    const { stdout, stderr } = await execFileAsync(
        "sudo",
        command
    );

    return {
        type: "accepted",
        command,
        stdout,
        stderr,
        toString: () => {
            return `${stdout || ""}\n${stderr || ""}`;
        }
    };
}