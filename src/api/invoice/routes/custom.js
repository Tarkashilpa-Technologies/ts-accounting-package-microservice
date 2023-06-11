module.exports = {
    routes: [
      {
        method: "POST",
        path: "/invoices/generatePdf",
        handler: "invoice.getInvoicePdf",
      },
      {
        method: "POST",
        path: "/invoices/createInvoice",
        handler: "invoice.createInvoice",
      },
    ],
  };