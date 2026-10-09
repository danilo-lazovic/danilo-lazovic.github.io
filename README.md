# danilo-lazovic.github.io

Personal portfolio of Danilo Lazović: https://danilo-lazovic.github.io

Plain HTML, CSS and JavaScript with no build step. GitHub Pages serves `index.html` as is.

```
index.html              all content, in English and Serbian (elements tagged data-l="en" / data-l="sr")
assets/css/style.css    design tokens (light + dark), layout
assets/js/main.js       language + theme toggles, scroll reveal, hero network animation
assets/img/             images (webp), favicon, social preview
assets/Danilo_Lazovic_CV_EN.pdf
```

Preview locally: `python -m http.server` and open http://localhost:8000.

To edit text, change both the `data-l="en"` and `data-l="sr"` versions of an element.
