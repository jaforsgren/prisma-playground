# prisma-playground

playground for exploring postgresql + prisma

# Next Steps (Iterative Commits)

Commit 2: Implement Product CRUD endpoints.

Commit 3: Add Review relationship + cascading deletes.

Commit 4: Implement Order with custom join table.

Commit 5: Add error handling + tests.

# Inspect postgresql

## 1. psql

psql -h localhost -p 5432 -U postgres

```sql
\l         -- list databases
\c mydb    -- connect to a database
\dt        -- list tables
SELECT * FROM product;   -- see your products
```

```


## prisma studio


npx prisma studio


```
