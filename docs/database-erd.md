# Lensistry database ERD

This entity–relationship diagram reflects the **current Drizzle ORM schema** in
`src/modules/{auth,catalog,indexing,repository,search}/db/` (18 tables, 22
foreign keys). It describes the database structure, not the implementation
status of application features.

```mermaid
erDiagram
    %% Better Auth
    user {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        timestamp created_at
        timestamp updated_at
        text role
        boolean banned
        text ban_reason
        timestamp ban_expires
    }
    session {
        text id PK
        timestamp expires_at
        text token UK
        timestamp created_at
        timestamp updated_at
        text ip_address
        text user_agent
        text user_id FK
        text impersonated_by
    }
    account {
        text id PK
        text account_id
        text provider_id
        text user_id FK
        text access_token
        text refresh_token
        text id_token
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope
        text password
        timestamp created_at
        timestamp updated_at
    }
    verification {
        text id PK
        text identifier
        text value
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }
    rate_limit {
        text id PK
        text key UK
        integer count
        bigint last_request
    }

    %% Product catalog
    brands {
        uuid id PK
        text name UK
    }
    categories {
        uuid id PK
        text name
        uuid parent_id FK
    }
    products {
        uuid id PK
        text sku UK
        text name
        uuid brand_id FK
        uuid category_id FK
        text variant
        text description
        text created_by_id FK
        text updated_by_id FK
        timestamptz created_at
        timestamptz updated_at
    }
    product_keywords {
        uuid product_id FK
        text keyword
    }
    product_images {
        uuid id PK
        uuid product_id FK
        text object_key UK
        text original_filename
        boolean is_primary
        text mime_type
        integer byte_size
        timestamptz created_at
    }

    %% Indexing and embeddings
    indexing_jobs {
        uuid id PK
        uuid product_id FK
        indexing_status status
        integer attempt
        integer processed_images
        integer total_images
        text model_version
        text error_message
        timestamptz created_at
        timestamptz started_at
        timestamptz completed_at
    }
    product_embeddings {
        uuid id PK
        uuid product_id FK
        uuid image_id FK
        uuid job_id FK
        text model_version
        vector_512 embedding
        timestamptz created_at
    }

    %% Store and shelf photo repository
    stores {
        uuid id PK
        text code UK
        text name
        text location
    }
    campaigns {
        uuid id PK
        text name UK
    }
    source_photos {
        uuid id PK
        text object_key UK
        text original_filename
        text mime_type
        integer byte_size
        uuid store_id FK
        uuid campaign_id FK
        date captured_on
        text notes
        photo_status status
        text uploaded_by_id FK
        timestamptz created_at
    }
    photo_detections {
        uuid id PK
        uuid photo_id FK
        uuid product_id FK
        text model_version
        real confidence
        real x
        real y
        real width
        real height
        timestamptz created_at
    }

    %% Saved search and result snapshots
    search_history {
        uuid id PK
        text user_id FK
        search_type type
        text query
        jsonb filters
        text saved_name
        timestamptz created_at
    }
    search_results {
        uuid id PK
        uuid search_id FK
        integer rank
        uuid product_id FK
        uuid photo_id FK
        real similarity
        text product_name
        text product_sku
    }

    user ||--o{ session : "has"
    user ||--o{ account : "has"

    categories o|--o{ categories : "parent of"
    brands ||--o{ products : "brands"
    categories ||--o{ products : "classifies"
    user o|--o{ products : "created by"
    user o|--o{ products : "updated by"
    products ||--o{ product_keywords : "tagged with"
    products ||--o{ product_images : "has reference"

    products ||--o{ indexing_jobs : "indexed by"
    products ||--o{ product_embeddings : "embedded as"
    product_images ||--o{ product_embeddings : "source of"
    indexing_jobs ||--o{ product_embeddings : "generates"

    stores ||--o{ source_photos : "captured at"
    campaigns o|--o{ source_photos : "associated with"
    user o|--o{ source_photos : "uploaded by"
    source_photos ||--o{ photo_detections : "contains"
    products o|--o{ photo_detections : "matched to"

    user ||--o{ search_history : "owns"
    search_history ||--o{ search_results : "records"
    products o|--o{ search_results : "result product"
    source_photos o|--o{ search_results : "result photo"
```

**Cardinality:** `||` means exactly one; `o|` means zero or one; `o{` means
zero or many. The left side of each line is the referenced table. Optional
relationships correspond to nullable foreign-key columns. In particular,
deleted products can leave detections and saved search results intact, while
their `product_id` becomes `NULL`.

**Additional constraints:** `product_keywords` uses a unique **pair**
(`product_id`, `keyword`) instead of a single-column primary key;
`categories` uniquely indexes (`name`, `parent_id`), and `product_embeddings`
uniquely indexes (`job_id`, `image_id`). The schema also defines check
constraints for uploaded-image types/sizes, nonnegative indexing progress,
positive search ranking, normalized photo bounding boxes, and score ranges.
The `verification` and `rate_limit` Better Auth tables have no foreign keys.

**Storage and search:** `product_embeddings.embedding` is a 512-dimensional
pgvector with an HNSW cosine index. Image content resides in object storage;
`product_images` and `source_photos` store its object keys. Enumerated statuses
are `indexing_status`, `photo_status`, and `search_type`.

Source: [`src/lib/db/schema.ts`](../src/lib/db/schema.ts) and its imported
module schemas. Implementation considerations are documented in
[`database.md`](database.md).
