export interface PdfRequest {
  html: string;
  options?: {
    format?: 'A4' | 'Letter';
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    printBackground?: boolean;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
