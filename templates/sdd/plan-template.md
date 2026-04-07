# Technical Plan: [Project Name]

**Linked Spec:** [.qwen/specs/[spec-name]-spec.md](../specs/[spec-name]-spec.md)

---

## 1. Architecture Overview

### System Context Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     [Your System]                       │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │          │    │          │    │          │         │
│  │ Service  │    │ Service  │    │ Service  │         │
│  │    A     │    │    B     │    │    C     │         │
│  │          │    │          │    │          │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ▲                ▲                ▲
         │                │                │
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │External │     │ External│     │ External│
    │System A │     │System B │     │System C │
    └─────────┘     └─────────┘     └─────────┘
```

### Component Breakdown

| Component | Responsibility | Technology | Interfaces |
|-----------|---------------|------------|------------|
| [Name] | [What it does] | [Stack] | [APIs/events] |

### Data Flow

```
[User] → [API Gateway] → [Service A] → [Database]
                              ↓
                         [Service B]
                              ↓
                         [External API]
```

---

## 2. Technology Stack

### Backend

| Layer | Technology | Version | Justification | Alternatives Considered |
|-------|------------|---------|---------------|------------------------|
| Language | [e.g., Python] | [3.11+] | [Why] | [Node.js, Go] |
| Framework | [e.g., FastAPI] | [0.100+] | [Why] | [Flask, Django] |
| ORM | [e.g., SQLAlchemy] | [2.0+] | [Why] | [Prisma, raw SQL] |

### Frontend

| Layer | Technology | Version | Justification | Alternatives Considered |
|-------|------------|---------|---------------|------------------------|
| Framework | [e.g., React] | [18+] | [Why] | [Vue, Svelte] |
| Language | [TypeScript] | [5.0+] | [Why] | [JavaScript] |
| UI Library | [e.g., MUI] | [5+] | [Why] | [AntD, Chakra] |
| State Mgmt | [e.g., Zustand] | [4+] | [Why] | [Redux, Context] |

### Database

| Type | Technology | Version | Justification | Use Case |
|------|------------|---------|---------------|----------|
| Primary | [PostgreSQL] | [15] | [Why] | [Transactional data] |
| Cache | [Redis] | [7] | [Why] | [Session, hot data] |
| Search | [Elasticsearch] | [8] | [Why] | [Full-text search] |
| Vector | [Pinecone] | [-] | [Why] | [Embeddings] |

### Infrastructure

| Service | Technology | Version | Justification |
|---------|------------|---------|---------------|
| Cloud | [AWS/GCP/Azure] | [-] | [Why] |
| Container | [Docker] | [24] | [Why] |
| Orchestration | [Kubernetes] | [1.28] | [Why] |
| CI/CD | [GitHub Actions] | [-] | [Why] |
| Monitoring | [Prometheus+Grafana] | [-] | [Why] |

---

## 3. API Design

### API Style

- **Style:** REST / GraphQL / gRPC / tRPC
- **Versioning:** URL path (`/api/v1/`)
- **Auth:** [OAuth2 / JWT / API Key]
- **Format:** JSON
- **Documentation:** OpenAPI 3.0

### Endpoints

#### [Resource] Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/[resource]` | List [resource] | Required |
| GET | `/api/v1/[resource]/{id}` | Get [resource] by ID | Required |
| POST | `/api/v1/[resource]` | Create [resource] | Required |
| PUT | `/api/v1/[resource]/{id}` | Update [resource] | Required |
| DELETE | `/api/v1/[resource]/{id}` | Delete [resource] | Required |

---

### Endpoint Details

#### GET /api/v1/[resource]

**Description:** List all [resource] with pagination

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |
| sort | string | No | created_at | Sort field |
| order | string | No | desc | asc/desc |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Error Responses:**
| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 500 | Server Error | Internal error |

---

#### POST /api/v1/[resource]

**Description:** Create a new [resource]

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "metadata": {}
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 4. Data Models

### Entity: [Entity Name]

**Table:** `[table_name]`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Entity name |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

### Schema Definition

```sql
CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_[table_name]_name ON [table_name](name);
```

### Entity Relationships

```
┌─────────────┐         ┌─────────────┐
│   Entity A  │         │   Entity B  │
│             │         │             │
│ id (PK)     │◄───────►│ id (PK)     │
│ name        │  1:1    │ name        │
└─────────────┘         └─────────────┘

┌─────────────┐         ┌─────────────┐
│   Entity C  │         │   Entity D  │
│             │         │             │
│ id (PK)     │◄───┐    │ id (PK)     │
│ name        │    │    │ name        │
└─────────────┘    │    └─────────────┘
                   │
              ┌────┴────┐
              │  C_D    │
              │ (Junction)
              │ c_id(FK)│
              │ d_id(FK)│
              └─────────┘
              Many:Many
```

---

## 5. Integration Points

### External Services

| Service | Purpose | Authentication | Rate Limits | Fallback |
|---------|---------|----------------|-------------|----------|
| [Stripe] | Payments | API Key | 1000/hr | Queue |
| [SendGrid] | Email | API Key | 100/sec | Retry |

### Integration Details

#### [Service Name]

**Purpose:** [What it does]

**Connection:**
```
[Your System] ──HTTP/gRPC/Queue──► [External Service]
```

**Authentication:**
- Method: [API Key / OAuth2 / mTLS]
- Storage: [Secrets Manager]
- Rotation: [Frequency]

