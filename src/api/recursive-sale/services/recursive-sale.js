'use strict';

/**
 * recursive-sale service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::recursive-sale.recursive-sale');
