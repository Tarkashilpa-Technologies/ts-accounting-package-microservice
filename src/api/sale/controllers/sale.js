'use strict';

/**
 * sale controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { parseMultipartData } = require("@strapi/utils");
module.exports = createCoreController('api::sale.sale',({strapi})=>({
    async getsalesData(ctx) {
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);
        const { results, pagination } = await strapi.service('api::sale.sale').find(sanitizedQueryParams);
        const sanitizedResults = await this.sanitizeOutput(results, ctx);
        return this.transformResponse(sanitizedResults, { pagination });
        // const query = ctx.request.query;
        // console.log(query);
        // let populate  = ""
        // query['populate'] == 1 ?  populate  = "*" : populate = ""
        // const { limit = 10, start = 0 } = query;
        // const limitNumber = Number(limit);
        // const startNumber = Number(start);
      
        // console.log(startNumber,limit,"log")
        // const sales = await strapi.entityService.findMany("api::sale.sale",{
        //     limit: limitNumber,
        //     start: startNumber,
        //   populate:populate ,
        // });

        // const totalCount = await strapi.db.query('api::sale.sale').count();
        // const pagination = {
        //     page:"",
        //     pageSize:"",
        //     pageCount:"",
        //     limit: limitNumber, // Set the appropriate limit
        //     start: startNumber, // Set the appropriate start index
        //     total: totalCount,
        //   };
        // const sanitizedResults = await this.sanitizeOutput(sales, ctx);
        // return this.transformResponse(sanitizedResults,{pagination});
      },

      async delete(ctx){
        let saleId = ctx.params.id;
        let sale = await strapi.db.query('api::sale.sale').findOne({
            where:{
                id:saleId
            },
            populate:true
        })
        if(!(!!sale)){
            return ctx.send({
                message:"sale is not present in db"
            },400)
        }
        let invoices  = sale['invoices'].map(({id})=>id)
        if(invoices.length){
            invoices = invoices.join(" , ")
            return ctx.send({
                message:`${invoices} invoice ids are present in sales you can't delete the sale`
            },400)
        }
        
        sale = await strapi.service('api::sale.sale').delete(saleId)
        const sanitizedResults = await this.sanitizeOutput(sale, ctx);
        return this.transformResponse(sanitizedResults);
      },

      async update(ctx){
        const { data } = parseMultipartData(ctx);
        let saleId = ctx.params.id;
        let salesData = { ...data };
        let sale = await strapi.db.query('api::sale.sale').findOne({
            where:{
                id:saleId
            },
            populate:true
        })
        if(!(!!sale)){
            return ctx.send({
                message:"sale is not present in db"
            },400)
        }
        let invoices  = sale['invoices'].map(({id})=>id)
        if(invoices.length){
            invoices = invoices.join(" , ")
            return ctx.send({
                message:`${invoices} invoice id are present in sales you can't update`
            },400)
        }
        
        
        sale = await strapi.service('api::sale.sale').update(saleId,salesData)
        const sanitizedResults = await this.sanitizeOutput(sale, ctx);
        return this.transformResponse(sanitizedResults);

      }

}));
