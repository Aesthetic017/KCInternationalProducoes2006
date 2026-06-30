const buildCrudRouter = require('./crudFactory');
const Service = require('../models/Service');

module.exports = buildCrudRouter(Service, (doc) => ({
  type: 'service',
  itemName: doc.title,
  itemDesc: doc.desc,
}));