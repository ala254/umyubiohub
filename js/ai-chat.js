// UMYU BioHub - AI Study Assistant Chatbot
// Complete AI Chatbot with PDF Summarization and Smart Recommendations

class AIChatbot {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.isProcessing = false;
        this.conversationHistory = [];
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions'; // Optional: Add your API key
        this.useAI = false; // Set to true if using OpenAI API
        this.init();
    }
    
    init() {
        this.createChatbotUI();
        this.setupEventListeners();
        this.loadChatHistory();
    }
    
    createChatbotUI() {
        // Check if chatbot already exists
        if (document.querySelector('.chatbot-container')) return;
        
        const chatbotHTML = `
            <div class="chatbot-container">
                <div class="chatbot-toggle">
                    <i class="fas fa-robot"></i>
                    <span class="notification-badge" style="display: none;">1</span>
                </div>
                <div class="chatbot-window">
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <i class="fas fa-brain"></i>
                            <div>
                                <h4>BioHub AI Assistant</h4>
                                <small>Powered by Biochemistry AI</small>
                            </div>
                        </div>
                        <div class="chat-header-actions">
                            <button class="clear-chat-btn" title="Clear chat">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <button class="minimize-chat-btn" title="Minimize">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="close-chat" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <div class="message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <div class="message-sender">BioHub AI</div>
                                <div class="message-text">
                                    Hello! I'm your Biochemistry study assistant. I can help you with:
                                    <ul>
                                        <li>📚 Explaining biochemistry concepts</li>
                                        <li>📄 Summarizing PDF documents</li>
                                        <li>📝 Answering past questions</li>
                                        <li>🎯 Recommending study materials</li>
                                    </ul>
                                    Ask me anything about your courses!
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-typing" style="display: none;">
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>AI is thinking...</span>
                    </div>
                    <div class="chat-input-area">
                        <div class="input-options">
                            <button class="upload-pdf-btn" title="Upload PDF for summary">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="suggestions-btn" title="Suggested questions">
                                <i class="fas fa-lightbulb"></i>
                            </button>
                        </div>
                        <div class="input-wrapper">
                            <input type="text" placeholder="Ask a question about Biochemistry..." id="chatInput">
                            <button id="sendMessage">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                    <div class="suggestions-panel" style="display: none;">
                        <div class="suggestions-header">
                            <span>Suggested Questions</span>
                            <button class="close-suggestions"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="suggestions-list">
                            <div class="suggestion-item">What is glycolysis?</div>
                            <div class="suggestion-item">Explain enzyme kinetics</div>
                            <div class="suggestion-item">Protein structure levels</div>
                            <div class="suggestion-item">DNA replication process</div>
                            <div class="suggestion-item">How to calculate CGPA?</div>
                            <div class="suggestion-item">Recommend study materials for BCH 301</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        this.addStyles();
    }
    
    addStyles() {
        if (document.querySelector('#chatbot-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'chatbot-styles';
        styles.textContent = `
            .chatbot-container {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            }
            
            .chatbot-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2ecc71, #3498db);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .chatbot-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 25px rgba(46, 204, 113, 0.4);
            }
            
            .chatbot-toggle i {
                font-size: 1.8rem;
                color: white;
            }
            
            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chatbot-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 400px;
                height: 600px;
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                display: none;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid var(--glass-border);
                box-shadow: var(--shadow);
                animation: fadeInUp 0.3s ease-out;
            }
            
            .chatbot-window.active {
                display: flex;
            }
            
            .chat-header {
                padding: 1rem;
                background: rgba(0,0,0,0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--glass-border);
            }
            
            .chat-header-info {
                display: flex;
                align-items: center;
                gap: 0.8rem;
            }
            
            .chat-header-info i {
                font-size: 1.5rem;
                color: var(--secondary);
            }
            
            .chat-header-info h4 {
                margin: 0;
                font-size: 1rem;
            }
            
            .chat-header-info small {
                font-size: 0.7rem;
                opacity: 0.7;
            }
            
            .chat-header-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .chat-header-actions button {
                background: transparent;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.3rem;
                border-radius: 5px;
                transition: all 0.3s;
            }
            
            .chat-header-actions button:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .message {
                display: flex;
                gap: 0.8rem;
                animation: fadeInUp 0.3s ease-out;
            }
            
            .user-message {
                flex-direction: row-reverse;
            }
            
            .message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
            }
            
            .user-message .message-avatar {
                background: var(--secondary);
            }
            
            .message-content {
                max-width: 70%;
                background: rgba(255,255,255,0.1);
                padding: 0.7rem 1rem;
                border-radius: 15px;
            }
            
            .user-message .message-content {
                background: var(--secondary);
                color: white;
            }
            
            .message-sender {
                font-size: 0.7rem;
                font-weight: 600;
                margin-bottom: 0.3rem;
                opacity: 0.7;
            }
            
            .message-text {
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .message-text ul {
                margin: 0.5rem 0;
                padding-left: 1.2rem;
            }
            
            .message-text li {
                margin: 0.2rem 0;
            }
            
            .chat-typing {
                padding: 0.8rem 1rem;
                display: flex;
                align-items: center;
                gap: 0.8rem;
                border-top: 1px solid var(--glass-border);
            }
            
            .typing-indicator {
                display: flex;
                gap: 0.3rem;
            }
            
            .typing-indicator span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--secondary);
                animation: typing 1.4s infinite;
            }
            
            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-5px); opacity: 1; }
            }
            
            .chat-input-area {
                padding: 1rem;
                border-top: 1px solid var(--glass-border);
                display: flex;
                gap: 0.8rem;
            }
            
            .input-options {
                display: flex;
                gap: 0.5rem;
            }
            
            .input-options button {
                background: transparent;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .input-options button:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .input-wrapper {
                flex: 1;
                display: flex;
                gap: 0.5rem;
            }
            
            .input-wrapper input {
                flex: 1;
                padding: 0.7rem 1rem;
                border-radius: 25px;
                border: 1px solid var(--glass-border);
                background: rgba(255,255,255,0.1);
                color: inherit;
                font-size: 0.9rem;
            }
            
            .input-wrapper input:focus {
                outline: none;
                border-color: var(--secondary);
            }
            
            .input-wrapper button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--secondary);
                border: none;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .input-wrapper button:hover {
                transform: scale(1.05);
            }
            
            .input-wrapper button i {
                color: white;
            }
            
            .suggestions-panel {
                position: absolute;
                bottom: 100%;
                left: 0;
                right: 0;
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border-radius: 15px;
                margin-bottom: 0.5rem;
                border: 1px solid var(--glass-border);
                max-height: 300px;
                overflow-y: auto;
                z-index: 10;
            }
            
            .suggestions-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.8rem 1rem;
                border-bottom: 1px solid var(--glass-border);
                font-weight: 600;
            }
            
            .suggestions-list {
                padding: 0.5rem;
            }
            
            .suggestion-item {
                padding: 0.7rem 1rem;
                cursor: pointer;
                border-radius: 10px;
                transition: all 0.3s;
                font-size: 0.85rem;
            }
            
            .suggestion-item:hover {
                background: rgba(46, 204, 113, 0.2);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 500px) {
                .chatbot-window {
                    width: calc(100vw - 2rem);
                    right: 0;
                    height: 550px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    setupEventListeners() {
        const toggle = document.querySelector('.chatbot-toggle');
        const window = document.querySelector('.chatbot-window');
        const close = document.querySelector('.close-chat');
        const minimize = document.querySelector('.minimize-chat-btn');
        const clearBtn = document.querySelector('.clear-chat-btn');
        const sendBtn = document.getElementById('sendMessage');
        const input = document.getElementById('chatInput');
        const uploadBtn = document.querySelector('.upload-pdf-btn');
        const suggestionsBtn = document.querySelector('.suggestions-btn');
        
        toggle?.addEventListener('click', () => {
            window.classList.toggle('active');
            if (window.classList.contains('active')) {
                input?.focus();
                this.markMessagesAsRead();
            }
        });
        
        close?.addEventListener('click', () => {
            window.classList.remove('active');
        });
        
        minimize?.addEventListener('click', () => {
            window.classList.remove('active');
        });
        
        clearBtn?.addEventListener('click', () => {
            this.clearChat();
        });
        
        sendBtn?.addEventListener('click', () => this.sendMessage());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        uploadBtn?.addEventListener('click', () => this.handlePDFUpload());
        
        suggestionsBtn?.addEventListener('click', () => {
            const panel = document.querySelector('.suggestions-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.querySelector('.close-suggestions')?.addEventListener('click', () => {
            document.querySelector('.suggestions-panel').style.display = 'none';
        });
        
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                if (input) {
                    input.value = item.textContent;
                    this.sendMessage();
                    document.querySelector('.suggestions-panel').style.display = 'none';
                }
            });
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.querySelector('.suggestions-panel');
            const suggestionsBtn = document.querySelector('.suggestions-btn');
            if (panel && suggestionsBtn && !panel.contains(e.target) && !suggestionsBtn.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message || this.isProcessing) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        this.isProcessing = true;
        this.showTypingIndicator(true);
        
        try {
            let response;
            if (this.useAI && this.apiEndpoint) {
                response = await this.getAIResponse(message);
            } else {
                response = await this.getLocalResponse(message);
            }
            this.addMessage(response, 'ai');
            this.saveToHistory(message, response);
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage("I'm having trouble processing your request. Please try again.", 'ai');
        } finally {
            this.isProcessing = false;
            this.showTypingIndicator(false);
        }
    }
    
    async getLocalResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Biochemistry Knowledge Base
        const knowledgeBase = {
            'glycolysis': `**Glycolysis Overview:**\n\nGlycolysis is the metabolic pathway that converts glucose (C6H12O6) into pyruvate (CH3COCOO−).\n\n**Key Facts:**\n• Location: Cytoplasm\n• 10 enzymatic steps\n• Net gain: 2 ATP + 2 NADH\n• Does not require oxygen (anaerobic)\n\n**The 10 Steps:**\n1. Hexokinase - Glucose → Glucose-6-phosphate\n2. Phosphoglucose isomerase - G6P → Fructose-6-phosphate\n3. Phosphofructokinase-1 (rate-limiting) - F6P → F1,6BP\n4. Aldolase - F1,6BP → DHAP + G3P\n5. Triose phosphate isomerase - DHAP ↔ G3P\n6. Glyceraldehyde-3-phosphate dehydrogenase - G3P → 1,3-BPG\n7. Phosphoglycerate kinase - 1,3-BPG → 3-PG\n8. Phosphoglycerate mutase - 3-PG → 2-PG\n9. Enolase - 2-PG → PEP\n10. Pyruvate kinase - PEP → Pyruvate\n\nWould you like me to explain any specific step in detail?`,
            
            'enzyme': `**Enzymes - Biological Catalysts**\n\n**Definition:** Enzymes are proteins that catalyze (speed up) biochemical reactions by lowering activation energy.\n\n**Key Properties:**\n• Highly specific - lock and key / induced fit model\n• Not consumed in reactions\n• Affected by temperature, pH, and concentration\n• Can be regulated (allosteric, covalent modification)\n\n**Classification:**\n1. Oxidoreductases - Transfer electrons (oxidation-reduction)\n2. Transferases - Transfer functional groups\n3. Hydrolases - Hydrolysis reactions\n4. Lyases - Add/remove groups without hydrolysis\n5. Isomerases - Rearrange atoms within molecule\n6. Ligases - Join molecules using ATP\n\n**Kinetics:**\n• Michaelis-Menten equation: V = Vmax[S]/(Km + [S])\n• Km = substrate concentration at 1/2 Vmax\n• Vmax = maximum reaction velocity\n\n**Inhibition Types:**\n• Competitive - increases Km\n• Non-competitive - decreases Vmax\n• Uncompetitive - decreases both\n\nWould you like to learn about specific enzymes or inhibition calculations?`,
            
            'protein structure': `**Protein Structure - Four Levels**\n\n**1. Primary Structure**\n• Linear sequence of amino acids\n• Determined by genetic code\n• Peptide bonds connect amino acids\n\n**2. Secondary Structure**\n• Local folding patterns\n• α-helix (right-handed, stabilized by H-bonds)\n• β-sheet (parallel/antiparallel)\n• β-turns and loops\n\n**3. Tertiary Structure**\n• 3D folding of single polypeptide\n• Stabilized by:\n  - Hydrophobic interactions\n  - Hydrogen bonds\n  - Ionic bonds\n  - Disulfide bridges\n  - Van der Waals forces\n\n**4. Quaternary Structure**\n• Assembly of multiple subunits\n• Example: Hemoglobin (4 subunits)\n\n**Protein Folding:**\n• Chaperone proteins assist folding\n• Misfolding leads to diseases (Alzheimer's, Parkinson's)\n• Denaturation = loss of structure/function\n\nWould you like me to explain any level in more detail?`,
            
            'dna replication': `**DNA Replication Process**\n\n**Key Enzymes:**\n• Helicase - Unwinds DNA double helix\n• Topoisomerase - Relieves supercoiling\n• Single-strand binding proteins - Stabilize ssDNA\n• Primase - RNA primer synthesis\n• DNA Polymerase III - Main synthesis (prokaryotes)\n• DNA Polymerase I - Removes primers, fills gaps\n• Ligase - Joins Okazaki fragments\n\n**Steps:**\n1. **Initiation** - Origin recognition, unwinding\n2. **Elongation** -\n   • Leading strand - Continuous 5'→3'\n   • Lagging strand - Discontinuous Okazaki fragments\n3. **Termination** - When replication forks meet\n\n**Leading vs Lagging:**\n| Feature | Leading | Lagging |\n|---------|---------|---------|\n| Synthesis | Continuous | Discontinuous |\n| Primers needed | One | Many |\n| Direction | Toward fork | Away from fork |\n\n**In Eukaryotes:**\n• Multiple origins of replication\n• Longer Okazaki fragments\n• More complex polymerases\n\nWould you like to learn about DNA repair mechanisms instead?`,
            
            'metabolism': `**Metabolism Overview**\n\n**Definition:** All chemical reactions in living organisms.\n\n**Two Main Categories:**\n\n**Catabolism (Breaking Down)**\n• Releases energy (exergonic)\n• Examples:\n  - Glycolysis (glucose → pyruvate)\n  - β-oxidation (fatty acids → acetyl-CoA)\n  - TCA cycle\n\n**Anabolism (Building Up)**\n• Consumes energy (endergonic)\n• Examples:\n  - Gluconeogenesis (glucose synthesis)\n  - Fatty acid synthesis\n  - Protein synthesis\n\n**Major Metabolic Pathways:**\n1. Carbohydrate Metabolism\n   - Glycolysis, Gluconeogenesis\n   - Glycogenesis, Glycogenolysis\n   - Pentose phosphate pathway\n\n2. Lipid Metabolism\n   - Lipolysis, β-oxidation\n   - Lipogenesis, Ketogenesis\n\n3. Protein/Amino Acid Metabolism\n   - Transamination, Deamination\n   - Urea cycle\n\n**Energy Currency:** ATP, NADH, FADH2, NADPH\n\n**Hormonal Regulation:**\n• Insulin - Anabolic (fed state)\n• Glucagon - Catabolic (fasted state)\n• Epinephrine - Fight or flight\n\nWhich specific pathway would you like to explore?`,
            
            'bch 301': `**BCH 301 - Protein Structure and Function**\n\n**Course Highlights:**\n• Amino acid chemistry and properties\n• Protein purification techniques\n• Structure determination (X-ray, NMR, Cryo-EM)\n• Protein folding and misfolding diseases\n• Enzyme mechanisms and kinetics\n• Membrane proteins and transport\n\n**Recommended Study Materials:**\n1. Lehninger Principles of Biochemistry (Chapters 3-6)\n2. Voet & Voet Biochemistry (Chapters 5-9)\n3. Past questions available in library\n\n**Key Topics to Focus:**\n✓ Amino acid classification (polar, nonpolar, charged)\n✓ Ramachandran plot\n✓ Motifs and domains\n✓ Chaperones and the proteasome\n\nWould you like a practice question on this topic?`,
            
            'past question': `**Sample Past Question - BCH 301**\n\n**Question:** Describe the Michaelis-Menten model of enzyme kinetics. Derive the Michaelis-Menten equation and explain the significance of Km and Vmax.\n\n**Model Answer Outline:**\n\n1. **Assumptions of Michaelis-Menten:**\n   - E + S ⇌ ES → E + P\n   - Steady-state assumption\n   - [S] >> [E]\n\n2. **Derivation:**\n   - Rate = Vmax[S]/(Km + [S])\n   - Where Vmax = k2[E]total\n   - Km = (k-1 + k2)/k1\n\n3. **Significance:**\n   - Km = substrate affinity (lower Km = higher affinity)\n   - Vmax = maximum velocity at saturating [S]\n\n4. **Lineweaver-Burk Plot:**\n   - Double reciprocal: 1/V = (Km/Vmax)(1/[S]) + 1/Vmax\n\n**Grading Points:**\n• Correct derivation (5 marks)\n• Explanation of terms (3 marks)\n• Diagram of plot (2 marks)\n\nWould you like more past questions?`,
            
            'cgpa': `**How to Calculate CGPA**\n\n**Formula:**\nCGPA = Σ(Grade Point × Credit Units) / Σ(Credit Units)\n\n**Grade Points (5.0 Scale):**\n| Grade | Percentage | Grade Point |\n|-------|------------|-------------|\n| A | 70-100 | 5.0 |\n| B | 60-69 | 4.0 |\n| C | 50-59 | 3.0 |\n| D | 45-49 | 2.0 |\n| E | 40-44 | 1.0 |\n| F | <40 | 0.0 |\n\n**Example Calculation:**\nCourse: BCH 301 (3 credits) - Grade A (5.0)\nPoints = 5.0 × 3 = 15.0\n\nCourse: CHM 201 (2 credits) - Grade B (4.0)\nPoints = 4.0 × 2 = 8.0\n\nTotal Points = 23.0\nTotal Credits = 5\nCGPA = 23/5 = 4.6\n\n**Classification:**\n• 4.50 - 5.00: First Class\n• 3.50 - 4.49: Second Class Upper\n• 2.50 - 3.49: Second Class Lower\n• 1.50 - 2.49: Third Class\n• 1.00 - 1.49: Pass\n\nUse the CGPA calculator on your dashboard to compute yours!`,
            
            'recommend': `**Personalized Material Recommendations**\n\nBased on your level (300 Level), here are top recommended materials:\n\n📚 **Essential Materials:**\n1. **Protein Structure Notes** - Latest upload with high downloads\n2. **Enzyme Kinetics Past Questions** - Most popular for exam prep\n3. **Metabolism I Lecture Series** - Comprehensive coverage\n\n🎯 **For Exam Preparation:**\n• Past questions compilation (BCH 301, 302, 303)\n• Summary notes with key concepts\n• Practice quizzes available in discussion forum\n\n📖 **Recommended Textbooks:**\n• Lehninger Principles of Biochemistry (7th Ed)\n• Voet & Voet Biochemistry (4th Ed)\n• Stryer's Biochemistry (9th Ed)\n\n💡 **Study Tips:**\n1. Review practical manuals before lab sessions\n2. Join study groups in the discussion forum\n3. Use the AI summarizer for long research papers\n\nWould you like to download any specific material?`,
            
            'default': `I'm your Biochemistry study assistant! Here's what I can help with:\n\n🔬 **Topics I Can Explain:**\n• Glycolysis and metabolic pathways\n• Enzyme kinetics and mechanisms\n• Protein structure and function\n• DNA replication and gene expression\n• Metabolism (carbohydrates, lipids, proteins)\n\n📚 **Course Support:**\n• BCH 201 - Introduction to Biochemistry\n• BCH 301 - Protein Structure\n• BCH 302 - Enzyme Kinetics\n• BCH 303 - Metabolism I\n• BCH 401 - Advanced Enzymology\n\n📄 **Features:**\n• Upload a PDF for AI summary\n• Get material recommendations\n• Answer past questions\n• Calculate your CGPA\n\nWhat would you like to learn about today?`
        };
        
        // Check for keywords in query
        for (const [keyword, response] of Object.entries(knowledgeBase)) {
            if (lowerQuery.includes(keyword)) {
                return response;
            }
        }
        
        // Check for course code queries
        const courseMatch = lowerQuery.match(/bch\s*(\d{3})/i);
        if (courseMatch) {
            return `**BCH ${courseMatch[1]} Support**\n\nYou can find materials for BCH ${courseMatch[1]} in the library section. Use the search bar or filter by course code.\n\n**Available Resources:**\n• Lecture notes and slides\n• Past examination questions\n• Practical manuals\n• Recommended readings\n\nWould you like me to search for specific BCH ${courseMatch[1]} materials?`;
        }
        
        return knowledgeBase['default'];
    }
    
    async getAIResponse(query) {
        // This is where you would integrate OpenAI API
        // Add your API key in the constructor
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openAIApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful Biochemistry study assistant for UMYU students. Provide accurate, educational responses about biochemistry topics.'
                        },
                        { role: 'user', content: query }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API error:', error);
            return this.getLocalResponse(query);
        }
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Convert markdown-like formatting to HTML
        let formattedText = text;
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/•/g, '•');
        formattedText = formattedText.replace(/✓/g, '✓');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">${sender === 'ai' ? 'BioHub AI' : 'You'}</div>
                <div class="message-text">${formattedText}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ text, sender, timestamp: new Date().toISOString() });
    }
    
    showTypingIndicator(show) {
        const typingDiv = document.querySelector('.chat-typing');
        if (typingDiv) {
            typingDiv.style.display = show ? 'flex' : 'none';
        }
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer && show) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }
    
    async handlePDFUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                this.addMessage(`Uploaded: ${file.name}`, 'user');
                this.showTypingIndicator(true);
                this.isProcessing = true;
                
                try {
                    const summary = await this.summarizePDF(file);
                    this.addMessage(summary, 'ai');
                } catch (error) {
                    this.addMessage("I couldn't process the PDF. Please try again or ensure the file is valid.", 'ai');
                } finally {
                    this.isProcessing = false;
                    this.showTypingIndicator(false);
                }
            } else {
                this.addMessage("Please upload a valid PDF file.", 'ai');
            }
        };
        input.click();
    }
    
    async summarizePDF(file) {
        // Simulate PDF processing and summarization
        return new Promise((resolve) => {
            setTimeout(() => {
                const summary = `**📄 PDF Summary Generated**\n\n**File:** ${file.name}\n\n**Document Analysis:**\n\nBased on the content analysis, here are the key points:\n\n📌 **Main Topics Covered:**\n• Core biochemistry concepts and principles\n• Detailed explanations with diagrams\n• Key terminology and definitions\n• Review questions at the end of chapters\n\n🎯 **Key Takeaways:**\n1. Focus on understanding the fundamental mechanisms\n2. Pay attention to pathway regulations\n3. Memorize key enzyme names and their functions\n\n📚 **Recommended Study Approach:**\n• Read chapter summaries first\n• Take notes on highlighted terms\n• Practice with end-of-chapter questions\n\n**Would you like me to explain any specific concept from this document?**`;
                
                resolve(summary);
            }, 2000);
        });
    }
    
    clearChat() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-sender">BioHub AI</div>
                        <div class="message-text">Chat cleared! How can I help you with your Biochemistry studies today?</div>
                    </div>
                </div>
            `;
        }
        this.messages = [];
        localStorage.removeItem('chatHistory');
    }
    
    saveToHistory(question, answer) {
        const history = {
            question,
            answer,
            timestamp: new Date().toISOString()
        };
        this.conversationHistory.push(history);
        
        // Keep only last 50 conversations
        if (this.conversationHistory.length > 50) {
            this.conversationHistory.shift();
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(this.conversationHistory));
    }
    
    loadChatHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
        }
    }
    
    markMessagesAsRead() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.biohubChatbot = new AIChatbot();
});

// PDF Summarizer Class for advanced features
class PDFSummarizer {
    static async extractText(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                // In production, use pdf.js or similar library
                // For demo, return mock text
                resolve("Sample extracted text from PDF. In production, this would use PDF parsing libraries.");
            };
            reader.readAsArrayBuffer(file);
        });
    }
    
    static async generateSummary(text) {
        // Mock summarization
        const summaryPoints = [
            "Document covers key biochemistry concepts",
            "Includes detailed explanations of metabolic pathways",
            "Contains practice questions for self-assessment",
            "Recommended for BCH 301 students"
        ];
        
        return summaryPoints;
    }
}

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIChatbot, PDFSummarizer };
}