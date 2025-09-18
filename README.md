# AI Photo Studio

An AI-powered photo studio that transforms your pictures into various creative themes. This application leverages the Gemini API to offer a powerful and intuitive image editing and generation experience. Users can combine a primary subject photo with multiple style reference images and a text prompt to generate a batch of creatively altered images.

## Features

-   **Multi-Image Input**: Combine a primary subject photo (Module 1) with multiple style reference photos (Module 2).
-   **Advanced Text Prompts**: Describe the desired output with detailed text prompts.
-   **Prompt Templates**: Get started quickly with a curated list of style templates, from cinematic looks to artistic mediums.
-   **Batch Generation**: Generate multiple images at once, each combining the primary subject with a different style reference.
-   **Single Image Generation**: Use just a primary photo and a prompt for a single, focused transformation.
-   **Interactive UI**: Modern, responsive interface with image previews, loading states, and error handling.
-   **Image Management**: Easily add, remove, and manage your input images.
-   **Result Actions**: Download, regenerate, or view generated images in full-screen.

## How It Works

1.  **Upload to Module 1**: Add the primary photo you want to transform. This is the main subject.
2.  **(Optional) Upload to Module 2**: Add one or more photos that define the style, texture, or composition you're aiming for.
3.  **Describe the Style**: Write a detailed text prompt in the text area, or click on a pre-made style template to auto-fill it.
4.  **Generate**: Click the "Generate" button. The app will process your request, using the Gemini model to combine the Module 1 image with your prompt (and each Module 2 image if provided).
5.  **View Results**: Your new photos will appear on the right. You can click on them to view them larger, download them, or try generating them again.

## Tech Stack

-   **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
-   **AI**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)

## Getting Started

To run this project locally, you will need to have Node.js installed and a Google Gemini API key.

### Prerequisites

-   Node.js and npm (or yarn).
-   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository** (or download the source code).

2.  **Install dependencies** by running the following command in the project's root directory:
    ```bash
    npm install
    ```

3.  **Set up your API Key**.
    The application loads the Gemini API key from the environment variable `process.env.API_KEY`. You will need to ensure this variable is set in your local development environment. One common way to do this is by using a `.env` file, but the method may vary depending on your development server setup.

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to the local address provided in your terminal (e.g., `http://localhost:5173`).

## File Structure

Here is an overview of the key files and directories in the project:

```
/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable React components (Button, Icons, etc.)
│   ├── services/          # API calls to Gemini (geminiService.ts)
│   ├── utils/             # Helper functions (imageUtils.ts)
│   ├── App.tsx            # Main application component and layout
│   ├── index.tsx          # React entry point
│   ├── constants.ts       # Static data like prompt templates
│   └── types.ts           # TypeScript type definitions
├── index.html             # Main HTML file
└── README.md              # Project documentation
```
