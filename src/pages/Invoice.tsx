import * as React from 'react';
import { useState, useEffect } from 'react';
import { http } from '../http';
import { InvoiceInfo, Client } from '../models/Invoices';

export interface InvoiceProps {
  invoiceId: number;
  onDelete: () => void;
  onUpdate: () => void;
}

export interface formData {
  invoice: InvoiceInfo | null;
  clients: Client[]
}

export function Invoice({ invoiceId, onDelete, onUpdate }: InvoiceProps) {

  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState<formData | null>(null);

  const addItem = () => {
    setInvoice({
      ...invoice!,
      items: [...invoice!.items, { id: Math.random(), text: '', price: 0 }]
    })
  }

  const removeItem = (index: number) => {
    setInvoice({
      ...invoice!,
      items: invoice!.items.filter((_, i) => i !== index)
    })
  }

  const setItemTitle = (index: number, text: string) => {
    setInvoice({
      ...invoice!,
      items: invoice!.items.map((item, i) => {
        if (i !== index) return item;
        return { ...item, text };
      })
    })
  }

  const setItemPrice = (index: number, price: number) => {
    setInvoice({
      ...invoice!,
      items: invoice!.items.map((item, i) => {
        if (i !== index) return item;
        return { ...item, price };
      })
    })
  }

  const setField = (field: string, value: any) => {
    setInvoice({
      ...formData?.invoice!,
      [field]: value
    });
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity()) {
      http('http://localhost:3001/invoices/' + invoiceId, {
        method: 'PUT',
        body: invoice
      }).then(() => {
        setIsSubmitted(false);
        onUpdate();
      })
    } else {
      setIsSubmitted(true);
    }
  }

  const deleteInvoice = () => {
    http('http://localhost:3001/invoices/' + invoiceId, {
      method: 'DELETE'
    }).then(() => {
      onDelete();
    })
  }

  const resetInvoice = () => {
    setInvoice(formData?.invoice!);
    setClients(formData?.clients!);
  }

  const total = invoice?.items.reduce((tot, item) => tot + item.price, 0) || 0;

  useEffect(() => {
    setInvoice(null);
    setIsSubmitted(false);

    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      http<InvoiceInfo>('http://localhost:3001/invoices/' + invoiceId, { signal }),
      http<Client[]>('http://localhost:3001/clients', { signal })
    ]).then(([invoice, clients]) => {
      setInvoice(invoice);
      setClients(clients);
      setFormData({
        invoice: invoice,
        clients: clients
      })
    });

    return () => controller.abort();
  }, [invoiceId])

  return !invoice ? <p>Loading...</p> : <form noValidate onSubmit={onSubmit} className={isSubmitted ? "was-validated" : ""}>
    <h3 className="mt-3">Invoice</h3>
    <div className='col-md-6'>
      <input
        type="text" placeholder="Title" className={`form-control w-100`}
        name="title"
        value={invoice?.title}
        onChange={e => setField(e.target.name, e.target.value)}
        required
        minLength={3}
      />
      <div className="invalid-feedback">
        Please choose a title.
      </div>
    </div>
    <div className='col-md-6'>
      <select
        name="clientId" className="form-select mt-2"
        value={invoice?.clientId || ''}
        onChange={e => setField(e.target.name, e.target.value)}
        required
      >
        <option value="">Select a client</option>
        {clients?.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
      </select>
      <div className="invalid-feedback">
        Please choose a Client.
      </div>
    </div>

    <h5 className="mt-3">Items</h5>
    <button type="button" className="btn btn-success btn-sm mb-2" onClick={addItem}>Add</button>
    {invoice?.items.map((item, i) =>
      <div className="mb-1 input-group" key={item.id}>
        <input className="form-control" type="text" placeholder="Item" value={item.text} onChange={e => setItemTitle(i, e.target.value)} required />
        <input className="form-control" type="number" placeholder="Price" value={item.price} onChange={e => setItemPrice(i, +e.target.value)} />
        <div className="invalid-feedback">
            Please choose a Name.
        </div>
        <button type="button" className="btn btn-danger" onClick={() => removeItem(i)}>Remove</button>
      </div>
    )}
    <h6 className="mt-3">Total: €{total}</h6>
    <button type="submit" className="btn btn-primary m-2 d-inline-block">Save</button>
    <button type="button" className="btn btn-danger m-2 d-inline-block" onClick={deleteInvoice}>Delete</button>
    <button type="button" className="btn btn-warning m-2 d-inline-block" onClick={resetInvoice}>Discard changes</button>
  </form>;
}