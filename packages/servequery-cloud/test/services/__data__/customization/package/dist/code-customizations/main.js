/**
 * @param {import('@servequery/agent').Agent} agent
 */
function customize(agent) {
  agent.addChart('test-package', (context, resultBuilder) =>
    resultBuilder.distribution({
      foo: 42,
      bar: 24,
    }),
  );
}

module.exports = customize;
