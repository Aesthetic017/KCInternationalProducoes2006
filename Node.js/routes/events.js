const buildCrudRouter = require('./crudFactory');
const Event = require('../models/Event');

module.exports = buildCrudRouter(Event, (doc) => ({
  type: 'event',
  itemName: doc.title,
  itemDesc: doc.venue,
}));