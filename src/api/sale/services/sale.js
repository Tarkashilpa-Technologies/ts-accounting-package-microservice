'use strict';

/**
 * sale service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::sale.sale'), ({ strapi }) =>  ({
  async createMany (data) {
    const results = await strapi.query("api::sale.sale").createMany(data);
    return results;
  },
})
// module.exports = {
//     createMany: async function (data) {
//       const results = await strapi.query("api::sale.sale").createMany(data);
//       return results;
//     },
//   };