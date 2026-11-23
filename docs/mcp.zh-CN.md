# 在 Lumina 中使用 AI（MCP）

> 适用于 **Lumina 2.5.7+**、**思源笔记 3.8.0+**。
> 全文路径均相对思源工作区根目录，与操作系统无关。

---

## 1. 这是什么

Lumina 的笔记、朋友圈、行程都存在插件自己的数据里，不写入思源的文档树。这带来一个副作用：AI 看不到它们。

**MCP（Model Context Protocol）** 是一套让 AI 客户端访问外部数据的标准协议。思源 3.8.0 起，内核已经内置了 MCP 服务（`POST /mcp`），所以 AI 只要连上思源，就能读到你工作区里的内容。

Lumina 在此基础上补了两件事：

| 能力 | 怎么实现 | 说明 |
| --- | --- | --- |
| **读** | 插件数据本身就是 JSON 文件，AI 用内置的 `file` 工具直接读 | 无需任何配置 |
| **写** | 约定一个「收件箱」文件，AI 往里追加，插件定时取走 | 需要在插件里开启（默认开启） |

```
AI 客户端 ──► 思源内核内置 MCP ──┬──► file 工具：读 lumina-records 等数据文件
                                ├──► file 工具：往 mcp-inbox.txt 追加
                                └──► search 工具：搜已同步到日记里的内容
                                        │
                            每 30 秒取走收件箱 │
                                        ▼
                                   Lumina 插件 ──► 清风笔记
```

## 2. 为什么 Lumina 不内置 MCP 服务

思源插件运行在渲染进程（WebView）里，既不能监听本地端口，也不能启动 stdio 子进程——而 MCP 的两种传输方式正是 Streamable HTTP 和 stdio。同时思源内核已经提供了完整的 MCP 实现，插件再做一层只会变成多余的安装包。所以 Lumina 的选择是：**协议层用官方的，插件只负责把数据变得可读、可写**。

## 3. 准备工作

### 3.1 版本

- 思源笔记 **3.8.0** 及以上（低于此版本没有 `/mcp` 端点）
- Lumina **2.5.7** 及以上
- 一个支持 MCP 的客户端：Cursor、Claude Code、Claude Desktop、Cline、Cherry Studio、ChatWise 等

### 3.2 获取 API Token

**思源 → 设置 → 关于 → API Token → 复制**。

注意事项：

- `/mcp` 要求**管理员权限**，用普通只读会话连不上。
- 不要把 token 提交到 Git 仓库、截图或公开聊天里。
- 换 token 后需要同步更新客户端配置。

### 3.3 先验证服务是否可用

在终端执行（把 `TOKEN` 换掉）：

```bash
curl -s -X POST http://127.0.0.1:6806/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Token TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

返回内容里能看到 `serverInfo`（含思源版本号）就说明服务正常。

> Windows 的命令提示符和 PowerShell 对 `curl` 的参数解析与上面不同（单引号会被当成普通字符），建议在 Git Bash / WSL 里执行；也可以跳过这步，直接在客户端里试连。

| 返回 | 含义 | 处理 |
| --- | --- | --- |
| 含 `serverInfo` | 正常 | 继续下一步 |
| `401` / `Auth failed` | token 不对或权限不足 | 重新复制 token，确认是管理员 |
| `404` | 思源版本低于 3.8.0 | 升级思源 |
| 连接被拒绝 | 思源没运行或端口不是 6806 | 检查思源是否启动、端口设置 |

---

## 4. 连接客户端

### 4.1 通用连接参数

先记住这四项，任何客户端都是填这几个值：

| 项目 | 值 |
| --- | --- |
| 传输方式 | Streamable HTTP |
| 地址 | `http://127.0.0.1:6806/mcp` |
| 请求头 | `Authorization: Token <你的 API Token>` |
| 免请求头写法 | `http://127.0.0.1:6806/mcp?token=<你的 API Token>` |

