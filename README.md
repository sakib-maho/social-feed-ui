# Social Feed UI

<!-- BrandCloud:readme-standard -->
[![Maintained](https://img.shields.io/badge/Maintained-yes-brightgreen.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Showcase](https://img.shields.io/badge/Portfolio-Showcase-blue.svg)](#)

_Part of the `sakib-maho` project showcase series with consistent documentation and quality standards._

This repository is now a functional social feed UI clone built with vanilla HTML/CSS/JavaScript.
It includes searchable posts, JSON data loading, and schema tests.

## Features

- Feed cards rendered from local JSON data
- Search filter by author/content/tags
- Responsive layout with clean styling
- Data schema validation test
- Legacy archive preserved in `legacy/archives/`

## Quick Start

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Tests

```bash
python3 -m unittest discover -s tests -p "test_*.py"
```

## License

MIT License. See `LICENSE`.
