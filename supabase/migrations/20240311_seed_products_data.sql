-- =====================================================
-- Seed Data: Categories, Products, and Related Data
-- =====================================================

-- Clear existing data (optional - comment out in production)
-- DELETE FROM product_images;
-- DELETE FROM product_tech_specs;
-- DELETE FROM product_services;
-- DELETE FROM product_tags;
-- DELETE FROM products;
-- DELETE FROM categories;

-- =====================================================
-- 1. Categories
-- =====================================================

INSERT INTO categories (id, name, slug, description, status, product_count) VALUES
('11111111-1111-1111-1111-111111111001', 'Networking Equipment', 'networking-equipment', 'Routers, switches, firewalls, and networking infrastructure', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111002', 'Servers & Storage', 'servers-storage', 'Enterprise servers, storage solutions, and data center equipment', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111003', 'Security Solutions', 'security-solutions', 'Firewalls, intrusion detection, security appliances', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111004', 'Cloud Services', 'cloud-services', 'Cloud infrastructure, SaaS platforms, and cloud solutions', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111005', 'Software & Licenses', 'software-licenses', 'Enterprise software, licenses, and applications', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111006', 'Telecommunications', 'telecommunications', 'VoIP, telephony systems, and communication equipment', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111007', 'IoT & Smart Devices', 'iot-smart-devices', 'Internet of Things devices and smart automation', 'ACTIVE', 0),
('11111111-1111-1111-1111-111111111008', 'Data Center Infrastructure', 'datacenter-infrastructure', 'Racks, cooling systems, power management', 'ACTIVE', 0)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. Products (Linked to Distributor Organization)
-- Organization ID: 550e8400-e29b-41d4-a716-446655440001
-- =====================================================

-- Networking Products
INSERT INTO products (
  id, organization_id, name, sku, category_id, brand, 
  description, short_description, price, currency,
  model_number, manufacturer, 
  key_features,
  min_order_quantity, stock_status, delivery_timeline,
  warranty_info, warranty_period, warranty_type,
  is_trending, is_featured, status,
  technical_support_available, demo_available, installation_available
) VALUES

-- Product 1: Enterprise Router (Trending & Featured)
(
  '22222222-2222-2222-2222-222222222001',
  '550e8400-e29b-41d4-a716-446655440001',
  'Cisco ISR 4451 Integrated Services Router',
  'ISR4451-X/K9',
  '11111111-1111-1111-1111-111111111001',
  'Cisco',
  'High-performance enterprise router with advanced security features, ideal for medium to large enterprises. Supports up to 2 Gbps throughput with integrated services including VPN, firewall, and application visibility.',
  'Enterprise-grade router with 2 Gbps throughput and advanced security',
  45999.00,
  'USD',
  'ISR4451-X/K9',
  'Cisco Systems',
  ARRAY['2 Gbps aggregate throughput', 'Integrated security features', 'Supports 400+ concurrent VPN tunnels', '4x 1GE and 3x 10GE ports', 'Advanced threat protection'],
  1,
  'IN_STOCK',
  '3-5 business days',
  'Cisco standard warranty with optional extended support',
  36,
  'MANUFACTURER',
  true,
  true,
  'ACTIVE',
  true,
  true,
  true
),

-- Product 2: Enterprise Switch (Featured)
(
  '22222222-2222-2222-2222-222222222002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Cisco Catalyst 9300 48-Port Switch',
  'C9300-48P-E',
  '11111111-1111-1111-1111-111111111001',
  'Cisco',
  'Next-generation enterprise switch with 48 PoE+ ports, ideal for campus networks. Features advanced security, automation capabilities, and support for SD-Access architecture.',
  '48-port PoE+ enterprise switch with advanced automation',
  12999.00,
  'USD',
  'C9300-48P-E',
  'Cisco Systems',
  ARRAY['48x 1GE PoE+ ports', '740W PoE budget', 'SD-Access ready', 'Stacking capability', 'Advanced threat defense'],
  1,
  'IN_STOCK',
  '2-4 business days',
  'Cisco limited lifetime warranty',
  -1,
  'LIFETIME',
  false,
  true,
  'ACTIVE',
  true,
  true,
  true
),

