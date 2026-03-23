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
- All classes that needs to be initiated in order, should have `_constructor` instead of `constructor` which is called at app starting point.

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

- themes colors are defined as a map `$themes` in file `/Users/abhimanyu/Documents/trading/trade/src/styles/theme.scss`. scss functions set the variables according to the current theme attribute

- add theme variables and colors in `$themes` map in file `trade/src/styles/theme.scss`
- all themes in `$themes` map have all the colors types as in any other theme. if adding new variable to one theme, this variable has to be added to others also. value of these variable is as per that theme style

- `$themes` format
  - `theme-name` ex: light, dark
    - `styles` [key:value] pair, (any style specific to this theme only)
    - `colors` [key:value] pair, every theme should have all the variables.
      ###### (current variables used in colors)
      - body-bg
      - primary-color-dark
      - primary-color-light
      - border-color
      - text-color
      - subtle-text
      - highlighted-border

- if you are adding new theme color variable, then make sure that all themes must have this variable.

- make sure you add new themeName in `trade/src/styles/theme.d.ts` in RootThemes_t

- if adding new variable in themes add the variable to `trade/src/styles/themeVariables.d.ts` type and export it from `trade/src/styles/themeVariables.module.scss`. so it can accessed in react component as css variable

#### Changing default theme

> default theme is set during compile time, so every time this value changes, new build is required

- change `DefaultRootTheme` in file `trade/src/style/theme.ts` to new default, which should be one of the `RootThemes_e`

# File responsibilities

- `trade/src/services/socket/` handles socket.io client. It manages auto-reconnect and emit all received messages to trade eventBus. the other services and classes or components can subscribe to eventBus events with a callback

- `eventBus` is created from a template and acts as the communication layer between classes, components and files. It can notify and publish events to subscribers. It also emits all the client events to server via websocket, and on server side, there is a server instance of eventBus that publish all server events to respective clients

- eventBus events types are that are allowed are declared in `/Users/abhimanyu/Documents/trading/tradeServer/src/util/eventBus/events.d.ts`.
- all new eventTypes must be declared in `/Users/abhimanyu/Documents/trading/tradeServer/src/util/eventBus/events.d.ts`
