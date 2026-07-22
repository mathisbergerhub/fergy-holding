# Fergy Holding

Mini-site statique de pr&eacute;sentation de Fergy Holding, publiable tel quel sur GitHub et Vercel.

## Structure utile

- `index.html` : page principale
- `styles.css` : styles globaux
- `site.js` : animations l&eacute;g&egrave;res et envoi du formulaire de candidature
- `mentions-legales.html` : mentions l&eacute;gales
- `politique-confidentialite.html` : politique de confidentialit&eacute;
- `conditions-utilisation.html` : conditions d'utilisation
- `assets/` : logos et favicon

## D&eacute;ploiement

Le site ne n&eacute;cessite pas de build ni de variables d'environnement.
Le formulaire de candidature envoie directement vers Formspree via l'action HTML d&eacute;finie dans `index.html`.
