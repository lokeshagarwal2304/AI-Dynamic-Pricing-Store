// AI Dynamic Pricing Store Chatbot Knowledge Base

interface KnowledgeBase {
  appOverview: {
    name: string;
    description: string;
    keyFeatures: string[];
  };
  techStack: {
    frontend: Record<string, string>;
    backend: Record<string, string>;
    aiMl: Record<string, string>;
  };
  dynamicPricing: {
    howItWorks: string;
    realWorldExample: {
      scenario: string;
      example: string;
    };
    factors: string[];
    benefits: string[];
  };
  features: Record<string, string>;
  installation: {
    prerequisites: string[];
    steps: string[];
    troubleshooting: string[];
  };
  userGuide: {
    gettingStarted: string;
    navigation: Record<string, string>;
    tips: string[];
  };
  faq: {
    question: string;
    answer: string;
  }[];
  quickReplies: string[];
  defaultResponses: {
    greeting: string;
    fallback: string;
    goodbye: string;
  };
}

export const chatbotKnowledge: KnowledgeBase = {
  // App Overview
  appOverview: {
    name: "AI Dynamic Pricing Store",
    description: "An intelligent e-commerce platform that uses advanced machine learning algorithms to automatically adjust product prices in real-time based on market demand, inventory levels, competitor pricing, and customer behavior patterns.",
    keyFeatures: [
      "Real-time dynamic pricing using AI/ML algorithms",
      "Comprehensive product catalog management",
      "Advanced analytics and performance dashboards",
      "User-friendly shopping cart and checkout system",
      "Admin panel for business intelligence",
      "Responsive design for mobile and desktop"
    ]
  },

  // Technical Stack
  techStack: {
    frontend: {
      framework: "React.js",
      styling: "Tailwind CSS",
      routing: "React Router",
      stateManagement: "Context API",
      components: "Custom UI components with Heroicons",
      theme: "Blue and purple gradient theme with dark/light mode"
    },
    backend: {
      runtime: "Node.js",
      framework: "FastAPI (Python)",
      database: "SQLite (can be configured for PostgreSQL/MongoDB)",
      authentication: "JWT tokens",
      api: "RESTful API architecture"
    },
    aiMl: {
      framework: "Python with scikit-learn",
      algorithm: "Random Forest Regressor",
      features: "Inventory level, competitor prices, sales history, ratings, seasonality",
      preprocessing: "Label encoding for categorical variables",
      deployment: "Real-time prediction endpoints"
    }
  },

  // Dynamic Pricing Algorithm
  dynamicPricing: {
    howItWorks: "Our AI-powered dynamic pricing system analyzes multiple data points in real-time to determine optimal product prices. The algorithm considers inventory levels, competitor pricing, historical sales data, product ratings, seasonality, and market demand patterns.",
    
    realWorldExample: {
      scenario: "E-commerce Electronics Store",
      example: "Imagine you're selling a popular smartphone. Our AI notices that:\n\n📊 **Data Analysis:**\n• Inventory is running low (only 15 units left)\n• Competitor prices increased by 5% this week\n• Historical data shows 40% higher demand on weekends\n• Product has 4.8-star rating with 500+ reviews\n\n🤖 **AI Decision:**\nThe algorithm calculates that demand is high and supply is limited, so it increases the price by 8% to maximize revenue while ensuring inventory lasts longer.\n\n💰 **Result:**\nInstead of selling out quickly at a low price, you maximize profit and maintain availability for more customers."
    },

    factors: [
      "Current inventory levels",
      "Competitor average pricing",
      "Sales performance (last 30 days)",
      "Product ratings and reviews",
      "Seasonal demand patterns",
      "Brand tier and positioning",
      "Material costs and margins"
    ],

    benefits: [
      "Maximize revenue and profitability",
      "Optimize inventory management",
      "Stay competitive in real-time",
      "Reduce manual pricing workload",
      "Respond quickly to market changes",
      "Improve customer satisfaction with fair pricing"
    ]
  },

  // Features Explanation
  features: {
    productListing: "Browse our comprehensive catalog with AI-optimized prices. Each product displays the base price, AI-suggested price, and savings percentage. Filter by category, price range, ratings, and more.",
    
    dashboard: "Access detailed analytics including sales performance, pricing trends, revenue optimization, and inventory insights. View real-time metrics and historical data to make informed business decisions.",
    
    cart: "Smart shopping cart that updates prices in real-time. Add items, adjust quantities, and see live pricing changes. Includes shipping calculations and tax estimates.",
    
    admin: "Comprehensive admin panel for managing products, viewing detailed analytics, monitoring AI model performance, and configuring pricing parameters.",
    
    modelPerformance: "Track AI model accuracy, prediction confidence scores, and performance metrics. Monitor how well the pricing algorithm is performing over time."
  },

  // Installation & Setup
  installation: {
    prerequisites: [
      "Node.js (v14 or higher)",
      "Python (v3.8 or higher)",
      "Git for version control",
      "Code editor (VS Code recommended)"
    ],
    
    steps: [
      "Clone the repository from GitHub",
      "Install frontend dependencies: npm install",
      "Install backend dependencies: pip install -r requirements.txt",
      "Set up environment variables",
      "Initialize the database",
      "Start the development servers",
      "Access the app at http://localhost:3000"
    ],
    
    troubleshooting: [
      "Ensure all dependencies are installed correctly",
      "Check Python and Node.js versions",
      "Verify database connection settings",
      "Clear browser cache if experiencing issues",
      "Check console for any error messages"
    ]
  },

  // User Guide
  userGuide: {
    gettingStarted: "Welcome to AI Dynamic Pricing Store! Start by browsing our product catalog, add items to your cart, and experience real-time price optimization. Use the search bar to find specific products or browse by category.",
    
    navigation: {
      products: "Browse all available products with AI-optimized pricing",
      dashboard: "View comprehensive analytics and business insights",
      performance: "Monitor AI model performance and accuracy metrics",
      cart: "Review selected items and proceed to checkout",
      profile: "Manage your account settings and preferences"
    },
    
    tips: [
      "Use filters to find products that match your criteria",
      "Check the 'AI Optimized' badge for the best deals",
      "Monitor the dashboard for pricing trends",
      "Enable notifications for price drops on favorite items",
      "Use the dark mode toggle for comfortable viewing"
    ]
  },

  // FAQ
  faq: [
    {
      question: "How accurate is the AI pricing algorithm?",
      answer: "Our AI model typically achieves 85-92% accuracy in price predictions. The system continuously learns from market data and user behavior to improve over time. You can monitor the model's performance in the Performance section."
    },
    {
      question: "How often do prices change?",
      answer: "Prices are recalculated in real-time based on market conditions. However, to prevent confusion, we typically update displayed prices every 15-30 minutes unless there are significant market changes."
    },
    {
      question: "Can I set minimum and maximum price limits?",
      answer: "Yes! Admins can configure price boundaries to ensure prices stay within acceptable ranges. This prevents extreme price fluctuations while still allowing AI optimization."
    },
    {
      question: "What data does the AI use for pricing decisions?",
      answer: "The AI analyzes inventory levels, competitor prices, historical sales, product ratings, seasonality, brand positioning, and material costs to determine optimal pricing."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We use industry-standard security measures including JWT authentication, encrypted data transmission, and secure database storage. Personal information is never shared with third parties."
    },
    {
      question: "Can I integrate this with my existing e-commerce platform?",
      answer: "Yes! Our system provides RESTful APIs that can be integrated with most e-commerce platforms. We also offer custom integration services for enterprise clients."
    },
    {
      question: "What happens if the AI makes a pricing mistake?",
      answer: "We have multiple safeguards including price limits, human oversight, and rollback capabilities. If you notice any issues, you can manually override prices or contact our support team."
    },
    {
      question: "Do I need technical knowledge to use this platform?",
      answer: "Not at all! The user interface is designed to be intuitive for non-technical users. However, some advanced features like model configuration may require basic technical understanding."
    }
  ],

  // Quick Replies
  quickReplies: [
    "How does dynamic pricing work?",
    "Show me a demo",
    "What is the tech stack?",
    "How do I get started?",
    "What are the main features?",
    "How accurate is the AI?",
    "Is my data secure?",
    "Can I set price limits?"
  ],

  // Default Responses
  defaultResponses: {
    greeting: "👋 Hi! I'm your AI Assistant for the AI Dynamic Pricing Store. I'm here to help you understand how our intelligent pricing platform works and answer any questions you might have!",
    
    fallback: "I'm not sure about that specific question, but I'm here to help! You can ask me about:\n\n• How dynamic pricing works\n• Technical details about our platform\n• Getting started guide\n• Features and capabilities\n• Pricing algorithm insights\n• Installation and setup\n\nWhat would you like to know more about?",
    
    goodbye: "Thank you for using AI Dynamic Pricing Store! Feel free to ask me anything else anytime. Have a great day! 😊"
  }
};

