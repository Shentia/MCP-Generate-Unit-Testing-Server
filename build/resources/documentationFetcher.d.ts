export declare class DocumentationFetcher {
    private cache;
    fetchJestDocs(): Promise<string>;
    fetchJasmineDocs(): Promise<string>;
    private cleanHtmlContent;
    private getFallbackJestDocs;
    private getFallbackJasmineDocs;
    clearCache(): void;
}
export declare const docFetcher: DocumentationFetcher;
//# sourceMappingURL=documentationFetcher.d.ts.map