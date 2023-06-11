'use strict';

/**
 * invoice controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { parseMultipartData } = require("@strapi/utils");
const axios = require('axios');
const {
    increasedInvoiceFunc,
    billDateStr,
    percentage,
    calculateTax,
  } = require("../../../utils/functions");

module.exports = createCoreController('api::invoice.invoice',  ({ strapi }) => ({
    async create(ctx) {
        const { data } = parseMultipartData(ctx);
        let invoiceData = { ...data.data };
        let prevInvoiceNumber = await strapi.entityService.findMany(
          "api::invoice.invoice",
          {
            start: 0,
            sort: "INVOICE_NUMBER:desc",
            limit: 5,
            where: {
              TYPE: invoiceData.TYPE,
            },
          }
        );
        console.log("NSNS",prevInvoiceNumber, invoiceData.TYPE)
        if (invoiceData.TYPE === "TAX") {
          let newInvoiceNumber= ''
          console.log("prevInvoiceNumber", invoiceData.TYPE);
          if (prevInvoiceNumber.length) {
            let { INVOICE_NUMBER } = prevInvoiceNumber[0];
            if(INVOICE_NUMBER == ''){
              newInvoiceNumber = increasedInvoiceFunc('TAX000');
            }
            else{
              newInvoiceNumber = increasedInvoiceFunc(INVOICE_NUMBER);
            }
            invoiceData["INVOICE_NUMBER"] = newInvoiceNumber;
          }
        } else if (invoiceData.TYPE === "PROFORMA") {
          console.log("prevInvoiceNumber", invoiceData.TYPE);
          if (prevInvoiceNumber.length) {
            console.log("ABCD", prevInvoiceNumber[0]);
            let { INVOICE_NUMBER } = prevInvoiceNumber[0];
            let newInvoiceNumber = increasedInvoiceFunc(INVOICE_NUMBER);
            invoiceData["INVOICE_NUMBER"] = newInvoiceNumber;
          }
        }
        let salesData = invoiceData['sales'];
        let subTotal = 0;
        for (let index = 0; index < salesData.length; index++) {
          const sales = await strapi.db.query("api::sale.sale").findOne({
            where:{
              id:salesData[index]
            }
          })
          subTotal+= sales['AMOUNT']
        }
        let IGST = percentage(9,subTotal) ;
        let CGST = percentage(9,subTotal) ;
        let grandTotal = subTotal + IGST + CGST;
        invoiceData['IGST'] = IGST;
        invoiceData['CGST'] = CGST;
        invoiceData['SGST'] = 0;
        invoiceData['GRAND_TOTAL'] = grandTotal.toFixed(2);
        console.log(invoiceData,"invoiceData")
        let newInvoice = await strapi
          .service("api::invoice.invoice")
          .create({ data: invoiceData });
        // let newInvoice = []
        let tempSales = newInvoice;
        const sanitizedResults = await this.sanitizeOutput(tempSales, ctx);
        return this.transformResponse(sanitizedResults);

      },
    async getInvoicePdf(ctx) {
        let invoiceItems= []
        const { data } = parseMultipartData(ctx);
        let pdfData = { ...data.data };
        let  {invoiceNumber="",clientDetails} = pdfData ;
        let invoice = await strapi.db.query("api::invoice.invoice").findOne({
          where: {
            ID: invoiceNumber,
          },
          populate: true,
        });
        
        console.log(invoice,"skjbk")
        if (invoice && Object.keys(invoice).length ) {
          let { INVOICE_NUMBER, INVOICE_DATE, IGST, CGST, SGST, GRAND_TOTAL, sales } = invoice;
        //   let billDateString = billDateStr(INVOICE_DATE);
          let billDateString = billDateStr(INVOICE_DATE);
          let subTotal = 0
            sales?.forEach(element => {
                let val = {
                    item: element.DESCRIPTION,
                    amount: element.AMOUNT
                }
                invoiceItems.push(val)
                subTotal += val.amount
                console.log(invoiceItems);
            });
          let pdfItems = {
            invoiceItems: invoiceItems,
            invoiceNo: INVOICE_NUMBER,
            billDate: billDateString,
            SUBTOTAL: subTotal,
            IGST: IGST,
            CGST: CGST,
            SGST: SGST,
            GRAND_TOTAL: GRAND_TOTAL,
          };
        //   console.log("VHGVG", pdfItems, invoiceItems)
          try {
            let response = await axios.post("http://localhost:8000/api/v1/upload",{...pdfItems,}, {headers: {"Content-Type": "application/json",},})
          let fileId = response.data.fileId;
          let data = {
            fileId,
            clientDetails
          }
            let pdfResponseData = await axios.post("http://localhost:8000/api/v1/fetchDocument",{...data,}, {headers: {"Content-Type": "application/json",},}) 
            let msg = pdfResponseData?.data?.msg
            ctx.body ={
              data:{
                message:msg
              }
           }
          } catch (error) {
            console.log(error,"data")
            let {msg= ""} = error?.response?.data
            ctx.body = {
              "data": null,
              "error": {
                  "status": 400,
                  "name": "InternalServerError",
                  "message":msg
              }
          }}
        }else{
          ctx.body = {
            "data": null,
            "error": {
                "status": 400,
                "name": "InternalServerError",
                "message":`this invoice ${invoiceNumber} data is not present in db please provide a valid Invoice Number `
            }
        }
        }
      },   
      
      async createInvoice(ctx){
        const { data } = parseMultipartData(ctx);
        let invoiceData = { ...data.data };
        let {sales} = invoiceData;
        let prevInvoiceNumber = await strapi.entityService.findMany(
          "api::invoice.invoice",
          {
            start: 0,
            sort: "INVOICE_NUMBER:desc",
            limit: 5,
            where: {
              TYPE: invoiceData.TYPE,
            },
          }
        );
        console.log("NSNS",prevInvoiceNumber, invoiceData.TYPE)
        if (invoiceData.TYPE === "TAX") {
          let newInvoiceNumber= ''
          console.log("prevInvoiceNumber", invoiceData.TYPE);
          if (prevInvoiceNumber.length) {
            let { INVOICE_NUMBER } = prevInvoiceNumber[0];
            if(INVOICE_NUMBER == ''){
              newInvoiceNumber = increasedInvoiceFunc('TAX000');
            }
            else{
              newInvoiceNumber = increasedInvoiceFunc(INVOICE_NUMBER);
            }
            invoiceData["INVOICE_NUMBER"] = newInvoiceNumber;
          }
        } else if (invoiceData.TYPE === "PROFORMA") {
          console.log("prevInvoiceNumber", invoiceData.TYPE);
          if (prevInvoiceNumber.length) {
            console.log("ABCD", prevInvoiceNumber[0]);
            let { INVOICE_NUMBER } = prevInvoiceNumber[0];
            let newInvoiceNumber = increasedInvoiceFunc(INVOICE_NUMBER);
            invoiceData["INVOICE_NUMBER"] = newInvoiceNumber;
          }
        }
        let salesData = await strapi.db.query('api::sale.sale').findMany({
          where:{
            id:{
              $in:sales
            }
          }
        })
        if(salesData.length){
          let PROJECT = salesData[0]['PROJECT']
          let isEqalSales = salesData.every(ele=>ele['PROJECT']===PROJECT)
          if(!isEqalSales){
            return ctx.send({
              message:`invalid sales id provide a valid sale ids`
          },400)
          }
          let totalAmount = salesData.reduce((a,b)=>a  + b.AMOUNT,0)
          let perAmount = {};
          if(invoiceData['HOST_BUSINESS_STATE'] === invoiceData['CLIENT_BILLING_STATE']){
            perAmount = calculateTax(totalAmount,9,"sgst","cgst")
          }else{
            perAmount = calculateTax(totalAmount,18,"igst")
          }
          Object.keys(perAmount).forEach(ele=>{
            invoiceData[ele] = perAmount[ele]
          })
        }
        // console.log(invoiceData,"inco")
        let newInvoice = await strapi
        .service("api::invoice.invoice")
        .create({ data: invoiceData });
      // let newInvoice = []
      let tempInvoice = newInvoice;
      const sanitizedResults = await this.sanitizeOutput(tempInvoice, ctx);
      return this.transformResponse(sanitizedResults);


      }
}));
