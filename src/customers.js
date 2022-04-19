/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function createCustomers(client) {
  await client.index({
    index: 'customers',
    id: '1',
    document: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@acme.tld',
    },
  });
}

module.exports = {
  createCustomers,
};
