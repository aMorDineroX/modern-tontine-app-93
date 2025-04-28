# Guide d'accessibilité pour l'application Naat

Ce document fournit des directives et des bonnes pratiques pour rendre l'application Naat accessible à tous les utilisateurs, y compris ceux ayant des handicaps.

## Principes d'accessibilité

L'application Naat suit les principes WCAG 2.1 (Web Content Accessibility Guidelines) :

1. **Perceptible** : Les informations et les composants de l'interface utilisateur doivent être présentés de manière à ce que les utilisateurs puissent les percevoir.
2. **Utilisable** : Les composants de l'interface utilisateur et la navigation doivent être utilisables.
3. **Compréhensible** : Les informations et l'utilisation de l'interface utilisateur doivent être compréhensibles.
4. **Robuste** : Le contenu doit être suffisamment robuste pour être interprété de manière fiable par une large variété d'agents utilisateurs, y compris les technologies d'assistance.

## Composants accessibles

### SkipToContent

Le composant `SkipToContent` permet aux utilisateurs de clavier de sauter la navigation et d'aller directement au contenu principal.

```jsx
// Utilisation
<SkipToContent contentId="main-content" />
...
<main id="main-content">
  Contenu principal
</main>
```

### AccessibleFormField

Le composant `AccessibleFormField` fournit des champs de formulaire accessibles avec des labels, des messages d'erreur et des textes d'aide appropriés.

```jsx
// Utilisation
<AccessibleFormField
  id="email"
  label="Adresse email"
  type="email"
  required
  error={errors.email?.message}
  helpText="Nous ne partagerons jamais votre email."
  inputProps={{
    placeholder: "exemple@email.com",
    ...register("email")
  }}
/>
```

## Bonnes pratiques

### Sémantique HTML

Utilisez des éléments HTML sémantiques appropriés pour leur but :

- `<button>` pour les boutons
- `<a>` pour les liens
- `<h1>`, `<h2>`, etc. pour les titres
- `<nav>` pour la navigation
- `<main>` pour le contenu principal
- `<section>` pour les sections
- `<article>` pour les articles
- `<aside>` pour le contenu secondaire
- `<footer>` pour le pied de page

### Attributs ARIA

Utilisez les attributs ARIA lorsque nécessaire pour améliorer l'accessibilité :

- `aria-label` : Fournit un label pour les éléments sans texte visible
- `aria-labelledby` : Associe un élément à un autre élément qui lui sert de label
- `aria-describedby` : Associe un élément à un autre élément qui le décrit
- `aria-required` : Indique qu'un champ est requis
- `aria-invalid` : Indique qu'un champ est invalide
- `aria-expanded` : Indique si un élément est développé ou réduit
- `aria-hidden` : Cache un élément des technologies d'assistance
- `aria-live` : Indique qu'un élément sera mis à jour dynamiquement

### Focus

Assurez-vous que tous les éléments interactifs sont focusables et que l'ordre de focus est logique :

- Utilisez `tabindex="0"` pour rendre un élément focusable dans l'ordre de tabulation normal
- Évitez d'utiliser `tabindex` avec des valeurs positives
- Assurez-vous que les éléments focusés ont un style de focus visible
- Utilisez `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` pour un style de focus cohérent

### Contraste et couleurs

Assurez-vous que le contraste entre le texte et l'arrière-plan est suffisant :

- Texte normal : Ratio de contraste d'au moins 4.5:1
- Grand texte : Ratio de contraste d'au moins 3:1
- Ne vous fiez pas uniquement à la couleur pour transmettre des informations

### Images et médias

Fournissez des alternatives textuelles pour les images et les médias :

- Utilisez l'attribut `alt` pour les images
- Fournissez des sous-titres pour les vidéos
- Fournissez des transcriptions pour les contenus audio

### Formulaires

Rendez les formulaires accessibles :

- Associez les labels aux champs de formulaire avec l'attribut `htmlFor`
- Fournissez des messages d'erreur clairs et accessibles
- Groupez les champs de formulaire liés avec `<fieldset>` et `<legend>`
- Utilisez `aria-describedby` pour associer des textes d'aide aux champs

## Composants UI accessibles

### Boutons

```jsx
<Button
  onClick={handleClick}
  aria-label="Ajouter un membre"
>
  <PlusIcon />
  Ajouter
</Button>
```

### Modales

```jsx
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle id="dialog-title">Titre de la modale</DialogTitle>
      <DialogDescription id="dialog-description">
        Description de la modale
      </DialogDescription>
    </DialogHeader>
    {/* Contenu de la modale */}
  </DialogContent>
</Dialog>
```

### Onglets

```jsx
<Tabs defaultValue="tab1">
  <TabsList aria-label="Options">
    <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
    <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Contenu de l'onglet 1</TabsContent>
  <TabsContent value="tab2">Contenu de l'onglet 2</TabsContent>
</Tabs>
```

### Accordéons

```jsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Contenu de la section 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>Contenu de la section 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Tests d'accessibilité

### Tests manuels

- Naviguez dans l'application en utilisant uniquement le clavier
- Testez l'application avec un lecteur d'écran (NVDA, JAWS, VoiceOver)
- Vérifiez le contraste des couleurs avec des outils comme [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Testez l'application avec un zoom de 200%

### Tests automatisés

Utilisez des outils comme [axe-core](https://github.com/dequelabs/axe-core) pour tester automatiquement l'accessibilité :

```jsx
// src/test/accessibility/button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Ressources

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
- [Axe Core](https://github.com/dequelabs/axe-core)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