> 如果客户端不支持自定义请求头（部分图形化客户端），就用第四行的 `?token=` 形式，效果相同。该写法只在本机回环地址上使用。

### 4.2 Cursor

编辑 `~/.cursor/mcp.json`（仅自己可用）或项目内 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "siyuan": {
      "url": "http://127.0.0.1:6806/mcp",
      "headers": {
        "Authorization": "Token <你的 API Token>"
      }
    }
  }
}
```

保存后重启 Cursor，在 **Customize → MCP** 里确认 `siyuan` 已连接。

### 4.3 Claude Code

```bash
claude mcp add --transport http siyuan http://127.0.0.1:6806/mcp \
  --header "Authorization: Token <你的 API Token>"
```

在会话里用 `/mcp` 查看连接状态。

### 4.4 Claude Desktop

**Claude Desktop 的 `claude_desktop_config.json` 只支持本地 stdio 服务，不能直接写 URL**；而它的「自定义连接器」是从 Anthropic 云端发起连接的，访问不到你电脑上的 `127.0.0.1`。所以本机思源需要用一个本地桥接进程转发：

新建（或编辑）配置文件：

- Windows：`%APPDATA%\Claude\claude_desktop_config.json`
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`

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
        "SIYUAN_AUTH": "Token <你的 API Token>"
      }
    }
  }
}
```

两点说明：

- 需要本机装有 **Node.js 18+**（`npx` 会临时下载 `mcp-remote`，不用手动安装）。
- **`--header` 的值故意拆成两部分**：Windows 上的 Claude Desktop 在调用 `npx` 时不会转义参数里的空格，直接写 `"Authorization: Token xxx"` 会被截断；用环境变量注入可以绕开。

改完完全退出 Claude Desktop（不是关窗口）再重新打开。

### 4.5 其它客户端

ChatWise、Cherry Studio、Cline、Raycast 等：在「添加 MCP 服务器」里选择 **HTTP / Streamable HTTP** 类型，填地址与 `Authorization` 请求头即可。若界面只让填一个 URL，就用 `http://127.0.0.1:6806/mcp?token=<TOKEN>`。

### 4.6 从其它设备访问

思源默认只监听本机。要让局域网内的另一台设备连接：

1. 在思源设置里开启局域网访问（不同版本的菜单位置略有差异），或自行配置反向代理。
2. 把地址中的 `127.0.0.1` 换成运行思源的机器 IP，例如 `http://192.168.1.10:6806/mcp`。
3. 注意此时流量是明文 HTTP，仅在可信网络内使用；跨公网请务必套 HTTPS 反向代理。

---

## 5. 让 AI 读取 Lumina 数据

### 5.1 数据文件

| 文件（工作区相对路径） | 内容 | 顶层结构 |
| --- | --- | --- |
| `data/storage/petal/siyuan-lumina/lumina-records` | 清风笔记（碎碎念） | `breezeNotes` / `tagMeta` / `breezeReviewHistory` |
| `data/storage/petal/siyuan-lumina/lumina-moments` | 朋友圈 | `config` / `items` |
| `data/storage/petal/siyuan-lumina/lumina-travel` | 行程 | `trips` / `groups` |
| `data/storage/petal/siyuan-lumina/lumina-settings` | 插件设置 | — |

> 这些文件**没有 `.json` 扩展名**，但内容是标准 JSON。

笔记条目的字段：

```json
{
  "breezeNotes": [
    {
      "id": "b_1763123456789ab12",
      "time": "2026-11-23 21:30",
      "content": "今天把 MCP 打通了 #开发",
      "images": ["/assets/xxx.png"],
      "files": [],
      "source": ""
    }
  ],
  "tagMeta": {},
  "breezeReviewHistory": {}
}
```

| 字段 | 说明 |
| --- | --- |
| `id` | 笔记唯一 ID |
| `time` | 本地时间，`YYYY-MM-DD HH:mm` |
| `content` | 正文，含 `#标签`、链接等原始写法 |
| `images` / `files` | 资源路径数组，`/assets/...` 为思源资源文件 |
| `source` | 来源标记，手动输入时为空 |

