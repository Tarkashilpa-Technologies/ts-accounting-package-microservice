'use strict';

/**
 * party-email service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::party-email.party-email');
