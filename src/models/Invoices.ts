export interface InvoiceInfo {
  id: number;
  title: string;
  clientId: number | null;
  items: Array<{
    id: number;
    text: string;
    price: number;
  }>
}

export interface Client {
  id: number;
  name: string;
}
