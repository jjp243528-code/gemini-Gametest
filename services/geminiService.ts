import { GoogleGenAI } from "@google/genai";
import { GameEntry } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeGameStrategy = async (entry: GameEntry): Promise<string> => {
  if (!apiKey) {
    return "API Key 未配置，无法使用 AI 分析功能。";
  }

  try {
    // Format the dynamic groups into a readable string
    const adStrategyDescription = entry.adGroups.map((group, index) => {
      const attrs = group.attributes.map(attr => `- ${attr.key}: ${attr.value}`).join('\n');
      return `[广告模块 ${index + 1}: ${group.name}]\n${attrs}`;
    }).join('\n\n');

    const prompt = `
      作为一个专业的移动游戏商业化分析师，请根据以下试玩数据对该游戏的广告变现策略进行简短的专业分析和总结。
      请重点关注：广告对用户体验的影响、变现的激进程度以及潜在的改进建议。

      游戏名称: ${entry.gameName}
      游戏类型: ${entry.genre}
      
      === 广告策略详情 ===
      ${adStrategyDescription}
      
      === 试玩备注 ===
      ${entry.notes}

      请用中文输出一段约 100-150 字的分析报告。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "无法生成分析。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 分析请求失败，请稍后重试。";
  }
};