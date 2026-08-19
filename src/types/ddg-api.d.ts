declare module 'ddg-api' {
  interface SearchResult {
    title: string;
    url: string;
    snippet: string;
  }

  interface SearchOptions {
    numResults?: number;
    region?: string;
    safesearch?: 'on' | 'off' | 'moderate';
  }

  interface SearchClient {
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  }

  export function SearchClient(): SearchClient;
  const SearchClient: {
    new (): SearchClient;
  };
}
