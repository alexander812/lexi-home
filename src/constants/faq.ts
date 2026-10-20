import type { Locale } from './i18n';
import { t } from '../utils/i18n-text';

export interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_KEYS = [
  { question: 'faq_q1', answer: 'faq_a1' },
  { question: 'faq_q2', answer: 'faq_a2' },
  { question: 'faq_q3', answer: 'faq_a3' },
  { question: 'faq_q4', answer: 'faq_a4' },
  { question: 'faq_q5', answer: 'faq_a5' },
  { question: 'faq_q6', answer: 'faq_a6' },
  { question: 'faq_q7', answer: 'faq_a7' },
] as const;

/** FAQ shown in the page and mirrored in the FAQPage structured data */
export function getFaqItems(locale: Locale): FaqItem[] {
  return FAQ_KEYS.map(({ question, answer }) => ({
    question: t(locale, question),
    answer: t(locale, answer),
  }));
}
