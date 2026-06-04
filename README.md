# Westmere Hall

A browser-based text adventure prototype.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Current mechanics

- Navigate by place name, such as `West Wing`, `South Garden`, or `go North Gallery`.
- Speak with characters, such as `speak Elizabeth` or `speak Turtle`.
- Examine props, such as `examine Darcy letter`.
- Some clues only count after taking the object: `take westing envelope`, `take silver candlestick`, `take twin notebook page`, `take rewritten page`.
- Inventory appears in the left sidebar and items can be removed.
- Places visited and people consulted are tracked in the left sidebar.
- The Clues panel includes clues from both objects and conversations.
- Placeholder image text changes by location, conversation, and examined/taken object.
