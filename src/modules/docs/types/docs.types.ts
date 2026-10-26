// src/modules/docs/types/docs.types.ts

export type DocCalloutType = "tip" | "important" | "note" | "warning";

export interface DocCallout {
  type: DocCalloutType;
  titleFa: string;
  titleEn: string;
  contentFa: string;
  contentEn: string;
}

export interface DocStep {
  number: number;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  tipFa?: string;
  tipEn?: string;
}

export interface DocSection {
  id: string;
  titleFa: string;
  titleEn: string;
  contentFa: string;
  contentEn: string;
  callout?: DocCallout;
  steps?: DocStep[];
  codeSnippet?: {
    code: string;
    language: string;
    captionFa?: string;
    captionEn?: string;
  };
  formula?: {
    latex: string;
    reference: string;
    descriptionFa: string;
    descriptionEn: string;
  };
}

export interface DocArticle {
  id: string;
  slug: string;
  categoryId: string;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  subtitleEn: string;
  readingTimeMinutes: number;
  standardRef?: string;
  lastUpdated: string;
  sections: DocSection[];
  tags: string[];
}

export interface DocCategory {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  iconName: string;
  articles: DocArticle[];
}
