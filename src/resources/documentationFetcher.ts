import fetch from 'node-fetch';
import { DocumentationCache } from '../types.js';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class DocumentationFetcher {
  private cache: DocumentationCache = {
    lastFetched: {}
  };

  async fetchJestDocs(): Promise<string> {
    const now = new Date();
    
    // Check if cache is valid
    if (
      this.cache.jest &&
      this.cache.lastFetched.jest &&
      now.getTime() - this.cache.lastFetched.jest.getTime() < CACHE_DURATION_MS
    ) {
      return this.cache.jest;
    }

    try {
      // Fetch multiple Jest documentation pages
      const urls = [
        'https://jestjs.io/docs/getting-started',
        'https://jestjs.io/docs/api',
        'https://jestjs.io/docs/expect',
        'https://jestjs.io/docs/mock-functions'
      ];

      const fetchPromises = urls.map(url => 
        fetch(url).then(res => res.text()).catch(() => '')
      );

      const results = await Promise.all(fetchPromises);
      const combinedDocs = results.join('\n\n---\n\n');

      // Extract relevant content (remove HTML tags for simpler processing)
      const cleanedDocs = this.cleanHtmlContent(combinedDocs);

      this.cache.jest = cleanedDocs;
      this.cache.lastFetched.jest = now;

      return cleanedDocs;
    } catch (error) {
      console.error('Failed to fetch Jest documentation:', error);
      return this.getFallbackJestDocs();
    }
  }

  async fetchJasmineDocs(): Promise<string> {
    const now = new Date();
    
    // Check if cache is valid
    if (
      this.cache.jasmine &&
      this.cache.lastFetched.jasmine &&
      now.getTime() - this.cache.lastFetched.jasmine.getTime() < CACHE_DURATION_MS
    ) {
      return this.cache.jasmine;
    }

    try {
      const urls = [
        'https://jasmine.github.io/',
        'https://jasmine.github.io/api/edge/global',
        'https://jasmine.github.io/tutorials/your_first_suite'
      ];

      const fetchPromises = urls.map(url => 
        fetch(url).then(res => res.text()).catch(() => '')
      );

      const results = await Promise.all(fetchPromises);
      const combinedDocs = results.join('\n\n---\n\n');

      const cleanedDocs = this.cleanHtmlContent(combinedDocs);

      this.cache.jasmine = cleanedDocs;
      this.cache.lastFetched.jasmine = now;

      return cleanedDocs;
    } catch (error) {
      console.error('Failed to fetch Jasmine documentation:', error);
      return this.getFallbackJasmineDocs();
    }
  }

  private cleanHtmlContent(html: string): string {
    // Remove script and style tags
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags but keep content
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Limit size to prevent token overflow
    return cleaned.substring(0, 50000);
  }

  private getFallbackJestDocs(): string {
    return `
# Jest Testing Framework

## Basic Structure
describe('Test Suite', () => {
  test('test case', () => {
    expect(value).toBe(expected);
  });
});

## Common Matchers
- toBe(value) - strict equality
- toEqual(value) - deep equality
- toBeTruthy() / toBeFalsy()
- toBeNull() / toBeUndefined() / toBeDefined()
- toContain(item) - array/string contains
- toMatch(pattern) - string matches regex
- toThrow() - function throws error

## Async Testing
test('async test', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

## Mocking
const mockFn = jest.fn();
jest.mock('./module');

## Setup/Teardown
beforeEach(() => { /* setup */ });
afterEach(() => { /* cleanup */ });
beforeAll(() => { /* one-time setup */ });
afterAll(() => { /* one-time cleanup */ });
    `.trim();
  }

  private getFallbackJasmineDocs(): string {
    return `
# Jasmine Testing Framework

## Basic Structure
describe('Test Suite', function() {
  it('test case', function() {
    expect(value).toBe(expected);
  });
});

## Common Matchers
- toBe(value) - strict equality
- toEqual(value) - deep equality
- toBeTruthy() / toBeFalsy()
- toBeNull() / toBeUndefined() / toBeDefined()
- toContain(item) - array/string contains
- toMatch(pattern) - string matches regex
- toThrow() - function throws error

## Async Testing
it('async test', function(done) {
  asyncFunction().then(function(result) {
    expect(result).toBeDefined();
    done();
  });
});

## Spies
const spy = jasmine.createSpy('name');
spyOn(object, 'method');

## Setup/Teardown
beforeEach(function() { /* setup */ });
afterEach(function() { /* cleanup */ });
beforeAll(function() { /* one-time setup */ });
afterAll(function() { /* one-time cleanup */ });
    `.trim();
  }

  clearCache(): void {
    this.cache = { lastFetched: {} };
  }
}

export const docFetcher = new DocumentationFetcher();
