insert into public.teachers
  (slug, full_name, role, photo_url, sort_order, is_published)
values
  ('koylmandas-panagiotis', 'ΚΟΥΛΜΑΝΔΑΣ ΠΑΝΑΓΙΩΤΗΣ', 'ΜΑΘΗΜΑΤΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/koulmandas.jpg', 1, true),
  ('georgellis-michalis', 'ΓΕΩΡΓΕΛΛΗΣ ΜΙΧΑΛΗΣ', 'ΦΥΣΙΚΟΣ-ΧΗΜΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/georgellis.jpg', 2, true),
  ('kefala-ioanna-maria', 'ΚΕΦΑΛΑ ΙΩΑΝΝΑ ΜΑΡΙΑ', 'ΒΙΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/kefala.jpg', 3, true),
  ('manakas-manolis', 'ΜΑΝΑΚΑΣ ΜΑΝΩΛΗΣ', 'ΦΙΛΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/manakas.jpg', 4, true),
  ('papatriantafylloy-dimitris', 'ΠΑΠΑΤΡΙΑΝΤΑΦΥΛΛΟΥ ΔΗΜΗΤΡΗΣ', 'ΜΑΘΗΜΑΤΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2026/05/1000039612.jpg', 5, true),
  ('triantafylloy-vaggelis', 'ΤΡΙΑΝΤΑΦΥΛΛΟΥ ΒΑΓΓΕΛΗΣ', 'ΜΑΘΗΜΑΤΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2023/03/Screenshot_20230122_002415_Facebook-e1679872719156.jpg', 6, true),
  ('vagianni-despoina', 'ΒΑΓΙΑΝΝΗ ΔΕΣΠΟΙΝΑ', 'ΦΙΛΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2023/03/Screenshot_20230127_102524_Facebook-e1679872908646.jpg', 7, true),
  ('myzika-despoina', 'ΜΥΖΙΚΑ ΔΕΣΠΟΙΝΑ', 'ΟΙΚΟΝΟΜΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2023/03/Screenshot_20230122_001700_Facebook-e1679872947742.jpg', 8, true),
  ('papadimitrioy-christoforos', 'ΠΑΠΑΔΗΜΗΤΡΙΟΥ ΧΡΙΣΤΟΦΟΡΟΣ', 'ΜΑΘΗΜΑΤΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/papadimitriou.jpg', 9, true),
  ('marmarinoy-marianthi', 'ΜΑΡΜΑΡΙΝΟΥ ΜΑΡΙΑΝΘΗ', 'ΦΙΛΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2023/03/Picture1.png', 10, true),
  ('agadellis-stratis', 'ΑΓΑΔΕΛΛΗΣ ΣΤΡΑΤΗΣ', 'ΧΗΜΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/agadellis.jpg', 11, true),
  ('passadellis-michalis', 'ΠΑΣΣΑΔΕΛΛΗΣ ΜΙΧΑΛΗΣ', 'ΜΗΧΑΝΟΛΟΓΟΣ ΜΗΧΑΝΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/profile.jpg', 12, true),
  ('stravoylellis-dimitris', 'ΣΤΡΑΒΟΥΛΕΛΛΗΣ ΔΗΜΗΤΡΗΣ', 'ΗΛΕΚΤΡΟΛΟΓΟΣ ΜΗΧΑΝΙΚΟΣ ΚΑΙ ΜΗΧΑΝΙΚΟΣ ΥΠΟΛΟ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/03/161034225_147279340520809_1103897557959280259_n-e1679873789950.jpg', 13, true),
  ('galatsidas-nikos', 'ΓΑΛΑΤΣΙΔΑΣ ΝΙΚΟΣ', 'ΟΙΚΟΝΟΜΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/galatsidas.jpg', 14, true),
  ('koylmandas-symeon', 'ΚΟΥΛΜΑΝΔΑΣ ΣΥΜΕΩΝ', 'ΟΙΚΟΝΟΜΟΛΟΓΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2023/03/FB_IMG_1675161634246.jpg', 15, true),
  ('stamati-marina', 'ΣΤΑΜΑΤΗ ΜΑΡΙΝΑ', 'ΚΑΘΗΓΗΤΡΙΑ ΠΛΗΡΟΦΟΡΙΚΗΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/08/marina-e1679873867513.jpg', 16, true),
  ('serifis-sotiris', 'ΣΕΡΙΦΗΣ ΣΩΤΗΡΗΣ', 'ΜΑΘΗΜΑΤΙΚΟΣ', 'https://i0.wp.com/korifi-edu.gr/wp-content/uploads/2021/01/serifis-e1679874034402.jpg', 17, true)
on conflict (slug) do update set
  full_name    = excluded.full_name,
  role         = excluded.role,
  photo_url    = excluded.photo_url,
  sort_order   = excluded.sort_order,
  is_published = true;