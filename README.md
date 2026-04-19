# Aaswad Food App

## Firebase OTP Login Setup

1. Create a Firebase project in Firebase Console.
2. In `Authentication` -> `Sign-in method`, enable `Phone` provider.
3. In `Project settings` -> `General`, create a Web app and copy config values.
4. Create a `.env` file in the project root using `.env.example` as reference.
5. Add localhost to `Authentication` -> `Settings` -> `Authorized domains`.
6. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Notes

- Firebase client config values are safe to use in frontend apps.
- Do not commit your `.env` file.
- For local testing, configure test phone numbers in Firebase Authentication if needed.

## Firebase Env Troubleshooting

If the login page shows `Firebase Initialized: No`:

1. Ensure you created `.env` in project root (not only `.env.example`).
2. Ensure keys are prefixed with `VITE_` (this project uses Vite).
3. Do not use `REACT_APP_` keys in this app.
4. Restart dev server after editing env values:

```bash
npm run dev
```
