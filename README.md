# ESP App

This is a robust and highly optimized Next.js 15 application featuring multi-language support (i18n), dynamic theming, and an advanced Aparat channel integration.

## Getting Started

Follow these simple steps to clone, install dependencies, and run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- [Git](https://git-scm.com/)

### One-Liner Setup (PowerShell)
To clone, install, and run the project instantly in a single command, open your PowerShell terminal and run:

```powershell
git clone https://github.com/saeed92jf/esp-app.git; if ($?) { cd esp-app; npm install; if ($?) { npm run dev } }
```

### Manual Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saeed92jf/esp-app.git
   cd esp-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(Alternatively, you can use `yarn install`, `pnpm install`, or `bun install`)*

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and configure your variables (such as `NEXT_PUBLIC_APARAT_USERNAMES`).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) (or whichever port Next.js uses) with your browser to see the result.

## Features
- **App Router:** Built with Next.js 15 modern App Router architecture.
- **i18n:** Built-in internationalization support (English and Persian).
- **Tailwind CSS & Shadcn UI:** Beautiful, responsive, and customizable components.
- **Advanced Virtualization:** High-performance lists using `@tanstack/react-virtual` for handling tens of thousands of items smoothly.
- **Background Loading Strategy:** Intelligent batched non-blocking fetchers for APIs.
