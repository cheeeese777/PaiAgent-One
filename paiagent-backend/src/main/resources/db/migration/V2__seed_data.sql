-- Seed default admin user (password: admin123)
INSERT INTO users (username, password_hash, display_name) VALUES
('admin', '$2b$12$NhDYT8Qcaa4.PVxGwOA1C.Rtghuz55YwCX7LsVD1OGQpZCn7v5fCO', 'admin');

-- Seed node definitions
INSERT INTO node_definitions (node_key, node_type, label, category, icon_url, config_schema, default_config, sort_order) VALUES
('deepseek', 'LLM', 'DeepSeek', '大模型节点', '/icons/deepseek.png',
 '{"provider":"deepseek","models":["deepseek-chat","deepseek-coder"]}',
 '{"provider":"deepseek","model":"deepseek-chat","temperature":0.7}', 1),

('qwen', 'LLM', '通义千问', '大模型节点', '/icons/qwen.png',
 '{"provider":"qwen","models":["qwen-turbo","qwen-plus","qwen-max"]}',
 '{"provider":"qwen","model":"qwen-turbo","temperature":0.7}', 2),

('aiping', 'LLM', 'AI Ping', '大模型节点', '/icons/aiping.png',
 '{"provider":"aiping","models":["aiping-default"]}',
 '{"provider":"aiping","model":"aiping-default","temperature":0.7}', 3),

('zhipu', 'LLM', '智谱', '大模型节点', '/icons/zhipu.png',
 '{"provider":"zhipu","models":["glm-4","glm-3-turbo"]}',
 '{"provider":"zhipu","model":"glm-4","temperature":0.7}', 4),

('voice_synthesis', 'TOOL', '超拟人音频合成', '工具节点', '/icons/voice.png',
 '{"toolType":"voice_synthesis","voices":["male-1","female-1","narrator"]}',
 '{"toolType":"voice_synthesis","voice":"narrator","speed":1.0}', 10);
