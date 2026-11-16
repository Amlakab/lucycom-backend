"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatbotQuery = void 0;
const handleChatbotQuery = async (req, res) => {
    try {
        const { message, language = 'en' } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const q = message.toLowerCase();
        // Responses tailored to Lucycom Technologies S.C.
        if (q.includes('service') || q.includes('solution') || q.includes('offer') ||
            q.includes('አገልግሎት') || q.includes('ስራ')) {
            const text = language === 'am'
                ? 'ሉሲኮም ቴክኖሎጂስ አ.ማ በ4 ዋና ዋና መስኮች የተሟሉ አገልግሎቶችን ያቀርባል፡ የቴሌኮም መሰረተ-ልማት (ማማ ተከላ፣ 4G/5G LTE፣ RF ማመቻቸት)፣ ደረጃቸውን የጠበቁ ዳታ ሴንተሮች፣ ዘመናዊ የመማሪያ ክፍሎች (Smart Classrooms & VDI) እና የድርጅት ደህንነት (AI CCTV & NGFW)።'
                : 'LUCYCOM TECHNOLOGIES S.C. provides end-to-end ICT infrastructure across 4 core domains: Telecom Infrastructure (Towers, 4G/5G LTE, RF optimization), Tier II/III Data Centers, Smart Classrooms & VDI, and Enterprise Security (AI CCTV & Next-Gen Firewalls).';
            return res.json({ reply: text, topic: 'solutions' });
        }
        if (q.includes('location') || q.includes('address') || q.includes('where') ||
            q.includes('አድራሻ') || q.includes('የት') || q.includes('ቢሮ')) {
            const text = language === 'am'
                ? 'የሉሲኮም ዋና መስሪያ ቤት አድራሻ፡ አዲስ አበባ፣ የካ ክፍለ ከተማ፣ ወረዳ 08፣ የቤት ቁጥር 158/406፣ ኢትዮጵያ። ስልክ፡ +251 939997612 / +251 911510295 / +251 911828830።'
                : 'LUCYCOM TECHNOLOGIES S.C. Headquarters: Yeka Sub-City, Woreda 08, House No. 158/406, Addis Ababa, Ethiopia. Direct phone: +251 939997612 / +251 911510295.';
            return res.json({ reply: text, topic: 'location' });
        }
        if (q.includes('license') || q.includes('certif') || q.includes('legal') || q.includes('tin') ||
            q.includes('ፈቃድ') || q.includes('ምስክር')) {
            const text = language === 'am'
                ? 'ሉሲኮም ቴክኖሎጂስ አ.ማ በኢትዮጵያ ኮሙኒኬሽን ባለስልጣን (የውጭ ቴሌኮም ተከላና ጥገና ፈቃድ)፣ በኢትዮጵያ ኤነርጂ ባለስልጣን (ደረጃ-5 ኤሌክትሮሜካኒካል ስራ ተቋራጭ) እና በአዲስ አበባ ንግድ ቢሮ የተመዘገበና ፍቃድ ያለው አክሲዮን ማህበር ነው። TIN: 0072480301፣ ካፒታል፡ 2,360,000.00 ብር።'
                : 'LUCYCOM TECHNOLOGIES S.C. is an accredited share company licensed by the Ethiopian Communications Authority (ECA Telecom License), Ethiopian Energy Authority (EEA Grade-5 Electromechanical Contractor), and Trade Bureau. TIN: 0072480301, Capital: 2,360,000.00 ETB.';
            return res.json({ reply: text, topic: 'licenses' });
        }
        const fallback = language === 'am'
            ? 'ስለ ሉሲኮም ቴክኖሎጂስ አ.ማ ላቀረቡት ጥያቄ እናመሰግናለን። ለበለጠ መረጃ በ+251 939997612 ወይም info@lucycomtechnologies.com በቀጥታ ሊያገኙን ይችላሉ።'
            : 'Thank you for your inquiry about LUCYCOM TECHNOLOGIES S.C. For detailed engineering proposals or inquiries, please contact our team at info@lucycomtechnologies.com or +251 939997612.';
        return res.json({ reply: fallback, topic: 'general' });
    }
    catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.handleChatbotQuery = handleChatbotQuery;
