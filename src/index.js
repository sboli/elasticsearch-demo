'use strict';
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');
const Customers = require('./customers');

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'password',
  },
  tls: {
    ca: fs.readFileSync('./ca.crt'),
    rejectUnauthorized: false,
  },
});

async function run() {
  await Customers.createCustomers(client);
}

run().catch(console.log);