朋友圈条目含 `text` / `images` / `mood` / `weather` / `category` / `location` / `created` / `comments` 等字段；行程含 `title` / `startPoint` / `endPoint` / `startDate` / `days` 等。

### 5.2 可以这样问

> 读一下 `data/storage/petal/siyuan-lumina/lumina-records`，把我这个月带 `#开发` 标签的笔记列出来，按时间倒序。

> 统计我的笔记里出现最多的 10 个标签和各自条数。

> 在朋友圈数据里找我今年去过的城市，整理成一张表。

> 帮我回顾上周的碎碎念，总结成三条要点。

### 5.3 另一种方式：先同步到思源文档

如果你更希望 AI 用思源的全文搜索（而不是直接读 JSON），可以：

1. **设置 → 数据同步**，选好「日记笔记本」。
2. 打开「自动同步思源笔记文档」，或对已有笔记点一次「批量同步清风笔记」。

之后新笔记会写进日记文档，AI 用 `search` 工具就能搜到，还能利用思源的双链、标签体系。

---

## 6. 让 AI 写入 Lumina

### 6.1 为什么不能直接改数据文件

插件的记录常驻内存，写盘时是**整体覆盖**。外部程序改了 `lumina-records`，下一次插件保存就会把它覆盖回去，甚至造成数据丢失。所以写入走一个专门的收件箱，由插件自己完成落盘。

### 6.2 收件箱

| 项目 | 值 |
| --- | --- |
| 路径 | `data/storage/petal/siyuan-lumina/mcp-inbox.txt` |
| 编码 | UTF-8 纯文本 |
| 格式 | 一行一条 |

解析规则：

| 写法 | 结果 |
| --- | --- |
| 普通一行 | 一条笔记 |
| 空行 / 只有空格 | 忽略 |
| 以 `#` 或 `//` 开头 | 当作注释忽略（可用来写标题） |
| 行首 `-`、`*`、`+` 加空格 | 去掉符号后保存（方便 AI 输出列表） |
| 行内 `#标签`、链接、`@` | 原样保留，与手动输入一致 |

示例文件内容：

```
# 这是注释，不会被导入
- 今天把 MCP 打通了 #开发
下午和产品对了下周的排期
// 这行也是注释
```

会被收成两条笔记：「今天把 MCP 打通了 #开发」和「下午和产品对了下周的排期」。

### 6.3 提示词模板

直接把下面这段发给 AI（把最后一行换成你要记的内容）：

> 请把下面这一条追加到工作区文件 `data/storage/petal/siyuan-lumina/mcp-inbox.txt` 的末尾。
> 一行一条，不要改动已有的行，也不要加编号。这个文件是 Lumina 插件的收件箱，不是笔记数据，可以安全写入。
>
> 今天把 MCP 打通了 #开发

英文版：

> Append the following line to the workspace file `data/storage/petal/siyuan-lumina/mcp-inbox.txt`.
> One item per line, do not modify existing lines, do not add numbering. This file is an inbox for the Lumina plugin, not note data, so it is safe to write to.
>
> Shipped the MCP integration today #dev

### 6.4 行为细节

| 行为 | 说明 |
| --- | --- |
| 轮询间隔 | 30 秒；插件加载后 6 秒先查一次 |
| 后台标签页 | 不轮询（`document.hidden` 为真时跳过） |
| 落盘链路 | 与你手动输入完全相同：`addBreezeNote` → 写入 `lumina-records` → 刷新视图 |
| 清空时机 | **全部条目都写入成功**才清空文件；有失败则保留，下一轮只重试失败的那几条 |
| 重复保护 | 本次会话内已导入过的行会被跳过（即使文件没清空成功也不会重复） |
| 自动同步文档 | **不会**触发「自动同步思源笔记文档」，需要时请在插件里手动同步 |

