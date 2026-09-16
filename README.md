# 🚀 Starship Keymap Unifier

One joystick layout to rule three space games: **Elite Dangerous**, **Star Citizen**, **No Man's Sky**.

Load a bindings file from any of the three games → it becomes your **master layout** → export the closest possible equivalent for the other two. Edit one unified table, get per-game previews live, conflict warnings included.

## Run it

No build step, no server. Just open `index.html` in a browser:

```powershell
start index.html
```

Or serve it (needed for the one-click *sample* buttons, since `file://` blocks `fetch` — the file picker always works):

```powershell
npx serve .
# or
python -m http.server 8080
```

## Files

| File | What |
|---|---|
| `index.html` | App shell |
| `styles.css` | Dark cockpit theme |
| `data.js` | Canonical action crosswalk (ED ↔ SC ↔ NMS) + reference layout — **edit here to improve mappings** |
| `app.js` | Parsers, converters, generators, UI |
| `samples/` | One sample bindings file per game |

## Supported formats

- **Elite Dangerous** — `Custom.4.0.binds`-style XML (`<Root PresetName=…>`), Primary/Secondary + `*AxisRaw` bindings, modifiers, POV hats.
- **Star Citizen** — `layout_*_exported.xml` (`<ActionMaps>`), `kb1_/mo1_/jsN_` inputs incl. modifiers, buttons, axes, POVs.
- **No Man's Sky** — `TKGAMESETTINGS.MXML` (`TkGameSettings` → `KeyMapping2_*` → ActionSet/Action/Button).

## Install locations for exports

- **ED:** `%LOCALAPPDATA%\Frontier Developments\Elite Dangerous\Options\Bindings\Unified.4.0.binds` → select “Unified” in Controls. The **stick name** field must match your hardware's Device string.
- **SC:** `StarCitizen\LIVE\USER\Client\0\Controls\Mappings\layout_Unified_exported.xml` → console: `pp_RebindKeys Unified`. If sticks swap order, use `pp_resortdevices joystick 1 2`.
- **NMS:** back up `…\No Man's Sky\Binaries\SETTINGS\TKGAMESETTINGS.MXML`, replace the `KeyMapping2` block. NMS has no key chords and limited stick support — flagged rows need an in-game rebind.

## Honest limitations

- Cross-game concepts aren't 1:1 (e.g. Silent Running ≈ G-force safety). Those rows carry an **approx** badge with the reasoning.
- NMS key chords collapse to the modifier; joystick axes/hats export best-effort with warnings.
- SC axis extras (`v_pitch`, `v_throttle_abs`, …) are emitted best-effort — unknown names are ignored by the game, so they're harmless if your build renamed them. Verify in-game.

## Hacking

- Improve the crosswalk in `data.js` (`CANONICAL_ACTIONS`: `ed` / `sc` / `nms` name lists, `conf`, `note`).
- `window.Keymap` exposes `parseAny/generateED/generateSC/generateNMS/parseHuman/findConflicts` in the console.