**Error Handling:**
- Retry policy: [Exponential backoff, 3 retries]
- Circuit breaker: [Open after 5 failures]
- Fallback: [Queue for later processing]

---

### Internal Systems

| System | Purpose | Integration Method | Data Flow |
|--------|---------|-------------------|-----------|
| [Auth Service] | Authentication | REST API | Bidirectional |
| [Data Warehouse] | Analytics | ETL Pipeline | Outbound |

---

## 6. Security Architecture

### Authentication Flow

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ User │     │  Client  │     │   API    │     │  Auth    │
│      │     │          │     │ Gateway  │     │ Provider │
└──┬───┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
   │              │                │                │
   │ 1. Login     │                │                │
   │─────────────►│                │                │
   │              │ 2. Token Req   │                │
   │              │───────────────►│                │
   │              │                │ 3. Validate    │
   │              │                │───────────────►│
   │              │                │                │
   │              │                │ 4. Token       │
   │              │                │◄───────────────│
   │              │ 5. JWT         │                │
   │              │◄───────────────│                │
   │ 6. Access    │                │                │
   │◄─────────────│                │                │
```

### Authorization Model

| Role | Permissions | Scope |
|------|-------------|-------|
| Admin | Full access | All resources |
| User | Read/Write own | Own resources |
| Guest | Read only | Public resources |

### RBAC Implementation

```python
@require_role('admin')
def admin_only_endpoint():
    pass

@require_permission('resource:create')
def create_resource():
    pass
```

### Data Protection

| Data Type | Encryption at Rest | Encryption in Transit | Access Control |
|-----------|-------------------|----------------------|----------------|
| PII | AES-256 | TLS 1.3 | RBAC |
| Credentials | bcrypt | TLS 1.3 | System only |
| API Keys | Encrypted | TLS 1.3 | Service only |

---

## 7. Testing Strategy

### Testing Pyramid

```
           /\
          /  \
         / E2E \        ~10% - Critical flows only
        /──────\
       /        \
      /Integration\     ~20% - API contracts, DB integration
     /────────────\
    /              \
   /    Unit Tests   \  ~70% - All functions, utilities
  /──────────────────\
```

### Unit Testing

| Aspect | Choice |
|--------|--------|
| Framework | [Jest / pytest] |
| Coverage Target | ≥ 80% |
| Critical Paths | 100% |
| Mocking | [unittest.mock / jest.mock] |

### Integration Testing

| Aspect | Choice |
|--------|--------|
| Framework | [Supertest / requests] |
| Database | Test containers |
| External APIs | WireMock / responses |

### E2E Testing

| Aspect | Choice |
|--------|--------|
| Framework | [Playwright / Cypress] |
| Browsers | Chrome, Firefox, Safari |
| Critical Flows | [List flows] |

---

## 8. Deployment Architecture

### Environments

| Environment | Purpose | Update Frequency | Data |
|-------------|---------|-----------------|------|
| Dev | Development | On every commit | Synthetic |
| Staging | Pre-prod testing | On PR merge | Anonymized prod |
| Production | Live traffic | On release | Real |

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                       │
└─────────────────────────────────────────────────────────┘

     ┌─────────┐
     │  Push   │
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │  Lint   │
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │  Build  │
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │  Test   │
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │ Security│
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │ Deploy  │
     │  Dev    │
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │ Deploy  │
     │Staging  │
     └────┬────┘
          │
          ▼
     ┌─────────┐
     │ Deploy  │
     │  Prod   │
     └─────────┘
```

### Rollback Strategy

**Automated Rollback Triggers:**
- Error rate > 5%
- Latency p99 > 1s
- Health check failures

**Rollback Procedure:**
1. Detect issue (monitoring)
2. Trigger rollback (automated/manual)
3. Revert to last known good version
4. Investigate root cause
5. Document incident

---

## 9. Observability

### Logging

| Level | Use Case | Destination |
|-------|----------|-------------|
| ERROR | Errors, exceptions | Splunk/Datadog |
| WARN | Warnings, retries | Splunk/Datadog |
| INFO | Business events | Splunk/Datadog |
| DEBUG | Debugging (dev only) | Console |

### Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Latency p99 | < 500ms | > 1s |
| Error Rate | < 1% | > 5% |
| Throughput | [Target] | < [Min] |
| CPU | < 70% | > 85% |
| Memory | < 80% | > 90% |

### Tracing

- **Tool:** [Jaeger / Zipkin / X-Ray]
- **Sampling:** 10% (prod), 100% (dev)
- **Propagation:** W3C Trace Context

---

## 10. Risks & Mitigations

| Technical Risk | Impact | Probability | Mitigation |
|----------------|--------|-------------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Strategy] |

---

## 11. Open Technical Decisions

| Decision | Options | Owner | Due Date | Status |
|----------|---------|-------|----------|--------|
| [Decision] | [A vs B] | [Name] | [Date] | Open |

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | [Date] | [Name] | Initial draft |
| 1.0 | [Date] | [Name] | Approved |

**Approval:**

| Role | Name | Date |
|------|------|------|
| Tech Lead | [Name] | [Date] |
| Architect | [Name] | [Date] |
| Security | [Name] | [Date] |

---

**Status:** DRAFT | IN_REVIEW | APPROVED
**Created:** [Date]
**Last Updated:** [Date]
