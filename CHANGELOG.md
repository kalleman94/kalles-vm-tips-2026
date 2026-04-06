# Changelog – KallesVMTips2026

## v4 – 2026-04-05
### Nya funktioner
- Admin: toggle för att aktivera/stänga slutspelet (⚙️ Inställningar)
- Admin: fält för att mata in faktiska bonussvar (VM-vinnare, Skyttekung, Bronsmatch-vinnare)
- Slutspelsfliken visar meddelande "Slutspelet öppnas när gruppspelet är färdigt" när admin stängt av slutspelet

---

## v3 – 2026-04-05
### Designfixar
- Vit text i navbar (logo + navigeringslänkar) mot blå bakgrund
- Vit text på alla knappar (Spara, Lägg till)
- Flik "Mina tips" omdöpt till "Mitt tips"
- Flik "Allas tips" omdöpt till "Inlämnade tips"

---


### Designfixar
- Textfärg ändrad till svart (#111111) i alla flikar: Scoreboard, Mina tips, Allas tips, Admin
- Lagt till `color-scheme: light` för att tvinga ljust läge oavsett webbläsarens mörkt-läge-inställning
- Explicit `text-gray-900` på body-elementet för konsekvent textfärg

---

## v1 – 2026-04-04
### Initial release
- Scoreboard med realtidsuppdatering (Supabase Realtime)
- PIN-inloggning för deltagare
- Tipsida med tre sektioner: Gruppspel, Bonusfrågor, Slutspel
- Låslogik: gruppspel + bonus låses 24h innan första match, slutspel låses 24h innan första slutspelsmatch
- Allas tips – läsvy för alla deltagares tips
- Adminpanel: lägg till deltagare, registrera matchresultat, triggar automatisk poängberäkning
- Poängmodell från Excel: rätt mål = 2p/lag, rätt tecken = 3p, max 7p/match
- Bonuspoäng: skyttekung 20p, VM-vinnare 20p, bronsmatch-vinnare 10p
- Slutspelspoäng: R32=1p, R16=2p, QF=4p, SF=6p, brons/final=8p per rätt lag
- Deploy på Netlify: https://kalles-vm-tips-2026.netlify.app
- Backend: Supabase (PostgreSQL + Auth + Realtime)
- Färgtema: blå #1B3A6B, röd #C8102E, grön #006847
