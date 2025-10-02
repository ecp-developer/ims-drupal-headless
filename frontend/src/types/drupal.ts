export interface DrupalNode {
  type: string;
  id: string;
  attributes: {
    title: string;
    created: string;
    body?: {
      processed: string;
      value: string;
    };
    [key: string]: any;
  };
}

export interface DrupalResponse {
  data: DrupalNode[];
}

// Taxonomy Term interface
export interface TaxonomyTerm {
  type: string;
  id: string;
  attributes: {
    name: string;
    drupal_internal__tid: number;
    description?: {
      value?: string;
      processed?: string;
    };
    weight?: number;
    status: boolean;
    [key: string]: any;
  };
}

export interface TaxonomyResponse {
  data: TaxonomyTerm[];
  links?: {
    self?: { href: string };
    first?: { href: string };
    last?: { href: string };
    prev?: { href: string };
    next?: { href: string };
  };
}

export type ContentType = 'article' | 'page' | 'vendors';

export type TaxonomyVocabulary = 'country' | 'city' | 'categories';
