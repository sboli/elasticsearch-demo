'use strict';
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');
const Customers = require('./customers');
const Orders = require('./orders');

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
  //   await Customers.createCustomers(client);
  // await Customers.listCustomers(client);
  await Customers.createCustomer(client, {
    firstName: 'Fist name ',
    lastName: 'Last name',
    email: 'fistlast@acme.tld',
  });
  let res = await Customers.findCustomers(client, {
    email: 'fistlast@acme.tld',
  });
  res = await Customers.deleteCustomer(client, res.hits.hits[0]._id);
  // let created = await Customers.createCustomer(client, {
  //   firstName: 'Fist name ',
  //   lastName: 'Last name',
  //   email: 'fistlast@acme.tld',
  // });
  // const updateRes = await Customers.updateCustomer(client, created._id, {
  //   firstName: 'Fist name Updated at ' + new Date().toISOString(),
  // });
  // console.log('Update res', updateRes);
  const customerId = 'ruG1R4AB1zE9Xk62nlee';
  res = await Customers.findCustomers(client, {
    _id: customerId,
  });

  await Orders.createOrder(client, customerId, {
    lines: [{ item: 'Item 1', quantity: 1, price: 10 }],
  });

  res = await Customers.findCustomers(client, {
    _id: customerId,
  });
  // console.log(JSON.stringify(res.hits.hits, null, 2));

  res = await Orders.analyze(client);
  console.log(JSON.stringify(res, null, 2));
}

run().catch(console.log);
