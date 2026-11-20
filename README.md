<div style="text-align: center; padding: 0 0 15px;">
  <div style="font-size: 76px; font-family: Georgia, 'Times New Roman', serif; color: var(--b3-theme-on-background); letter-spacing: 3px; line-height: 1; margin-bottom: 22px;">Lumina</div>
  <div style="color: var(--b3-theme-on-surface); font-size: 15px; letter-spacing: 0.3px; margin-bottom: 10px;">A new way to instantly capture every fleeting thought.</div>
  <div style="color: var(--b3-theme-on-surface-light); font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase;">If you like writing things down, start right now.</div>

  <div style="display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; margin-top: 16px;">
    <a href="https://ld246.com/article/1778921929846" target="_blank" rel="noopener noreferrer"
        style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; background: linear-gradient(135deg, #2d8cf0 0%, #5cadff 100%); color: white; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">
        📖 Guide (Chinese)
    </a>
    <a href="https://ld246.com/article/1777266791604" target="_blank" rel="noopener noreferrer"
        style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; background: linear-gradient(135deg, #ff9900 0%, #ffb84d 100%); color: white; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">
        💬 Feedback
    </a>
  </div>
</div>

## What is Lumina

Lumina (轻语) is a note-taking plugin for [SiYuan](https://b3log.org/siyuan) built around one idea: writing something down should take one second. It opens as a normal side panel on desktop and as a full-screen, mobile-first view on phones.

Everything is stored inside the plugin's own data files, so notes never pollute your document tree unless you ask for it — syncing into a daily note is one switch away.

## Features

- **Notes (Breeze)** — a Flomo-style timeline: type, press Enter, done. Tags, images, links, task lists, pinning, archiving, search and date filters.
- **Moments** — a social-feed style journal with cover image, mood, weather, category and location, plus comments. Optional passcode lock.
- **Gallery** — a masonry view of all images used in notes and moments.
- **Table & Stats** — edit notes as a table; heatmap, tag cloud, writing rhythm and streaks.
- **LifeLog** — time-block logging that turns records into a timeline with durations and weekly stats.
- **Trips** — a canvas for planning a trip: days, stops, links and colors.
- **Sync to documents** — optionally write notes or moments into daily notes or a fixed document, using a customizable template with `{{date}}`, `{{content}}` and other placeholders.
- **Export / import** — export to Markdown, Word or image; import data from earlier Lumina releases.

## Install

1. Open SiYuan → **Settings → Marketplace → Downloaded**, search for `Lumina` and install it.
2. Enable the plugin, then click the Lumina icon in the dock (or the top bar) to open it.

Manual install: put this folder under `data/plugins/siyuan-lumina/` in your workspace and reload SiYuan.

> Requires SiYuan 3.3.3 or later.

## Quick start

- **Write a note** — open **Notes**, type in the box at the bottom and press Enter. Typing `#tag` inside the text creates tags on the fly.
- **Switch views** — the bottom tab bar (mobile) or the left icon rail (desktop) moves between Notes, Gallery, Stats, Moments, LifeLog and Trips.
- **Find things again** — use the search box, or click the arrow next to “All notes” for quick filters (no tag, has comments / images / links / tasks, archived).
- **Make it yours** — Settings covers layout, font size, image sizes, which toolbar buttons to show, and where the sidebar appears.
- **Sync into your notes** — enable **Settings → Data sync**, choose a daily-note notebook or a fixed document, then run **Batch sync** to write existing entries.

## Language support

The interface follows the language you set in SiYuan — currently Simplified Chinese and English. Anything not translated yet falls back to Chinese rather than showing a raw key, so switching languages never leaves the UI half-broken.

Want another language? Contributions are welcome.

## Data

Plugin data is kept under the plugin's own storage (`lumina-records`, `lumina-moments`, `lumina-travel`, `lumina-settings`). Uninstalling the plugin keeps your notes and moments; only the settings file is removed.

## Feedback

- Bugs, ideas and translation fixes: [community thread](https://ld246.com/article/1777266791604) or [open an issue](https://github.com/LunaNorth/siyuan-lumina/issues).
- When reporting a problem, please include: SiYuan version, plugin version, which view you were in, the steps to reproduce, and anything printed in the developer console (`Ctrl/Cmd + Shift + I`).
- The in-app guide is Chinese-only for now; English documentation is being added gradually. Ask in the thread and I will reply in English.

## Changelog

### v2.5.4
- **Fix** — on mobile, the plugin's dock entry disappeared after being opened once; the drawer's entry bar is no longer hidden.
- **New** — multilingual interface: follows SiYuan's UI language across settings, views, toolbars, dates and notifications.

Older entries and the full history are in the [Chinese README](README.zh-CN.md).
