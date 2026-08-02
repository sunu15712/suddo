export type Action = "ask" | "allow" | "reject";
type Decision = "accepted" | "rejected"

export interface Rule {
    name?: string;
    command?: string[];
    action?: Action;
    default?: Action;
}

export interface SuddoConfig {
    rules: Rule[];
}

export interface ExecutionResult {
    type: Decision;
    command: string[];
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    toString: () => string
}
