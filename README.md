# GeminiFlow

GeminiFlow is a complete, deployable Gemini chatbot web application built with Next.js and TypeScript. It features a modern, responsive UI styled with TailwindCSS, and it's designed to be deployed directly to Vercel.

## Features

- **Streaming Responses**: Real-time message streaming from the Gemini API.
- **Multi-Modal Conversations**: Supports both text and image inputs.
- **Google Search Grounding**: Enhances responses with up-to-date information from Google Search, including citations.
- **Session Management**: Maintains conversation history with a simple session mechanism.
- **Responsive UI**: A clean, minimalist single-page interface optimized for desktop, tablet, and mobile.
- **Dark Mode**: Supports light and dark themes.
- **Secure**: Your API key is kept secure on the server-side and is never exposed to the client.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI**: [Google AI for Developers JS SDK](https://github.com/google/generative-ai-js) (`@google/genai`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get the project running locally for development and testing.

### 1. Clone the repository

```bash
git clone <repository-url>
cd GeminiFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of your project by copying the example file:

```bash
cp .env.local.example .env.local
```

Now, open `.env.local` and add your Google AI API key. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

```
# .env.local
GEMINI_API_KEY="your_api_key_here"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) in your browser to see the running application.

## Testing Steps

1.  **Start the service**: Run `npm run dev`.
2.  **Open the browser**: Navigate to `http://localhost:3000`.
3.  **Send a text question**: Type a question like "What is the latest news about AI?" and press Enter. You should see the response stream in. The response should also include citation links at the bottom from the Google Search grounding tool.
4.  **Upload an image**: Click the paperclip icon, select an image, and ask a question like "What's in this picture?". The model should describe the image.
5.  **Clear context**: Click the "Clear Chat" button in the header and confirm. The chat history should be erased, starting a new session.
6.  **Test dark mode**: Click the sun/moon icon in the header to toggle between light and dark themes.

## Deployment on Vercel

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push your code** to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2.  **Import your project** on Vercel.
3.  **Set the Environment Variable**: In your Vercel project's dashboard, go to `Settings > Environment Variables` and add your `GEMINI_API_KEY`.
    -   **Name**: `GEMINI_API_KEY`
    -   **Value**: `your_api_key_here`
4.  **Deploy**. Vercel will automatically detect that you are using Next.js and will handle the build and deployment process.
