# suddo

A local MCP server that lets an MCP client (Claude Code, etc.) run `sudo`
commands without you having to open a separate terminal just to type your
password.

## How it works

It exposes a single tool, `execute_command`, that takes a command as an
argv array (e.g. `["pacman", "-S", "--noconfirm", "neovim"]`) and:

1. Authenticates with `sudo` by popping a `zenity` password dialog
   (retries up to 3 times).
2. Checks the command against the rules in your config file to decide
   whether to `allow` it, `reject` it, or `ask` you first.
3. If it needs to ask, it sends an MCP elicitation request back to the
   client so you get a real allow/deny prompt instead of a silent guess.
4. Runs the command with `sudo` and returns stdout/stderr.

## Requirements

- Node.js
- `sudo`
- `zenity` (for the password prompt)

## Install

```bash
npm install
```

Run directly with `tsx` (no build needed):

```bash
npm start
```

Or compile and run the plain JS:

```bash
npx tsc
node dist/index.js
```

## Registering with an MCP client

Example with Claude Code:

```bash
claude mcp add suddo -- node /path/to/suddo/dist/index.js
```

(or point it at `npx tsx /path/to/suddo/src/index.ts` if you don't want
to build it)

## Configuration

On first run, `suddo` copies the bundled `config.json` / `config.schema.json`
into `~/.config/suddo/`. Edit the copy there, not the one in this repo.

Rules are checked top to bottom, first match wins. Each rule looks like:

```jsonc
{
    "name": "install package",
    "command": ["pacman", "-S", "--noconfirm", "*"], // "*" matches any single arg
    "action": "allow" // "allow" | "ask" | "reject"
}
```

You also need exactly one `default` rule, used when nothing else matches:

```jsonc
{ "default": "ask" }
```

## Project layout

```
src/
  index.ts     MCP server setup, registers the execute_command tool
  auth.ts      sudo authentication via zenity
  policy.ts    matches a command against config.json rules
  executor.ts  actually runs the sudo command
  config.ts    loads + validates config.json against config.schema.json
  env.ts       resolves config/template file paths
  types.ts     shared types
config.json           default rule set, copied to ~/.config/suddo on first run
config.schema.json    JSON Schema for config.json
```
