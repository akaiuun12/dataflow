# Databook Red

A modern, developer-focused tech blog platform built with React, TypeScript, and Vite. Features a beautiful dark mode interface, markdown rendering with syntax highlighting, and mathematical equation support.

## Project Structure

```
red-databook/
├── src/
│   ├── components/       # React components
│   │   └── MarkdownRenderer.tsx
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite type definitions
├── posts/                # Blog posts (markdown files)
│   ├── dl/              # Deep Learning posts
│   ├── ml/              # Machine Learning posts
│   ├── python/          # Python posts
│   ├── sql/             # SQL posts
│   ├── stats/           # Statistics posts
│   └── web/             # Web development posts
├── public/              # Static assets
│   └── imgs/            # Images
├── drafts/               # Draft posts (not published)
├── dist/                # Build output (generated)
└── node_modules/        # Dependencies (generated)
```

## Features

- 📝 Markdown-based blog posts with frontmatter support
- 🎨 Beautiful dark/light mode toggle
- 🔍 Search functionality
- 📊 Category filtering
- 💻 Syntax highlighting for code blocks
- 📐 Math equation rendering with KaTeX
- 📱 Responsive design
- ⚡ Fast performance with Vite

## Prerequisites

- Node.js 20+ (or as specified in netlify.toml)
- npm

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment

This project is configured for Netlify deployment. The `netlify.toml` file contains the build settings:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20

To deploy:
1. Connect your repository to Netlify
2. Netlify will automatically detect the `netlify.toml` configuration
3. Deploy!

## Adding Posts

1. Create a markdown file in the appropriate category folder under `posts/`
2. Add frontmatter at the top of the file:
   ```yaml
   ---
   title: Your Post Title
   date: YYYY-MM-DD
   author: Your Name
   category: CATEGORY
   tags: ['tag1', 'tag2']
   description: Post description
   published: true
   ---
   ```
3. Write your content in markdown format
4. The post will automatically appear in the blog feed

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Prism.js** - Syntax highlighting
- **KaTeX** - Math rendering
