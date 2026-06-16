# Vercel Deployment Investigation Report

## Root Cause
The Vercel deployment failed because the `@ducanh2912/next-pwa` package was missing from `frontend/package.json`. 

Vercel is configured with the `frontend/` directory as its Root Directory. During deployment, Vercel runs `npm install` inside `frontend/`. Since `@ducanh2912/next-pwa` was not listed in `dependencies` or `devDependencies` of `frontend/package.json`, it was never installed in the remote Vercel environment. Subsequently, when Vercel ran `next build`, the `next.config.js` file failed on line 1 while attempting to `require('@ducanh2912/next-pwa')`.

## Files Changed
1. `frontend/package.json`: Added `"@ducanh2912/next-pwa"` to `dependencies`.
2. `frontend/package-lock.json`: Updated with the resolved dependency tree for `next-pwa`.

*(No changes were required to `next.config.js` or the repository structure as the logic and paths were already correct).*

## PWA Status
**Status:** **Remains Enabled**
After properly installing the missing dependency, local verifications confirm that the Next.js production build (`npm run build`) successfully executes the PWA plugin, compiles the Service Workers, and emits `sw.js` into the `public` directory without errors.

## Exact Commands Required Before Pushing
The dependency has already been installed locally and the `package.json` updated. To ensure a successful Vercel deployment, simply commit and push the dependency changes:

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "fix: install missing next-pwa dependency for vercel deployment"
git push
```
