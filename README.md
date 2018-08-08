# Unofficial Blockstack Extension

This is a web extension to add Blockstack support to the Web Browser by
making it so a user can log into the browser and authenticate apps via
popup windows instead of through https://browser.blockstack.org/ or
having to run their own instance of the Blockstack Browser. This makes
the experience much more native and easy to use!

Currently you can not edit your profile or manage your wallet. This is
more of a proof of concept then a finished product, and it may have bugs;
use it at your own risk!

![screenshot-1](/gfx/screenshot-1.png)

Forum discussion can be found [here](https://forum.blockstack.org/t/5414).

## Features

- Creating/Recovering Accounts
- Managing Multiple Identities
- App Authentication
- App lookup via [app.co's repo](https://app-co-api.herokuapp.com/api/apps)

## Downloads (for Alpha Version)

**This extension is in alpha, and may accidently overwrite your profile.json resulting in loss of:**

- Profile Name
- Profile Bio
- Social Verifications
- Ability for people who you shared files with to view those files
- Breaking apps that rely on multi-player data storage

**Don't use your normal Blockstack ID to test this with!**

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/u-blockstack-extension/)
- [Chrome](https://chrome.google.com/webstore/detail/unofficial-blockstack-ext/ldkenndopbdlbphmdmnmanmkhcjahmnm)

## Building

- `npm run build` will create a built extension in the `/build` directory.
- `npm run build:prod` will build production.

## Testing

```
npm run build
cd build
web-ext run
```

Where [web-ext](https://github.com/mozilla/web-ext) is the Mozilla web extension tester found on NPM.

## License

It's under [MPL-2.0](LICENSE.md), similar to the [Blockstack Browser](https://github.com/blockstack/blockstack-browser).

Icons (`/src/assets/images/icon-16`, `icon-48`, `icon-128`, etc) are under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/), as well as project-graphics (found in `/gfx`).

<sup><sub>*Soli Deo Gloria*</sub></sup>
