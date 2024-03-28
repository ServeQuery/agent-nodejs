/**
 * @param {import('@servequery/agent').Agent} agent
 */
function customize(agent) {
  agent.addChart('test-default', (context, resultBuilder) =>
    resultBuilder.distribution({
      foo: 42,
      bar: 24,
    }),
  );
}

exports.default = customize;
