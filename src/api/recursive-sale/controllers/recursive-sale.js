'use strict';
const { parseMultipartData } = require("@strapi/utils");

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
        console.log(recursiveSalesData)
        let salesPayload = {
            PROJECT: recursiveSalesData?.data?.PROJECT,
            STATUS_OF_PROJECT: "UPCOMING",
            EXPECTED_COMPLETION_DATE: "2023-05-09",
            MONTH_OF_SALE: "2023-05-09",
            DESCRIPTION: "this is a local project",
            AMOUNT: 0,
            services: recursiveSalesData?.data?.services,
            recursive_sale: recursiveSaleId,
        };
        let salesIds = [];
        for (
            let index = 0;
            index < recursiveSalesData.data.NUMBER_OF_RECURRENCES;
            index++
        ) {
            let result = await strapi.db
                .query("api::sale.sale")
                .create({ data: salesPayload });
            salesIds.push(result.id);
        }
        console.log("ABCD", salesIds, recursiveSaleId, )
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
        let salesPayload = {
            PROJECT: "test 1234",
            STATUS_OF_PROJECT: "UPCOMING",
            EXPECTED_COMPLETION_DATE: "2023-05-09",
            MONTH_OF_SALE: "2023-05-09",
            DESCRIPTION: "this is a local project abc",
            AMOUNT: 0,
            services: recursiveSalesData.data.services,
        };

        const SalesToUpdate = await strapi.db.query("api::sale.sale").findMany({
            where: {
                recursive_sales: [15],
              }
            }
          );
          await Promise.all(
            SalesToUpdate.map(({ id }) =>{
                strapi.service("api::sale.sale").update(id, recursiveSalesData)
            }
            )
          );
        const sanitizedResults = await this.sanitizeOutput(recursiveSale, ctx);
        return this.transformResponse(sanitizedResults);
    },

    // async delete(ctx) {
    //     const { data } = parseMultipartData(ctx);
    //     let recursiveSaleId = ctx.params.id;
    //     let recursiveSalesData = { ...data };

    //     const SalesToUpdate = await strapi.db.query("api::sale.sale").findMany({
    //         where: {
    //             recursive_sales: [15],
    //         }
    //     }
    //     );
    //     await Promise.all(
    //         SalesToUpdate.map(({ id }) => {
    //             strapi.db.query("api::lamp.lamp").delete({
    //                 where: { id },
    //             })
    //         }
    //         )
    //     );
    //     const sanitizedResults = await this.sanitizeOutput(recursiveSale, ctx);
    //     return this.transformResponse(sanitizedResults);
    // },
})
)
