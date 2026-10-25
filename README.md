`bun run local serve`

## Repos
1. `master` contains the most up to date content and drafts;
2. `master-public` contains the published content;
* The content in `public` repo is built from here.
3. `public` github pages content.
* The content origines from the `/public/` folder after doing the `Build public` actions.

## Build public
```
bun run clean
bun run build:production
```

## Shortcodes
[Docs](https://www.docsy.dev/docs/content/shortcodes/)

## Menu
```
---
description: Example on how to set a menu item in the header menu
menu:
  main:
    name: "Menu Title"
    weight: 30
---
```

## Debugging
Insert `{{< debug >}}`. It will print `/layouts/shortcodes/debug.html`

## Custom type
1. Make the folder `/layouts/[TYPE]/`;
2. `section.html` for section kind and `page.html` for page kind;
3. `section` is for `_index.md` and `page` for `index.md`.

