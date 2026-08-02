import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import auth from "./auth.js";
import { loadConfig } from "./config.js";
import { decide } from "./policy.js";
import execute from "./executor.js";

const config = await loadConfig();

const server = new McpServer({
    name: "suddo",
    version: "1.0.0"
});

server.registerTool(
    "execute_command",
    {
        description: "Execute command safely",
        inputSchema: {
            command: z.array(z.string())
        }
    },
    async ({ command }, extra) => {
        const authResult = await auth();

        if (authResult !== 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Authentication failed."
                    }
                ],
                isError: true
            };
        }

        const allowed = await decide(
            config,
            command,
            async () => {
                const result = await extra.sendRequest(
                    {
                        method: "elicitation/create",
                        params: {
                            message: `Allow execute: ${command.join(" ")}?`,
                            requestedSchema: {
                                type: "object",
                                properties: {}
                            }
                        }
                    },
                    z.object({
                        action: z.enum([
                            "accept",
                            "decline",
                            "cancel"
                        ])
                    })
                );

                return result.action === "accept";
            }
        );

        if (!allowed) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Command rejected by policy."
                    }
                ]
            };
        }

        const result = await execute(command);

        return {
            content: [
                {
                    type: "text",
                    text:
                        result.toString()
                }
            ]
        };
    }
);

await server.connect(
    new StdioServerTransport()
);