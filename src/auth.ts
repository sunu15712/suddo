import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// retry 3 times to authenticate sudo.
// return 0 if succeed, -1 if failed.
export default async function auth(): Promise<number> {
    for (let retryCount = 0; retryCount < 3; retryCount++) {
        const password = await askPassword();

        if (password === null) {
            continue;
        }

        const success = await verifySudo(password);

        // remove reference to password
        if (success) {
            return 0;
        }
    }

    return -1;
}

async function askPassword(): Promise<string | null> {
    try {
        const { stdout } = await execFileAsync(
            "zenity",
            [
                "--password",
                "--title=suddo authentication"
            ]
        );

        return stdout.trim();
    } catch {
        return null;
    }
}

function verifySudo(password: string): Promise<boolean> {
    return new Promise((resolve) => {
        const sudo = spawn(
            "sudo",
            [
                "-S",
                "-v"
            ]
        );

        sudo.stdin.write(password + "\n");
        sudo.stdin.end();

        sudo.on("close", (code) => {
            resolve(code === 0);
        });
    });
}