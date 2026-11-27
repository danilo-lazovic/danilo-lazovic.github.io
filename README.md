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
assets/js/main.js       language and theme toggles, the nav brackets, and everything that moves (list below)
assets/img/             favicon and social preview
assets/Danilo_Lazovic_CV_EN.pdf
```

The ASCII drawings in the project cards are plain text inside `<pre>` tags, generated from each
project's own data and images (ramp ` .:-=+*#%@`, one character per 4 x 8 pixel cell).

What moves, all of it drawn in characters by `main.js`:

- the street cat in the hero and the bottleneck flow in info (click either to pause it)
- each case study's drawing prints line by line the first time it scrolls into view
- the clock in the Nem' kad drawing shows the visitor's real time (`<pre data-clock>`)
- the Café portal chart plays one day of sales, 07:00 to 22:00, on a loop (`<pre data-sales>`)

The print-in is skipped for visitors who ask for reduced motion. Without JavaScript every drawing is
simply there, as written in `index.html`.

A case study is a drawing on the left and, on the right, one sentence about what the thing is, a
short list of what it does (`<ul class="does">`) and a few facts (`<dl class="rows facts">`).
On a phone the grid at the top turns into a plain index, because the drawings come again below.

Preview locally: `python -m http.server` and open http://localhost:8000.
