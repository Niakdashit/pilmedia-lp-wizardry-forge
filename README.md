# Leadya Marketing Builder

This project uses Vite to build the application.

## Setup

Install dependencies:

```bash
npm ci
```

This step installs Vite and all other dependencies. It must be run at least once
before building the project.

## Testing

Install dependencies and execute the test suite:

```bash
npm ci
npm test
```

## Brandfetch API key

Some parts of the application rely on the [Brandfetch](https://brandfetch.com/)
API. To use these features you must supply a valid `VITE_BRANDFETCH_KEY` in your
environment:

1. Create a Brandfetch account and generate an API key from your dashboard.
2. Copy the key into your `.env` file under the variable name
   `VITE_BRANDFETCH_KEY`.

The `.env.example` file already includes a placeholder for this variable which
you can use as a template.

## Build

To create a production build, run:

```bash
npm run build
```


## License

This project is licensed under the [MIT License](LICENSE).
