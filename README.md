bun run local serve

### Build public
* bun run clean
* bun run build:production

### Menu
---
description: Example on how to set a menu item in the header menu
menu:
  main:
    name: "Menu Title"
    weight: 30
---

### Debugging

In `../docsy/theme/layouts/all.html` add `<p>` tags. For example:
{{ define "main" -}}
<p>ALL.HTML SELECTED: {{ .RelPermalink }}</p>
<p>Title: {{ .Title }}</p>
<p>Kind: {{ .Kind }}</p>
{{ .Content -}}
{{ end }}

