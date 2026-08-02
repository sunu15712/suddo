import type { SuddoConfig, Rule, Action } from "./types.js";

function matchRule(rule: Rule, command: Array<string>) {
    if (command.length !== rule.command?.length) {
        return false;
    }

    for (let i = 0; i < command.length; i++) {
        if (command[i] !== rule.command![i] && rule.command![i] !== "*") {
            return false;
        }
    }

    return true;
}

function decideAction(action: Action, asker: () => Promise<boolean>): Promise<boolean> {
    switch (action) {
        case "allow":
            return Promise.resolve(true);
        case "ask":
            return asker();
        case "reject":
            return Promise.resolve(false);
    }
}

export async function decide(config: SuddoConfig, command: Array<string>, asker: () => Promise<boolean>): Promise<boolean> {
    for (const rule of config.rules) {
        if (matchRule(rule, command)) {
            return decideAction(rule.action!, asker);
        }
    }

    const defaultRule = config.rules.find((rule) => rule.default);

    return decideAction(defaultRule?.default ?? "ask", asker);
}