-- Product 3: Enterprise Firewall (Trending)
(
  '22222222-2222-2222-2222-222222222003',
  '550e8400-e29b-41d4-a716-446655440001',
  'Palo Alto Networks PA-3220 Next-Gen Firewall',
  'PA-3220',
  '11111111-1111-1111-1111-111111111003',
  'Palo Alto Networks',
  'Industry-leading next-generation firewall with threat prevention, URL filtering, and application visibility. Perfect for distributed enterprise deployments with up to 3 Gbps throughput.',
  'Next-gen firewall with 3 Gbps throughput and ML-powered security',
  28500.00,
  'USD',
  'PA-3220',
  'Palo Alto Networks',
  ARRAY['3 Gbps firewall throughput', 'ML-powered threat prevention', 'Advanced URL filtering', 'Application-based security', 'Zero-trust architecture'],
  1,
  'IN_STOCK',
  '5-7 business days',
  'Standard hardware warranty with optional premium support',
  12,
  'MANUFACTURER',
  true,
  false,
  'ACTIVE',
  true,
  true,
  false
),

-- Product 4: Dell Server (Trending & Featured)
(
  '22222222-2222-2222-2222-222222222004',
  '550e8400-e29b-41d4-a716-446655440001',
  'Dell PowerEdge R750 Rack Server',
  'R750-BASE',
  '11111111-1111-1111-1111-111111111002',
  'Dell',
  'High-performance 2U rack server powered by 3rd Gen Intel Xeon processors. Perfect for virtualization, databases, and data analytics workloads. Supports up to 8TB RAM and 24x 2.5" drives.',
  '2U rack server with Intel Xeon, up to 8TB RAM',
  15999.00,
  'USD',
  'PowerEdge R750',
  'Dell Technologies',
  ARRAY['Dual Intel Xeon Scalable processors', 'Up to 8TB DDR4 memory', '24x 2.5" drive bays', 'Redundant power supplies', 'iDRAC9 management'],
  1,
  'IN_STOCK',
  '7-10 business days',
  'Dell ProSupport with next business day onsite service',
  36,
  'MANUFACTURER',
  true,
  true,
  'ACTIVE',
  true,
  true,
  true
),

-- Product 5: HPE Storage
(
  '22222222-2222-2222-2222-222222222005',
  '550e8400-e29b-41d4-a716-446655440001',
  'HPE Nimble Storage All-Flash Array',
  'HPE-NIMBLE-AF20',
  '11111111-1111-1111-1111-111111111002',
  'HPE',
  'Predictive all-flash storage array with AI-driven operations. Delivers consistent performance for mission-critical applications with 99.9999% guaranteed availability.',
  'AI-powered all-flash storage with predictive analytics',
  42000.00,
  'USD',
  'Nimble AF20',
  'Hewlett Packard Enterprise',
  ARRAY['AI-driven predictive analytics', '99.9999% availability guarantee', 'Sub-millisecond latency', 'Inline data reduction', 'Cloud-based management'],
  1,
  'IN_STOCK',
  '10-14 business days',
  'HPE Warranty with InfoSight predictive analytics',
  36,
  'MANUFACTURER',
  false,
  true,
  'ACTIVE',
  true,
  true,
  true
),

