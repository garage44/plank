# Use Cases for Plank

Plank isn't just another WebSocket solution. Its power comes from **database-originated event tracking** using PostgreSQL LISTEN/NOTIFY. This means your database itself triggers real-time updates—no manual broadcasting, no missed notifications, guaranteed consistency.

## What Makes Plank Different?

**Regular WebSocket Solution**:
```python
# You manually broadcast in every endpoint
@app.post("/items")
async def create_item(item: Item):
    result = await db.insert(item)
    await websocket_manager.broadcast(result)  # Easy to forget!
    return result
```

**Plank (Database-Originated Events)**:
```python
# Database trigger automatically broadcasts
@app.post("/items")
async def create_item(item: Item):
    return await db.insert(item)  # That's it! Trigger handles notification
```

## Why This Matters

✅ **Zero Boilerplate**: No manual broadcast calls scattered through your codebase
✅ **Never Miss Updates**: Database triggers fire even for direct SQL, admin tools, cron jobs
✅ **Transactional Safety**: Notifications only fire if transaction commits
✅ **Multi-Instance Ready**: All backend instances get notified automatically
✅ **Third-Party Integration**: External tools updating the DB? You still get notified

---

## 🎯 Ideal Use Cases

These scenarios specifically benefit from database-originated events:

### 1. Multi-Service Architectures with Shared Database

**Why Database-Originated Events Matter**:
Multiple services write to the same database, but they all need to know about changes instantly.

**The Problem with Regular WebSockets**:
- Each service must manually broadcast changes
- Services can't notify each other about their changes
- Background jobs, cron tasks, manual SQL queries don't trigger updates
- Coordination nightmare across services

**Plank's Solution**:
Database triggers fire regardless of which service (or human!) made the change. All connected clients get notified automatically.

**Real Examples**:
- **E-commerce**: Inventory service updates stock → Checkout service instantly knows
- **Multi-tenant SaaS**: Admin updates settings → All tenant apps refresh instantly
- **Data Pipeline**: ETL job imports data → Dashboards update without refresh
- **Manual Fixes**: DBA runs SQL update → Frontend reflects change immediately

---

### 2. Admin Tools & Database GUIs Alongside Your App

**Why Database-Originated Events Matter**:
You use external tools (pgAdmin, Retool, custom scripts) to modify data, not just your API.

**The Problem with Regular WebSockets**:
```python
# Your API broadcasts changes
@app.put("/users/{id}")
async def update_user(id, data):
    await db.update(id, data)
    await ws.broadcast("user_updated", id)  # Works!

# But when admin uses pgAdmin:
UPDATE users SET status = 'banned' WHERE id = 123;
-- No broadcast! Frontend never updates. 😞
```

**Plank's Solution**:
Database trigger fires no matter who changes the data. pgAdmin, Retool, SQL scripts—they all trigger real-time updates.

**Real Examples**:
- **Content Management**: Editors use Retool to bulk-update posts → Live site updates instantly
- **User Management**: Admin panel + SQL scripts both trigger live updates
- **Data Corrections**: DBA fixes bad data → All connected dashboards refresh
- **Import Scripts**: Nightly data imports trigger dashboard updates for early users

---

### 3. Complex Transactions with Multi-Table Updates

**Why Database-Originated Events Matter**:
When one logical operation touches multiple tables, notifications should only fire if the transaction succeeds.

**The Problem with Regular WebSockets**:
```python
@app.post("/transfer")
async def transfer_money(from_id, to_id, amount):
    await db.debit(from_id, amount)
    await ws.broadcast("account_updated", from_id)  # Sent!

    # OH NO! This fails...
    await db.credit(to_id, amount)  # 💥 Error!

    # But WebSocket already notified about debit
    # Now data is inconsistent with what clients see
```

**Plank's Solution**:
Database triggers fire AFTER commit. If transaction rolls back, no notification is sent. Perfect consistency.

**Real Examples**:
- **Financial Transfers**: Multi-account updates only notify if entire transaction succeeds
- **Order Processing**: Inventory, orders, payments—all must succeed before notification
- **User Registration**: Profile + permissions + initial data—atomic notifications
- **Cascading Deletes**: Deleting parent + children triggers single cohesive update

---

### 4. Background Jobs & Scheduled Tasks

**Why Database-Originated Events Matter**:
Cron jobs, queue workers, and background tasks modify data outside request/response cycle.

**The Problem with Regular WebSockets**:
```python
# Your API endpoint - has WebSocket reference
@app.post("/reports")
async def generate_report(params):
    task = await queue.enqueue(generate_report_task, params)
    # ??? How does background job broadcast when done?
    return {"task_id": task.id}

# Background worker - no WebSocket access!
def generate_report_task(params):
    result = generate_report(params)
    db.insert_report(result)
    # Can't broadcast! Worker doesn't have WebSocket reference.
```

**Plank's Solution**:
Background jobs just write to database. Triggers handle the notifications automatically.

**Real Examples**:
- **Report Generation**: Long-running jobs finish → Users get instant notification
- **Batch Processing**: Nightly imports complete → Dashboards auto-update
- **Email Queue**: Emails sent/failed → Admin panel reflects status live
- **Data Aggregation**: Hourly rollups complete → Charts update instantly

---

### 5. Database-Driven Business Logic & Triggers

**Why Database-Originated Events Matter**:
You use PostgreSQL features like triggers, rules, or stored procedures for business logic.

