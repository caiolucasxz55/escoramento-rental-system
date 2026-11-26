// so no navegador: o pdf.js e carregado sob demanda, quando o preview abre
type Pdfjs = typeof import("pdfjs-dist");

let loading: Promise<Pdfjs> | null = null;

export function loadPdfjs(): Promise<Pdfjs> {
  loading ??= import("pdfjs-dist").then((pdfjs) => {
    // worker empacotado pelo bundler; o parse do PDF roda fora da thread da UI
    pdfjs.GlobalWorkerOptions.workerPort ??= new Worker(
      new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
      { type: "module" },
    );
    return pdfjs;
  });
  return loading;
}