-- Product 6: VMware Software
(
  '22222222-2222-2222-2222-222222222006',
  '550e8400-e29b-41d4-a716-446655440001',
  'VMware vSphere 8 Enterprise Plus',
  'VSPHERE8-ENT-PLUS',
  '11111111-1111-1111-1111-111111111005',
  'VMware',
  'Complete virtualization platform for cloud infrastructure. Includes vCenter Server, ESXi hypervisor, and advanced features for automation, security, and multi-cloud management.',
  'Enterprise virtualization platform with advanced features',
  5995.00,
  'USD',
  'vSphere 8 Enterprise Plus',
  'VMware by Broadcom',
  ARRAY['Advanced vMotion capabilities', 'Distributed Resource Scheduler', 'High Availability', 'Fault Tolerance', 'Multi-cloud support'],
  1,
  'IN_STOCK',
  '1-2 business days (digital delivery)',
  'Standard support included, premium support available',
  12,
  'SOFTWARE',
  true,
  false,
  'ACTIVE',
  true,
  false,
  false
),

-- Product 7: Fortinet Firewall
(
  '22222222-2222-2222-2222-222222222007',
  '550e8400-e29b-41d4-a716-446655440001',
  'Fortinet FortiGate 200F Firewall',
  'FG-200F',
  '11111111-1111-1111-1111-111111111003',
  'Fortinet',
  'High-performance next-generation firewall with AI-powered threat intelligence. Ideal for medium enterprises with up to 10 Gbps firewall throughput and advanced threat protection.',
  'NGFW with 10 Gbps throughput and AI security',
  8900.00,
  'USD',
  'FortiGate 200F',
  'Fortinet',
  ARRAY['10 Gbps firewall throughput', 'AI-powered security', 'SD-WAN capabilities', 'Advanced threat protection', 'Cloud-managed'],
  1,
  'IN_STOCK',
  '3-5 business days',
  'Fortinet standard hardware warranty',
  12,
  'MANUFACTURER',
  true,
  true,
  'ACTIVE',
  true,
  true,
  false
),

-- Product 8: Aruba Wireless
(
  '22222222-2222-2222-2222-222222222008',
  '550e8400-e29b-41d4-a716-446655440001',
  'Aruba 650 Series Wi-Fi 6E Access Point',
  'AP-655',
  '11111111-1111-1111-1111-111111111001',
  'Aruba',
  'Tri-band Wi-Fi 6E access point with support for 6 GHz spectrum. Delivers up to 7.8 Gbps aggregate data rate for high-density environments like auditoriums and stadiums.',
  'Wi-Fi 6E access point with 6 GHz support',
  1850.00,
  'USD',
  'AP-655',
  'Aruba Networks (HPE)',
  ARRAY['Tri-band Wi-Fi 6E', '7.8 Gbps aggregate throughput', '6 GHz spectrum support', 'AI-powered optimization', 'Cloud or on-prem management'],
  5,
  'IN_STOCK',
  '3-5 business days',
  'Aruba limited lifetime warranty',
  -1,
  'LIFETIME',
  true,
  false,
  'ACTIVE',
  true,
  true,
  true
),

-- Product 9: Microsoft 365
(
  '22222222-2222-2222-2222-222222222009',
  '550e8400-e29b-41d4-a716-446655440001',
  'Microsoft 365 E5 License',
  'M365-E5-ANNUAL',
  '11111111-1111-1111-1111-111111111005',
  'Microsoft',
  'Complete productivity and security suite including Office apps, Teams, advanced security, compliance tools, and analytics. Best for enterprises requiring advanced security and compliance.',
  'Complete enterprise suite with advanced security',
  57.00,
  'USD',
  'Microsoft 365 E5',
  'Microsoft Corporation',
  ARRAY['Full Office suite', 'Advanced Teams capabilities', 'Advanced security and compliance', 'Power BI Pro included', 'Cloud PBX'],
  25,
  'IN_STOCK',
  'Immediate (digital delivery)',
  'Microsoft standard support',
  12,
  'SUBSCRIPTION',
  false,
  true,
  'ACTIVE',
  true,
  false,
  false
),

