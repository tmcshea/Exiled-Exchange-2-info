# AI Assistant Integration

This document describes the AI-powered features added to Exiled Exchange 2.

## Overview

The AI Assistant integration adds intelligent price insights and item analysis powered by Anthropic's Claude AI. This helps players make better trading decisions by providing context about item pricing, market trends, and value assessments.

## Features

### Price Insights & Context (✅ Implemented)

When checking an item's price, the AI Assistant provides:
- **Price Explanation**: Why the item is priced at its current level
- **Value Assessment**: Whether it's a good deal, overpriced, or fairly priced
- **Build Recommendations**: What types of builds would want this item
- **Market Context**: Analysis of key stats affecting the price

The insights appear automatically in the price check window when enabled.

### Coming Soon

- **Item Analysis**: Detailed breakdown of item stats and modifiers
- **Build Suggestions**: Comprehensive build recommendations
- **Chat Assistant**: Interactive chat for questions about items and game mechanics

## Setup

### 1. Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-ant-api03-...`)

### 2. Configure in Exiled Exchange 2

1. Open Exiled Exchange 2
2. Click the settings icon (gear icon)
3. Navigate to **AI Assistant** in the left menu
4. Check **"Enable AI Assistant"**
5. Paste your API key in the **API Key** field
6. Choose your preferred model (Claude 3.5 Sonnet recommended)
7. Enable **"Price Insights & Context"**
8. Click **Save**

### 3. Usage

Once configured:
1. Hover over an item in Path of Exile 2
2. Press your price check hotkey (default: Ctrl+D)
3. The AI insights will appear below the price trend chart
4. The AI analyzes the item and provides contextual insights

## Configuration Options

### Models

- **Claude 3.5 Sonnet** (Recommended)
  - Best balance of speed, quality, and cost
  - ~$0.001-0.003 per price check

- **Claude 3.5 Haiku**
  - Faster and cheaper
  - Good for quick insights
  - ~$0.0005-0.001 per price check

- **Claude 3 Opus**
  - Most capable model
  - Slower and more expensive
  - ~$0.003-0.010 per price check

### Advanced Settings

- **Max Tokens**: Controls response length (256-2048)
  - Higher = longer responses but costs more
  - Recommended: 1024

- **Temperature**: Controls creativity (0.0-1.0)
  - Lower = more focused and consistent
  - Higher = more creative and varied
  - Recommended: 0.7

## Cost Considerations

The AI Assistant uses Anthropic's API which incurs usage costs:

- Typical cost per price check: **$0.001-0.003 USD**
- 100 price checks: ~$0.10-0.30
- 1000 price checks: ~$1.00-3.00

**Tips to minimize costs:**
- Insights are cached for 30 minutes per unique item
- Use Claude 3.5 Haiku for routine checks
- Disable AI insights when not needed
- Monitor usage at [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)

## Technical Architecture

### Components

1. **AIService.ts** (`renderer/src/web/background/AIService.ts`)
   - Core service for AI API calls
   - Handles caching and error handling
   - Builds prompts with item and market data

2. **AIPriceInsights.vue** (`renderer/src/web/price-check/ai-insights/AIPriceInsights.vue`)
   - Vue component for displaying AI insights
   - Shows loading states and errors
   - Integrated into price check window

3. **AI Settings** (`renderer/src/web/settings/ai-assistant.vue`)
   - Configuration panel for AI features
   - API key management
   - Feature toggles and advanced settings

4. **Config Extension** (`renderer/src/web/Config.ts`)
   - Added `aiAssistant` configuration object
   - Config version bumped to 30
   - Automatic migration for existing configs

### Data Flow

```
1. User triggers price check (Ctrl+D)
2. Item is parsed and price data fetched
3. If AI enabled, AIPriceInsights component activates
4. AIService builds prompt with item details
5. Anthropic API call (with caching)
6. Response displayed to user
```

### Caching

- Insights are cached for 30 minutes per unique item
- Cache key: `${item.name}-${item.rarity}-${item.itemLevel}-${priceData}`
- Automatic cache invalidation after TTL
- Manual refresh available via UI button

## Privacy & Security

- API keys are stored locally in your AppData configuration
- Keys are never logged or transmitted except to Anthropic API
- No item data is stored on external servers
- All AI processing happens via Anthropic's API

## Development

### Running with AI Integration

```bash
# Install dependencies
cd renderer
npm install

# Start development server
npm run dev

# In another terminal
cd main
npm install
npm run dev
```

### Testing AI Features

1. Enable AI in settings (use test API key)
2. Check various item types:
   - Unique items
   - Rare items with multiple mods
   - Currency items
   - Maps

3. Verify:
   - Insights appear correctly
   - Caching works (same item = instant response)
   - Error handling (invalid API key, network errors)

### Adding New AI Features

To add a new AI feature:

1. Add feature flag to `Config.ts`:
```typescript
features: {
  priceInsights: boolean;
  yourNewFeature: boolean;  // Add here
}
```

2. Create service method in `AIService.ts`:
```typescript
async getYourNewFeature(request: YourRequest): Promise<YourResponse> {
  // Implementation
}
```

3. Create Vue component in appropriate location

4. Add toggle in `ai-assistant.vue` settings

## Troubleshooting

### AI insights not showing

1. Check AI Assistant is enabled in settings
2. Verify API key is configured correctly
3. Check "Price Insights & Context" is enabled
4. Look for error messages in the AI insights panel

### API errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Anthropic API issue (retry)

### Performance issues

- Reduce `maxTokens` for faster responses
- Use Claude 3.5 Haiku for better speed
- Check network connection

## Future Enhancements

### Planned Features

- [ ] Local LLM support (Ollama)
- [ ] OpenAI GPT integration
- [ ] Item analysis feature
- [ ] Build suggestions feature
- [ ] Chat assistant widget
- [ ] Batch analysis for stash tabs
- [ ] Price prediction improvements
- [ ] Multi-language support for AI responses

### Integration Ideas

- Enhance with poe.ninja data for better market context
- Add trade history analysis
- Meta build detection
- Craft simulation suggestions
- Economic trend analysis

## Contributing

To contribute to AI features:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/ai-enhancement`
3. Make your changes
4. Test thoroughly with various items
5. Submit a pull request

## License

Same as Exiled Exchange 2 main project.

## Credits

- Anthropic Claude AI for powering intelligent insights
- Original Exiled Exchange 2 by Garrett Parker
- Awakened PoE Trade by SnosMe (upstream project)

## Support

For issues or questions:
- GitHub Issues: [github.com/Kvan7/Exiled-Exchange-2/issues](https://github.com/Kvan7/Exiled-Exchange-2/issues)
- Check existing issues for AI-related problems
- Provide error messages and console logs when reporting bugs
