import { useState, useEffect } from 'react';
import { http } from '../http';
import { InvoiceInfo } from '../models/Invoices';
import { Invoice } from './Invoice';

export function Invoices() {

  const [invoiceList, setInvoiceList] = useState<InvoiceInfo[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    http<InvoiceInfo[]>('http://localhost:3001/invoices').then(invoices => {
      setInvoiceList(invoices);
    })
  }

  const newInvoice = () => {
    http<InvoiceInfo>('http://localhost:3001/invoices', {
      body: {
        title: 'New invoice',
        clientId: '',
        items: []
      }
    }).then(invoice => {
      setInvoiceList([...invoiceList, invoice]);
      setActiveInvoice(invoice.id);
    })
  }

  const onDelete = () => {
    setInvoiceList(invoiceList.filter(i => i.id !== activeInvoice));
    setActiveInvoice(null);
  }
  
  return <div>
    <b>Invoices</b>
    <ul className="list-group">
      {invoiceList.map(invoice => (
        <li
          className={"list-group-item " + (invoice.id === activeInvoice ? 'active' : '')}
          key={invoice.id}
          onClick={() => setActiveInvoice(invoice.id)}
        >{invoice.title}</li>
      ))}
    </ul>
    <button type="button" className="btn btn-success btn-sm mt-2" onClick={newInvoice}>Add</button>

    { activeInvoice && <Invoice invoiceId={activeInvoice} onDelete={onDelete} onUpdate={() => fetchInvoices()} />}
  </div>;
}