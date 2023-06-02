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
    console.log(data2, "data2")
    let currentData = new Date()
    let tempDescription = ''
    for (
      let index = 0;
      index < recursiveSalesData.data.NUMBER_OF_RECURRENCES;
      index++
    ) {
      // tempDescription = replaceVariableWithValue(recursiveSalesData?.data?.DESCRIPTION, recursiveSalesData.data)
      if (recursiveSalesData?.data?.DESCRIPTION.includes('<MONTH>')) {
        const date = new Date(data2[index]);
        const options = { month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleString('en-US', options);
        tempDescription = replaceVariableWithValue(recursiveSalesData?.data?.DESCRIPTION, { MONTH: formattedDate })
      } else if (recursiveSalesData?.data?.DESCRIPTION.includes('<Sale Period>')) {
        tempDescription = replaceVariableWithValue(recursiveSalesData?.data?.DESCRIPTION, { 'Sale Period': timePeriodString(data2[index], data2[index + 1]) })
      } else {
        tempDescription = recursiveSalesData?.data?.DESCRIPTION
      }
      let salesPayload = {
        PROJECT: recursiveSalesData?.data?.PROJECT,
        STATUS_OF_PROJECT: new Date(data2[index]) > currentData ? "UPCOMING" : "COMPLETED",
        EXPECTED_COMPLETION_DATE: data2[index],
        MONTH_OF_SALE: data2[index],
        DESCRIPTION: tempDescription,
        AMOUNT: recursiveSalesData?.data?.AMOUNT_WITHOUT_TAXES,
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

    let tempSales = await strapi.db.query("api::sale.sale").findMany({
      where: {
        recursive_sales: [recursiveSaleId],
      },
      populate: ['invoices'],
    })
    let statusCompleted = tempSales?.filter((val) => val?.invoices?.length > 0)
    let saleIds = statusCompleted?.map(obj => obj.id)
    console.log(statusCompleted, "ABCD");
    if (statusCompleted?.length >= 1) {
      ctx.send({
        message: 'An Invoice is already Genertated for Sale, Please delete if before updating Recurssive Sale',
        saleIds: saleIds
      }, 400);
      return
    } else {
      let recursiveSale = await strapi
        .service("api::recursive-sale.recursive-sale")
        .update(recursiveSaleId, recursiveSalesData);

      const SalesToUpdate = await strapi.db.query("api::sale.sale").findMany({
        where: {
          recursive_sales: [recursiveSaleId],
          // STATUS_OF_PROJECT: "UPCOMING",
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
    }
  },
  async delete(ctx) {
    let recursiveSaleId = ctx.params.id;
    let findSalesData = await strapi.db
      .query("api::sale.sale")
      .findOne({
        where: { id: recursiveSaleId },
        populate: ['sales'],
      });
    let SalesToUpdate = await strapi.db.query("api::sale.sale").findMany({
      where: {
        recursive_sales: [recursiveSaleId],
      },
      populate: ['invoices'],
    })

    console.log(SalesToUpdate, "dsbk")
    let statusCompleted = SalesToUpdate?.filter((val) => val?.invoices?.length > 0)
    let saleIds = statusCompleted?.map(obj => obj.id);
    console.log(statusCompleted, "ABCD")
    if (statusCompleted?.length >= 1) {
      ctx.send({
        message: 'An Invoice is already Genertated for Sale, Please delete if before removing Recurssive Sale',
        saleIds: saleIds
      }, 400);
      return
    } else {

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