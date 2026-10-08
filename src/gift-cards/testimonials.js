// Real customer reviews for the gift cards page. The section stays hidden until this list has entries.
//
// Only add genuine reviews you have permission to publish (e.g. from your review page, app stores,
// or customer emails), quoted word for word. Shape:
//   {
//     quote: 'Exact words from the customer.',
//     name: 'Ama K.',                 // as the customer agreed to be shown
//     location: 'Accra, Ghana',       // optional
//     source: 'App Store review',     // optional: where the review was left
//     rating: 5,                      // optional: 1–5, only if the customer gave one
//     date: 'Sep 2026',               // optional
//   }
export const TESTIMONIALS = [];

// Demo placeholders: shown on every build (dev and production) until TESTIMONIALS has real entries.
// Replace with real reviews before launch.
export const PREVIEW_TESTIMONIALS = [
  { quote: 'Sample review. Replace with a real customer quote about buying a gift card.', name: 'Customer name', location: 'City, Country', source: 'Review source', rating: 5, date: 'Month Year' },
  { quote: 'Sample review. A longer real quote will wrap across several lines here, so the cards are tested with more text than the others.', name: 'Customer name', location: 'City, Country', source: 'Review source', rating: 5 },
  { quote: 'Sample review. Replace with a real customer quote.', name: 'Customer name', location: 'City, Country', source: 'Review source' },
];
