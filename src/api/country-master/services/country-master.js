'use strict';

/**
 * country-master service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::country-master.country-master');
