-- Users database initialization script

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(200) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_since TIMESTAMP DEFAULT NULL
);

-- Insert some sample data
INSERT INTO users (id, email, full_name) VALUES
    ('018f1234-5678-9abc-def0-123456789abc', 'john.doe@example.com', 'John Doe'),
    ('018f1234-5678-9abc-def0-123456789abd', 'jane.smith@example.com', 'Jane Smith')
ON CONFLICT (email) DO NOTHING; 