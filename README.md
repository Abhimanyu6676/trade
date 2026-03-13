### 🚀 Theme guide

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
      - text-color
      - border-color
      - subtle-text

- make sure you add new themeName in `styles/theme.d.ts` in RootThemes_t

- if adding new variable in themes add the variable `styles/themeVariables.d.ts` type and export it from `styles/themeVariables.module.scss`

#### Changing default theme

> default theme is set during compile time, so every time this value changes, new build is required

- change `DefaultRootTheme` in file `style/theme.ts` to new default, which should be one of the `RootThemes_e`
