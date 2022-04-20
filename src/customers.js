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
  const bulkSize = 100;
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
    for (const hit of res.hits.hits) {
      allHits.push(hit);
    }
    hasNextPage = !(res.hits.hits.lengh === 0);
  }
  await client.closePointInTime({ id: pit.id });

  const ret = Array.from(allHits.values());
  console.log(ret[0]);
}

module.exports = {
  createCustomers,
  listCustomers,
};
