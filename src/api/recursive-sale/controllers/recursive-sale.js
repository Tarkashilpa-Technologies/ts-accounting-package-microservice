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
        let recursiveSaleId;
        let recursiveSale = await strapi.service("api::recursive-sale.recursive-sale").create(recursiveSalesData);
        recursiveSaleId = recursiveSale.id;
        let { 
            RECURRING_FREQUENCY,
            EXPECTED_SALE_COMPLETION_DATE,
            MONTH_OF_SALE_DONE,
            NUMBER_OF_RECURRENCES,
            DESCRIPTION,
            services,
            AMOUNT_WITHOUT_TAXES,
            SALES_REF,
            PROJECT
         } = recursiveSalesData

        let salesPayload = {
            PROJECT: PROJECT,
            STATUS_OF_PROJECT: "UPCOMING",
            EXPECTED_COMPLETION_DATE: EXPECTED_SALE_COMPLETION_DATE,
            MONTH_OF_SALE: MONTH_OF_SALE_DONE,
            DESCRIPTION: DESCRIPTION,
            AMOUNT: AMOUNT_WITHOUT_TAXES,
            services: services,
            recursive_sales: [recursiveSaleId],
        };
        let salesArr = []
        for (let index = 0; index < (RECURRING_FREQUENCY-1) ; index++) {
            salesArr.push(salesPayload)
        }
        let results = await strapi.service("api::sale.sale").createMany({ data: salesArr });
        let salesIds = results.ids
        let tempSales = await strapi.service("api::recursive-sale.recursive-sale").update(recursiveSaleId,
            {
                data: {
                    SALES_REF: salesIds
                }
            }
        );

        const sanitizedResults = await this.sanitizeOutput(tempSales, ctx);
        return this.transformResponse(sanitizedResults);
    },
})
)
