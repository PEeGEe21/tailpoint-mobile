# Contributing to Tailpoint Mobile

## Before opening a pull request

1. Branch from `dev` using a short feature or fix branch name.
2. Keep product screens out of infrastructure-only changes.
3. Run `npm run check`.
4. Test native behavior on the relevant platform when the change touches native APIs.
5. Update the API contract or documentation when behavior changes.

Never commit credentials, tokens, production customer data, `.env` files, signing material, or unrestricted task content in fixtures and screenshots.

Pull requests merge into `dev`. Production releases promote reviewed commits from `dev` to `main` through the release process.
