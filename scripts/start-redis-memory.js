const { RedisMemoryServer } = require('redis-memory-server');

async function main() {
  const redisServer = new RedisMemoryServer({
    instance: {
      ip: '127.0.0.1',
      port: 6380,
    },
  });

  const host = await redisServer.getHost();
  const port = await redisServer.getPort();

  console.log(`Redis memory server running at ${host}:${port}`);

  const shutdown = async () => {
    try {
      await redisServer.stop();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Failed to start redis-memory-server:', error);
  process.exit(1);
});
