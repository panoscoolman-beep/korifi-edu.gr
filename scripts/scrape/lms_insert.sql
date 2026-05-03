-- LMS sample migration: 5 courses + lessons

insert into public.courses (title, slug, description, subject_id, is_free, cover_image)
  select E'Άλγεβρα Α Λυκείου', E'άλγεβρα-α-λυκείου', NULL, s.id, true, NULL
  from public.subjects s where s.slug = E'alikeiou'
  on conflict (slug) do update set title=excluded.title, subject_id=excluded.subject_id
  returning id, slug;

insert into public.courses (title, slug, description, subject_id, is_free, cover_image)
  select E'Άλγεβρα Β Λυκείου', E'άλγεβρα-β-λυκείου', NULL, s.id, true, E'https://korifi-edu.gr/wp-content/uploads/2021/03/Algebra-Spanish-720x388-1.jpg'
  from public.subjects s where s.slug = E'blikeiou'
  on conflict (slug) do update set title=excluded.title, subject_id=excluded.subject_id
  returning id, slug;

insert into public.courses (title, slug, description, subject_id, is_free, cover_image)
  select E'Μαθηματικά Γ Γενικού Λυκείου', E'μαθηματικά-γ-γενικού-λυκείου', NULL, s.id, true, E'https://korifi-edu.gr/wp-content/uploads/2021/03/Copy-of-Calculus-2-1-scaled-1.jpeg'
  from public.subjects s where s.slug = E'glikeiou'
  on conflict (slug) do update set title=excluded.title, subject_id=excluded.subject_id
  returning id, slug;

insert into public.courses (title, slug, description, subject_id, is_free, cover_image)
  select E'Μαθηματικά Κατεύθυνσης Β λυκείου', E'μαθηματικά-κατεύθυνσης-β-λυκείου', NULL, s.id, true, NULL
  from public.subjects s where s.slug = E'blikeiou'
  on conflict (slug) do update set title=excluded.title, subject_id=excluded.subject_id
  returning id, slug;

insert into public.courses (title, slug, description, subject_id, is_free, cover_image)
  select E'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον (ΑΕΠΠ) Γ Λυκείου', E'ανάπτυξη-εφαρμογών-σε-προγραμματιστ', NULL, s.id, true, E'https://korifi-edu.gr/wp-content/uploads/2021/03/Ba_COMPUTER-SCIENCE_900X600.jpg'
  from public.subjects s where s.slug = E'glikeiou'
  on conflict (slug) do update set title=excluded.title, subject_id=excluded.subject_id
  returning id, slug;


