/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function createCustomers(client) {
  const docs = [];
  for (let i = 0; i < 100000; ++i) {
    docs.push(
      {
        create: {
          _index: 'customers',
          _id: `cus${i}`,
        },
      },
      {
        firstName: 'Customer ' + i,
        lastName: 'LastName ' + i,
        email: `customer${i}@acme.tld`,
      }
    );
  }
  await client.bulk({
    index: 'customers',
    body: docs,
  });
}

/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function listCustomers(client) {
  const bulkSize = 1000;
  const allHits = [];
  let hasNextPage = true;
  const pit = await client.openPointInTime({
    keep_alive: '1m',
    index: 'customers',
  });
  while (hasNextPage) {
    let res = await client.search({
      size: bulkSize,
      pit: {
        id: pit.id,
        keep_alive: '1m',
      },
      sort: [{ _shard_doc: 'asc' }],
      search_after:
        allHits.length > 0 ? allHits[allHits.length - 1].sort : undefined,
    });
    let hitsBefore = allHits.length;
    for (const hit of res.hits.hits) {
      allHits.push(hit);
    }
    hasNextPage = allHits.length > hitsBefore;
    console.log(`${allHits.length} customers`);
  }
  await client.closePointInTime({ id: pit.id });

  const ret = Array.from(allHits.values());
  return ret;
}

/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function createCustomer(client, customer) {
  const res = await client.index({
    index: 'customers',
    document: customer,
  });
  await client.indices.refresh({
    index: 'customers',
  });
  return res;
}

/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function deleteCustomer(client, id) {
  return await client.delete({
    index: 'customers',
    id,
  });
}

/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function findCustomers(client, term) {
  const res = await client.search({
    index: 'customers',
    body: {
      query: {
        bool: {
          must: [
            {
              match_phrase: {
                ...term,
              },
            },
          ],
        },
      },
    },
  });
  return res;
}

/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
async function updateCustomer(client, id, update) {
  const res = await client.update({
    index: 'customers',
    id,
    doc: {
      ...update,
    },
  });

  await client.indices.refresh({
    index: 'customers',
  });
  return res;
}

module.exports = {
  createCustomers,
  listCustomers,
  createCustomer,
  deleteCustomer,
  findCustomers,
  updateCustomer,
};
