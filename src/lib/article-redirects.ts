/**
 * Παλιά άρθρα που αντικαταστάθηκαν από νεότερα, ενημερωμένα με επίσημες πηγές.
 * Το redirect ενεργοποιείται ΜΟΝΟ όταν το νέο άρθρο έχει δημοσιευτεί — μέχρι
 * τότε το παλιό σερβίρεται κανονικά, ώστε να μη μείνει ποτέ κενό URL.
 *
 * Χρησιμοποιείται από το /blog/[slug] (redirect) και από το sitemap (για να
 * μη δηλώνουμε στη Google URLs που κάνουν redirect).
 */
export const REPLACED_BY: Record<string, string> = {
  "i-metavasi-apo-to-gymnasio-sto-lykeio": "a-lykeiou-ti-allazei",
  "geniko-i-epaggelmatiko-lykeio-mia-pro": "epal-lesvou-tomeis-eidikotites",
  "i-koyrtina-toy-agchoys": "agchos-exetaseon-odigos",
  "panellinies-odigies-epiviosis-gia-to": "agchos-exetaseon-odigos",
};
