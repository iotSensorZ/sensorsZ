declare module 'html-pdf-node' {
    interface Options {
      format?: string;
    }
  
    interface FileContent {
      content: string;
    }
  
    function generatePdf(file: FileContent, options: Options): Promise<Buffer>;
  
    export { generatePdf, FileContent, Options };
  }
  