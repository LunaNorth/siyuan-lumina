# Using AI with Lumina (MCP)

> Requires **Lumina 2.5.7+** and **SiYuan 3.8.0+**.
> All paths are relative to the SiYuan workspace root and are the same on every operating system.

---

## 1. What this is

Lumina keeps notes, moments and trips in its own plugin storage rather than in the document tree. That has a side effect: AI assistants cannot see them.

**MCP (Model Context Protocol)** is a standard way for AI clients to reach external data. Since SiYuan 3.8.0 the kernel ships an MCP server (`POST /mcp`), so an AI client that connects to SiYuan can read your workspace.

Lumina adds two things on top:

| Ability | How it works | Setup |
| --- | --- | --- |
| **Read** | Plugin data is plain JSON; the built-in `file` tool reads it directly | none |
| **Write** | A small "inbox" file the AI appends to; the plugin picks it up | on by default (can be turned off) |

```
AI client ──► SiYuan built-in MCP ──┬──► file tool: read lumina-records and friends
                                    ├──► file tool: append to mcp-inbox.txt
                                    └──► search tool: search notes synced to documents
                                             │
                              every 30s pick up │
                                             ▼
                                      Lumina plugin ──► Notes
```

## 2. Why Lumina does not bundle an MCP server

SiYuan plugins run inside the renderer process (a WebView). They cannot listen on a local port and cannot spawn a stdio child process — which are exactly the two transports MCP defines. The kernel already provides a complete implementation, so a second one shipped by the plugin would only be another package to install. Lumina therefore uses the official server and focuses on making its data readable and writable.

## 3. Before you start

### 3.1 Versions

- SiYuan **3.8.0** or newer (earlier versions have no `/mcp` endpoint)
- Lumina **2.5.7** or newer
- An MCP-capable client: Cursor, Claude Code, Claude Desktop, Cline, Cherry Studio, ChatWise, and so on

### 3.2 Get an API token

**SiYuan → Settings → About → API Token → copy.**

Notes:

- `/mcp` requires an **administrator** session.
- Never commit the token to a repository, put it in a screenshot, or paste it in public.
- If you regenerate the token, update your client configuration.

### 3.3 Verify the server first

Run this in a terminal (replace `TOKEN`):

```bash
curl -s -X POST http://127.0.0.1:6806/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Token TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

If the response contains `serverInfo` (with the SiYuan version), the server is working.

> On Windows, Command Prompt and PowerShell parse `curl` arguments differently (single quotes are taken literally). Run it in Git Bash / WSL, or skip this step and try connecting from your client directly.

| Response | Meaning | What to do |
| --- | --- | --- |
| Contains `serverInfo` | Working | Continue |
| `401` / `Auth failed` | Wrong token or insufficient role | Copy the token again, make sure you are an admin |
| `404` | SiYuan older than 3.8.0 | Upgrade SiYuan |
| Connection refused | SiYuan not running, or not on port 6806 | Start SiYuan, check the port |

---

## 4. Connect your client

### 4.1 The values every client needs

| Item | Value |
| --- | --- |
| Transport | Streamable HTTP |
| URL | `http://127.0.0.1:6806/mcp` |
| Header | `Authorization: Token <your API token>` |
| Header-free form | `http://127.0.0.1:6806/mcp?token=<your API token>` |

> Clients that cannot set custom headers (some GUI apps) can use the `?token=` form instead. It is only meaningful on the loopback address.

### 4.2 Cursor

Edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

```json
{
  "mcpServers": {
    "siyuan": {
      "url": "http://127.0.0.1:6806/mcp",
      "headers": {
        "Authorization": "Token <your API token>"
      }
    }
  }
}
```

Restart Cursor and check **Customize → MCP** to confirm `siyuan` is connected.

### 4.3 Claude Code

```bash
claude mcp add --transport http siyuan http://127.0.0.1:6806/mcp \
  --header "Authorization: Token <your API token>"
```

Use `/mcp` inside a session to check the status.

### 4.4 Claude Desktop

**`claude_desktop_config.json` only launches local stdio servers — it cannot take a URL**, and the app's custom connectors connect from Anthropic's cloud, which cannot reach your `127.0.0.1`. So a local bridge process is needed:

