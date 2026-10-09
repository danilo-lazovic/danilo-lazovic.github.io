# danilo-lazovic.github.io

Danilo Lazović's portfolio: https://danilo-lazovic.github.io

Plain HTML, CSS and JavaScript, no build step. Built on the "Danilo" design system
(https://claude.ai/artifact/K4KBMmuYkLCcNVZUqKnp5G): Courier Prime, Instrument Sans and Caveat,
butter paper with one blue, square corners, ASCII wherever possible.

```
index.html              all content, English and Serbian (elements tagged data-l="en" / data-l="sr")
assets/css/tokens.css   colour, type, spacing tokens from the design system (Papir and Noc themes)
assets/css/ds.css       design system components (dn-*), copied from its bundle.css
assets/css/site.css     page layout only
assets/js/main.js       language and theme toggles, the ASCII flow animation in the hero
assets/img/             favicon and social preview
assets/Danilo_Lazovic_CV_EN.pdf
```

The ASCII drawings in the project cards are plain text inside `<pre>` tags, generated from each
project's own data and images (ramp ` .:-=+*#%@`, one character per 4 x 8 pixel cell).

Preview locally: `python -m http.server` and open http://localhost:8000.
