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

## Language support

The interface follows the language you set in SiYuan (currently Simplified Chinese and English):

- Translations live in `i18n/zh-CN.json` and `i18n/en.json`; SiYuan loads the one matching your UI language and hands it to the plugin.
- Keys are the **Chinese source text** itself, so a missing entry simply falls back to Chinese instead of showing a raw key.
- Numbers and dates inside sentences use `{n}` / `{name}` placeholders.

To add a language, copy `en.json` to `<locale>.json`, translate the values, and open a pull request — no code change needed.

## Data

Plugin data is kept under the plugin's own storage (`lumina-records`, `lumina-moments`, `lumina-travel`, `lumina-settings`). Uninstalling the plugin keeps your notes and moments; only the settings file is removed.

## Changelog

### v2.5.3
- **Fix** — on mobile, the plugin's dock entry disappeared after being opened once; the drawer's entry bar is no longer hidden.
- **New** — full i18n: the interface follows SiYuan's UI language across settings, views, toolbars, dates and notifications.

Older entries are listed in the Chinese [README](README.md).
