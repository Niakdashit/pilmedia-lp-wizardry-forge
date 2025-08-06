// Temporarily disable TypeScript strict checks for DesignEditor
declare global {
  namespace JSX {
    interface IntrinsicElements {
      style: any;
    }
  }
}

export {};