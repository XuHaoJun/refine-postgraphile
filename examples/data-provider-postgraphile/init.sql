-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (id, title) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Technology'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Science'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Business'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Health'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Education');

-- Insert sample posts
INSERT INTO posts (id, title, content, category_id) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', 'The Future of AI', 'Artificial Intelligence is revolutionizing industries across the globe. From autonomous vehicles to medical diagnostics, AI is becoming an integral part of our daily lives.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440001', 'Quantum Computing Breakthrough', 'Scientists have achieved a major breakthrough in quantum computing, bringing us closer to solving complex problems that are currently impossible for classical computers.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Sustainable Energy Solutions', 'The world is moving towards renewable energy sources. Solar and wind power are becoming more cost-effective and efficient.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440003', 'Remote Work Revolution', 'The pandemic has accelerated the adoption of remote work. Companies are rethinking office spaces and work-life balance.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440004', 'Mental Health Awareness', 'Mental health is becoming a priority in workplaces and communities. Organizations are implementing programs to support employee well-being.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440005', 'Online Learning Platforms', 'Digital education platforms are transforming how we learn. Interactive courses and personalized learning paths are the future.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440006', 'Blockchain Beyond Crypto', 'Blockchain technology has applications beyond cryptocurrencies, including supply chain management and secure voting systems.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440007', 'Climate Change Solutions', 'Innovative solutions are emerging to combat climate change, from carbon capture technologies to sustainable agriculture practices.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440008', 'Cybersecurity Best Practices', 'As digital threats evolve, organizations must implement comprehensive cybersecurity measures to protect sensitive data.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440009', 'Personalized Medicine', 'Advances in genomics are enabling personalized treatment plans tailored to individual genetic profiles.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440010', 'Virtual Reality in Education', 'VR technology is creating immersive learning experiences that enhance understanding and retention of complex subjects.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440011', 'Electric Vehicle Market', 'The EV market is experiencing rapid growth, with major automakers committing to all-electric lineups in the coming years.', '550e8400-e29b-41d4-a716-446655440002');

-- Create indexes for better performance
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_categories_created_at ON categories(created_at);
