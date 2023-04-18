'use strict';

/**
 * party service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::party.party');
