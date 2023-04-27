"use strict";

/**
 * party controller
 */
const { parseMultipartData } = require("@strapi/utils");
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::party.party", ({ strapi }) => ({
  async create(ctx) {
    const { data } = parseMultipartData(ctx);
    let tempData = { ...data.data };
    let tempEmails = [];
    let ids = [];
    await Promise.all(
      data.data["party_emails"].map(async (ele, ItemIndex) => {
        let email = await strapi.db
          .query("api::party-email.party-email")
          .findOne({
            where: {
              EMAIL: ele,
            },
          });
        if (email) {
          ids.push(email.id);
        } else {
          tempEmails.push(ele);
        }
        return email;
      })
    );
    let allKeys = await Promise.all(
      tempEmails.map(async (ele) => {
        const products = await strapi
          .service("api::party-email.party-email")
          .create({
            data: { EMAIL: ele },
          });
        return products;
      })
    );
    allKeys.forEach((ele) => {
      ids.push(ele.id);
    });
    tempData["party_emails"] = ids;
    let results = await strapi
      .service("api::party.party")
      .create({ data: tempData });
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults);
  },
}));