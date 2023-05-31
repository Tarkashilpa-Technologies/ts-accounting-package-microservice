module.exports = {
    routes: [
      {
        method: "POST",
        path: "/invoices/generatePdf",
        handler: "invoice.getInvoicePdf",
      },
    ],
  };