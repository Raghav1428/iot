# server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.3. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Development

Install dependencies (the repo has a `bun.lock` lockfile, and the scripts use Bun):

```sh
bun install
```

Run the project using the scripts in `package.json`:

```sh
bun run dev     # bun --watch index.ts
bun run start   # bun run index.ts
bun run build   # bun build index.ts --outdir dist
```
