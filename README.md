<h1 align="center">AETHER Study Hub</h1>

<div align="center">
  <img src="assets/studyhub.png" height="200" />
</div>

---

AETHER Study Hub is an education-themed web portal with study resources,
research tools, enrichment activities, and a classroom-style navigation flow.

## Pages

- `studyhub.html` - main study dashboard
- `research.html` - research browser
- `resources.html` - learning resources
- `enrichment.html` - enrichment activities

## Running Locally

Install dependencies:

```sh
pnpm install
```

Start the local server:

```sh
pnpm dev
```

The study dashboard runs at:

```text
http://localhost:4141/studyhub.html
```

## Hosting

This project needs a Node web service for the full research browser backend.
Static hosting can show the HTML pages, but the full browser experience needs
the server started with `pnpm dev`.
