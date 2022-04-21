/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
module.exports.createOrder = async function (client, customerId, order) {
  await client.update({
    index: 'customers',
    id: customerId,
    script: {
      source: `if (ctx._source.orders == null) { ctx._source.orders = new ArrayList(); }
      ctx._source.orders.add(params.order);`,
      params: {
        order,
      },
    },
  });
  await client.indices.refresh({
    index: 'customers',
  });
};

/**
 * @typedef { import('@elastic/elasticsearch').Client } Client
 * @param {Client} client
 */
module.exports.analyze = async function (client) {
  return await client.search({
    index: 'customers',
    body: {
      size: 0,
      runtime_mappings: {
        order_total: {
          type: 'double',
          script: `
		if (params['_source'].containsKey('orders')) {
		double total = 0;
		for (HashMap order : params['_source'].get('orders')) {
			if (order.containsKey('lines')) {
			for (HashMap line : order.get('lines')) {
			total += line.price * line.quantity
			}
			}
		}
		emit(total)
		} else {
		emit(0)
		}
		`,
        },
      },
      aggs: {
        order_total: {
          sum: {
            field: 'order_total',
          },
        },
      },
    },
  });
};
