# Imanooo turns 28

A tap-through, story-style invitation for Imanooo's 28th birthday road trip on **Sunday, November 29, 2026**: the date and countdown, the plan, the sport casual dress code, two scratch-off "top secret" activities, breakfast and lunch questions, an RSVP, a WhatsApp send-off, and a personal note.

Plain HTML, CSS and JavaScript. No build step, works directly on GitHub Pages.

## Files

```
imanooo-28/
├── index.html      ← the 12 story cards and their wording
├── css/styles.css  ← styling; colors at the top (--sun, --orange, --tomato, --forest, --cream)
├── js/config.js    ← PERSONALIZE HERE: names, WhatsApp number, date, food options
├── js/app.js       ← story navigation, countdown, scratch cards, RSVP, WhatsApp
└── assets/favicon.svg
```

## Run it in VS Code

1. Unzip, then **File → Open Folder…** → `imanooo-28`.
2. Install the **Live Server** extension when VS Code suggests it.
3. Right-click `index.html` → **Open with Live Server**. Use your browser's phone view (F12 → device toolbar) to see it as she will.

## Personalize (`js/config.js`)

```js
herName: "Imanooo",
myName: "",            // signs the note at the end
whatsappNumber: "",    // e.g. "96170123456"; leave "" and WhatsApp asks her which chat to use
eventStart: "2026-11-29T00:00:00+02:00",  // set the real pickup time later, e.g. T09:00:00+02:00
```

Food options are the `breakfast`, `drinks` and `lunch` lists in the same file. Card wording (plan, dress code, secret activity replies, the note) is in `index.html`.

## How her answers reach you

Nothing is sent automatically. The last card shows her answers; **Send on WhatsApp** opens WhatsApp with them typed in and she taps send. **Copy my answers** is the backup. Her progress is saved in her own browser only, so if she closes the page she continues where she left off.

## Publish on GitHub Pages

1. VS Code → **Source Control** → **Publish to GitHub** → public repository named e.g. `imanooo-28`.
2. On github.com: **Settings → Pages** → Deploy from a branch → `main` / root → **Save**.
3. A minute later: `https://<your-username>.github.io/imanooo-28/`.

Keep it in a separate repository from the first invitation so the two links stay separate. The repo is public, so your WhatsApp number in `config.js` is visible to anyone who finds the repo.
