# TODO - v2

- Finish Main View
  - Add Profile Editor/Page
  - Adjust Wallet Page (Look & Feel)
  - Add Settings Page
    - API Settings
    - Extension Settings
      - Show "Recommended Apps"
- Find a better name :Y

# TODO - v3
- Add the ability to have our own profile/userdata storage (`profile_ube.json`?)
  - (encrypted) user data like number of aliases, recent/pinned apps, emails, etc.
- Add "Store" Page to show all apps and sort by category (financial, etc) and "popularity" (via app.co)
- Add email field to profile editor
- Update Auth Popup to allow email scope


#TODO - Later

### Frontend

- Add the ability to add more bitcoin wallet accounts (via encrypted recovery codes)
- Add Notification Area when Gaia Inboxes get implemented
- Add dedicated app pages that link from the store/search/home instead of hover descriptions
- Add the ability to search user profiles via username
  - Also add the ability to "pin" users (why?)
- Add more extension settings
  - Open in New Tab vs Same Tab

### Backend
- Reformat the State to be cleaner and not just "straight imports" from the Blockstack Browser
- Move more of the login/logout logic to the background thread instead if it relying on the popups to be open
