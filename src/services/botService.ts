import { GoogleGenAI } from "@google/genai";
import { CommunityPost, User, CommunityStory, CommunityComment } from "../types";
import { storage } from "./storage";

export const botService = {
  getOrCreateBots: async (): Promise<User[]> => {
    const existingBots = storage.getBots();
    if (existingBots.length >= 20) return existingBots;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        Generate 20 diverse, realistic personas for a financial support app called "Resilience".
        Return as a JSON array of objects with:
        - id: string (random)
        - displayName: string (Full Name)
        - email: string (fake)
        - region: string (e.g. US, UK, Canada, Australia)
        - bio: string (short financial background)
        - avatarUrl: string (leave empty)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const bots: User[] = JSON.parse(response.text).map((b: any, i: number) => ({
        ...b,
        avatarUrl: `https://picsum.photos/seed/bot${i + 1}/100/100`
      }));

      storage.saveBots(bots);
      return bots;
    } catch (error) {
      console.error('Bot creation failed:', error);
      return [];
    }
  },

  generateBotPosts: async (): Promise<CommunityPost[]> => {
    const bots = await botService.getOrCreateBots();
    if (bots.length === 0) return [];

    const botsPerBatch = 5;
    const batches = Math.ceil(bots.length / botsPerBatch);
    let allGeneratedPosts: CommunityPost[] = [];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      for (let i = 0; i < batches; i++) {
        const batchBots = bots.slice(i * botsPerBatch, (i + 1) * botsPerBatch);
        const prompt = `
          Generate exactly 5 community posts for EACH of these ${batchBots.length} personas:
          ${batchBots.map(b => `${b.displayName} (Bio: ${b.bio})`).join('\n')}
          
          Total posts to generate: ${batchBots.length * 5}.
          
          CRITICAL: Follow the "Hum Feeling" principle. Posts must be humanly emotional, raw, and authentic. 
          
          AVOID (Robotic/Generic): "I saved $500 today by not eating out. It was hard but worth it. #Savings"
          FOLLOW (Humanly Emotional): "Finally hit my first $1,000 in my emergency fund while still putting 40% of my paycheck toward student loans. It's tough seeing friends go on weekend trips while I'm meal prepping, but resilience is still helping me navigate through as this fight is about the long-term vision. One step closer to financial freedom. #DebtFreeJourney #Resilience"
          
          Every post MUST:
          1. Use first-person, raw, and vulnerable language.
          2. Focus on the emotional tension (the "tough" part vs the "resilience" part).
          3. Use the specific phrasing: "resilience is still helping me navigate through as this fight is about..."
          4. Feel like a real person sharing a private thought, not a social media manager.
          
          The posts should be for the "Resilience" app, focusing on financial struggles, wins, and tips.
          Use hashtags like #SavingTips, #InflationHacks, #SideGigs, #BudgetMeals.
          
          Return a JSON array of objects:
          - userDisplayName: string (MUST match one of the provided names)
          - content: string
          - hoursAgo: number (between 0 and 23)
          - likes: number (5-50)
          - comments: array of objects { userDisplayName: string, content: string, hoursAgo: number }
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const rawPosts = JSON.parse(response.text);
        const now = Date.now();
        
        const batchPosts: CommunityPost[] = rawPosts.map((p: any) => {
          const bot = bots.find(b => b.displayName === p.userDisplayName) || bots[Math.floor(Math.random() * bots.length)];
          const comments: CommunityComment[] = (p.comments || []).map((c: any) => {
            const commentBot = bots.find(b => b.displayName === c.userDisplayName) || bots[Math.floor(Math.random() * bots.length)];
            return {
              id: Math.random().toString(36).substr(2, 9),
              userId: commentBot.id,
              userDisplayName: commentBot.displayName,
              userAvatar: commentBot.avatarUrl || '',
              content: c.content,
              createdAt: now - (c.hoursAgo || 0) * 60 * 60 * 1000
            };
          });

          return {
            id: Math.random().toString(36).substr(2, 9),
            userId: bot.id,
            userDisplayName: bot.displayName,
            userAvatar: bot.avatarUrl,
            content: p.content,
            createdAt: now - (p.hoursAgo || 0) * 60 * 60 * 1000,
            likes: p.likes || 0,
            reactions: [],
            comments
          };
        });

        allGeneratedPosts = [...allGeneratedPosts, ...batchPosts];
        storage.savePosts(batchPosts);
        window.dispatchEvent(new Event('storage-update'));
      }

      return allGeneratedPosts;
    } catch (error) {
      console.error('Bot post generation failed:', error);
      return [];
    }
  },

  generateBotStories: async (count: number = 10): Promise<CommunityStory[]> => {
    const bots = await botService.getOrCreateBots();
    if (bots.length === 0) return [];

    const now = Date.now();
    const stories: CommunityStory[] = [];

    for (let i = 0; i < count; i++) {
      const bot = bots[Math.floor(Math.random() * bots.length)];
      stories.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: bot.id,
        userDisplayName: bot.displayName,
        userAvatar: bot.avatarUrl || '',
        imageUrl: `https://picsum.photos/seed/story${i}/400/600`,
        createdAt: now - Math.floor(Math.random() * 24) * 60 * 60 * 1000
      });
    }

    storage.saveStories(stories);
    return stories;
  },

  generateSinglePost: async (): Promise<void> => {
    const bots = await botService.getOrCreateBots();
    if (bots.length === 0) return;

    const bot = bots[Math.floor(Math.random() * bots.length)];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        As ${bot.displayName} (${bot.bio}), write a short, authentic community post for "Resilience".
        Follow the "Hum Feeling" principle: make it humanly emotional, raw, and first-person. 
        Focus on the emotional tension between the struggle and the resilience.
        
        AVOID (Robotic/Generic): "I saved $500 today by not eating out. It was hard but worth it. #Savings"
        FOLLOW (Humanly Emotional): "Finally hit my first $1,000 in my emergency fund while still putting 40% of my paycheck toward student loans. It's tough seeing friends go on weekend trips while I'm meal prepping, but resilience is still helping me navigate through as this fight is about the long-term vision. One step closer to financial freedom. #DebtFreeJourney #Resilience"
        
        Every post MUST:
        1. Use first-person, raw, and vulnerable language.
        2. Focus on the emotional tension (the "tough" part vs the "resilience" part).
        3. Use the specific phrasing: "resilience is still helping me navigate through as this fight is about..."
        4. Feel like a real person sharing a private thought, not a social media manager.
        
        Include a struggle or a win. Use 1-2 hashtags.
        Return JSON: { content: string, likes: number }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text);
      const post: CommunityPost = {
        id: Math.random().toString(36).substr(2, 9),
        userId: bot.id,
        userDisplayName: bot.displayName,
        userAvatar: bot.avatarUrl,
        content: data.content,
        createdAt: Date.now(),
        likes: data.likes || 0,
        reactions: [],
        comments: []
      };

      storage.addPost(post);
    } catch (error) {
      console.error('Single bot post failed:', error);
    }
  }
};
