-- PaiAgent Database Schema

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    display_name VARCHAR(128),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS node_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_key VARCHAR(64) NOT NULL UNIQUE,
    node_type VARCHAR(32) NOT NULL COMMENT 'INPUT, LLM, TOOL, OUTPUT',
    label VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    icon_url VARCHAR(256),
    config_schema JSON,
    default_config JSON,
    sort_order INT DEFAULT 0,
    enabled TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workflows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    user_id BIGINT NOT NULL,
    flow_json LONGTEXT NOT NULL,
    description VARCHAR(512),
    version INT DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_workflow_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workflow_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL COMMENT 'PENDING, RUNNING, SUCCESS, FAILED',
    input_data JSON,
    output_data JSON,
    node_results JSON,
    error_message TEXT,
    started_at DATETIME,
    finished_at DATETIME,
    duration_ms BIGINT,
    INDEX idx_workflow_id (workflow_id),
    CONSTRAINT fk_execution_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id),
    CONSTRAINT fk_execution_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
