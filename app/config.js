require('dotenv').config();

const paths = require('../paths');

const isDocker = process.env.IS_DOCKER || false,
  dbLocation = isDocker ? 'mongodb' : 'localhost';

module.exports = {
  db: {
    seeder: `${paths.quotesDir}/trumpisms.json`,
    location: `${dbLocation}`,
    URI: `mongodb://${dbLocation}/the-best-words`,
    db: 'the-best-words',
    collection: 'quotes'
  }
};