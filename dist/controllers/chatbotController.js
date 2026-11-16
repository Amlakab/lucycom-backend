"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatbotQuery = void 0;
const handleChatbotQuery = async (req, res) => {
    try {
        const { message, language = 'en' } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const q = message.toLowerCase().trim();
        // 1. Greetings (pure greeting without specific domain request)
        const isPureGreeting = (/^(hi|hello|hey|hiya|howdy|greetings|good\s*(morning|afternoon|evening|day)|yo|sup|what'?s\s*up)\b/i.test(q) ||
            /^(ሰላም|ሰላምታ|ጤና\s*ይስጥልኝ|እንደምን\s*(አለህ|አለሽ|አላችሁ|አደርክ|አመሸህ)|እንዴት\s*(ነህ|ነሽ|ናችሁ)|ሀይ|ሃይ|ሰላም\s*ነው)/i.test(q));
        const hasSpecificDomainKeyword = (q.includes('telecom') || q.includes('data') || q.includes('service') || q.includes('license') ||
            q.includes('where') || q.includes('address') || q.includes('price') || q.includes('quote') ||
            q.includes('project') || q.includes('education') || q.includes('security') || q.includes('partner') ||
            q.includes('news') || q.includes('ማማ') || q.includes('ቢሮ') || q.includes('አድራሻ') || q.includes('ፈቃድ') ||
            q.includes('ዋጋ') || q.includes('ትምህርት') || q.includes('ደህንነት') || q.includes('ስራ'));
        if (isPureGreeting && !hasSpecificDomainKeyword) {
            const text = language === 'am'
                ? 'ሰላም! 👋 እንኳን ወደ ሉሲኮም ቴክኖሎጂስ አ.ማ (LUCYCOM TECHNOLOGIES S.C.) በደህና መጡ። እኔ ሉሲቦት ነኝ፤ ዛሬ በምን ልርዳዎት? ስለ ቴሌኮም መሰረተ-ልማት፣ ዳታ ሴንተሮች፣ ዘመናዊ ትምህርት፣ የድርጅት ደህንነት፣ ፈቃዶች ወይም የዋጋ መጠየቂያ መጠየቅ ይችላሉ።'
                : 'Hello! 👋 Welcome to LUCYCOM TECHNOLOGIES S.C. I am LucyBot, your corporate assistant. How can I help you today? Ask me anything about our telecom infrastructure, data centers, smart education, security, licenses, or request a quote.';
            return res.json({ reply: text, topic: 'greeting' });
        }
        // 2. Gratitude / Courtesy
        if (q.includes('thank') || q.includes('thanks') || q.includes('thx') || q.includes('appreciate') ||
            q.includes('አመሰግናለሁ') || q.includes('እግዜር ይስጥልኝ') || q.includes('ተባረክ')) {
            const text = language === 'am'
                ? 'ምንም አይደል! 😊 ስለ ሉሲኮም ቴክኖሎጂስ ተጨማሪ ጥያቄ ካለዎት በማንኛውም ሰዓት ይጠይቁ። መልካም ቀን!'
                : "You're very welcome! 😊 If you have any further questions about Lucycom Technologies, feel free to ask anytime. Have a great day!";
            return res.json({ reply: text, topic: 'courtesy' });
        }
        // 3. Goodbye
        if (q.includes('bye') || q.includes('goodbye') || q.includes('see you') ||
            q.includes('ደህና ሁን') || q.includes('ደህና ሁኚ') || q.includes('ደህና ሁኑ') || q.includes('ቻው')) {
            const text = language === 'am'
                ? 'ደህና ሁኑ! 👋 ሉሲኮም ቴክኖሎጂስን ስላነጋገሩ እናመሰግናለን። በ +251 939997612 ወይም info@lucycomtechnologies.com ሊያገኙን ይችላሉ።'
                : 'Goodbye! 👋 Thank you for contacting Lucycom Technologies. Reach us anytime at info@lucycomtechnologies.com or +251 939997612.';
            return res.json({ reply: text, topic: 'goodbye' });
        }
        // 4. About Lucycom / Company Profile
        if (q.includes('who is lucycom') || q.includes('about lucycom') || q.includes('tell me about lucycom') ||
            q.includes('company profile') || q.includes('who are you') || q.includes('motto') || q.includes('slogan') ||
            q.includes('ስለ ሉሲኮም') || q.includes('ሉሲኮም ማን ነው') || q.includes('ስለ ኩባንያው') || q.includes('መፈክር')) {
            const text = language === 'am'
                ? 'ሉሲኮም ቴክኖሎጂስ አ.ማ በኢትዮጵያ ዓለም አቀፍ ደረጃቸውን የጠበቁ የICT፣ የቴሌኮም እና የዳታ ሴንተር መሰረተ-ልማቶችን በመንደፍ፣ በማቅረብና በመገንባት ላይ የተሰማራ ቀዳሚ የአክሲዮን ማህበር ነው።\n• መፈክር፦ «ሉሲ መገኛ፣ ሉሲኮም መዳረሻ»\n• ካፒታል፦ 2,360,000.00 ብር\n• TIN፦ 0072480301\n• ዋና መስሪያ ቤት፦ አዲስ አበባ፣ የካ ክፍለ ከተማ፣ ወረዳ 08፣ የቤት ቁጥር 158/406'
                : 'LUCYCOM TECHNOLOGIES S.C. is a premier Ethiopian share company dedicated to designing, supplying, building, and maintaining carrier-grade ICT, telecom, and data center infrastructure.\n• Motto: "Lucy the origin, LucyCom the destination"\n• Share Capital: 2,360,000.00 ETB\n• TIN: 0072480301\n• Headquarters: Yeka Sub-City, Woreda 08, House No. 158/406, Addis Ababa, Ethiopia.';
            return res.json({ reply: text, topic: 'about' });
        }
        // 5. Telecom
        if (q.includes('telecom') || q.includes('tower') || q.includes('mast') || q.includes('bts') ||
            q.includes('4g') || q.includes('5g') || q.includes('lte') || q.includes('microwave') ||
            q.includes('rf') || q.includes('drive test') || q.includes('ቴሌኮም') || q.includes('ማማ') ||
            q.includes('ተከላ') || q.includes('ድራይቭ ቴስት')) {
            const text = language === 'am'
                ? 'የቴሌኮም መሰረተ-ልማት ስራዎቻችን፦\n• የማማ ተከላ (እስከ 60 ሜትር ከፍታ የላቲስ እና ሞኖፖል ማማዎች)\n• 4G/5G LTE የሬዲዮ ተከላ፣ የአንቴና ማስተካከልና የVSWR ፍተሻ\n• የማይክሮዌቭ ትራንስሚሽን መስመሮች\n• የድራይቭ ቴስት ጥራት ማረጋገጫ (99.8% የማለፊያ ምጣኔ)\n• የፋይበር መስመር ዝርጋታ።'
                : 'Telecom Infrastructure & Mobile Network Rollout:\n• Mast & Tower Erection (up to 60m lattice & monopole masts)\n• 4G/5G LTE Radio Access Base Station Commissioning\n• Microwave Transmission Links & Antenna Feeder Alignment\n• RF Drive Testing & Quality Acceptance (99.8% pass rate across 120+ sites)\n• Fiber Optic Backhaul & OTDR Testing.';
            return res.json({ reply: text, topic: 'telecom' });
        }
        // 6. Data Center
        if (q.includes('data center') || q.includes('datacenter') || q.includes('cooling') ||
            q.includes('crac') || q.includes('ups') || q.includes('tier') || q.includes('cabling') ||
            q.includes('ዳታ ሴንተር') || q.includes('ማቀዝቀዣ') || q.includes('ዩፒኤስ')) {
            const text = language === 'am'
                ? 'ደረጃቸውን የጠበቁ Tier II/III ዳታ ሴንተሮች፦\n• ትክክለኛ የኢን-ሮው CRAC ማቀዝቀዣዎች እና የሆት/ኮልድ አይል ማቆያ ስርዓቶች\n• ሞጁላር N+1 የመስመር ላይ ዩፒኤሶች እና አውቶሜትድ ጀነሬተሮች\n• እስከ 100Gbps ፍጥነት የሚደግፉ የCat6A እና የOM4/OS2 MPO የፋይበር መስመሮች\n• የFM-200 ጋዝ እሳት አደጋ መከላከያ እና የVESDA ጭስ መለያ ስርዓት።'
                : 'Tier II/III Data Center & Datacom Infrastructure:\n• Precision In-Row CRAC Cooling with Hot/Cold Aisle Containment (PUE < 1.35)\n• Modular N+1 Online Double-Conversion UPS & Cummins Generator Sync\n• High-Density OM4 / OS2 MPO Pre-Terminated Fiber Backbones\n• FM-200 / Novec Clean Agent Fire Suppression & VESDA Early Warning.';
            return res.json({ reply: text, topic: 'datacenter' });
        }
        // 7. Smart Education & VDI
        if (q.includes('education') || q.includes('classroom') || q.includes('vdi') ||
            q.includes('smart board') || q.includes('interactive') || q.includes('lecture') ||
            q.includes('ትምህርት') || q.includes('ስማርት ቦርድ') || q.includes('ላብራቶሪ')) {
            const text = language === 'am'
                ? 'ዘመናዊ ትምህርት እና VDI የኮምፒውተር ላብራቶሪዎች፦\n• 4K በይነ-መረብ ስማርት ቦርዶች (65" - 86")\n• አውቶሜትድ ሌክቸር ቀረጻ በAI ካሜራዎች\n• OS-Easy VDI የኮምፒውተር ላብራቶሪ (የኮምፒውተር ጥገና ወጪን በ70% የሚቀንስ)\n• ዘመናዊ ዲጂታል ፖዲየሞች።'
                : 'Smart Education & Campus Digitalization:\n• 4K Interactive Flat Panels (65" to 86" multi-touch displays)\n• Automated Multi-Angle AI Lecture Recording Pods\n• OS-Easy VDI Computer Labs (consolidating 150+ PCs onto central servers, cutting maintenance by 70%)\n• Digital Presenter Podiums & Unified Audio-Visual Classrooms.';
            return res.json({ reply: text, topic: 'education' });
        }
        // 8. Security & CCTV
        if (q.includes('security') || q.includes('cctv') || q.includes('camera') ||
            q.includes('firewall') || q.includes('surveillance') || q.includes('facial') ||
            q.includes('ደህንነት') || q.includes('ሲሲቲቪ') || q.includes('ካሜራ') || q.includes('ፋየርዎል')) {
            const text = language === 'am'
                ? 'የድርጅት ደህንነት እና AI ሲሲቲቪ ቅኝት፦\n• የሰው ፊት እና የተሽከርካሪ ታርጋ የሚለዩ 4K AI ካሜራዎች\n• የዙሪያ ድንበር ጥሰቶችን በራስ-ሰር የሚያሳውቁ ስርዓቶች (Perimeter Tripwire)\n• ማዕከላዊ የቪዲዮ ቁጥጥር ማዕከል (VMS Video Wall)\n• ቀጣይ ትውልድ ፋየርዎል (Fortinet/Cisco NGFW) እና የባዮሜትሪክ መግቢያ በሮች።'
                : 'Enterprise Cybersecurity & AI Surveillance:\n• Deep-Learning 4K AI Cameras with Real-Time Facial Recognition\n• Automated Perimeter Tripwire Intrusion Detection\n• Enterprise Video Wall Operations Command Centers (VMS)\n• Next-Generation Firewalls (Fortinet FortiGate & Cisco Firepower) with Zero-Trust & Biometric Access Gates.';
            return res.json({ reply: text, topic: 'security' });
        }
        // 9. Licenses & Accreditations
        if (q.includes('license') || q.includes('certif') || q.includes('legal') || q.includes('tin') ||
            q.includes('eca') || q.includes('eea') || q.includes('proclamation') ||
            q.includes('ፈቃድ') || q.includes('ምስክር') || q.includes('ህጋዊ') || q.includes('ቲን')) {
            const text = language === 'am'
                ? 'ህጋዊ ምዝገባዎች እና ይፋዊ ፈቃዶች፦\n1. የኢትዮጵያ ኮሙኒኬሽን ባለስልጣን (ECA) የውጭ ቴሌኮም ተከላና ጥገና ፈቃድ (አዋጅ 1148/2011)\n2. የኢትዮጵያ ኤነርጂ ባለስልጣን (EEA) የኤሌክትሮሜካኒካል ተቋራጭ ደረጃ-5 ፈቃድ (አዋጅ 686/2002)\n3. የአዲስ አበባ ንግድ ቢሮ ፈቃዶች (የኔትወርክ ዲዛይን፣ የICT ማማከር፣ የሶፍትዌር ልማት)\n4. የንግድ ሚኒስቴር የኮሙኒኬሽን እቃዎች አስመጪነት ፈቃድ\n• TIN: 0072480301 | ካፒታል: 2,360,000.00 ብር'
                : 'Official Licenses & Accreditations:\n1. Ethiopian Communications Authority (ECA) Outdoor Telecom Installation & Maintenance License (Proclamation 1148/2019)\n2. Ethiopian Energy Authority (EEA) Electromechanical Contractor Grade-Five Competency Certificate (Proclamation 686/2010)\n3. Trade Bureau Licenses: Computer Network Design (Code 85121), ICT Consultancy (Code 86521), Software Development (Code 39141)\n4. Ministry of Trade: Telecom & Hardware Importation License\n• TIN: 0072480301 | Share Capital: 2,360,000.00 ETB';
            return res.json({ reply: text, topic: 'licenses' });
        }
        // 10. Projects
        if (q.includes('project') || q.includes('track') || q.includes('record') ||
            q.includes('ፕሮጀክት') || q.includes('ስራዎች') || q.includes('ተሞክሮ')) {
            const text = language === 'am'
                ? 'በስኬት የተጠናቀቁ የሉሲኮም ፕሮጀክቶች፦\n• በ120+ ጣቢያዎች ላይ የቴሌኮም ተከላና የድራይቭ ቴስት በ99.8% የጥራት ማለፊያ ምጣኔ ተጠናቋል\n• የዩኒቨርሲቲ Tier-II/III ሞጁላር ዳታ ሴንተር እና የፋይበር መስመር ዝርጋታ\n• ዘመናዊ የመማሪያ ክፍሎች እና የVDI ኮምፒውተር ላብራቶሪዎች\n• 250+ የAI ካሜራዎች ከማዕከላዊ የቁጥጥር ማዕከል ጋር ተዘርግተዋል።'
                : 'Key Completed Projects by LUCYCOM:\n• Turnkey BTS Rollout across 120+ Telecom Sites with 99.8% quality pass rate on drive tests\n• University Modular Tier-II/III Data Center & Campus Fiber Backbone\n• Smart Classroom & VDI Modernization across higher education institutions\n• 250+ AI CCTV Surveillance & Perimeter Defense Deployment.';
            return res.json({ reply: text, topic: 'projects' });
        }
        // 11. Location / Address
        if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('office') ||
            q.includes('አድራሻ') || q.includes('የት') || q.includes('ቢሮ') || q.includes('ቦታ')) {
            const text = language === 'am'
                ? 'የዋና መስሪያ ቤት አድራሻ፦ አዲስ አበባ፣ የካ ክፍለ ከተማ፣ ወረዳ 08፣ የቤት ቁጥር 158/406፣ ኢትዮጵያ።\nስልክ፦ +251 939997612 / +251 911510295 / +251 911828830\nኢሜይል፦ info@lucycomtechnologies.com'
                : 'Headquarters Address: Yeka Sub-City, Woreda 08, House No. 158/406, Addis Ababa, Ethiopia.\nDirect Phone: +251 939997612 / +251 911510295 / +251 911828830\nEmail: info@lucycomtechnologies.com.';
            return res.json({ reply: text, topic: 'location' });
        }
        // 12. Requests / Quotes / Pricing
        if (q.includes('request') || q.includes('quote') || q.includes('price') || q.includes('cost') ||
            q.includes('order') || q.includes('estimate') || q.includes('ዋጋ') || q.includes('መጠየቅ') || q.includes('ማዘዝ')) {
            const text = language === 'am'
                ? 'የዋጋ መጠየቂያ ለማቅረብ ወይም አገልግሎት ለማዘዝ፦\n1. በድረ-ገጻችን የላይኛው ማውጫ ላይ የሚገኘውን «አገልግሎት ይጠይቁ (Requests)» የሚለውን ተጠቅመው የሚፈልጉትን አገልግሎት ይምረጡ።\n2. የኮንታክት ቅጻችንን ይሙሉ፤ የኢንጂነሪንግ ክፍላችን በ24 ሰዓት ውስጥ ይፋዊ ፕሮፖዛል ያዘጋጃል።\n3. በስልክ ቁጥር +251 939997612 በቀጥታ መደወል ይችላሉ።'
                : 'To request a solution or official quotation:\n1. Use the new "Requests" dropdown in our top navigation bar to choose your specialized solution (Telecom, Data Center, Smart Education, Security, Solar, or Consultancy).\n2. Fill out our online Contact form with your project scope — our engineering desk responds within 24 hours.\n3. Call our direct technical lines at +251 939997612 or +251 911510295.';
            return res.json({ reply: text, topic: 'quote' });
        }
        // Fallback contextual response
        const fallback = language === 'am'
            ? 'ስለ ሉሲኮም ቴክኖሎጂስ አ.ማ ትክክለኛውን መረጃ ለመስጠት ዝግጁ ነኝ። እባክዎ ማወቅ የሚፈልጉትን ርዕስ በግልጽ ይጥቀሱልኝ (ለምሳሌ፡ የቴሌኮም ስራዎች፣ ዳታ ሴንተሮች፣ ዘመናዊ ትምህርት፣ የደህንነት ካሜራዎች፣ ህጋዊ ፈቃዶች፣ አድራሻ ወይም አገልግሎት መጠየቂያ)።'
            : "I want to make sure I give you the exact details you need about LUCYCOM TECHNOLOGIES S.C. Could you please specify which area you'd like to explore? (e.g. Telecom Infrastructure, Tier II/III Data Centers, Smart Classrooms, Enterprise Security, Licenses, Location, or Requesting a Quote).";
        return res.json({ reply: fallback, topic: 'general' });
    }
    catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.handleChatbotQuery = handleChatbotQuery;
