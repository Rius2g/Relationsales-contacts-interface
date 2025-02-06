package database

import (
	"context"
	"fmt"
	"log"
    "os"
    "runtime"
    "time"
    "github.com/google/uuid"
    t "backend/types"


	"github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)


type DBConfig struct {
    dbURL string
    Pool *pgxpool.Pool
}

var DB *DBConfig



func (db *DBConfig) testConnection(ctx context.Context) error {
    // Get a connection from the pool
    conn, err := db.Pool.Acquire(ctx)
    if err != nil {
        return fmt.Errorf("failed to acquire connection: %w", err)
    }
    defer conn.Release()

    log.Println("Acquired connection for test")

    // Use simple protocol for the test query
    rows, err := conn.Query(ctx, "SELECT 1;")
    if err != nil {
        return fmt.Errorf("ping query failed: %w", err)
    }
    defer rows.Close()

    // Check if we have a result
    if rows.Next() {
        var result int
        if err := rows.Scan(&result); err != nil {
            return fmt.Errorf("failed to scan result: %w", err)
        }
        if result != 1 {
            return fmt.Errorf("unexpected result from ping query: %d", result)
        }
    }

    return nil
}


func InitDb() error {
    log.Println("Starting database initialization")
    dbURL := os.Getenv("DATABASE_URL")
    // Create the pool configuration
    config, err := pgxpool.ParseConfig(dbURL)
    if err != nil {
        return fmt.Errorf("failed to parse config: %w", err)
    }

    // Disable prepared statements
    config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

    // Set pool configuration
    config.MaxConns = int32(runtime.GOMAXPROCS(0) * 4) // Scale with CPU cores
    config.MinConns = int32(runtime.GOMAXPROCS(0))
    config.MaxConnLifetime = 1 * time.Hour
    config.MaxConnIdleTime = 30 * time.Minute
    config.ConnConfig.ConnectTimeout = 10 * time.Second

    log.Println("Creating connection pool")
    pool, err := pgxpool.NewWithConfig(context.Background(), config)
    if err != nil {
        return fmt.Errorf("failed to create connection pool: %w", err)
    }

    log.Println("Connection pool created")

    dbConfig := &DBConfig{
        dbURL: dbURL,
        Pool:  pool,
    }

    // Test connection
    log.Println("Testing database connection")
    if err := dbConfig.testConnection(context.Background()); err != nil {
        pool.Close()
        return fmt.Errorf("connection test failed: %w", err)
    }

    log.Println("Database connection test successful")

    // Create tables
    log.Println("Starting table creation")
    if err := dbConfig.createTables(context.Background()); err != nil {
        pool.Close()
        return fmt.Errorf("table creation failed: %w", err)
    }

    DB = dbConfig


    log.Println("Database initialization completed successfully")
    return nil
}



func (db *DBConfig) createTables(ctx context.Context) error {
    log.Println("Acquiring connection for table creation")
    conn, err := db.Pool.Acquire(ctx)
    if err != nil {
        return fmt.Errorf("failed to acquire connection: %w", err)
    }
    defer conn.Release()

    log.Println("Beginning transaction")
    tx, err := conn.Begin(ctx)
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback(ctx)


    log.Println("Creating tables")
    tableQueries := []string{
        `CREATE TABLE IF NOT EXISTS Organizations(
            OrgNumber int PRIMARY KEY,
            OrgName VARCHAR(75) NOT NULL UNIQUE
        );`,
        `CREATE TABLE IF NOT EXISTS Contacts(
            ContactID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            OrgNumber int NOT NULL,
            Name VARCHAR(75) NOT NULL,
            Email VARCHAR(75),
            Phone int NOT NULL,
            PositionName VARCHAR(75),
            ContactedAt TIMESTAMP NOT NULL,
            FOREIGN KEY (OrgNumber) REFERENCES Organizations(OrgNumber)
       );`,
   }

    for i, query := range tableQueries {
        log.Printf("Executing table creation query %d/4", i+1)
        if _, err := tx.Exec(ctx, query); err != nil {
            return fmt.Errorf("failed to create table: %w", err)
        }
    }

    log.Println("Committing transaction")
    if err := tx.Commit(ctx); err != nil {
        return fmt.Errorf("failed to commit transaction: %w", err)
    }

    log.Println("Tables created successfully")
    return nil
}

func (db *DBConfig) AddOrganization(ctx context.Context, org t.Organization) error {
    if ctx.Err() != nil {
        return fmt.Errorf("context error: %w", ctx.Err()) 
    }
    if err := db.testConnection(ctx); err != nil {
        return fmt.Errorf("failed to test connection: %w", err)
    }


    query := `INSERT INTO Organizations (OrgNumber, OrgName) VALUES ($1, $2);`
    _, err := db.Pool.Exec(ctx, query, org.OrgNumber, org.OrgName)
    if err != nil {
        return fmt.Errorf("failed to insert organization: %w", err)
    }


    return nil
}


func (db *DBConfig) AddContact(ctx context.Context, contact t.Contact) error {
    if ctx.Err() != nil {
        return fmt.Errorf("context error: %w", ctx.Err())
    }
    if err := db.testConnection(ctx); err != nil {
        return fmt.Errorf("failed to test connection: %w", err)
    }

    query := `INSERT INTO Contacts (OrgNumber, Name, Email, Phone, PositionName, ContactedAt) VALUES ($1, $2, $3, $4, $5, $6);`

    _, err := db.Pool.Exec(ctx, query, contact.OrgNumber, contact.Name, contact.Email, contact.Phone, contact.PositionName, time.Now())
    if err != nil {
        return fmt.Errorf("failed to insert contact: %w", err)
    }

    return nil
}

//need to specify what we are searching for in the frontend?
func (db *DBConfig) Search(searchQuery string){
    
}


func (db *DBConfig) DeleteContact(ctx context.Context, contactID string) error {
    if ctx.Err() != nil {
        return fmt.Errorf("context error: %w", ctx.Err())
    }
    if err := db.testConnection(ctx); err != nil {
        return fmt.Errorf("failed to test connection: %w", err)
    }

    query := `DELETE FROM Contacts WHERE ContactID = $1;`
    _, err := db.Pool.Exec(ctx, query, contactID)
    if err != nil {
        return fmt.Errorf("failed to delete contact: %w", err)
    }

    return nil
}


func (db *DBConfig) UpdateContact(ctx context.Context, contact t.Contact) error {
    if err := db.testConnection(ctx); err != nil {
        return fmt.Errorf("failed to test connection: %w", err)
    }

    query := `UPDATE Contacts SET Name = $1, Email = $2, Phone = $3, PositionName = $4, ContactedAt = $5 WHERE ContactID = $6;`
    _, err := db.Pool.Exec(ctx, query, contact.Name, contact.Email, contact.Phone, contact.PositionName, contact.ContactedAt, contact.ContactID)
    if err != nil {
        return fmt.Errorf("failed to update contact: %w", err)
    }

    return nil
}


func (db *DBConfig) GetAllData(ctx context.Context) ([]t.OrgWithContacts, error) {
   if ctx.Err() != nil {
       return nil, fmt.Errorf("context error: %w", ctx.Err())
   }
   if err := db.testConnection(ctx); err != nil {
       return nil, fmt.Errorf("failed to test connection: %w", err)
   }

   query := `SELECT Organizations.OrgNumber, Organizations.OrgName, 
             Contacts.ContactID, Contacts.Name, Contacts.Email, 
             Contacts.Phone, Contacts.PositionName, Contacts.ContactedAt 
             FROM Organizations 
             LEFT JOIN Contacts ON Organizations.OrgNumber = Contacts.OrgNumber;`

   rows, err := db.Pool.Query(ctx, query)
   if err != nil {
       return nil, fmt.Errorf("failed to query data: %w", err)
   }
   defer rows.Close()

   orgMap := make(map[int]t.OrgWithContacts)

   for rows.Next() {
       var (
           org t.OrgWithContacts
           contact t.Contact
           contactID *uuid.UUID
           name, email *string
           phone *int                    // Changed from *string to *int
           positionName, contactedAt *string
       )

       err := rows.Scan(
           &org.OrgNumber,
           &org.OrgName,
           &contactID,
           &name,
           &email,
           &phone,
           &positionName,
           &contactedAt,
       )
       if err != nil {
           return nil, fmt.Errorf("failed to scan row: %w", err)
       }

       if existingOrg, ok := orgMap[org.OrgNumber]; ok {
           org = existingOrg
       }

       if contactID != nil {
           contact.ContactID = *contactID
           contact.Name = *name 
           if email != nil {
               contact.Email = *email
           }
           contact.Phone = *phone        // No need for conversion since it's already an int
           if positionName != nil {
               contact.PositionName = *positionName
           }
           contact.ContactedAt = *contactedAt
           contact.OrgNumber = org.OrgNumber
           org.Contacts = append(org.Contacts, contact)
       }

       orgMap[org.OrgNumber] = org
   }

   orgs := make([]t.OrgWithContacts, 0, len(orgMap))
   for _, org := range orgMap {
       orgs = append(orgs, org)
   }

   return orgs, nil
}


func (db *DBConfig) SafeRollback(ctx context.Context, tx pgx.Tx, err error) {
    if err := tx.Rollback(ctx); err != nil {
        log.Printf("failed to rollback transaction: %v", err)
    }
}



func (db *DBConfig) Close(){
    if db.Pool != nil {
        db.Pool.Close()
    }
}
