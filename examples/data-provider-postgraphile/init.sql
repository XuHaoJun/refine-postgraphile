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
    ('660e8400-e29b-41d4-a716-446655440011', 'Electric Vehicle Market', 'The EV market is experiencing rapid growth, with major automakers committing to all-electric lineups in the coming years.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440012', 'Machine Learning in Healthcare', 'Machine learning algorithms are transforming medical diagnosis and treatment, enabling early detection of diseases and personalized care plans.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440013', 'Cloud Computing Evolution', 'Cloud infrastructure continues to evolve, offering scalable solutions for businesses of all sizes with improved security and performance.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440014', '5G Network Expansion', 'The rollout of 5G networks is accelerating, promising faster speeds and lower latency for mobile and IoT applications worldwide.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440015', 'DevOps Best Practices', 'Modern DevOps practices are streamlining software development and deployment, reducing time-to-market and improving reliability.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440016', 'Microservices Architecture', 'Organizations are adopting microservices to build scalable and maintainable applications that can evolve independently.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440017', 'Edge Computing Trends', 'Edge computing brings processing closer to data sources, reducing latency and enabling real-time applications in various industries.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440018', 'API-First Development', 'Building APIs first enables better integration, faster development cycles, and improved collaboration between teams.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440019', 'Container Orchestration', 'Kubernetes and container orchestration platforms are becoming essential for managing complex distributed applications.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440020', 'Low-Code Development Platforms', 'Low-code platforms are democratizing software development, allowing non-developers to build applications with visual interfaces.', '550e8400-e29b-41d4-a716-446655440000'),
    ('660e8400-e29b-41d4-a716-446655440021', 'Gene Therapy Advances', 'Recent breakthroughs in gene therapy are offering new hope for treating previously incurable genetic disorders.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440022', 'CRISPR Technology Applications', 'CRISPR gene editing is revolutionizing biotechnology, with applications in medicine, agriculture, and research.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440023', 'Space Exploration Milestones', 'Private companies and space agencies are achieving remarkable milestones in space exploration and commercial space travel.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440024', 'Renewable Energy Storage', 'Advancements in battery technology are solving the storage challenge for renewable energy, making it more reliable and accessible.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440025', 'Neuroscience Discoveries', 'New discoveries in neuroscience are revealing how the brain works and opening doors to treating neurological conditions.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440026', 'Ocean Conservation Efforts', 'Marine biologists and conservationists are working together to protect ocean ecosystems and combat plastic pollution.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440027', 'Biotechnology Innovations', 'Biotech companies are developing innovative solutions for food production, medicine, and environmental sustainability.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440028', 'Materials Science Breakthroughs', 'New materials with extraordinary properties are being developed, from self-healing polymers to ultra-lightweight composites.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440029', 'Astrophysics Research', 'Telescopes and space observatories are providing unprecedented insights into the universe, dark matter, and cosmic phenomena.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440030', 'Nanotechnology Applications', 'Nanotechnology is enabling breakthroughs in medicine, electronics, and materials science at the molecular level.', '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440031', 'Digital Transformation Strategies', 'Companies are reimagining their business models through digital transformation, leveraging technology to improve customer experiences.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440032', 'E-commerce Growth Trends', 'Online shopping continues to grow, with new platforms and technologies enhancing the customer experience and expanding market reach.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440033', 'Supply Chain Optimization', 'Advanced analytics and AI are helping businesses optimize supply chains, reducing costs and improving efficiency.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440034', 'Customer Experience Innovation', 'Businesses are investing in customer experience technologies to build loyalty and differentiate themselves in competitive markets.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440035', 'Data-Driven Decision Making', 'Organizations are leveraging big data and analytics to make informed decisions and gain competitive advantages.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440036', 'Marketing Automation Tools', 'Marketing automation platforms are helping businesses streamline campaigns, personalize messaging, and measure ROI effectively.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440037', 'Financial Technology Evolution', 'Fintech innovations are reshaping banking, payments, and financial services, making them more accessible and efficient.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440038', 'Startup Ecosystem Growth', 'Venture capital and startup ecosystems are thriving, with innovative companies emerging across various industries.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440039', 'Remote Team Management', 'Effective remote team management requires new tools and strategies to maintain productivity and team cohesion.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440040', 'Sustainable Business Practices', 'Companies are adopting sustainable practices to reduce environmental impact and meet growing consumer expectations.', '550e8400-e29b-41d4-a716-446655440002'),
    ('660e8400-e29b-41d4-a716-446655440041', 'Preventive Healthcare Strategies', 'Preventive healthcare approaches are gaining traction, focusing on wellness and early intervention to reduce long-term costs.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440042', 'Telemedicine Expansion', 'Telemedicine is making healthcare more accessible, allowing patients to consult with doctors remotely and receive timely care.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440043', 'Nutrition Science Research', 'New research in nutrition science is providing insights into how diet affects health, disease prevention, and longevity.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440044', 'Fitness Technology Trends', 'Wearable devices and fitness apps are helping people track their health metrics and achieve their wellness goals.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440045', 'Sleep Health Importance', 'Research continues to highlight the critical importance of quality sleep for physical and mental health and overall well-being.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440046', 'Public Health Initiatives', 'Public health organizations are launching initiatives to address health disparities and improve community health outcomes.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440047', 'Aging Population Care', 'Healthcare systems are adapting to serve aging populations with specialized care and support services.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440048', 'Mental Health Technology', 'Digital mental health tools and platforms are making therapy and support more accessible to people worldwide.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440049', 'Chronic Disease Management', 'Innovative approaches to managing chronic diseases are improving patient outcomes and quality of life.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440050', 'Global Health Equity', 'Efforts to achieve global health equity are addressing barriers to healthcare access and improving health outcomes worldwide.', '550e8400-e29b-41d4-a716-446655440003'),
    ('660e8400-e29b-41d4-a716-446655440051', 'Online Course Platforms', 'Massive open online courses and learning platforms are making education accessible to millions of learners globally.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440052', 'Coding Bootcamps Impact', 'Coding bootcamps are providing alternative pathways to tech careers, offering intensive training in programming and development.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440053', 'STEM Education Initiatives', 'Programs promoting STEM education are inspiring the next generation of scientists, engineers, and innovators.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440054', 'Lifelong Learning Culture', 'The importance of continuous learning is growing, with professionals seeking to upskill and adapt to changing job markets.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440055', 'Educational Technology Tools', 'EdTech tools are enhancing classroom experiences and enabling personalized learning for students of all ages.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440056', 'Accessibility in Education', 'Efforts to make education more accessible are ensuring that learning opportunities are available to all, regardless of ability.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440057', 'Teacher Professional Development', 'Investing in teacher training and professional development is crucial for improving educational outcomes and student success.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440058', 'Early Childhood Education', 'Research shows that quality early childhood education has lasting positive impacts on children development and future success.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440059', 'Language Learning Apps', 'Mobile apps are revolutionizing language learning, making it easier and more engaging to master new languages.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440060', 'Higher Education Innovation', 'Universities are embracing innovative teaching methods and technologies to better prepare students for the modern workforce.', '550e8400-e29b-41d4-a716-446655440004'),
    ('660e8400-e29b-41d4-a716-446655440061', 'Augmented Reality in Training', 'AR technology is being used for training in various industries, providing immersive learning experiences.', '550e8400-e29b-41d4-a716-446655440000');

CREATE INDEX idx_posts_title ON posts(title);
CREATE INDEX idx_posts_content ON posts(content);

-- Create indexes for better performance
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_categories_created_at ON categories(created_at);
