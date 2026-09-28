# AI Key Hub

Create a clean, minimal, and fast interactive web directory for Free AI API Keys & Credits based on the attached providers.json dataset.

Key requirements:
1. Design: Clean, clutter-free, and developer-focused (monospace touches, dark/light mode toggle, clean card or row layout without redundant text).
2. Data & Content: Avoid repeating credit amounts in both badges and descriptions. Show clean natural notes, and if a note is long, allow users to expand it with "See more" / "Show less". Include status indicators (Active, Expired/Dead, Unconfirmed, Fake) especially for the "Non-Working / Dead / Unverified" category.
3. Discovery & UX: Instant search bar (by name, keyword, model, or notes), category tabs/filters (Top Sites, Other Sites, Chinese/Regional, Free Tools, Dead/Unverified), and quick direct links to each provider.
4. Admin / Update Mode: A simple passcode/password-protected modal or admin section where the owner can add new providers, edit existing ones, toggle status (active/dead), or export/import the JSON data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ai-key-haven.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/35231019-a9b6-496a-b48f-41477d1276a6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