Create or edit:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://127.0.0.1:6806/mcp",
        "--allow-http",
        "--header",
        "Authorization:${SIYUAN_AUTH}"
      ],
      "env": {
        "SIYUAN_AUTH": "Token <your API token>"
      }
    }
  }
}
```

Two details:

- **Node.js 18+** is required (`npx` downloads `mcp-remote` on demand; nothing to install manually).
- The `--header` value is deliberately split: **Claude Desktop on Windows does not escape spaces in `npx` arguments**, so `"Authorization: Token xxx"` gets truncated. Injecting it through an environment variable avoids that.

Quit Claude Desktop completely (not just the window) and reopen it.

### 4.5 Other clients

ChatWise, Cherry Studio, Cline, Raycast, etc.: add a server of type **HTTP / Streamable HTTP**, then fill in the URL and the `Authorization` header. If the UI only accepts a single URL, use `http://127.0.0.1:6806/mcp?token=<TOKEN>`.

### 4.6 Connecting from another device

SiYuan only listens on loopback by default. To connect from another machine on your LAN:

1. Enable LAN access in SiYuan settings (the menu location varies between versions), or set up a reverse proxy.
2. Replace `127.0.0.1` with the host's IP, e.g. `http://192.168.1.10:6806/mcp`.
3. Traffic is plain HTTP in that case. Keep it on a trusted network, and use an HTTPS reverse proxy if it leaves the LAN.

---

## 5. Let the AI read Lumina

### 5.1 Data files

| File (workspace-relative) | Content | Top-level keys |
| --- | --- | --- |
| `data/storage/petal/siyuan-lumina/lumina-records` | Notes (Breeze) | `breezeNotes` / `tagMeta` / `breezeReviewHistory` |
| `data/storage/petal/siyuan-lumina/lumina-moments` | Moments | `config` / `items` |
| `data/storage/petal/siyuan-lumina/lumina-travel` | Trips | `trips` / `groups` |
| `data/storage/petal/siyuan-lumina/lumina-settings` | Plugin settings | — |

> These files have **no `.json` extension**, but their content is standard JSON.

A note entry looks like this:

```json
{
  "breezeNotes": [
    {
      "id": "b_1763123456789ab12",
      "time": "2026-11-23 21:30",
      "content": "Shipped the MCP integration today #dev",
      "images": ["/assets/xxx.png"],
      "files": [],
      "source": ""
    }
  ],
  "tagMeta": {},
  "breezeReviewHistory": {}
}
```

| Field | Meaning |
| --- | --- |
| `id` | Unique note ID |
| `time` | Local time, `YYYY-MM-DD HH:mm` |
| `content` | Body text, including `#tags` and links as typed |
| `images` / `files` | Resource paths; `/assets/...` are SiYuan assets |
| `source` | Origin marker; empty for notes typed in the UI |

Moment entries carry `text` / `images` / `mood` / `weather` / `category` / `location` / `created` / `comments`; trips carry `title` / `startPoint` / `endPoint` / `startDate` / `days`.

### 5.2 Example prompts

> Read `data/storage/petal/siyuan-lumina/lumina-records` and list my notes tagged `#dev` from this month, newest first.

> Count the top 10 tags across all my notes.

> From the moments file, list the cities I visited this year in a table.

> Summarise last week's notes into three bullet points.

### 5.3 Alternative: sync to SiYuan documents first

If you would rather have the AI use SiYuan's full-text search instead of reading JSON:

1. **Settings → Data sync**, pick a daily-note notebook.
2. Enable **Auto-sync to SiYuan documents**, or run **Batch sync notes** once for existing notes.

New notes then also land in your daily note, where the `search` tool can find them — with backlinks and tags included.

---

## 6. Let the AI write Lumina

### 6.1 Why the AI must not edit the JSON directly

The plugin keeps records in memory and writes the whole file back on each save. An external edit to `lumina-records` would simply be overwritten on the next save, and could lose data. That is why writes go through an inbox and are committed by the plugin itself.

### 6.2 The inbox

| Item | Value |
| --- | --- |
| Path | `data/storage/petal/siyuan-lumina/mcp-inbox.txt` |
| Encoding | UTF-8 plain text |
| Format | one item per line |

Parsing rules:

| You write | Result |
| --- | --- |
| A plain line | One note |
| Blank line / whitespace only | Ignored |
| Starting with `#` or `//` | Ignored as a comment (useful for a title line) |
| Leading `-`, `*` or `+` with a space | Marker is stripped, text is kept |
| `#tags`, links, `@` inside the line | Kept as-is, exactly like typing it yourself |

