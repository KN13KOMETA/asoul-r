# Contributing to ASOUL-R

Thank you for your interest in contributing! Please read the guidelines below
before opening a Pull Request.

## ⚠️ Important Notice

**Only translation files (`messages/`) are accepted.** Any Pull Request
containing changes outside of translation files will be closed without review.

---

## 🌐 Translations and Localizations

We welcome **Pull Requests for translations and localization fixes**!

To add or update translations:

1. All translation files are located in the `messages/` directory.
2. To add a new language, create a new `.toml` file (e.g., `messages/fr.toml`).
3. Ensure `pnpm lint:inlang` and `pnpm lint:reuse` pass without errors before
   submitting.

### 📜 Translation License (CC0-1.0)

As specified in `REUSE.toml`, all files in the `messages/` directory are
licensed under **CC0 1.0 Universal (Public Domain Dedication)**.

By submitting a Pull Request containing translation files, **you agree to place
your contributed text into the public domain under the CC0-1.0 license**.
