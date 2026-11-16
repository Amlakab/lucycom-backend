import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import SiteSettings from '../models/SiteSettings';
import Project, { ProjectCategory } from '../models/Project';
import Solution from '../models/Solution';
import Partner from '../models/Partner';
import Certification from '../models/Certification';
import Testimonial from '../models/Testimonial';
import BlogPost from '../models/BlogPost';
import User from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

export async function seedDatabase() {
  console.log('🚀 Connecting to MongoDB for LUCYCOM TECHNOLOGIES S.C. seeding...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  // 1. SiteSettings
  console.log('🌱 Seeding SiteSettings...');
  await SiteSettings.deleteMany({});
  await SiteSettings.create({
    company: {
      name: 'LUCYCOM TECHNOLOGIES S.C.',
      slogan: 'Lucy the origin, LucyCom the destination',
      sloganAmharic: 'ሉሲ መገኛ፣ ሉሲኮም መዳረሻ',
      tin: '0072480301',
      capital: '2,360,000.00 ETB',
      registrationNo: 'AACATB/14/672/50644211/2019',
      profileBrochureUrl: '/documents/LUCYCOM_Company_Profile.pdf'
    },
    hero: {
      title: "Empowering Ethiopia's Digital Future.",
      titleAmharic: 'የኢትዮጵያን ዲጂታል ሽግግር በላቀ ቴክኖሎጂ እናጸናለን',
      subtitle: 'End-to-End ICT, Telecom & Data Center Solutions.',
      subtitleAmharic: 'የተሟላ የቴሌኮም፣ የዳታ ሴንተር እና የዘመናዊ ቴክኖሎጂ ግንባታ መፍትሄዎች',
      description: 'LUCYCOM TECHNOLOGIES S.C. is a leading Ethiopian share company dedicated to designing, supplying, and supporting resilient, scalable, and international standards-compliant ICT infrastructure.',
      profileImages: ['/images/lucycom-hero.png', '/images/lucycom-badge.png'],
      profileImagesData: [],
      resumeUrl: '/documents/LUCYCOM_Company_Profile.pdf'
    },
    about: {
      title: 'About LUCYCOM TECHNOLOGIES S.C.',
      description: 'LUCYCOM TECHNOLOGIES S.C. is a premier Ethiopian share company dedicated to designing, supplying, installing, and supporting end-to-end ICT infrastructure solutions. Our experience spans civil infrastructure, telecom tower erection, Tier-standard data centers, smart classrooms, and cloud-ready Virtual Desktop Infrastructure (VDI). We pair certified engineering capabilities with strategic partnerships among world-class global technology manufacturers to deliver resilient, scalable, and international standards-compliant solutions tailored to Ethiopia’s rapid digital transformation.',
      vision: 'To be the leading ICT infrastructure & digital engineering pioneer in East Africa.',
      mission: 'Delivering resilient, world-class turnkey engineering solutions that empower Ethiopian institutions.',
      image: '/images/lucycom-hero.png'
    },
    solutionsSection: {
      title: 'Enterprise ICT & Turnkey Infrastructure Solutions',
      titleAmharic: 'የላቀ የቴሌኮም፣ ዳታ ሴንተር እና አይሲቲ መፍትሄዎች',
      subtitle: 'End-to-end design, deployment, and SLA maintenance across 6 mission-critical technology domains.',
      subtitleAmharic: 'በቴሌኮም፣ ዳታ ሴንተር፣ ስማርት ትምህርት፣ ሳይበር ደህንነት እና ኤሌክትሮ መካኒካል የተሟላ አገልግሎት'
    },
    partnersSection: {
      title: 'Global Technology Partners & OEM Alliances',
      titleAmharic: 'ዓለም አቀፍ የቴክኖሎጂ አጋሮቻችን እና አምራቾች',
      subtitle: 'Direct tier-1 integration and certified deployment with industry-leading telecommunications, data center, and security manufacturers.',
      subtitleAmharic: 'ከዓለም ታዋቂ የቴክኖሎጂ አምራቾች ጋር በመተባበር ደረጃቸውን የጠበቁ መፍትሄዎችን እናቀርባለን'
    },
    whyChooseUs: {
      title: 'Why Leading Ethiopian Enterprises Choose Lucycom',
      titleAmharic: 'ተቋማት ለምን ሉሲኮም ቴክኖሎጂስን ይመርጣሉ?',
      subtitle: 'Pairing certified local engineering capabilities with international standards and direct OEM partnerships.',
      subtitleAmharic: 'የተረጋገጠ የአገር ውስጥ የምህንድስና ብቃት ከዓለም አቀፍ የጥራት ደረጃዎች ጋር በማጣመር'
    },
    contact: {
      email: 'info@lucycomtechnologies.com',
      phone: '+251 939997612',
      alternatePhone: '+251 118220000',
      location: 'Yeka Sub-City, Woreda 08, House No. 158/406, Addis Ababa, Ethiopia',
      workingHours: 'Monday - Saturday: 8:30 AM - 5:30 PM (24/7 On-Call Technical Support)',
      socialLinks: [
        { platform: 'Website', url: 'https://www.lucycomtechnologies.com', icon: 'FiExternalLink' },
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/lucycom-technologies', icon: 'AiFillLinkedin' },
        { platform: 'Email', url: 'mailto:info@lucycomtechnologies.com', icon: 'IoMdMail' }
      ]
    },
    stats: {
      projectsCompleted: 120,
      happyClients: 45,
      linesOfCode: 250,
      yearsExperience: 8,
      qualityPassRate: 99.8,
      slaSupport: '24/7'
    },
    seo: {
      title: 'LUCYCOM TECHNOLOGIES S.C. - Corporate Profile',
      description: "Empowering Ethiopia's Digital Future through World-Class ICT & Telecom Infrastructure.",
      keywords: ['Lucycom Technologies', 'Telecom Ethiopia', 'Data Center Addis Ababa', 'Smart Classrooms', 'AI CCTV'],
      ogImage: '/images/lucycom-hero.png'
    }
  });

  // 2. Solutions (The 4 core solution domains from PDF)
  console.log('🌱 Seeding Solutions...');
  await Solution.deleteMany({});
  await Solution.create([
    {
      title: 'Telecom Infrastructure',
      slug: 'telecom-infrastructure',
      shortDescription: 'Civil works, mast erection, feeder alignment, radio/microwave commissioning, and drive test quality verification.',
      description: 'LUCYCOM provides complete turn-key telecom infrastructure solutions spanning civil foundations, heavy mast/tower erection up to 60 meters, antenna and feeder alignment, microwave link installation, and 4G/5G LTE commissioning with rigorous RF drive test verification.',
      icon: 'Radio',
      features: [
        'Civil works & heavy mast erection (up to 60m)',
        '4G / 5G LTE radio access installation & integration',
        'Microwave transmission link commissioning & feeder alignment',
        'Drive test quality verification & RF coverage optimization'
      ],
      keyTechnologies: ['4G/5G LTE', 'RF Optimization', 'Microwave', 'Mast Erection'],
      deliverables: 'Complete turnkey tower erection, link alignment, and SLA-backed commissioning.',
      image: '/images/lucycom-hero.png',
      order: 1,
      featured: true
    },
    {
      title: 'Data Center Builds & Datacom',
      slug: 'data-center-datacom',
      shortDescription: 'Tier-standard physical facility construction, precision cooling, cold/hot aisle containment, modular UPS, and fiber backbones.',
      description: 'We construct Tier II and Tier III compliant data centers engineered for continuous availability. Our deployments integrate precision close-control CRAC cooling, modular N+1 UPS power arrays, automated fire suppression, high-density server racking, and structured optical fiber backbones.',
      icon: 'Server',
      features: [
        'Tier II & Tier III physical data hall construction',
        'Precision CRAC cooling & cold/hot aisle containment',
        'Modular N+1 UPS power systems & automated power transfer',
        'High-density server racking & structured optical fiber backbones'
      ],
      keyTechnologies: ['Tier II/III', 'Precision Cooling', 'Modular UPS', 'Structured Cabling'],
      deliverables: 'Turn-key data center facility handover with full thermal and electrical redundancy.',
      image: '/images/lucycom-badge.png',
      order: 2,
      featured: true
    },
    {
      title: 'Smart Education & Classrooms',
      slug: 'smart-education',
      shortDescription: 'Interactive flat panels, podium integration, lecture recording, virtual lab platforms, and centralized desktop virtualization.',
      description: 'Transforming Ethiopian educational institutions through modern digital pedagogy. LUCYCOM designs and equips smart classrooms with interactive 4K touch displays, multi-camera lecture capture pods, digital speaker podiums, and centralized Virtual Desktop Infrastructure (VDI) laboratories.',
      icon: 'GraduationCap',
      features: [
        'Interactive smart flat panels & digital instructor podiums',
        'Automated multi-angle lecture recording pods',
        'Centralized Virtual Desktop Infrastructure (VDI) labs',
        'Unified audio-visual and remote e-learning platforms'
      ],
      keyTechnologies: ['VDI', 'Smart Boards', 'Lecture Capture', 'Virtual Labs'],
      deliverables: 'Turn-key interactive classroom setups and central VDI server environments.',
      image: '/images/lucycom-hero.png',
      order: 3,
      featured: true
    },
    {
      title: 'Enterprise Security & AI CCTV',
      slug: 'enterprise-security',
      shortDescription: 'AI face recognition cameras, perimeter intrusion alerts, central VMS control centers, Next-Gen firewalls, and zero-trust security.',
      description: 'Comprehensive physical and digital enterprise protection. We install enterprise IP video surveillance powered by facial recognition analytics, perimeter intrusion alarms, multi-screen centralized VMS command walls, and redundant Next-Generation Firewalls (NGFW) with zero-trust network access.',
      icon: 'ShieldCheck',
      features: [
        'AI facial recognition cameras & high-definition surveillance',
        'Automated perimeter intrusion detection & alarm triggers',
        'Centralized VMS video wall command room installations',
        'Next-Gen Firewalls (NGFW) & zero-trust network encryption'
      ],
      keyTechnologies: ['AI CCTV', 'NGFW', 'Perimeter AI', 'Access Control'],
      deliverables: 'Centralized command center setup with 24/7 video analytics and hardened firewalls.',
      image: '/images/lucycom-badge.png',
      order: 4,
      featured: true
    }
  ]);

  // 3. Partners (The 9 official global technology partners from PDF)
  console.log('🌱 Seeding Partners...');
  await Partner.deleteMany({});
  await Partner.create([
    {
      name: 'HUAWEI',
      domain: 'Telecom & Core Networking',
      description: 'Global leader in telecommunications carrier equipment, 4G/5G radio infrastructure, transmission, and enterprise routing.',
      tier: 'Global Technology Partner',
      order: 1,
      featured: true
    },
    {
      name: 'NOKIA',
      domain: 'Optical & Mobile Infrastructure',
      description: 'Pioneer in carrier-grade optical transport, mobile RAN networks, and high-capacity packet core systems.',
      tier: 'Global Technology Partner',
      order: 2,
      featured: true
    },
    {
      name: 'ERICSSON',
      domain: '5G Radio & Transmission',
      description: 'Industry standard for cellular base stations, advanced antenna systems, and microwave transmission backhauls.',
      tier: 'Global Technology Partner',
      order: 3,
      featured: true
    },
    {
      name: 'CISCO',
      domain: 'Enterprise Switching & Routing',
      description: 'World benchmark in enterprise networking hardware, campus routing, core switches, and unified communications.',
      tier: 'Certified Integration Partner',
      order: 4,
      featured: true
    },
    {
      name: 'FORTINET',
      domain: 'Next-Gen Cybersecurity & NGFW',
      description: 'Industry-leading Security Fabric, Next-Generation Firewalls (FortiGate), secure SD-WAN, and zero-trust threat prevention.',
      tier: 'Cybersecurity Partner',
      order: 5,
      featured: true
    },
    {
      name: 'HPE / DELL',
      domain: 'Data Center Servers & Storage',
      description: 'High-density rack servers, SAN/NAS storage arrays, and hyper-converged infrastructure for modern enterprise data halls.',
      tier: 'Hardware OEM Partner',
      order: 6,
      featured: true
    },
    {
      name: 'HIKVISION',
      domain: 'AI Video Surveillance & CCTV',
      description: 'Market leader in intelligent IP cameras, PTZ surveillance, facial recognition terminals, and central VMS control software.',
      tier: 'Surveillance Partner',
      order: 7,
      featured: true
    },
    {
      name: 'DAHUA',
      domain: 'Perimeter Security & Analytics',
      description: 'Advanced perimeter thermal detection, AI intrusion video analytics, and smart command room control matrices.',
      tier: 'Security Partner',
      order: 8,
      featured: true
    },
    {
      name: 'OS-EASY',
      domain: 'Virtual Desktop Infrastructure (VDI)',
      description: 'Enterprise and academic cloud desktop virtualization software powering modern computer laboratories and smart classrooms.',
      tier: 'VDI Solutions Partner',
      order: 9,
      featured: true
    }
  ]);

  // 4. Projects (from PDF page 4)
  console.log('🌱 Seeding Projects...');
  await Project.deleteMany({});
  await Project.create([
    {
      title: 'National Telecom Rollout & Acceptance',
      description: 'Turn-key radio installation, drive testing, and coverage optimization across 120+ sites with 99.8% quality pass rate for major telecom operators & vendors.',
      image: '/images/lucycom-hero.png',
      tags: ['4G/5G LTE', 'RF Optimization', 'Microwave', 'Mast Erection'],
      category: ProjectCategory.TELECOM,
      featured: true,
      order: 1,
      liveUrl: 'https://www.lucycomtechnologies.com'
    },
    {
      title: 'Campus-Wide Data Center & LAN Infrastructure',
      description: 'Turn-key installation of high-density server racks, fiber optic backbone, precision CRAC cooling, and centralized modular UPS power for Higher Education & Universities.',
      image: '/images/lucycom-badge.png',
      tags: ['Tier II/III', 'Structured Cabling', 'CRAC Cooling', 'Modular UPS'],
      category: ProjectCategory.DATACENTER,
      featured: true,
      order: 2,
      liveUrl: 'https://www.lucycomtechnologies.com'
    },
    {
      title: 'Smart Classroom Modernization & VDI',
      description: 'Deployed interactive smart boards, lecture recording pods, and central VDI server environments for computer laboratories in Educational Institutions.',
      image: '/images/lucycom-hero.png',
      tags: ['VDI', 'Smart Boards', 'Lecture Capture', 'e-Learning'],
      category: ProjectCategory.EDUCATION,
      featured: true,
      order: 3,
      liveUrl: 'https://www.lucycomtechnologies.com'
    },
    {
      title: 'High-Definition CCTV & Perimeter AI Surveillance',
      description: 'Installed 250+ AI-enabled IP video surveillance cameras connected to a central command room with automated perimeter intrusion alerts for Government & Commercial Facilities.',
      image: '/images/lucycom-badge.png',
      tags: ['AI CCTV', 'VMS Command Room', 'Intrusion Detection', 'Facial Recognition'],
      category: ProjectCategory.SECURITY,
      featured: true,
      order: 4,
      liveUrl: 'https://www.lucycomtechnologies.com'
    },
    {
      title: 'Enterprise NGFW & Zero-Trust Security Hardening',
      description: 'Configured redundant Next-Gen Firewalls, multi-site VPNs, and intrusion prevention rules for enterprise data protection for Financial & Enterprise Clients.',
      image: '/images/lucycom-hero.png',
      tags: ['NGFW', 'Zero-Trust', 'Fortinet/Cisco', 'IPSec VPN'],
      category: ProjectCategory.SECURITY,
      featured: true,
      order: 5,
      liveUrl: 'https://www.lucycomtechnologies.com'
    },
    {
      title: 'Electromechanical Backup Power & Solar Microgrids',
      description: 'Supplied and integrated heavy-duty diesel generators, ATS automated switching panels, transient surge protection, and hybrid solar photovoltaic microgrids.',
      image: '/images/lucycom-badge.png',
      tags: ['Industrial Generators', 'ATS Panels', 'Surge Earthing', 'Solar PV'],
      category: ProjectCategory.POWER,
      featured: true,
      order: 6,
      liveUrl: 'https://www.lucycomtechnologies.com'
    }
  ]);

  // 5. Certifications & Licenses (from PDF page 5-15)
  console.log('🌱 Seeding Official Certifications & Licenses...');
  await Certification.deleteMany({});
  await Certification.create([
    {
      title: 'Outdoor Telecommunications Facilities Installation & Maintenance Works License',
      organization: 'Ethiopian Communications Authority (ECA)',
      description: 'Official regulatory license issued under Communications Service Proclamation No. 1148/2019 for telecommunications civil, tower, radio, and optical works.',
      startDate: new Date('2021-08-20'),
      category: 'Honors, Awards & Recognition',
      credentialId: 'AA/ADISM/3/0000038/2013',
      featured: true
    },
    {
      title: 'Electromechanical Contractor Grade-Five Competency Certificate',
      organization: 'Ethiopian Energy Authority (EEA)',
      description: 'Authorized electro-mechanical contractor certification under Proclamation No. 686/2010 for power, data center electromechanical, and cooling systems.',
      startDate: new Date('2021-05-31'),
      category: 'Honors, Awards & Recognition',
      credentialId: '51213--247',
      featured: true
    },
    {
      title: 'Computer Network Design & Cable Installation License (Code: 85121)',
      organization: 'Addis Ababa City Administration Trade Bureau',
      description: 'Commercial business license under Proclamation No. 980/2016 for structured cabling, enterprise data networking, and LAN/WAN infrastructure.',
      startDate: new Date('2019-11-02'),
      category: 'Technical & Skill-Based Certifications',
      credentialId: 'AACATB/14/672/50644059/2019',
      featured: true
    },
    {
      title: 'Import Trade in Communication & Computer Equipment License (Code: 65721)',
      organization: 'Ministry of Trade and Regional Integration',
      description: 'Federal business license for importing world-class IT hardware, telecom gear, servers, routers, and surveillance equipment.',
      startDate: new Date('2019-11-02'),
      category: 'Technical & Skill-Based Certifications',
      credentialId: 'MT/AA/14/672/50644466/2019',
      featured: true
    },
    {
      title: 'Consultancy Service on Information and Communication Technology (Code: 86521)',
      organization: 'Addis Ababa City Administration Trade Bureau',
      description: 'Licensed professional consultancy on ICT architecture, enterprise digitization, cybersecurity, and data center engineering.',
      startDate: new Date('2019-11-02'),
      category: 'Professional Development & Short Courses',
      credentialId: 'AACATB/14/672/50644039/2019',
      featured: true
    },
    {
      title: 'Software Development, Design, Enrichment & Implementation (Code: 39141)',
      organization: 'Addis Ababa City Administration Trade Bureau',
      description: 'Licensed development and deployment of bespoke enterprise software solutions, digital portals, and cloud systems.',
      startDate: new Date('2019-11-02'),
      category: 'Technical & Skill-Based Certifications',
      credentialId: 'AACATB/14/672/50644211/2019',
      featured: true
    }
  ]);

  // 6. Testimonials
  console.log('🌱 Seeding Testimonials...');
  await Testimonial.deleteMany({});
  await Testimonial.create([
    {
      name: 'Telecom Rollout Project Director',
      role: 'Major Telecom Operator / Vendor',
      content: 'LUCYCOM TECHNOLOGIES delivered our multi-site telecom rollout ahead of tight project milestones. Their RF drive test pass rate of 99.8% speaks directly to their engineering precision.',
      rating: 5,
      featured: true,
      order: 1
    },
    {
      name: 'Director of ICT & Campus Infrastructure',
      role: 'Higher Education Institution',
      content: 'The turn-key data center facility and campus-wide optical fiber network designed and deployed by LUCYCOM has provided our university with uninterrupted connectivity and high-density computing capacity.',
      rating: 5,
      featured: true,
      order: 2
    },
    {
      name: 'Chief Security Officer',
      role: 'Enterprise Commercial Facility',
      content: 'The 250+ AI-enabled video surveillance cameras and central command monitoring room delivered by LUCYCOM have significantly elevated our perimeter protection and incident response times.',
      rating: 5,
      featured: true,
      order: 3
    },
    {
      name: 'Enterprise Technology Officer',
      role: 'Financial & Enterprise Services',
      content: 'LUCYCOM’s implementation of Next-Gen Firewalls and redundant site-to-site VPN encryption safeguards our mission-critical data in full compliance with national security regulations.',
      rating: 5,
      featured: true,
      order: 4
    }
  ]);

  // 7. Blog Posts
  console.log('🌱 Seeding Blog Posts...');
  await BlogPost.deleteMany({});
  await BlogPost.create([
    {
      title: "Accelerating Ethiopia's Digital Transformation with Resilient ICT Infrastructure",
      slug: 'accelerating-ethiopias-digital-transformation',
      excerpt: 'How modern telecommunication towers, fiber optic backbones, and Tier-standard data centers form the bedrock of the national digital economy.',
      content: 'As Ethiopia undergoes unprecedented digital modernization across finance, government, education, and healthcare, the demand for resilient, high-bandwidth, and zero-downtime ICT infrastructure has never been greater. LUCYCOM TECHNOLOGIES S.C. is committed to pairing certified local engineering with international standards to build the physical and digital foundations required for this transformation.',
      category: 'Telecom & ICT',
      tags: ['Digital Transformation', 'Ethiopia', 'Telecom', 'Infrastructure'],
      views: 350,
      published: true,
      publishedAt: new Date()
    },
    {
      title: 'Building Tier-Standard Modular Data Centers: Engineering Best Practices',
      slug: 'building-tier-standard-modular-data-centers',
      excerpt: 'A comprehensive overview of precision cooling (CRAC), modular UPS redundancy, and structured cabling for modern enterprise data halls.',
      content: 'Modern data centers require meticulous planning around thermal management, power efficiency, and physical security. In this technical brief, LUCYCOM highlights how hot/cold aisle containment, modular N+1 UPS systems, and TIA-942 standards guarantee 99.98% operational uptime.',
      category: 'Data Center',
      tags: ['Data Center', 'Tier Standards', 'UPS', 'Precision Cooling'],
      views: 280,
      published: true,
      publishedAt: new Date()
    }
  ]);

  // 8. Admin User Account
  console.log('🌱 Seeding Admin User Account...');
  const adminEmail = 'admin@lucycom.com';
  const adminPhone = '0939997612';
  const adminPassword = 'Admin@Lucycom2026!';

  await User.deleteMany({ $or: [{ email: adminEmail }, { phone: adminPhone }] });
  const adminUser = new User({
    name: 'Lucycom Administrator',
    email: adminEmail,
    phone: adminPhone,
    password: adminPassword,
    role: 'admin',
    isActive: true,
    address: 'Yeka Sub-City, Woreda 08, House No. 158/406, Addis Ababa, Ethiopia'
  });
  await adminUser.save();
  console.log(`✅ Admin account created successfully:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Phone: ${adminPhone}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: admin`);

  console.log('🎉 LUCYCOM TECHNOLOGIES S.C. database seeding completed successfully!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error during seeding:', err);
      process.exit(1);
    });
}
