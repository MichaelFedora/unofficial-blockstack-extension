# Notes

General notes for the project, etc.

### "Conversion Kit" Notes

Could add this to the `manifest.json` in order to  add the ability to "search"
blockstack things natively without requiring the omnibox keyword `bs`
(in addition to making the `main.html` page as the homepage and newtab page):

```json
"chrome_settings_overrides": {
  "homepage": "main.html",
  "search_provider": {
    "favicon_url": "assets/images/icon-48.png",
    "is_default": true,
    "keyword": "blockstack",
    "name": "Blockstack Search",
    "search_url": "https://blockstack.org/search/?q={searchTerms}",
    "suggest_url": "https://blockstack.org/search/?q={searchTerms}&suggest=true"
  }
},
"chrome_url_overrides": {
  "newtab": "main.html"
}
```

It was tried out in testing but found to be a little annoying because this would
only be used for a "blockstack-only" browser, not a hybrid which is the goal of
this extension. In addition, the main page makes for a terrible `newtab` page.
