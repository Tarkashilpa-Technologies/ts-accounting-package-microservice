'use strict';
const { parseMultipartData } = require("@strapi/utils");
const { generateBillingCycleDates, replaceVariableWithValue, timePeriodString } = require("../../../../config/util");

/**
 * recursive-sale controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::recursive-sale.recursive-sale', ({ strapi }) => ({
    async create(ctx) {
        const { data } = parseMultipartData(ctx);
        let recursiveSalesData = { ...data };
        let recursiveSale = await strapi.service("api::recursive-sale.recursive-sale").create(recursiveSalesData);
        let recursiveSaleId = recursiveSale.id;
        let { EXPECTED_SALE_COMPLETION_DATE, RECURRING_FREQUENCY, NUMBER_OF_RECURRENCES, MONTH_OF_SALE_DONE } = recursiveSalesData.data
        // console.log(recursiveSalesData)
        let salesPayload = {}
        let salesIds = [];
        let data2 = generateBillingCycleDates(EXPECTED_SALE_COMPLETION_DATE, RECURRING_FREQUENCY, NUMBER_OF_RECURRENCES + 1)
        console.log(data2,"data2")
        let currentData = new Date()
        for (
            let index = 0;
            index < recursiveSalesData.data.NUMBER_OF_RECURRENCES;
            index++
        ) {
            let tempDescription = replaceVariableWithValue(recursiveSalesData?.data?.DESCRIPTION, recursiveSalesData.data)
            let desc = `development for ${MONTH_OF_SALE_DONE}  ${timePeriodString(data2[index],data2[index+1])}`
            console.log("NSNS", desc)
           let salesPayload = {
                PROJECT: recursiveSalesData?.data?.PROJECT,
                STATUS_OF_PROJECT:  new Date(data2[index]) > currentData ?"UPCOMING" :"COMPLETED",
                EXPECTED_COMPLETION_DATE: data2[index],
                MONTH_OF_SALE: data2[index],
                DESCRIPTION: desc,
                AMOUNT: recursiveSalesData?.data?.AMOUNT,
                services: recursiveSalesData?.data?.services,
                recursive_sale: recursiveSaleId,
            };
            let result = await strapi.db
                .query("api::sale.sale")
                .create({ data: salesPayload });
            salesIds.push(result.id);
        }
        recursiveSalesData.data.sales = salesIds;
        console.log(recursiveSalesData)
        let tempSales = await strapi
            .service("api::recursive-sale.recursive-sale")
            .update(recursiveSaleId, {
                data: {
                    sales: salesIds,
                },
            });
        const sanitizedResults = await this.sanitizeOutput(tempSales, ctx);
        return this.transformResponse(sanitizedResults);
    },
    async update(ctx) {
        const { data } = parseMultipartData(ctx);
        let recursiveSaleId = ctx.params.id;
        let recursiveSalesData = { ...data };
        let recursiveSale = await strapi
            .service("api::recursive-sale.recursive-sale")
            .update(recursiveSaleId, recursiveSalesData);

        const SalesToUpdate = await strapi.db.query("api::sale.sale").findMany({
            where: {
                recursive_sales: [recursiveSaleId],
                STATUS_OF_PROJECT: "UPCOMING",
            }
        }
        );
        await Promise.all(
            SalesToUpdate.map(({ id }) => {
                strapi.service("api::sale.sale").update(id, recursiveSalesData)
            }
            )
        );
        const sanitizedResults = await this.sanitizeOutput(recursiveSale, ctx);
        return this.transformResponse(sanitizedResults);
    },
    async delete(ctx) {
        let recursiveSaleId = ctx.params.id;
        let findSalesData = await strapi.db
          .query("api::recursive-sale.recursive-sale")
          .findOne({
            where: { id: recursiveSaleId },
            populate: ['sales'],
          });
          
          console.log(findSalesData,"dsbk")
        if(!(findSalesData && Object.keys(findSalesData))){
            ctx.send({
                message: 'data is not present in db'
            }, 400);
            return
        }
        let statusCompleted = findSalesData["sales"].some(({STATUS_OF_PROJECT})=>STATUS_OF_PROJECT==='COMPLETED')
        if(statusCompleted){
          ctx.send({
            message: 'STATUS_OF_PROJECT  Completed Cannot  Delete the data'
        }, 400);
          return
        }else{
  
          let salesDataIds = findSalesData["sales"].map(({ id }) => id);
          salesDataIds.forEach(async (ele) => {
            await strapi.db.query("api::sale.sale").delete({
              where: {
                id: ele,
              },
            });
          });
          let recursive_sale = strapi.db
            .query("api::recursive-sale.recursive-sale")
            .delete({
              where: {
                id: recursiveSaleId,
              },
            });
            const sanitizedResults = await this.sanitizeOutput(recursive_sale, ctx);
            return this.transformResponse(sanitizedResults);
        }
      }
})
)