### 6.5 关闭

**设置 → 数据同步 → AI / MCP → 接收 AI 写入（MCP 收件箱）**，关掉后插件不再读取收件箱，AI 只能读、不能写。

---

## 7. 安全与隐私

- **token 等同于你整个工作区的读写权限**，请只配置在可信设备上，不要提交进仓库。
- 思源默认只监听 `127.0.0.1`，外部设备无法直接访问；开放局域网访问前请评估网络环境。
- MCP 的 `file` 工具无法访问 `conf/conf.json`、`data/templates` 等敏感路径，也无法访问**加密笔记本**。
- 写入通道可以随时关闭；关闭后 AI 无法再向 Lumina 添加内容。
- 如果你在意 AI 的写入，建议先只读：关掉收件箱开关，把 AI 当查询工具用。

## 8. 故障排查

| 症状 | 可能原因 | 处理 |
| --- | --- | --- |
| 客户端显示 401 / Auth failed | token 错误、有空格、或不是管理员 | 重新复制 token，注意不要带前后空格 |
| 请求 `/mcp` 返回 404 | 思源版本低于 3.8.0 | 升级思源 |
| 客户端连上了但没有任何工具 | 客户端不支持 Streamable HTTP，或地址写成了 `/api` | 确认传输方式选 HTTP，地址以 `/mcp` 结尾 |
| Claude Desktop 连不上 `127.0.0.1` | 自定义连接器由云端发起，访问不到本机 | 按 4.4 用 `mcp-remote` 桥接 |
| `mcp-remote` 报参数被截断 | Windows 下参数空格未转义 | 用 4.4 里的 `SIYUAN_AUTH` 环境变量写法 |
| AI 读不到笔记文件 | 路径写错，或带了绝对路径 | 使用相对工作区的 `data/storage/...` 写法 |
| 收件箱没反应 | 开关关了、页面在后台、或路径写错 | 检查开关；切回思源窗口等 30 秒；核对文件名 `mcp-inbox.txt` |
| 同一条被导入两次 | 极少数情况下文件清空失败 | 每条内容只在本次会话导入一次；重启后确认收件箱是否为空 |
| 写入成功但列表没刷新 | 视图缓存 | 切走再切回清风视图，或点刷新 |

## 9. 常见问题

**Q：会不会改坏我的笔记？**
不会。读取是只读的；写入只能向收件箱追加，落盘由插件自己完成，并且只走「新增」，没有删除、覆盖的能力。

**Q：AI 写的记录会同步到思源文档吗？**
不会。自动同步只在手动发布时触发。需要的话，在插件里点一次「批量同步清风笔记」。

**Q：手机上能用吗？**
MCP 服务跑在运行思源的设备上。手机端的 AI 客户端连不到电脑的 `127.0.0.1`；如果确实需要，请让思源开放局域网访问，并用电脑的局域网 IP 连接。

**Q：必须装 Node.js 吗？**
只有 Claude Desktop 的桥接方案需要（`npx` 依赖 Node.js 18+）。Cursor、Claude Code 等直接填 URL 的客户端不需要。

**Q：需要安装第三方 MCP 服务器吗？**
不需要。本文全部基于思源 3.8.0+ 内置的 MCP 服务。社区另有若干第三方 SiYuan MCP 服务器（通过 `npx` 运行），能力与用法不同，不在本文支持范围内。

## 10. 相关链接

- Lumina 仓库：<https://github.com/LunaNorth/siyuan-lumina>
- 思源笔记：<https://github.com/siyuan-note/siyuan>
- MCP 规范：<https://modelcontextprotocol.io>
- `mcp-remote`（Claude Desktop 桥接）：<https://www.npmjs.com/package/mcp-remote>

---

*文档随 Lumina 版本更新。若发现与你的客户端不符，以客户端官方文档为准，欢迎提 Issue 反馈。*
