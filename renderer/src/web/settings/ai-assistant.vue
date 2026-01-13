<template>
  <div class="max-w-2xl p-4">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2 flex items-center gap-2">
        <i class="fas fa-brain text-purple-400"></i>
        AI Assistant Settings
      </h2>
      <p class="text-gray-400 text-sm">
        Configure AI-powered features to enhance your trading experience with intelligent insights and analysis.
      </p>
    </div>

    <!-- Enable AI Assistant -->
    <div class="mb-6 p-4 bg-gray-700 rounded">
      <ui-checkbox class="mb-2" v-model="enabled">
        <span class="text-lg">Enable AI Assistant</span>
      </ui-checkbox>
      <p class="text-gray-400 text-sm ml-6">
        Turn on AI-powered features for item analysis and price insights
      </p>
    </div>

    <template v-if="enabled">
      <!-- API Configuration -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">API Configuration</h3>

        <div class="mb-4">
          <div class="flex-1 mb-1 font-medium">AI Provider</div>
          <select v-model="provider" class="p-2 rounded bg-gray-700 w-48">
            <option value="anthropic">Anthropic Claude</option>
            <option value="openai" disabled>OpenAI GPT (Coming Soon)</option>
            <option value="ollama" disabled>Local LLM (Coming Soon)</option>
          </select>
          <p class="text-gray-400 text-xs mt-1">
            Currently only Anthropic Claude is supported
          </p>
        </div>

        <div class="mb-4">
          <div class="flex-1 mb-2 font-medium">
            API Key
            <span class="text-red-400">*</span>
          </div>
          <input
            v-model="apiKey"
            type="password"
            class="rounded bg-gray-900 px-3 py-2 block w-full font-mono text-sm"
            placeholder="sk-ant-api03-..."
          />
          <p class="text-gray-400 text-xs mt-1">
            Get your API key from
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              class="text-purple-400 hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
          <p v-if="!apiKey" class="text-orange-400 text-xs mt-1">
            <i class="fas fa-exclamation-triangle"></i>
            API key is required for AI features to work
          </p>
        </div>

        <div class="mb-4">
          <div class="flex-1 mb-1 font-medium">Model</div>
          <select v-model="model" class="p-2 rounded bg-gray-700 w-full max-w-md">
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
            <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Faster, Cheaper)</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus (Most Capable)</option>
          </select>
          <p class="text-gray-400 text-xs mt-1">
            Sonnet offers the best balance of speed, quality, and cost
          </p>
        </div>
      </div>

      <hr class="mb-6 border-gray-700" />

      <!-- Features -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">AI Features</h3>

        <div class="space-y-3">
          <div class="p-3 bg-gray-700 rounded">
            <ui-checkbox v-model="priceInsights">
              <span class="font-medium">Price Insights & Context</span>
            </ui-checkbox>
            <p class="text-gray-400 text-sm ml-6 mt-1">
              Get AI-powered explanations about item pricing, market trends, and value assessment
            </p>
          </div>

          <div class="p-3 bg-gray-700 rounded opacity-50">
            <ui-checkbox v-model="itemAnalysis" disabled>
              <span class="font-medium">Item Analysis</span>
              <span class="text-xs text-gray-400 ml-2">(Coming Soon)</span>
            </ui-checkbox>
            <p class="text-gray-400 text-sm ml-6 mt-1">
              Detailed analysis of item stats, modifiers, and potential uses
            </p>
          </div>

          <div class="p-3 bg-gray-700 rounded opacity-50">
            <ui-checkbox v-model="buildSuggestions" disabled>
              <span class="font-medium">Build Suggestions</span>
              <span class="text-xs text-gray-400 ml-2">(Coming Soon)</span>
            </ui-checkbox>
            <p class="text-gray-400 text-sm ml-6 mt-1">
              AI recommendations for which builds would benefit from this item
            </p>
          </div>
        </div>
      </div>

      <hr class="mb-6 border-gray-700" />

      <!-- Advanced Settings -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Advanced Settings</h3>

        <div class="mb-4">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium">Max Tokens</span>
            <span class="text-gray-400 text-sm">({{ maxTokens }})</span>
          </div>
          <input
            v-model.number="maxTokens"
            type="range"
            min="256"
            max="2048"
            step="256"
            class="w-full"
          />
          <p class="text-gray-400 text-xs mt-1">
            Higher values allow longer responses but cost more. Recommended: 1024
          </p>
        </div>

        <div class="mb-4">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium">Temperature</span>
            <span class="text-gray-400 text-sm">({{ temperature.toFixed(1) }})</span>
          </div>
          <input
            v-model.number="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="w-full"
          />
          <p class="text-gray-400 text-xs mt-1">
            Lower = more focused, Higher = more creative. Recommended: 0.7
          </p>
        </div>
      </div>

      <!-- Cost Warning -->
      <div class="p-4 bg-orange-900 bg-opacity-30 border border-orange-700 rounded">
        <div class="flex items-start gap-2">
          <i class="fas fa-exclamation-triangle text-orange-400 mt-1"></i>
          <div>
            <p class="font-medium text-orange-200 mb-1">API Usage Costs</p>
            <p class="text-sm text-orange-300">
              AI features use Anthropic's API which incurs costs based on usage.
              Each price check with AI insights costs approximately $0.001-0.003 USD.
              Monitor your usage at
              <a
                href="https://console.anthropic.com/settings/usage"
                target="_blank"
                class="text-orange-100 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="p-8 text-center text-gray-400">
        <i class="fas fa-info-circle text-4xl mb-3"></i>
        <p>Enable AI Assistant above to configure AI-powered features</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18nNs } from "@/web/i18n";
import UiCheckbox from "@/web/ui/UiCheckbox.vue";
import { configModelValue, configProp } from "./utils";

export default defineComponent({
  name: "settings.ai-assistant",
  components: { UiCheckbox },
  props: configProp(),
  setup(props) {
    const { t } = useI18nNs("settings");

    return {
      t,
      enabled: configModelValue(() => props.config.aiAssistant, "enabled"),
      provider: configModelValue(() => props.config.aiAssistant, "provider"),
      apiKey: configModelValue(() => props.config.aiAssistant, "apiKey"),
      model: configModelValue(() => props.config.aiAssistant, "model"),
      priceInsights: configModelValue(() => props.config.aiAssistant.features, "priceInsights"),
      itemAnalysis: configModelValue(() => props.config.aiAssistant.features, "itemAnalysis"),
      buildSuggestions: configModelValue(() => props.config.aiAssistant.features, "buildSuggestions"),
      maxTokens: configModelValue(() => props.config.aiAssistant, "maxTokens"),
      temperature: configModelValue(() => props.config.aiAssistant, "temperature"),
    };
  },
});
</script>
