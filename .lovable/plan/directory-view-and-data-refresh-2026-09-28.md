# Directory view and data refresh

## What will change

- Add a compact List/Grid switch beside the search and category controls; remember the selected view in the browser.
- Make every category heading clickable with a clear chevron and item count, so each section can be collapsed or expanded independently.
- Keep search and a selected category as one combined results view, while the default “All” view remains grouped into collapsible categories.
- Replace the hidden-only admin shortcut with a  hidden /admin link, also keep “Admin” link while retaining the keyboard shortcut.
- Reconcile the directory with the uploaded HTML and restore every supplied multi-service link, including AIPM, xllm, AggAI, and DawCode as four short named buttons.
- add a disscussion page with this comment ember form, and there should option to comment about all category, when press comment/report icon, it will open disscussion section -
  <div
    data-open-remark
    data-site-key="cmukver0n000104l0fgy0el55"
  ></div>
  <script async src="[https://open-remark.zeon.studio/embed.js"></script>](https://open-remark.zeon.studio/embed.js"></script>)

## Visual direction

- Preserve the fast, developer-focused character, but improve hierarchy with a stronger page header, a unified control bar, cleaner section dividers, and more polished rows/cards.
- List view prioritizes scanning; Grid view uses compact provider cards without nesting cards inside sections.
- Use the existing light/dark theme and semantic colors, with accessible labels, focus states, and mobile wrapping.

## Technical details

- Extend provider links to optionally carry explicit short labels so grouped services do not rely on domain-derived names.
- Update the seed data and browser-data migration so previously saved copies gain newly restored links without forcing users to reset.
- Use icon controls for List/Grid, theme, and category expansion, each with a tooltip or accessible label.
- Verify default grouping, collapse/expand, list/grid switching, search, multi-link buttons, admin access, and mobile layout in the running preview.