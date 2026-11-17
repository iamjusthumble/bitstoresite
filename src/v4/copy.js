// V4 wording. Starts from the V3 copy and leaves out P2P, which Mybitstore doesn't offer for now.
import { faqs as v3Faqs, securityCopy as v3Security, steps as v3Steps } from '../v3/copy.js';

export { aiCopy, lensCopy, productCopy } from '../v3/copy.js';

export const P2P_SECURITY_TITLE = 'Escrow-backed P2P';
// Same order as the shared security items, minus the P2P one
export const securityCopy = v3Security.filter((_, i) => i !== 1);

export const steps = v3Steps.map(([t, c]) => (t === 'Add funds' ? [t, 'Buy crypto with a card or bank transfer, or send in crypto you already own.'] : [t, c]));

export const faqs = v3Faqs.map((f) =>
  f.q === 'How do I add money to my account?' ? { ...f, a: 'Buy crypto with a card or bank transfer, or send in crypto from another wallet.' } : f,
);

export const aiAlert = {
  title: 'Extra Verification',
  copy: 'This large transaction needs one more check before it goes through.',
  tags: ['Transaction Value: $1,250', 'Large Amount'],
};
