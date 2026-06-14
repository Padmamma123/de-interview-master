CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    full_name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    experience_level VARCHAR(50) NOT NULL,
    current_role VARCHAR(150),
    target_role VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id),
    source VARCHAR(50) NOT NULL DEFAULT 'AI',
    difficulty VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    question_type VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    hints JSONB NOT NULL DEFAULT '[]'::JSONB,
    expected_answer TEXT,
    common_mistakes JSONB NOT NULL DEFAULT '[]'::JSONB,
    follow_up_questions JSONB NOT NULL DEFAULT '[]'::JSONB,
    real_world_use_cases JSONB NOT NULL DEFAULT '[]'::JSONB,
    references JSONB NOT NULL DEFAULT '[]'::JSONB,
    approaches JSONB NOT NULL DEFAULT '[]'::JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    submitted_answer TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback JSONB NOT NULL DEFAULT '{}'::JSONB,
    duration_seconds INTEGER,
    attempt_status VARCHAR(30) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interview_type VARCHAR(100) NOT NULL,
    topics JSONB NOT NULL DEFAULT '[]'::JSONB,
    difficulty VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'InProgress'
);

CREATE TABLE IF NOT EXISTS interview_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_interview_id UUID NOT NULL REFERENCES mock_interviews(id) ON DELETE CASCADE,
    technical_accuracy_score INTEGER NOT NULL DEFAULT 0 CHECK (technical_accuracy_score BETWEEN 0 AND 100),
    communication_score INTEGER NOT NULL DEFAULT 0 CHECK (communication_score BETWEEN 0 AND 100),
    depth_score INTEGER NOT NULL DEFAULT 0 CHECK (depth_score BETWEEN 0 AND 100),
    optimization_thinking_score INTEGER NOT NULL DEFAULT 0 CHECK (optimization_thinking_score BETWEEN 0 AND 100),
    architecture_thinking_score INTEGER NOT NULL DEFAULT 0 CHECK (architecture_thinking_score BETWEEN 0 AND 100),
    overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
    category VARCHAR(30) NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]'::JSONB,
    improvements JSONB NOT NULL DEFAULT '[]'::JSONB,
    report JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(150) NOT NULL,
    current_experience_level VARCHAR(50) NOT NULL,
    skill_gap_analysis JSONB NOT NULL DEFAULT '{}'::JSONB,
    recommended_topics JSONB NOT NULL DEFAULT '[]'::JSONB,
    daily_plan JSONB NOT NULL DEFAULT '[]'::JSONB,
    weekly_goals JSONB NOT NULL DEFAULT '[]'::JSONB,
    generated_by VARCHAR(50) NOT NULL DEFAULT 'AI',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    source VARCHAR(255),
    content_type VARCHAR(100),
    storage_path TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    vector_ref VARCHAR(255) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMP,
    provider VARCHAR(50),
    provider_subscription_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    questions_solved INTEGER NOT NULL DEFAULT 0,
    topics_covered INTEGER NOT NULL DEFAULT 0,
    weak_areas JSONB NOT NULL DEFAULT '[]'::JSONB,
    strong_areas JSONB NOT NULL DEFAULT '[]'::JSONB,
    mock_interview_score INTEGER,
    architecture_score INTEGER,
    study_streak INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, metric_date)
);

INSERT INTO roles (name)
VALUES ('Admin'), ('User')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON questions(topic_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_created ON question_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_embeddings_document ON embeddings(document_id);

