# Leadya Marketing Builder

This project uses Vite to build the application.

## Setup

Install dependencies with:

```bash
npm ci
```

## Environment variables

Create a `.env` file at the project root with the following variables:

```bash
VITE_RESEND_API_KEY=your_resend_api_key
OPENAI_API_KEY=your_openai_key
VITE_QUIZ_ENDPOINT=https://your-quiz-function-url
VITE_BRANDFETCH_KEY=your_brandfetch_key
VITE_DEFAULT_FROM_EMAIL="Leadya <contact@leadya.fr>"
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_supabase_public_key
```

## Development server

Start the dev server with:

```bash
npm run dev
```

## Testing

Run the test suite with:

```bash
npm test
```