insert into public.lessons (title, "order", content_type, pdf_url, content, is_free, course_id)
select t.*, c.id from (values
    (E'Λογική - Σύνολα', 1, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/00-%CE%9B%CE%BF%CE%B3%CE%B9%CE%BA%CE%AE-%CE%A3%CF%8D%CE%BD%CE%BF%CE%BB%CE%B1.pdf', NULL, true),
    (E'Απόλυτα Ρίζες', 2, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/01-%CE%91%CF%80%CF%8C%CE%BB%CF%85%CF%84%CE%B1-%CE%A1%CE%AF%CE%B6%CE%B5%CF%82.pdf', NULL, true),
    (E'Εξισώσεις- Ανισώσεις', 3, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/02-%CE%95%CE%BE%CE%B9%CF%83%CF%8E%CF%83%CE%B5%CE%B9%CF%82-%CE%91%CE%BD%CE%B9%CF%83%CF%8E%CF%83%CE%B5%CE%B9%CF%82-%CE%91-%CE%BA%CE%B1%CE%B9-%CE%92-%CE%B2%CE%B1%CE%B8%CE%BC%CE%BF%CF%8D.pdf', NULL, true),
    (E'Συναρτήσεις', 4, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/04-%CE%A3%CF%85%CE%BD%CE%B1%CF%81%CF%84%CE%AE%CF%83%CE%B5%CE%B9%CF%82.pdf', NULL, true),
    (E'Πρόοδοι', 5, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/03-%CE%A0%CF%81%CF%8C%CE%BF%CE%B4%CE%BF%CE%B9.pdf', NULL, true)
) as t(title, "order", content_type, pdf_url, content, is_free)
cross join (select id from public.courses where slug = E'άλγεβρα-α-λυκείου') c
on conflict do nothing;


insert into public.lessons (title, "order", content_type, pdf_url, content, is_free, course_id)
select t.*, c.id from (values
    (E'Συστήματα', 1, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/%CE%9A%CE%95%CE%A6.-1-2-%CE%A3%CF%85%CF%83%CF%84-%CE%A3%CF%85%CE%BD.pdf', NULL, true),
    (E'Τριγωνομετρία Β Λυκείου', 2, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/%CE%9A%CE%95%CE%A6.-3-%CE%A4%CE%A1%CE%99%CE%93%CE%A9%CE%9D%CE%9F%CE%9C%CE%95%CE%A4%CE%A1%CE%99%CE%91.pdf', NULL, true),
    (E'Πολυώνυμα', 3, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/%CE%9A%CE%95%CE%A6.-4-%CE%A0%CE%9F%CE%9B%CE%A5%CE%A9%CE%9D%CE%A5%CE%9C%CE%91.pdf', NULL, true),
    (E'Εκθετική-Λογαριθμική Συνάρτηση', 4, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/03/%CE%9A%CE%95%CE%A6.-5-%CE%95%CE%9A%CE%98%CE%95%CE%A4%CE%99%CE%9A%CE%97-%CE%9B%CE%9F%CE%93%CE%91%CE%A1%CE%99%CE%98%CE%9C%CE%99%CE%9A%CE%97.pdf', NULL, true)
) as t(title, "order", content_type, pdf_url, content, is_free)
cross join (select id from public.courses where slug = E'άλγεβρα-β-λυκείου') c
on conflict do nothing;


insert into public.lessons (title, "order", content_type, pdf_url, content, is_free, course_id)
select t.*, c.id from (values
    (E'θεωρια', 1, 'text', NULL, E'_(κενό)_', true),
    (E'Οδηγός Μελέτης της Θεωρίας', 2, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/001-%CE%9F%CE%94%CE%97%CE%93%CE%9F%CE%A3-%CE%9C%CE%95%CE%9B%CE%95%CE%A4%CE%97%CE%A3-%CE%A4%CE%97%CE%A3-%CE%98%CE%95%CE%A9%CE%A1%CE%99%CE%91%CE%A3.pdf', NULL, true),
    (E'Ορισμοί και αποδείξεις', 3, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/%CE%9F%CE%A1%CE%99%CE%A3%CE%9C%CE%9F%CE%99-%CE%93-%CE%9B%CE%A5%CE%9A%CE%95%CE%99%CE%9F%CE%A5_210823_123803.pdf', NULL, true),
    (E'Σημεία που θέλουν προσοχή στη θεωρία', 4, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/%CE%A3%CE%97%CE%9C%CE%95%CE%99%CE%91-%CE%A0%CE%9F%CE%A5-%CE%98%CE%95%CE%9B%CE%9F%CE%A5%CE%9D-%CE%A0%CE%A1%CE%9F%CE%A3%CE%9F%CE%A7%CE%97-%CE%A3%CE%A4%CE%97-%CE%98%CE%95%CE%A9%CE%A1%CE%99%CE%91_210823_123630.pdf', NULL, true),
    (E'15 Σ-Λ με αιτιολόγηση', 5, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/15-%CE%95%CF%81%CF%89%CF%84%CE%AE%CF%83%CE%B5%CE%B9%CF%82-%CF%83%CF%89%CF%83%CF%84%CE%BF%CF%8D-%CE%BB%CE%AC%CE%B8%CE%BF%CF%85%CF%82-%CE%BC%CE%B5-%CE%B1%CE%B9%CF%84%CE%B9%CE%BF%CE%BB%CE%BF%CE%B3%CE%B7%CF%83%CE%B7.pdf', NULL, true),
    (E'Αιτιολογήσεις Ψευδών προτάσεων', 6, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/%CE%B1%CE%B9%CF%84%CE%B9%CE%BF%CE%BB%CE%BF%CE%B3%CE%AE%CF%83%CE%B5%CE%B9%CF%82-%CF%84%CE%BF%CF%85-%CF%88%CE%B5%CF%85%CE%B4%CE%BF%CF%8D%CF%82_210428_142546.pdf', NULL, true),
    (E'Διαγώνισμα Σ-Λ', 7, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/T_F_2021_teliko-xoris-apantiseis.pdf', NULL, true),
    (E'Quiz θεωρίας', 8, 'text', NULL, E'https://docs.google.com/forms/d/e/1FAIpQLSfU1-fs4BAFI6a-P5i5xSNccaN3jKmQ138qqCaFvu1VwvUfDA/viewformEnter', true),
    (E'Διαγώνισμα Σ-Λ 2000-2020 με απαντήσεις', 9, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/%CE%A3%CE%BB-2000-2020%CE%BC%CE%B5-%CE%B1%CF%80%CE%B1%CE%BD%CF%84%CE%B7%CF%83%CE%B5%CE%B9%CF%82.pdf', NULL, true),
    (E'Θέματα Α ανά κεφάλαιο', 10, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/%CE%98%CE%AD%CE%BC%CE%B1%CF%84%CE%B1-%CE%91.pdf', NULL, true),
    (E'Γενικές οδηγίες και συμβουλές για τις Πανελλαδικές', 11, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/002-%CE%93%CE%B5%CE%BD%CE%B9%CE%BA%CE%AD%CF%82-%CE%BF%CE%B4%CE%B7%CE%B3%CE%AF%CE%B5%CF%82-%CE%BA%CE%B1%CE%B9-%CF%83%CF%85%CE%BC%CE%B2%CE%BF%CF%85%CE%BB%CE%AD%CF%82-%CE%B3%CE%B9%CE%B1-%CF%84%CE%B9%CF%82-%CE%A0%CE%B1%CE%BD%CE%B5%CE%BB%CE%BB%CE%B1%CE%B4%CE%B9%CE%BA%CE%AD%CF%82-1.pdf', NULL, true),
    (E'ΕΡΓΑΣΙΕΣ-ΑΠΟ-ΤΟ-ΣΧΟΛΙΚΟ-2021.', 12, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/006-%CE%95%CE%A1%CE%93%CE%91%CE%A3%CE%99%CE%95%CE%A3-%CE%91%CE%A0%CE%9F-%CE%A4%CE%9F-%CE%A3%CE%A7%CE%9F%CE%9B%CE%99%CE%9A%CE%9F-2021.pdf', NULL, true),
    (E'Βασικά-γενικάΘέματα-στην-Παράγωγο-2021', 13, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/005-%CE%92%CE%B1%CF%83%CE%B9%CE%BA%CE%AC-%CE%B3%CE%B5%CE%BD%CE%B9%CE%BA%CE%AC%CE%98%CE%AD%CE%BC%CE%B1%CF%84%CE%B1-%CF%83%CF%84%CE%B7%CE%BD-%CE%A0%CE%B1%CF%81%CE%AC%CE%B3%CF%89%CE%B3%CE%BF-2021-.pdf', NULL, true),
    (E'Μαθηματική-Συνάντηση 2021-ΘΕΜΑ-Γ.', 14, 'pdf', E'https://korifi-edu.gr/wp-content/uploads/2021/08/004-%CE%9C%CE%B1%CE%B8%CE%B7%CE%BC%CE%B1%CF%84%CE%B9%CE%BA%CE%AE-%CE%A3%CF%85%CE%BD%CE%AC%CE%BD%CF%84%CE%B7%CF%83%CE%B7-%CE%98%CE%95%CE%9C%CE%91-%CE%93.pdf', NULL, true)
) as t(title, "order", content_type, pdf_url, content, is_free)
cross join (select id from public.courses where slug = E'μαθηματικά-γ-γενικού-λυκείου') c
on conflict do nothing;


insert into public.lessons (title, "order", content_type, pdf_url, content, is_free, course_id)
select t.*, c.id from (values
    (E'Διανύσματα', 1, 'text', NULL, E'<a href="https://korifi-edu.gr/wp-content/uploads/2021/08/01-ΔΙΑΝΥΣΜΑΤΑ.docx">01 - ΔΙΑΝΥΣΜΑΤΑ</a>', true),
    (E'Ευθεία στο επίπεδο', 2, 'text', NULL, E'<a href="https://korifi-edu.gr/wp-content/uploads/2021/08/02-ΕΥΘΕΙΑ-ΣΤΟ-ΕΠΙΠΕΔΟ.docx">02 - ΕΥΘΕΙΑ ΣΤΟ ΕΠΙΠΕΔΟ</a>', true),
    (E'Κωνικές τομές', 3, 'text', NULL, E'<a href="https://korifi-edu.gr/wp-content/uploads/2021/08/03-ΚΩΝΙΚΕΣ-ΤΟΜΕΣ.docx">03 - ΚΩΝΙΚΕΣ ΤΟΜΕΣ</a>', true)
) as t(title, "order", content_type, pdf_url, content, is_free)
cross join (select id from public.courses where slug = E'μαθηματικά-κατεύθυνσης-β-λυκείου') c
on conflict do nothing;
