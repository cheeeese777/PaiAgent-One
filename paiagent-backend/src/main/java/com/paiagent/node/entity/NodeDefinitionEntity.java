package com.paiagent.node.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "node_definitions")
public class NodeDefinitionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "node_key", unique = true, nullable = false, length = 64)
    private String nodeKey;

    @Column(name = "node_type", nullable = false, length = 32)
    private String nodeType;

    @Column(nullable = false, length = 128)
    private String label;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(name = "icon_url", length = 256)
    private String iconUrl;

    @Column(name = "config_schema", columnDefinition = "JSON")
    private String configSchema;

    @Column(name = "default_config", columnDefinition = "JSON")
    private String defaultConfig;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