-- Product 10: Juniper Switch
(
  '22222222-2222-2222-2222-222222222010',
  '550e8400-e29b-41d4-a716-446655440001',
  'Juniper EX4400 48-Port Switch',
  'EX4400-48P',
  '11111111-1111-1111-1111-111111111001',
  'Juniper Networks',
  'Compact enterprise switch with 48 PoE+ ports and flexible uplink options. Features advanced automation, telemetry, and support for EVPN-VXLAN architectures.',
  '48-port PoE+ switch with advanced automation',
  10500.00,
  'USD',
  'EX4400-48P',
  'Juniper Networks',
  ARRAY['48x 1GE PoE+ ports', 'Flexible 10G/25G uplinks', 'Advanced automation', 'EVPN-VXLAN support', 'In-service software upgrade'],
  1,
  'IN_STOCK',
  '5-7 business days',
  'Juniper standard warranty',
  12,
  'MANUFACTURER',
  false,
  false,
  'ACTIVE',
  true,
  true,
  true
);

-- =====================================================
-- 3. Product Images
-- =====================================================

INSERT INTO product_images (product_id, url, display_order) VALUES
('22222222-2222-2222-2222-222222222001', 'https://images.unsplash.com/photo-1606904825846-647eb07f5d3a?w=800', 1),
('22222222-2222-2222-2222-222222222001', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800', 2),
('22222222-2222-2222-2222-222222222002', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', 1),
('22222222-2222-2222-2222-222222222003', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', 1),
('22222222-2222-2222-2222-222222222004', 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800', 1),
('22222222-2222-2222-2222-222222222004', 'https://images.unsplash.com/photo-1558494850-1e0e4c1e3d99?w=800', 2),
('22222222-2222-2222-2222-222222222005', 'https://images.unsplash.com/photo-1600267165477-6d4cc741b379?w=800', 1),
('22222222-2222-2222-2222-222222222006', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 1),
('22222222-2222-2222-2222-222222222007', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800', 1),
('22222222-2222-2222-2222-222222222008', 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800', 1),
('22222222-2222-2222-2222-222222222009', 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800', 1),
('22222222-2222-2222-2222-222222222010', 'https://images.unsplash.com/photo-1606904825846-647eb07f5d3a?w=800', 1);

-- =====================================================
-- 4. Product Technical Specifications
-- =====================================================

-- Cisco Router Specs
INSERT INTO product_tech_specs (product_id, spec_category, spec_name, spec_value, spec_unit, display_order) VALUES
('22222222-2222-2222-2222-222222222001', 'PERFORMANCE', 'Throughput', '2', 'Gbps', 1),
('22222222-2222-2222-2222-222222222001', 'PERFORMANCE', 'Concurrent Sessions', '200000', 'sessions', 2),
('22222222-2222-2222-2222-222222222001', 'PERFORMANCE', 'VPN Tunnels', '400', 'tunnels', 3),
('22222222-2222-2222-2222-222222222001', 'HARDWARE', 'Memory', '16', 'GB', 4),
('22222222-2222-2222-2222-222222222001', 'HARDWARE', 'Flash Storage', '8', 'GB', 5),
('22222222-2222-2222-2222-222222222001', 'NETWORK', 'Ethernet Ports', '4x 1GE, 3x 10GE', null, 6),
('22222222-2222-2222-2222-222222222001', 'NETWORK', 'Console Ports', '1x RJ-45', null, 7),
('22222222-2222-2222-2222-222222222001', 'SECURITY', 'Firewall', 'Integrated', null, 8),
('22222222-2222-2222-2222-222222222001', 'SECURITY', 'VPN Support', 'IPsec, SSL', null, 9);

-- Cisco Switch Specs
INSERT INTO product_tech_specs (product_id, spec_category, spec_name, spec_value, spec_unit, display_order) VALUES
('22222222-2222-2222-2222-222222222002', 'PERFORMANCE', 'Switching Capacity', '440', 'Gbps', 1),
('22222222-2222-2222-2222-222222222002', 'PERFORMANCE', 'Forwarding Rate', '327.38', 'Mpps', 2),
('22222222-2222-2222-2222-222222222002', 'HARDWARE', 'Ports', '48x 1GE PoE+', null, 3),
('22222222-2222-2222-2222-222222222002', 'HARDWARE', 'Uplinks', '4x 10GE SFP+', null, 4),
('22222222-2222-2222-2222-222222222002', 'HARDWARE', 'PoE Budget', '740', 'W', 5),
('22222222-2222-2222-2222-222222222002', 'NETWORK', 'MAC Table', '32000', 'entries', 6),
('22222222-2222-2222-2222-222222222002', 'NETWORK', 'VLANs', '4094', 'VLANs', 7);

-- Dell Server Specs
INSERT INTO product_tech_specs (product_id, spec_category, spec_name, spec_value, spec_unit, display_order) VALUES
('22222222-2222-2222-2222-222222222004', 'HARDWARE', 'Processors', 'Dual Intel Xeon Scalable', null, 1),
('22222222-2222-2222-2222-222222222004', 'HARDWARE', 'Max Memory', '8', 'TB', 2),
('22222222-2222-2222-2222-222222222004', 'HARDWARE', 'Drive Bays', '24x 2.5"', null, 3),
('22222222-2222-2222-2222-222222222004', 'HARDWARE', 'Form Factor', '2U Rack', null, 4),
('22222222-2222-2222-2222-222222222004', 'HARDWARE', 'PCIe Slots', '8', 'slots', 5),
('22222222-2222-2222-2222-222222222004', 'NETWORK', 'Network Ports', '4x 1GE', null, 6),
('22222222-2222-2222-2222-222222222004', 'PERFORMANCE', 'Max Cores', '56', 'cores', 7);

-- =====================================================
-- 5. Product Services
-- =====================================================

INSERT INTO product_services (product_id, service_type, service_name, description, price, duration, is_included) VALUES
('22222222-2222-2222-2222-222222222001', 'INSTALLATION', 'Professional Installation', 'Expert installation and configuration by certified engineers', 1500.00, '1 day', false),
('22222222-2222-2222-2222-222222222001', 'CONFIGURATION', 'Advanced Configuration', 'Custom configuration including VPN, routing policies, and security', 2000.00, '2 days', false),
('22222222-2222-2222-2222-222222222001', 'EXTENDED_WARRANTY', '3-Year Extended Warranty', 'Extended hardware warranty with next business day replacement', 4500.00, '36 months', false),

('22222222-2222-2222-2222-222222222002', 'INSTALLATION', 'Installation & Rack Mounting', 'Professional installation and rack mounting service', 800.00, '4 hours', false),
('22222222-2222-2222-2222-222222222002', 'CONFIGURATION', 'Network Configuration', 'VLAN setup, stacking configuration, and optimization', 1200.00, '1 day', false),

('22222222-2222-2222-2222-222222222003', 'INSTALLATION', 'Firewall Installation', 'Installation and initial setup', 2000.00, '1 day', false),
('22222222-2222-2222-2222-222222222003', 'CONFIGURATION', 'Security Policy Configuration', 'Complete security policy setup and rule configuration', 3500.00, '3 days', false),
('22222222-2222-2222-2222-222222222003', 'AMC', 'Annual Maintenance Contract', 'Annual maintenance with 24/7 support', 5000.00, '12 months', false),

('22222222-2222-2222-2222-222222222004', 'INSTALLATION', 'Server Installation', 'Rack mounting, cabling, and initial setup', 1800.00, '1 day', false),
('22222222-2222-2222-2222-222222222004', 'CONFIGURATION', 'OS Installation & Configuration', 'Operating system installation and configuration', 1500.00, '1 day', false),
('22222222-2222-2222-2222-222222222004', 'DEPLOYMENT', 'Complete Deployment', 'Full deployment including virtualization setup', 4000.00, '3 days', false),

('22222222-2222-2222-2222-222222222005', 'INSTALLATION', 'Storage Installation', 'Professional installation and integration', 3000.00, '2 days', false),
('22222222-2222-2222-2222-222222222005', 'CONFIGURATION', 'Storage Configuration', 'Volume setup, replication, and optimization', 2500.00, '2 days', false),
('22222222-2222-2222-2222-222222222005', 'AMC', 'Premium Support', 'Premium support with 4-hour response time', 8000.00, '12 months', false),

('22222222-2222-2222-2222-222222222008', 'INSTALLATION', 'AP Installation', 'Access point installation and mounting', 200.00, '2 hours', false),
('22222222-2222-2222-2222-222222222008', 'CONFIGURATION', 'Wireless Network Setup', 'Complete wireless network configuration', 500.00, '4 hours', false);

-- =====================================================
-- 6. Product Tags
-- =====================================================

INSERT INTO product_tags (product_id, tag) VALUES
('22222222-2222-2222-2222-222222222001', 'enterprise'),
('22222222-2222-2222-2222-222222222001', 'security'),
('22222222-2222-2222-2222-222222222001', 'vpn'),
('22222222-2222-2222-2222-222222222001', 'networking'),
('22222222-2222-2222-2222-222222222002', 'enterprise'),
('22222222-2222-2222-2222-222222222002', 'poe'),
('22222222-2222-2222-2222-222222222002', 'networking'),
('22222222-2222-2222-2222-222222222002', 'campus'),
('22222222-2222-2222-2222-222222222003', 'security'),
('22222222-2222-2222-2222-222222222003', 'next-gen'),
('22222222-2222-2222-2222-222222222003', 'threat-prevention'),
('22222222-2222-2222-2222-222222222004', 'enterprise'),
('22222222-2222-2222-2222-222222222004', 'virtualization'),
('22222222-2222-2222-2222-222222222004', 'datacenter'),
('22222222-2222-2222-2222-222222222005', 'all-flash'),
('22222222-2222-2222-2222-222222222005', 'ai-powered'),
('22222222-2222-2222-2222-222222222005', 'enterprise'),
('22222222-2222-2222-2222-222222222006', 'virtualization'),
('22222222-2222-2222-2222-222222222006', 'software'),
('22222222-2222-2222-2222-222222222006', 'cloud'),
('22222222-2222-2222-2222-222222222007', 'security'),
('22222222-2222-2222-2222-222222222007', 'sd-wan'),
('22222222-2222-2222-2222-222222222007', 'firewall'),
('22222222-2222-2222-2222-222222222008', 'wifi-6e'),
('22222222-2222-2222-2222-222222222008', 'wireless'),
('22222222-2222-2222-2222-222222222008', 'networking'),
('22222222-2222-2222-2222-222222222009', 'software'),
('22222222-2222-2222-2222-222222222009', 'productivity'),
('22222222-2222-2222-2222-222222222009', 'cloud'),
('22222222-2222-2222-2222-222222222010', 'networking'),
('22222222-2222-2222-2222-222222222010', 'enterprise'),
('22222222-2222-2222-2222-222222222010', 'automation');

-- =====================================================
-- Update category product counts
-- =====================================================

UPDATE categories SET product_count = (
  SELECT COUNT(*) FROM products WHERE category_id = categories.id
);

-- =====================================================
-- Verify Data
-- =====================================================

-- Check products count
SELECT 'Products Created' as info, COUNT(*) as count FROM products;
SELECT 'Categories Created' as info, COUNT(*) as count FROM categories;
SELECT 'Product Images' as info, COUNT(*) as count FROM product_images;
SELECT 'Technical Specs' as info, COUNT(*) as count FROM product_tech_specs;
SELECT 'Product Services' as info, COUNT(*) as count FROM product_services;
SELECT 'Product Tags' as info, COUNT(*) as count FROM product_tags;

-- Show trending and featured products
SELECT name, brand, is_trending, is_featured, price 
FROM products 
WHERE is_trending = true OR is_featured = true 
ORDER BY is_featured DESC, is_trending DESC;
