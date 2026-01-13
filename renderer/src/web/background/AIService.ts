import { AppConfig } from '../Config'
import type { ParsedItem } from '@/parser/ParsedItem'

export interface AIInsightRequest {
  item: ParsedItem
  priceData?: {
    meanPrice?: number
    medianPrice?: number
    listingCount?: number
    currency?: string
  }
  context?: string
}

export interface AIInsightResponse {
  insight: string
  confidence: number
  timestamp: number
  error?: string
}

class AIServiceClass {
  private requestCache = new Map<string, AIInsightResponse>()
  private readonly CACHE_TTL = 1000 * 60 * 30 // 30 minutes

  async getPriceInsight(request: AIInsightRequest): Promise<AIInsightResponse> {
    const config = AppConfig()

    if (!config.aiAssistant.enabled) {
      return {
        insight: 'AI Assistant is disabled. Enable it in settings.',
        confidence: 0,
        timestamp: Date.now(),
        error: 'AI_DISABLED'
      }
    }

    if (!config.aiAssistant.apiKey) {
      return {
        insight: 'No API key configured. Please add your Anthropic API key in settings.',
        confidence: 0,
        timestamp: Date.now(),
        error: 'NO_API_KEY'
      }
    }

    if (!config.aiAssistant.features.priceInsights) {
      return {
        insight: 'Price insights feature is disabled.',
        confidence: 0,
        timestamp: Date.now(),
        error: 'FEATURE_DISABLED'
      }
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(request)
    const cached = this.requestCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached
    }

    try {
      const response = await this.callAnthropicAPI(request)
      this.requestCache.set(cacheKey, response)
      return response
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        insight: `Error generating insights: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        timestamp: Date.now(),
        error: 'API_ERROR'
      }
    }
  }

  private async callAnthropicAPI(request: AIInsightRequest): Promise<AIInsightResponse> {
    const config = AppConfig()
    const prompt = this.buildPriceInsightPrompt(request)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.aiAssistant.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.aiAssistant.model,
        max_tokens: config.aiAssistant.maxTokens,
        temperature: config.aiAssistant.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Anthropic API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    const insight = data.content?.[0]?.text || 'No insight generated'

    return {
      insight,
      confidence: 0.85,
      timestamp: Date.now()
    }
  }

  private buildPriceInsightPrompt(request: AIInsightRequest): string {
    const { item, priceData } = request

    let prompt = `You are an expert Path of Exile 2 trading assistant. Analyze this item and provide concise pricing insights.

**Item Details:**
- Name: ${item.name || 'Unknown'}
- Base Type: ${item.baseType || 'Unknown'}
- Rarity: ${item.rarity || 'Unknown'}
- Item Level: ${item.itemLevel || 'Unknown'}
`

    if (item.category) {
      prompt += `- Category: ${item.category}\n`
    }

    if (item.props?.quality) {
      prompt += `- Quality: ${item.props.quality}%\n`
    }

    if (item.sockets?.length) {
      prompt += `- Sockets: ${item.sockets.length}\n`
    }

    // Add modifiers
    if (item.modifiers?.implicit?.length) {
      prompt += `\n**Implicit Modifiers:**\n`
      item.modifiers.implicit.forEach(mod => {
        prompt += `- ${mod.text}\n`
      })
    }

    if (item.modifiers?.explicit?.length) {
      prompt += `\n**Explicit Modifiers:**\n`
      item.modifiers.explicit.forEach(mod => {
        prompt += `- ${mod.text}\n`
      })
    }

    if (priceData) {
      prompt += `\n**Market Data:**\n`
      if (priceData.meanPrice) {
        prompt += `- Mean Price: ${priceData.meanPrice} ${priceData.currency || 'chaos'}\n`
      }
      if (priceData.medianPrice) {
        prompt += `- Median Price: ${priceData.medianPrice} ${priceData.currency || 'chaos'}\n`
      }
      if (priceData.listingCount) {
        prompt += `- Listings Available: ${priceData.listingCount}\n`
      }
    }

    prompt += `\n**Task:**
Provide a brief 2-3 sentence analysis covering:
1. Why this item is priced at this level (key valuable stats, meta relevance, rarity)
2. Whether it's a good deal, overpriced, or fairly priced
3. What type of builds would want this item

Keep it concise and actionable. Focus on the most important factors affecting price.`

    return prompt
  }

  private generateCacheKey(request: AIInsightRequest): string {
    const itemKey = `${request.item.name}-${request.item.rarity}-${request.item.itemLevel}`
    const priceKey = request.priceData ?
      `${request.priceData.meanPrice}-${request.priceData.medianPrice}` :
      'no-price'
    return `${itemKey}-${priceKey}`
  }

  clearCache(): void {
    this.requestCache.clear()
  }
}

export const AIService = new AIServiceClass()
