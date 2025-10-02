# **App Name**: GeminiFlow

## Core Features:

- Chat Stream: Stream text responses from the Gemini model using Server-Sent Events (SSE). Supports incremental rendering in the chat window.  The gemini-2.5-flash model id is used as a default model.
- Google Search Tool: Uses the Google Search tool. Retrieves search snippets for improved responses.
- Multi-Modal Input: Accepts image uploads via drag and drop or file selection. Passes image data to Gemini for analysis.
- Session Management: Manages multi-turn conversations with in-memory storage (option to switch to JSON/SQLite/Redis persistence). Includes support for long contexts. This session information is stored in memory only for demonstration purposes, for a production system consider using a durable solution such as a file, SQLite or Redis store. The 'lib/session.ts' provides persistence replacement points.
- Context Clearing: Provides an interface to clear the current conversation context and reset the session.
- Responsive UI: Single-page application built with TailwindCSS, optimized for mobile, tablet (iPad), and desktop screens. Adheres to touch-friendly design principles.
- Error Handling: Handles API errors, rate limits, and file size limits. Provides informative error messages in JSON format.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to evoke trust, intelligence and clarity.
- Background color: Light Gray (#F0F2F5) providing a clean and unobtrusive backdrop.
- Accent color: Teal (#009688) used for interactive elements and highlights, standing out while harmonizing with the indigo primary.
- Body text: 'Inter', a grotesque-style sans-serif, ensuring a modern, machined and objective aesthetic.
- Note: currently only Google Fonts are supported.
- Utilizes a set of minimalist icons, providing clear and intuitive visual cues.
- A clean, single-page layout is utilized, emphasizing readability and ease of navigation.
- Uses subtle animations for typing indicators and message transitions, enhancing user experience without being distracting.