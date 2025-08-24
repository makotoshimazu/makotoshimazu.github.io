# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a GitHub Pages static website hosted at io.shimazu.me. The repository contains various web applications and tools, primarily written in vanilla JavaScript and HTML.

## Project Structure

- `/` - Root contains the main index.html landing page
- `/games/` - Interactive games (alphabet typing game, touch-based creature game)
- `/random/` - PWA-enabled random password generator with service worker support
- `/tools/` - Web development tools (EJS template tester)
- `/mermaid/` - Pre-built Mermaid diagram editor application

## Key Technologies

- **No build system** - All applications use vanilla JavaScript/HTML/CSS
- **Service Worker** - Used in `/random/` for offline PWA functionality  
- **External libraries via CDN**:
  - TailwindCSS (games/alphabet.html)
  - Tone.js for audio (games/alphabet.html)
  - EJS templating (tools/ejs.html)
  - Mermaid.js (pre-built in /mermaid/)

## Development Guidelines

### Deployment
- This is a GitHub Pages site - changes pushed to main branch are automatically deployed
- CNAME file configures custom domain (io.shimazu.me)
- `.nojekyll` file prevents Jekyll processing

### Adding New Features
- Create standalone HTML files with inline or separate JS/CSS
- No build step required - write browser-compatible JavaScript
- Use CDN links for external libraries rather than npm packages
- Keep applications self-contained in their respective directories

### Service Worker Updates
When modifying the PWA in `/random/`:
- Increment the VERSION constant in sw.js to trigger cache updates
- Update STATIC_FILES array if adding new assets

## Architecture Notes

### Random Password Generator (/random/)
- Progressive Web App with offline support
- Service worker caches static assets
- Uses Web Crypto API for secure random generation
- Manifest.json enables "Add to Home Screen" functionality

### Games
- alphabet.html: Typing practice game with sound effects and visual feedback
- touch.html: Interactive touch-based game with particle effects and creature simulation

### Mermaid Editor (/mermaid/)
- Pre-built application (not source code)
- Uses Monaco editor and Mermaid.js
- Assets are minified and bundled