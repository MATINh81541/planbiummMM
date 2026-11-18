/*
 * Legal document content for PlanBium.
 *
 * Complete English and Persian text for four legal documents:
 * Terms of Service, Privacy Policy, Refund Policy, and Cookie Policy.
 *
 * <!-- REVIEW WITH A LEGAL ADVISOR BEFORE LAUNCH -->
 */

export type LegalType = 'terms' | 'privacy' | 'refunds' | 'cookies';

export interface LegalSection {
  headingKey: string;
  paragraphs: string[];
}

export interface LegalDocument {
  type: LegalType;
  lastUpdated: string;
  sections: LegalSection[];
}

// <!-- REVIEW WITH A LEGAL ADVISOR BEFORE LAUNCH -->
export const LEGAL_LAST_UPDATED: Record<LegalType, string> = {
  terms: '2026-11-18',
  privacy: '2026-11-18',
  refunds: '2026-11-18',
  cookies: '2026-11-18',
};

// Re-export the old type name for backwards compat
export type { LegalType as LegalDocType };

export const legalDocuments: Record<LegalType, LegalDocument> = {
  terms: {
    type: 'terms',
    lastUpdated: LEGAL_LAST_UPDATED.terms,
    sections: [
      {
        headingKey: 'legal.terms.s1.title',
        paragraphs: [
          'legal.terms.s1.p1',
        ],
      },
      {
        headingKey: 'legal.terms.s2.title',
        paragraphs: [
          'legal.terms.s2.p1',
        ],
      },
      {
        headingKey: 'legal.terms.s3.title',
        paragraphs: [
          'legal.terms.s3.p1',
          'legal.terms.s3.p2',
        ],
      },
      {
        headingKey: 'legal.terms.s4.title',
        paragraphs: [
          'legal.terms.s4.p1',
        ],
      },
      {
        headingKey: 'legal.terms.s5.title',
        paragraphs: [
          'legal.terms.s5.p1',
          'legal.terms.s5.p2',
        ],
      },
      {
        headingKey: 'legal.terms.s6.title',
        paragraphs: [
          'legal.terms.s6.p1',
        ],
      },
      {
        headingKey: 'legal.terms.s7.title',
        paragraphs: [
          'legal.terms.s7.p1',
        ],
      },
    ],
  },
  privacy: {
    type: 'privacy',
    lastUpdated: LEGAL_LAST_UPDATED.privacy,
    sections: [
      {
        headingKey: 'legal.privacy.s1.title',
        paragraphs: ['legal.privacy.s1.p1'],
      },
      {
        headingKey: 'legal.privacy.s2.title',
        paragraphs: ['legal.privacy.s2.p1', 'legal.privacy.s2.p2'],
      },
      {
        headingKey: 'legal.privacy.s3.title',
        paragraphs: ['legal.privacy.s3.p1', 'legal.privacy.s3.p2', 'legal.privacy.s3.p3'],
      },
      {
        headingKey: 'legal.privacy.s4.title',
        paragraphs: ['legal.privacy.s4.p1'],
      },
      {
        headingKey: 'legal.privacy.s5.title',
        paragraphs: ['legal.privacy.s5.p1'],
      },
      {
        headingKey: 'legal.privacy.s6.title',
        paragraphs: ['legal.privacy.s6.p1'],
      },
    ],
  },
  refunds: {
    type: 'refunds',
    lastUpdated: LEGAL_LAST_UPDATED.refunds,
    sections: [
      {
        headingKey: 'legal.refunds.s1.title',
        paragraphs: ['legal.refunds.s1.p1'],
      },
      {
        headingKey: 'legal.refunds.s2.title',
        paragraphs: ['legal.refunds.s2.p1', 'legal.refunds.s2.p2'],
      },
      {
        headingKey: 'legal.refunds.s3.title',
        paragraphs: ['legal.refunds.s3.p1', 'legal.refunds.s3.p2'],
      },
      {
        headingKey: 'legal.refunds.s4.title',
        paragraphs: ['legal.refunds.s4.p1'],
      },
      {
        headingKey: 'legal.refunds.s5.title',
        paragraphs: ['legal.refunds.s5.p1'],
      },
    ],
  },
  cookies: {
    type: 'cookies',
    lastUpdated: LEGAL_LAST_UPDATED.cookies,
    sections: [
      {
        headingKey: 'legal.cookies.s1.title',
        paragraphs: ['legal.cookies.s1.p1'],
      },
      {
        headingKey: 'legal.cookies.s2.title',
        paragraphs: ['legal.cookies.s2.p1', 'legal.cookies.s2.p2'],
      },
      {
        headingKey: 'legal.cookies.s3.title',
        paragraphs: ['legal.cookies.s3.p1'],
      },
      {
        headingKey: 'legal.cookies.s4.title',
        paragraphs: ['legal.cookies.s4.p1'],
      },
    ],
  },
};