// Chatbot Response Generator
export class ChatbotEngine {
  private knowledge: KnowledgeBase;

  constructor() {
    this.knowledge = chatbotKnowledge;
  }

  generateResponse(userMessage: string): string {
    const message = userMessage.toLowerCase().trim();
    
    // Greeting patterns
    if (this.matchesPattern(message, ['hello', 'hi', 'hey', 'greetings'])) {
      return this.knowledge.defaultResponses.greeting;
    }

    // Goodbye patterns
    if (this.matchesPattern(message, ['bye', 'goodbye', 'see you', 'thanks', 'thank you'])) {
      return this.knowledge.defaultResponses.goodbye;
    }

    // Dynamic pricing explanation
    if (this.matchesPattern(message, ['dynamic pricing', 'how does', 'pricing work', 'algorithm'])) {
      return `🤖 **How Dynamic Pricing Works:**\n\n${this.knowledge.dynamicPricing.howItWorks}\n\n${this.knowledge.dynamicPricing.realWorldExample.example}\n\n📋 **Key Factors Considered:**\n${this.knowledge.dynamicPricing.factors.map(factor => `• ${factor}`).join('\n')}\n\n✅ **Benefits:**\n${this.knowledge.dynamicPricing.benefits.map(benefit => `• ${benefit}`).join('\n')}`;
    }

    // Tech stack questions
    if (this.matchesPattern(message, ['tech stack', 'technology', 'framework', 'built with'])) {
      const tech = this.knowledge.techStack;
      return `💻 **Tech Stack Overview:**\n\n**Frontend:**\n• Framework: ${tech.frontend.framework}\n• Styling: ${tech.frontend.styling}\n• Routing: ${tech.frontend.routing}\n• Theme: ${tech.frontend.theme}\n\n**Backend:**\n• Runtime: ${tech.backend.runtime}\n• Framework: ${tech.backend.framework}\n• Database: ${tech.backend.database}\n• API: ${tech.backend.api}\n\n**AI/ML:**\n• Framework: ${tech.aiMl.framework}\n• Algorithm: ${tech.aiMl.algorithm}\n• Features: ${tech.aiMl.features}`;
    }

    // Getting started
    if (this.matchesPattern(message, ['get started', 'how to start', 'begin', 'setup', 'install'])) {
      return `🚀 **Getting Started with AI Dynamic Pricing Store:**\n\n📋 **Prerequisites:**\n${this.knowledge.installation.prerequisites.map(req => `• ${req}`).join('\n')}\n\n🔧 **Installation Steps:**\n${this.knowledge.installation.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n💡 **Quick Tips:**\n${this.knowledge.userGuide.tips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}\n\nNeed help with any specific step?`;
    }

    // Features questions
    if (this.matchesPattern(message, ['features', 'what can', 'capabilities', 'functionality'])) {
      return `✨ **Main Features:**\n\n${this.knowledge.appOverview.keyFeatures.map(feature => `• ${feature}`).join('\n')}\n\n📊 **Core Components:**\n• **Product Listing:** ${this.knowledge.features.productListing}\n• **Dashboard:** ${this.knowledge.features.dashboard}\n• **Smart Cart:** ${this.knowledge.features.cart}\n• **Admin Panel:** ${this.knowledge.features.admin}\n\nWould you like me to explain any specific feature in detail?`;
    }

    // Demo questions
    if (this.matchesPattern(message, ['demo', 'example', 'show me', 'preview'])) {
      return `🎯 **Live Demo Available!**\n\nYou're already experiencing our AI Dynamic Pricing Store! Here's what you can explore:\n\n🛍️ **Try These Features:**\n• Browse the Products page to see AI-optimized prices\n• Check the Dashboard for analytics\n• Add items to your Cart and watch real-time updates\n• Toggle between light/dark themes\n• View the Performance metrics\n\n💡 **Demo Highlights:**\n• Real-time price calculations\n• Interactive product catalog\n• Responsive design\n• Modern UI with smooth animations\n\nWhat specific feature would you like me to guide you through?`;
    }

    // Accuracy questions
    if (this.matchesPattern(message, ['accurate', 'accuracy', 'reliable', 'performance'])) {
      const faqItem = this.knowledge.faq.find(item => 
        item.question.toLowerCase().includes('accurate')
      );
      return `📈 **AI Accuracy & Performance:**\n\n${faqItem.answer}\n\n🔍 **Additional Details:**\n• Model Type: Random Forest Regressor\n• Training Features: ${this.knowledge.dynamicPricing.factors.length}+ data points\n• Continuous Learning: Yes, the model improves over time\n• Performance Monitoring: Available in the Performance dashboard\n\nYou can view real-time model metrics in the Performance section!`;
    }

    // Security questions
    if (this.matchesPattern(message, ['secure', 'security', 'safe', 'data protection'])) {
      const faqItem = this.knowledge.faq.find(item => 
        item.question.toLowerCase().includes('secure')
      );
      return `🔐 **Security & Data Protection:**\n\n${faqItem.answer}\n\n🛡️ **Security Measures:**\n• JWT Authentication\n• Encrypted data transmission\n• Secure database storage\n• Regular security audits\n• Privacy-first approach\n\nYour data and privacy are our top priorities!`;
    }

    // Price limits questions
    if (this.matchesPattern(message, ['price limit', 'minimum', 'maximum', 'boundaries'])) {
      const faqItem = this.knowledge.faq.find(item => 
        item.question.toLowerCase().includes('limits')
      );
      return `⚙️ **Price Limits & Controls:**\n\n${faqItem.answer}\n\n🎛️ **Available Controls:**\n• Set minimum price thresholds\n• Configure maximum price caps\n• Define percentage change limits\n• Manual override capabilities\n• Real-time monitoring alerts\n\nThis ensures the AI stays within your business parameters!`;
    }

    // FAQ search
    const faqMatch = this.knowledge.faq.find(item => 
      this.matchesAnyWord(message, item.question.toLowerCase().split(' '))
    );
    if (faqMatch) {
      return `❓ **${faqMatch.question}**\n\n${faqMatch.answer}`;
    }

    // Default fallback
    return this.knowledge.defaultResponses.fallback;
  }

  matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some((pattern: string) => message.includes(pattern));
  }

  matchesAnyWord(message: string, words: string[]): boolean {
    return words.some((word: string) => word.length > 3 && message.includes(word));
  }

  getQuickReplies(): string[] {
    return this.knowledge.quickReplies;
  }

  getWelcomeMessage(): string {
    return this.knowledge.defaultResponses.greeting;
  }
}

export default ChatbotEngine;