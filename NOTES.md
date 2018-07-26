# Searchbar whatnot

Could add this to the `manifest.json` in order to  add the ability to "search" blockstack things natively
without requiring the omnibox keyword `bs`:

```json
"chrome_settings_overrides": {
  "search_provider": {
    "favicon_url": "assets/images/icon-48.png",
    "is_default": true,
    "keyword": "blockstack",
    "name": "Blockstack Search",
    "search_url": "https://blockstack.org/search/?q={searchTerms}",
    "suggest_url": "https://blockstack.org/search/?q={searchTerms}&suggest=true"
  }
}
``` 
