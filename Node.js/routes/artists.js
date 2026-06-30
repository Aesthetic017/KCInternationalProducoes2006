const buildCrudRouter = require('./crudFactory');
const Artist = require('../models/Artits');

module.exports = buildCrudRouter(Artist, (doc) => ({
  type: 'artist',
  itemName: doc.name,
  itemDesc: doc.genre,
}));