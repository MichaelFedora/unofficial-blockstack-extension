# Unofficial Blockstack Extension

This is a web extension to add Blockstack support to the Web Browser by
making it so a user can log into the browser and authenticate apps via
popup windows instead of through https://browser.blockstack.org/ or
having to run their own instance of the Blockstack Browser. This makes
the experience much more native and easy to use!

This browser does not quite have feature parity with the official browser,
as it is missing the ability to acquire usernames and does not have the
ability to do social verifications.

![screenshot-1](/gfx/screenshot-1.png)

Forum discussion can be found [here](https://forum.blockstack.org/t/7409/).

## Features

- Creating/Recovering Accounts
- Managing Multiple Identities (at any offset)
- App Authentication
- App lookup via [app.co's repo](https://app-co-api.herokuapp.com/api/apps)
- Blockstack Wallet Management (BTC)
- Blockstack Profile & Identity Management
- API Setting Verification
- Ability to set/change your account email

## Known Issues

Using an account that has a name with a profile.json from a particular Gaia
Hub and switching to a different one in the settings will cause the extension
to error in ways that may make the extension unusable.

For now, make sure to use an account that has no names *or* stick with the
default Gaia Hub / the Gaia Hub that has the profile.json stored for that name.

## Downloads (for Beta Version)

***Wallet Transactions have not been tested yet -- use at your own risk!***

- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/u-blockstack-extension/)
- [Chrome](https://chrome.google.com/webstore/detail/unofficial-blockstack-ext/ldkenndopbdlbphmdmnmanmkhcjahmnm)

## Building

- `npm run build` will create a built extension in the `/build` directory.
- `npm run build:prod` will build production. It is allocated for 4Gb of memory however, so make sure you have space.
  - currently it has been recorded to take ~2.5Gb however

## Testing

```
npm run build
cd build
web-ext run
```

Where [web-ext](https://github.com/mozilla/web-ext) is the Mozilla web extension tester found on NPM.

**Until Blockstack.js updaets how it detects the `blockstack:` protocol, Firefox no longer
works. Use Chrome / Brave and "load unpacked" in the extensions menu to debug.**

## License

It's under [MPL-2.0](LICENSE.md), similar to the [Blockstack Browser](https://github.com/blockstack/blockstack-browser).

Icons (`/src/assets/images/icon-16`, `icon-48`, `icon-128`, etc) are under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/), as well as project-graphics (found in `/gfx`).

<sup><sub>*Soli Deo Gloria*</sub></sup>
