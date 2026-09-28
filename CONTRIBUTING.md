# Contributing to Evid

Thanks for helping. Evid is source-available under the [Elastic License 2.0](LICENSE).

## Before you start

- Open an [issue](https://github.com/niloy-biswas/evid/issues) for anything larger than a small fix, so we can agree on the approach.
- Read [`AGENTS.md`](AGENTS.md) for the repo map and conventions. Follow existing patterns in `lib/application/` and `components/`, and keep changes focused.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run lint:tokens
```

Colors come from tokens in `app/styles/`. Do not hardcode hex values in components.

## Pull requests

- One logical change per pull request, with a clear description of what and why.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for messages (`feat:`, `fix:`, `docs:`).
- Do not commit secrets or `.env*` files.

## License of contributions

By submitting a contribution you confirm you have the right to do so, and you agree that it is provided under the project's license and that the maintainers may also use it in Evid's commercial offerings (for example Evid Cloud).

## Security

Report vulnerabilities privately to hello@evid.cc, not in public issues.
