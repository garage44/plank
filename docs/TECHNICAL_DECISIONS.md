# Technical Decisions & Trade-offs

This document explains the key technical decisions made in this project and the trade-offs involved.

## Architecture Choice: PostgreSQL NOTIFY/LISTEN

### Why This Pattern?

**Chosen:** PostgreSQL's native pub/sub mechanism
**Instead of:** Redis, RabbitMQ, Kafka, or polling

### Advantages ✅

1. **Simplicity** - One less service to deploy and maintain
2. **Zero Additional Infrastructure** - If you're already using PostgreSQL, no new dependencies
3. **Transactional Consistency** - NOTIFY happens within the same transaction as data changes
4. **Low Latency** - Sub-millisecond notification delivery within same datacenter
5. **Native Integration** - Built into PostgreSQL, well-tested and reliable

### Trade-offs & Limitations ⚠️

1. **Payload Size Limit** - 8KB maximum per notification
   - **Impact:** Can't send large objects; must keep messages minimal
   - **Mitigation:** Send only IDs and essential data, let clients fetch full objects if needed

2. **Not Persistent** - If no listeners are connected, notifications are lost
   - **Impact:** Can't use for critical message delivery or audit trails
   - **Mitigation:** Not suitable for all use cases; better for real-time UI updates

3. **Single Database Scaling** - Doesn't work well across multiple database instances
   - **Impact:** Can't easily scale with database replication or sharding
   - **Mitigation:** Use Redis pub/sub or message queue when horizontal scaling is needed

4. **No Message Acknowledgment** - Fire-and-forget model
   - **Impact:** Can't guarantee message delivery or processing
   - **Mitigation:** Acceptable for UI notifications; not for critical workflows

### When to Use This Pattern

**Good fit for:**
- Real-time UI updates (dashboards, collaborative editing)
- Internal tools with moderate traffic
- MVP and prototypes
- Systems already using PostgreSQL heavily
- When simplicity > absolute scalability

**Not ideal for:**
- High-throughput message processing (>10k msgs/sec)
- Multi-region deployments
- Critical message delivery requiring acknowledgments
- Systems that need message replay/history
- Microservices architecture with independent services

## Technology Choices

### Backend: FastAPI

**Why FastAPI over Flask/Django?**
- Modern async/await support (essential for WebSockets)
- Automatic OpenAPI documentation
- Type hints and validation built-in
- High performance (on par with Node.js)
- Great developer experience

### Frontend: Preact + Bun

**Why Preact over React?**
- Smaller bundle size (3KB vs 42KB)
- Same API as React (easy to learn)
- Faster performance
- Appropriate for small-to-medium SPAs

**Why Bun?**
- Fast development server with HMR
- Built-in TypeScript/JSX transpilation
- Simple build process
- Modern tooling experience

**Why Signals for state management?**
- Minimal boilerplate compared to Redux
- Fine-grained reactivity
- Good for small-to-medium applications
- Works well with Preact

### Deployment Tools

**UV for Python** - Fast, modern dependency management
**Docker Compose** - Easy local development and deployment
**Systemd** - Production-ready process management
**Nginx** - Proven reverse proxy with WebSocket support

## System Flow

```
1. User Action (Frontend)
   ↓
2. API Call (HTTP POST)
   ↓
3. FastAPI Handler
   ↓
4. Database INSERT/UPDATE/DELETE
   ↓
5. PostgreSQL Trigger Fires
   ↓
6. pg_notify('item_changes', json)
   ↓
7. PostgresListener receives notification (LISTEN)
   ↓
8. ConnectionManager broadcasts to WebSockets
   ↓
9. All Connected Clients Receive Update
   ↓
10. Frontend UI Updates Automatically
```

## Key Components

### ConnectionManager (`plank/websocket/manager.py`)
- Maintains list of active WebSocket connections
- Handles connect/disconnect lifecycle
- Broadcasts messages to all clients
- Cleans up failed connections

### PostgresListener (`plank/db/listener.py`)
- Maintains dedicated PostgreSQL connection for LISTEN
- Subscribes to notification channels
- Routes notifications to registered callbacks
- Handles JSON parsing and error recovery

### Lifespan Handler (`plank/main.py`)
- Wires together database, listener, and WebSocket manager
- Ensures proper startup/shutdown ordering
- Creates background task to keep listener alive

### Database Triggers (`plank/db/init.py`)
- PL/pgSQL functions that fire on data changes
- Build JSON payloads with operation type and data
- Call pg_notify() to emit notifications

## Error Handling Considerations

### WebSocket Disconnections
- Handled gracefully in broadcast loop
- Failed clients automatically removed
- No crash if individual client connection fails

### Database Connection Loss
- **Current limitation:** Not fully handled
- **Production need:** Add retry logic and connection pooling
- **Consideration:** Monitor database connection health

### Missed Messages
- **Current behavior:** Clients don't receive notifications sent while disconnected
- **Production need:** Implement reconnection strategy with message sync
- **Options:** Timestamp-based polling on reconnect, or event sourcing

## Scaling Considerations

### Current System Can Handle:
- ~100-1000 concurrent WebSocket connections (single server)
- Low-to-moderate database write frequency
- Small-to-medium payloads (<1KB per notification)

### To Scale Beyond:
1. **Horizontal scaling:** Add Redis pub/sub between FastAPI instances
2. **Load balancing:** Use sticky sessions or shared state for WebSockets
3. **Database optimization:** Connection pooling, read replicas
4. **Message queue:** Switch to RabbitMQ/Kafka for high throughput
5. **CDN:** Serve frontend assets from CDN

## Future Improvements

If continuing this project, consider:

1. **Authentication & Authorization** - User-specific channels and permissions
2. **Reconnection Logic** - Handle disconnects gracefully with state sync
3. **Message History** - Store recent events for reconnecting clients
4. **Filtering** - Allow clients to subscribe to specific data subsets
5. **Monitoring** - Add metrics for connection count, message throughput, latency
6. **Testing** - More comprehensive WebSocket and integration tests
7. **Rate Limiting** - Prevent abuse of WebSocket connections
8. **Compression** - Reduce bandwidth for large payloads

## Development Approach

This project was built using AI-assisted development to:
- Scaffold the initial structure quickly
- Focus on understanding architectural patterns
- Explore modern Python and frontend tooling
- Create a working example for learning and discussion

The emphasis was on understanding **why** certain choices were made and what trade-offs they involve, rather than memorizing implementation details.

## References & Resources

- [PostgreSQL NOTIFY Documentation](https://www.postgresql.org/docs/current/sql-notify.html)
- [FastAPI WebSockets Guide](https://fastapi.tiangolo.com/advanced/websockets/)
- [asyncpg Documentation](https://magicstack.github.io/asyncpg/current/)
- [Bun Documentation](https://bun.sh/docs)
- [Preact Documentation](https://preactjs.com/)

---

**Key Takeaway:** This architecture trades absolute scalability and reliability for simplicity and developer experience. It's an excellent choice for internal tools, MVPs, and medium-traffic applications. For high-scale production systems, evaluate whether the limitations align with your requirements.
