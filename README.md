# React + Vite

## Admin roles and Firestore rules

The admin panel signs in with the user's regular Firebase email and password.
Access is determined by the `userRole` field in `users/{uid}`:

- `User` is assigned by default when a profile is created.
- `Associate` can access Project Management, Project Inquiries, and their own
  profile in Business Associate Management.
- `Admin` and `Super Admin` can access the full admin panel.

To create a Super Admin, create or update `users/{uid}` in Firebase Console
(using the Firebase Authentication UID as the document ID) and set
`userRole` to `Super Admin`. The website cannot assign this role.
Admins can assign `User` and `Associate`; only Super Admins can assign the
`Admin` role or change an existing Admin account's role.

Firestore access is enforced by [`firestore.rules`](./firestore.rules). Deploy
the updated rules after reviewing them with:

```sh
firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

Existing custom-claim admins must be assigned their profile role in Firebase
Console before the custom-claim rules are deployed.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
