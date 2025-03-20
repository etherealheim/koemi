## About

Koemi is a note-taking app I’ve been working on for myself. I like Markdown because it’s straightforward and easy to read, similar to how Obsidian handles things. I wanted a way to keep track of my thoughts and memories, so I set it up to upload everything to a vector database. That lets an AI pull stuff up later, and I can switch between a local model, Anthropic, or OpenAI depending on what I need.

One feature I’ve added is the ability to open a note and chat with the AI right at the bottom. The conversation doesn’t save, which keeps it simple, but I can summarize the key points and add them to the note. The AI can also search my other notes and link relevant bits, which helps me see connections.

I’ve included an open-source voice assistant with custom prompts, so it can adapt to different vibes—playful or focused, whatever fits. The dashboard has small prompts to revisit old notes or start new ones, which keeps things moving without being pushy.

This isn’t about selling or fitting a niche. As a designer, I’m building Koemi for myself—a practical tool that mixes my notes with AI in a way that feels useful and personal. I’m enjoying the process of making it work just how I want it.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
