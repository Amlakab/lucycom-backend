"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SiteSettingsSchema = new mongoose_1.Schema({
    company: {
        name: { type: String, default: 'LUCYCOM TECHNOLOGIES S.C.' },
        slogan: { type: String, default: 'Lucy the origin, LucyCom the destination' },
        sloganAmharic: { type: String, default: 'ሉሲ መገኛ፣ ሉሲኮም መዳረሻ' },
        tin: { type: String, default: '' },
        capital: { type: String, default: '' },
        registrationNo: { type: String, default: 'AACATB/14/672/50644211/2019' },
        profileBrochureUrl: { type: String, default: '/documents/LUCYCOM_Company_Profile.pdf' }
    },
    hero: {
        title: {
            type: String,
            required: true,
            default: "Empowering Ethiopia's Digital Future."
        },
        titleAmharic: {
            type: String,
            default: 'የኢትዮጵያን ዲጂታል ሽግግር በላቀ ቴክኖሎጂ እናጸናለን'
        },
        subtitle: {
            type: String,
            required: true,
            default: 'End-to-End ICT, Telecom & Data Center Solutions.'
        },
        subtitleAmharic: {
            type: String,
            default: 'የተሟላ የቴሌኮም፣ የዳታ ሴንተር እና የዘመናዊ ቴክኖሎጂ ግንባታ መፍትሄዎች'
        },
        description: {
            type: String,
            required: true,
            default: 'LUCYCOM TECHNOLOGIES S.C. is a leading Ethiopian share company dedicated to designing, supplying, and supporting resilient, scalable, and international standards-compliant ICT infrastructure.'
        },
        profileImages: {
            type: [String],
            default: ['/images/lucycom-hero.png', '/images/lucycom-badge.png']
        },
        profileImagesData: {
            type: [
                {
                    data: { type: Buffer, required: true },
                    contentType: { type: String, required: true },
                    fileName: { type: String, required: true },
                }
            ],
            default: [],
            required: false,
            select: true
        },
        resumeUrl: {
            type: String,
            default: '/documents/LUCYCOM_Company_Profile.pdf'
        }
    },
    about: {
        title: {
            type: String,
            required: true,
            default: 'About LUCYCOM TECHNOLOGIES S.C.'
        },
        description: {
            type: String,
            required: true,
            default: 'LUCYCOM TECHNOLOGIES S.C. is a premier Ethiopian share company dedicated to designing, supplying, installing, and supporting end-to-end ICT infrastructure solutions across civil infrastructure, telecom tower erection, Tier-standard data centers, smart classrooms, and cloud-ready Virtual Desktop Infrastructure (VDI).'
        },
        vision: {
            type: String,
            default: 'To be the leading ICT infrastructure & digital engineering pioneer in East Africa.'
        },
        mission: {
            type: String,
            default: 'Delivering resilient, world-class turnkey engineering solutions that empower Ethiopian institutions.'
        },
        image: {
            type: String,
            default: '/images/lucycom-hero.png'
        },
        imageData: {
            type: {
                data: { type: Buffer, required: true },
                contentType: { type: String, required: true },
                fileName: { type: String, required: true },
            },
            required: false,
            select: true
        }
    },
    solutionsSection: {
        title: {
            type: String,
            default: 'Enterprise ICT & Turnkey Infrastructure Solutions'
        },
        titleAmharic: {
            type: String,
            default: 'የላቀ የቴሌኮም፣ ዳታ ሴንተር እና አይሲቲ መፍትሄዎች'
        },
        subtitle: {
            type: String,
            default: 'End-to-end design, deployment, and SLA maintenance across 6 mission-critical technology domains.'
        },
        subtitleAmharic: {
            type: String,
            default: 'በቴሌኮም፣ ዳታ ሴንተር፣ ስማርት ትምህርት፣ ሳይበር ደህንነት እና ኤሌክትሮ መካኒካል የተሟላ አገልግሎት'
        }
    },
    partnersSection: {
        title: {
            type: String,
            default: 'Global Technology Partners & OEM Alliances'
        },
        titleAmharic: {
            type: String,
            default: 'ዓለም አቀፍ የቴክኖሎጂ አጋሮቻችን እና አምራቾች'
        },
        subtitle: {
            type: String,
            default: 'Direct tier-1 integration and certified deployment with industry-leading telecommunications, data center, and security manufacturers.'
        },
        subtitleAmharic: {
            type: String,
            default: 'ከዓለም ታዋቂ የቴክኖሎጂ አምራቾች ጋር በመተባበር ደረጃቸውን የጠበቁ መፍትሄዎችን እናቀርባለን'
        }
    },
    whyChooseUs: {
        title: {
            type: String,
            default: 'Why Leading Ethiopian Enterprises Choose Lucycom'
        },
        titleAmharic: {
            type: String,
            default: 'ተቋማት ለምን ሉሲኮም ቴክኖሎጂስን ይመርጣሉ?'
        },
        subtitle: {
            type: String,
            default: 'Pairing certified local engineering capabilities with international standards and direct OEM partnerships.'
        },
        subtitleAmharic: {
            type: String,
            default: 'የተረጋገጠ የአገር ውስጥ የምህንድስና ብቃት ከዓለም አቀፍ የጥራት ደረጃዎች ጋር በማጣመር'
        }
    },
    contact: {
        email: {
            type: String,
            required: true,
            default: 'info@lucycomtechnologies.com'
        },
        phone: {
            type: String,
            required: true,
            default: '+251 939997612'
        },
        alternatePhone: {
            type: String,
            default: '+251 118220000'
        },
        location: {
            type: String,
            required: true,
            default: 'Yeka Sub-City, Woreda 08, House No. 158/406, Addis Ababa, Ethiopia'
        },
        workingHours: {
            type: String,
            default: 'Monday - Saturday: 8:30 AM - 5:30 PM (24/7 On-Call Technical Support)'
        },
        socialLinks: {
            type: [
                {
                    platform: { type: String, required: true },
                    url: { type: String, required: true },
                    icon: { type: String, required: true },
                }
            ],
            default: [
                { platform: 'Website', url: 'https://www.lucycomtechnologies.com', icon: 'FiExternalLink' },
                { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/lucycom-technologies', icon: 'AiFillLinkedin' },
                { platform: 'Email', url: 'mailto:info@lucycomtechnologies.com', icon: 'IoMdMail' }
            ]
        }
    },
    stats: {
        projectsCompleted: {
            type: Number,
            default: 120
        },
        happyClients: {
            type: Number,
            default: 45
        },
        linesOfCode: {
            type: Number,
            default: 250
        },
        yearsExperience: {
            type: Number,
            default: 8
        },
        qualityPassRate: {
            type: Number,
            default: 99.8
        },
        slaSupport: {
            type: String,
            default: '24/7'
        }
    },
    seo: {
        title: {
            type: String,
            default: 'LUCYCOM TECHNOLOGIES S.C. | ICT & Telecom Infrastructure'
        },
        description: {
            type: String,
            default: 'Official website of LUCYCOM TECHNOLOGIES S.C. - End-to-End ICT, Telecom & Data Center Solutions.'
        },
        keywords: {
            type: [String],
            default: ['Lucycom Technologies', 'Telecom Ethiopia', 'Data Center Addis Ababa', 'Smart Classrooms', 'Enterprise Security']
        },
        ogImage: {
            type: String,
            default: '/images/lucycom-hero.png'
        }
    }
}, {
    timestamps: { createdAt: false, updatedAt: 'updated_at' }
});
SiteSettingsSchema.static('getSettings', async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            company: {
                name: 'LUCYCOM TECHNOLOGIES S.C.',
                slogan: 'Lucy the origin, LucyCom the destination',
                sloganAmharic: 'ሉሲ መገኛ፣ ሉሲኮም መዳረሻ',
                tin: '',
                capital: '',
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
                description: 'LUCYCOM TECHNOLOGIES S.C. is a premier Ethiopian share company dedicated to designing, supplying, installing, and supporting end-to-end ICT infrastructure solutions across civil infrastructure, telecom tower erection, Tier-standard data centers, smart classrooms, and cloud-ready Virtual Desktop Infrastructure (VDI).',
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
                description: 'End-to-End ICT, Telecom & Data Center Solutions.',
                keywords: ['LUCYCOM', 'Telecom Infrastructure', 'Data Center', 'Addis Ababa', 'Ethiopia'],
                ogImage: '/images/lucycom-hero.png'
            }
        });
    }
    return settings;
});
SiteSettingsSchema.index({ updated_at: -1 });
exports.default = mongoose_1.default.model('SiteSettings', SiteSettingsSchema);
