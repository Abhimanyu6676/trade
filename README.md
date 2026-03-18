# Trading App

## Project Structure

```text
.
├── env-prod/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── images/
│   ├── pages/
|   |   |-- auth (reserved for login, Register, forgot-password  )
|   |   |-- dashboard
│   ├── redux/
│   ├── schemas/
│   ├── services/
│   ├── styles/
│   └── util/
|
|______________________________
```

## Important Notes

- `backend/auth/**/*` route is protected for authentication pages only (login, register, forgot-password, logout) api calls this route is omitted from interceptor refreshToken check
-

## Project Architecture & Capabilities

| Module     | Purpose              |
| ---------- | -------------------- |
| api        | axios instance       |
| auth       | authentication state |
|            | login/logout/signup  |
| pages      | UI pages             |
| schemas    | form validation      |
| components | reusable UI          |

- Redux & Redux Saga
- Socket.io client
- Auth Context Provide, via React Context
- accessToken persistence in localStorage
- Protected Routes
- Axios Interceptors to auth refresh session and new accessToken
- Silent Session Restore in `AuthContextProvider`
- Session persistence across tabs via storage eventListener
- `react-hook-form` & `zod validation`
- Framer Motion Animations
- `scss` compaitablity

## Login Flow

User enters credentials
↓
Zod validates form
↓
React Hook Form submits
↓
AuthContext.login()
↓
Axios POST /login
↓
Backend returns JWT access token
↓
Token stored in localStorage
↓
User authenticated

## Authentication Flow and Refresh Token usage

Register → bcrypt hash → keystoneJS

Login
↓
Server returns Access Token
↓
Refresh token stored in HTTP cookie
↓
React stores Access Token
↓
API requests include Authorization header, via Axios Client
↓
Token expires
↓
Axios auto calls /refresh, for response interceptor upon receiving 401 after accessToken expires
↓
New access token issued
↓
User session continues silently

## Theme guide 🚀

#### Adding/Modifying new theme

- add theme variables and colors in `$themes` map in file `styles/theme.scss`

- `$themes` format
  - `theme-name` ex: light, dark
    - `styles` [key:value] pair (any style specific to this theme only)
    - `colors` [key:value] pair _every theme should have all the variables._
      ###### (current variables used in colors)
      - body-bg
      - primary-color-dark
      - primary-color-light
      - border-color
      - text-color
      - subtle-text
      - highlighted-border

- make sure you add new themeName in `styles/theme.d.ts` in RootThemes_t

- if adding new variable in themes add the variable `styles/themeVariables.d.ts` type and export it from `styles/themeVariables.module.scss`

#### Changing default theme

> default theme is set during compile time, so every time this value changes, new build is required

- change `DefaultRootTheme` in file `style/theme.ts` to new default, which should be one of the `RootThemes_e`
