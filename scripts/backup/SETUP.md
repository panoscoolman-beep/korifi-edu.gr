# Backup setup — μία φορά μόνο

Στόχος: Καθημερινό backup της Supabase database + Storage files στο Google Drive σου σε φάκελο **"supabase backup/korifi-edu"**.

---

## Βήμα 1 — Σύνδεση rclone με Google Drive

Αυτό γίνεται **μόνο μία φορά**. Ανοίγει browser, σου ζητά να κάνεις login στο Google account σου, και αποθηκεύει το token τοπικά.

```bash
cd C:\Users\panos\Desktop\projects\korifi-edu.gr
.\scripts\backup\rclone.exe config
```

Στις ερωτήσεις που εμφανίζονται:
1. `n` (νέο remote)
2. Όνομα: `gdrive`
3. Storage type: ψάξε για **"drive"** στη λίστα → επίλεξε τον αριθμό του (συνήθως **17** ή **18**, αναζήτησε "Google Drive")
4. `client_id`: πάτα **Enter** (default — λειτουργεί)
5. `client_secret`: πάτα **Enter** (default)
6. Scope: **`1`** (Full access — χρειάζεται για να φτιάξει τον φάκελο)
7. `service_account_file`: πάτα **Enter** (κενό)
8. Edit advanced config: **`n`**
9. Use auto config: **`y`** → ανοίγει ο browser
10. Στον browser: **Sign in με το Google σου** → **Allow** για rclone
11. Configure as Shared Drive: **`n`**
12. Confirm: **`y`** (Yes this is OK)
13. Quit: **`q`**

Tέλος. Το token αποθηκεύτηκε.

**Test:**
```bash
.\scripts\backup\rclone.exe lsd gdrive:
```
Πρέπει να δεις τους φακέλους του Google Drive σου.

---

## Βήμα 2 — Ένα δοκιμαστικό backup

```bash
python scripts\backup\backup.py
```

Αν όλα δουλεύουν, θα δεις:
- `✓ uploaded to Google Drive`
- Στο Google Drive σου εμφανίζεται φάκελος **"supabase backup/korifi-edu"** με ένα `.zip`

---

## Βήμα 3 — Αυτόματο daily backup μέσω Windows Task Scheduler

Τρέξε **σαν Administrator** (μία φορά):

```powershell
.\scripts\backup\install_scheduled_task.ps1
```

Αυτό προσθέτει task `Korifi Daily Backup` που τρέχει **καθημερινά στις 03:00**.

**Verify:**
- Άνοιξε **Task Scheduler** (`taskschd.msc`)
- Δες τη λίστα — πρέπει να δεις "Korifi Daily Backup"

**Trigger χειροκίνητα για test:**
```powershell
Start-ScheduledTask -TaskName "Korifi Daily Backup"
```

---

## Πού πάνε τα backup;

- **Τοπικά:** `_backups/YYYY-MM-DD/` + `_backups/korifi-edu-backup-YYYY-MM-DD.zip`
  - Διατηρούνται 7 μέρες (ρυθμίζεται με `BACKUP_KEEP_LOCAL_DAYS` στο `.env.local`)
- **Cloud:** Google Drive → `supabase backup/korifi-edu/`
  - Όσα backup θες — **δεν διαγράφονται αυτόματα**

---

## Restore — αν χρειαστεί

1. Κατέβασε το πιο πρόσφατο `.zip` από Google Drive
2. Unzip → `db/*.json` περιέχει όλα τα data, `storage/<bucket>/` τα files
3. Τρέξε τα migrations (`supabase/migrations/*.sql`) σε νέο project
4. Insert τα json data πίσω (μέσω Supabase MCP ή `psql`)
5. Re-upload τα storage files

(Αν θες αυτοματοποιημένο restore script, ζήτα το.)