**The Problem with Regular WebSockets**:
```sql
-- Database automatically calculates derived fields
CREATE TRIGGER update_total BEFORE INSERT ON line_items
FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- But your app doesn't know the trigger modified related rows!
-- No WebSocket broadcast happens for these automatic changes.
```

**Plank's Solution**:
Database triggers can fire notifications for their own changes. The database fully drives the real-time updates.

**Real Examples**:
- **Cascading Updates**: Changing product price updates all related orders → Live updates
- **Auto-calculation**: Database calculates totals/summaries → Frontend sees new values
- **Data Validation**: Database rejects/modifies data → Instant feedback to users
- **Audit Triggers**: Automatic audit logging triggers live security dashboard updates

---

### 6. Microservices Without Message Queue Overhead

**Why Database-Originated Events Matter**:
You want event-driven microservices but don't need Kafka/RabbitMQ complexity.

**The Problem with Regular WebSockets**:
```
Service A → Kafka → Service B → WebSocket Manager → Clients
  (Complex infrastructure, operational overhead, extra latency)
```

**Plank's Solution**:
```
Service A → PostgreSQL → Plank → Clients
  (Simpler stack, one less moving part, existing DB infrastructure)
```

**Real Examples**:
- **Order Processing**: Orders service inserts → Inventory service gets NOTIFY + Clients update
- **User Events**: Auth service updates user → All services + frontend get notified
- **Config Changes**: Settings service updates → All backend instances + frontend reload
- **Cache Invalidation**: Any service changes data → All caches + clients invalidate

**When This Works**:
- Shared PostgreSQL database across services
- Don't need guaranteed delivery (ephemeral notifications okay)
- <8KB message payloads
- Moderate event volume (<10k events/second)

---

### 7. Distributed Backend Instances (Horizontal Scaling)

**Why Database-Originated Events Matter**:
You run multiple backend instances behind a load balancer.

**The Problem with Regular WebSockets**:
```
User → LB → Instance A: updates DB + broadcasts to its WebSocket clients
          → Instance B: doesn't know about change, its clients don't update!
```
You need Redis pub/sub or sticky sessions. More complexity.

**Plank's Solution**:
Every backend instance listens to the same PostgreSQL NOTIFY channel. All instances stay synchronized automatically.

**Real Examples**:
- **High Availability**: 3+ backend instances all broadcast same updates to their clients
- **Rolling Deploys**: New instances automatically join notification stream
- **Auto-scaling**: Instances spin up/down without coordination
- **Multi-region**: Different regions listen to same database notifications

---

## 🎓 When to Choose Plank Over Regular WebSockets

### Use Plank (Database-Originated Events) When:

✅ **Multiple services write to the same database**
✅ **You use admin tools, SQL scripts, or background jobs that modify data**
✅ **Transactional consistency between DB and notifications matters**
✅ **You run multiple backend instances (horizontal scaling)**
✅ **You want event-driven architecture without adding Kafka/RabbitMQ**
✅ **Database triggers already handle business logic**
✅ **You'd forget to manually broadcast in some code paths**

### Use Regular WebSockets When:

❌ **Events aren't database changes** (e.g., user typing, cursor position)
❌ **You need guaranteed message delivery** (PostgreSQL NOTIFY is ephemeral)
❌ **Very high frequency** (>10k events/second)
❌ **Large payloads** (>8KB per notification)
❌ **You don't use PostgreSQL**
❌ **Single service with complete control over all data changes**

---

## 🚀 Quick Decision Tree

```
Do your real-time events originate from database changes?
├─ No → Use regular WebSockets
└─ Yes ↓

    Can you guarantee all code paths manually broadcast?
    ├─ Yes, only my API writes data → Maybe use regular WebSockets
    └─ No, multiple sources write data ↓

        Using PostgreSQL?
        ├─ No → Use Kafka/RabbitMQ + WebSockets
        └─ Yes → ✨ Use Plank!
```

---

## 💡 Real-World Example

Here's a concrete example showing the difference:

**Scenario**: E-commerce platform with separate services for orders, inventory, and admin panel.

**With Regular WebSockets**:
```python
# Orders service
@app.post("/orders")
async def create_order(order):
    await db.insert_order(order)
    await db.decrement_stock(order.product_id, order.quantity)
    await ws.broadcast({"type": "order_created", "data": order})  # Manual
    # But you forgot to broadcast the stock change! 😞

# Inventory service has no idea order was created
# Admin panel using Retool to adjust stock? No broadcasts at all!
# Scheduled job that restocks? No broadcasts!
```

**With Plank (Database-Originated)**:
```python
# Orders service
@app.post("/orders")
async def create_order(order):
    await db.insert_order(order)  # Trigger broadcasts to everyone
    await db.decrement_stock(order.product_id, order.quantity)  # Trigger broadcasts

# ✨ ALL of these automatically broadcast:
# - Your API creating orders
# - Inventory service updating stock
# - Admin using Retool to adjust inventory
# - Scheduled restock jobs
# - DBA manually fixing data
# - Any other service touching these tables
```

No coordination needed. No broadcasts to remember. Just write to the database.

---

## 🚀 Getting Started

1. Follow the [Quick Start Guide](QUICKSTART.md)
2. Add your tables + triggers to `plank/db/init.py`
3. Connect clients via WebSocket
4. Watch database changes propagate automatically!

---

**Built with ❤️ using FastAPI, WebSockets, and PostgreSQL LISTEN/NOTIFY**
