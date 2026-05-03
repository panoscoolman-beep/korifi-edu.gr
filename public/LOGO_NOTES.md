# Logo αρχεία

| Αρχείο | Περιγραφή | Χρήση |
|---|---|---|
| `logo.png` | Active logo (το ίδιο με `logo-original.png` τώρα) | Default — αυτό που σερβίρεται στο navbar/footer |
| `logo-original.png` | Μαύρο "ΚΟΡΥΦΗ" wordmark με κόκκινη κορυφή στο "Υ" (511×135) | Year-round, σε λευκό background |
| `logo-summer.png` | Ανανάς integrated wordmark, λευκό κείμενο (1400×368) | Καλοκαίρι, σε σκούρο background |
| `logo-icon.png` | Μόνο ανανάς icon από summer logo (143×275) | Standalone icon (favicon, πολύ μικρές χρήσεις) |

## Πώς να αλλάξεις σε καλοκαιρινό

```bash
# Backup current
mv public/logo.png public/logo-prev.png
# Switch to summer
cp public/logo-summer.png public/logo.png
# Επίσης πιθανόν θες να αλλάξεις το navbar background σε σκούρο
# (το summer logo έχει λευκό κείμενο)
```

ή — πιο σωστά — πρόσθεσε ένα env var `NEXT_PUBLIC_LOGO_VARIANT=summer|original` και
άλλαξε το `Navbar.tsx` να διαλέγει αρχείο based on env. Όποτε το θέλεις, μου το λες.
