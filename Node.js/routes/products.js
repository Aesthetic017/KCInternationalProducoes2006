const buildCrudRouter = require('./crudFactory');
const Product = require('../models/Product');

module.exports = buildCrudRouter(Product, (doc) => ({
  type: 'product',
  itemName: doc.name,
  itemDesc: doc.price ? `${doc.currency}${doc.price}` : '',
}));