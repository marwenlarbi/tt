-- Renommage des tables métier vers des noms en français.
-- Base attendue : celle définie dans .env (ex. cheebo).
--
-- 1) Table utilisateurs : lancer d'abord la migration Django :
--    python manage.py migrate
--    (renomme accounts_customuser -> comptes_utilisateur)
--
-- 2) Puis exécuter ce script dans MySQL pour les tables
--    publications / boutique (modèles managed=False).
--
-- Si une table n'existe pas encore, supprimez la ligne correspondante
-- avant d'exécuter le script.

SET FOREIGN_KEY_CHECKS = 0;

RENAME TABLE
  `posts_post` TO `publications`,
  `posts_comment` TO `publications_commentaires`,
  `posts_like` TO `publications_mentions_j_aime`,
  `posts_report` TO `signalements`,
  `products_orderitem` TO `lignes_commande`,
  `products_order` TO `commandes`,
  `products_product` TO `produits`;

SET FOREIGN_KEY_CHECKS = 1;

-- Optionnel : si vous ne lancez pas `python manage.py migrate` pour accounts,
-- décommentez la ligne suivante (une seule fois) :
-- RENAME TABLE `accounts_customuser` TO `comptes_utilisateur`;