Example:

```
# comment, not imported
- Shipped the MCP integration today #dev
Aligned next week's roadmap with product
// another comment
```

This produces two notes: "Shipped the MCP integration today #dev" and "Aligned next week's roadmap with product".

### 6.3 Prompt to give the AI

> Append the following line to the workspace file `data/storage/petal/siyuan-lumina/mcp-inbox.txt`.
> One item per line, do not modify existing lines, do not add numbering. This file is an inbox for the Lumina plugin, not note data, so it is safe to write to.
>
> Shipped the MCP integration today #dev

### 6.4 Behaviour

| Behaviour | Detail |
| --- | --- |
| Polling | Every 30 seconds; first check 6 seconds after the plugin loads |
| Background tab | Skipped while the page is hidden |
| Write path | Identical to typing: `addBreezeNote` → `lumina-records` → views refresh |
| Clearing | The file is cleared only when **every** item was saved; otherwise it stays and only the failed lines are retried next round |
| Duplicate guard | Lines already imported in this session are skipped, even if clearing failed |
| Document sync | Does **not** trigger "Auto-sync to SiYuan documents"; run a manual sync if you need it |

### 6.5 Turning it off

**Settings → Data sync → AI / MCP → Receive AI writes (MCP inbox)**. When off, the inbox is no longer read and the AI can only read.

---

## 7. Security and privacy

- **A token grants full read/write access to your workspace.** Only configure it on trusted devices, and never commit it.
- SiYuan listens on `127.0.0.1` only by default; other machines cannot reach it.
- The MCP `file` tool cannot touch `conf/conf.json`, `data/templates` and other sensitive paths, and cannot access **encrypted notebooks**.
- The write channel can be disabled at any time; once off, the AI cannot add anything to Lumina.
- If you prefer to stay read-only, simply turn the inbox off and use the AI as a query tool.

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| 401 / `Auth failed` | Wrong token, stray spaces, or not an admin | Copy the token again, trim spaces |
| `/mcp` returns 404 | SiYuan older than 3.8.0 | Upgrade SiYuan |
| Connected but no tools | Client not speaking Streamable HTTP, or URL missing `/mcp` | Pick the HTTP transport, end the URL with `/mcp` |
| Claude Desktop cannot reach `127.0.0.1` | Custom connectors connect from the cloud | Use the `mcp-remote` bridge in 4.4 |
| `mcp-remote` argument truncated | Windows does not escape spaces in `npx` args | Use the `SIYUAN_AUTH` env-var form in 4.4 |
| The AI cannot find the data files | Wrong path, or an absolute path was used | Use the workspace-relative `data/storage/...` form |
| Inbox seems ignored | Toggle off, page in background, or wrong filename | Check the toggle, focus SiYuan and wait 30s, confirm `mcp-inbox.txt` |
| The same line imported twice | Rare: clearing the file failed | Each line imports once per session; confirm the inbox is empty after a restart |
| Saved but the list looks stale | View cache | Switch away and back, or hit refresh |

## 9. FAQ

**Can this damage my notes?**
No. Reads are read-only, and writes can only append to the inbox. Committing is done by the plugin, and it only ever *adds* notes — there is no delete or overwrite path.

**Do AI-written notes get synced to SiYuan documents?**
No. Auto-sync only runs when you publish from the UI. Use **Batch sync notes** if you want them in your daily note.

**Does this work on mobile?**
The MCP server runs on the device that runs SiYuan. An AI client on your phone cannot reach your desktop's `127.0.0.1`; enable LAN access and use the desktop's IP if you really need it.

**Do I need Node.js?**
Only for the Claude Desktop bridge (`npx` needs Node.js 18+). Cursor, Claude Code and other URL-based clients do not.

**Do I need a third-party MCP server?**
No. Everything here uses the MCP server built into SiYuan 3.8.0+. Third-party SiYuan MCP servers exist (run via `npx`) with different tools and scope; they are not covered here.

## 10. Links

- Lumina: <https://github.com/LunaNorth/siyuan-lumina>
- SiYuan: <https://github.com/siyuan-note/siyuan>
- MCP specification: <https://modelcontextprotocol.io>
- `mcp-remote` (bridge for Claude Desktop): <https://www.npmjs.com/package/mcp-remote>

---

*This document is updated alongside Lumina. If your client behaves differently, its own documentation wins — feel free to open an issue.*
