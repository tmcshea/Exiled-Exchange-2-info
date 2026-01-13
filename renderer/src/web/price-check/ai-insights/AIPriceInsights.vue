<template>
  <div v-if="shouldShow" class="ai-insights-container">
    <div class="ai-insights-header">
      <div class="flex items-center gap-2">
        <i class="fas fa-brain text-purple-400"></i>
        <span class="font-semibold">AI Price Insights</span>
      </div>
      <button
        v-if="!isLoading && !error"
        @click="refresh"
        class="refresh-btn"
        title="Refresh insights"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>

    <div class="ai-insights-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Analyzing item...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ errorMessage }}</span>
        <button v-if="isConfigError" @click="openSettings" class="config-btn">
          Configure AI
        </button>
      </div>

      <!-- Success State -->
      <div v-else-if="insight" class="insight-content">
        <p class="insight-text">{{ insight.insight }}</p>
        <div v-if="insight.confidence" class="confidence-bar">
          <div class="confidence-label">Confidence:</div>
          <div class="confidence-track">
            <div
              class="confidence-fill"
              :style="{ width: `${insight.confidence * 100}%` }"
            ></div>
          </div>
          <div class="confidence-value">
            {{ Math.round(insight.confidence * 100) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { AppConfig } from "@/web/Config";
import { AIService } from "@/web/background/AIService";
import type { ParsedItem } from "@/parser/ParsedItem";
import type { AIInsightResponse } from "@/web/background/AIService";

const props = defineProps<{
  item: ParsedItem;
  priceData?: {
    meanPrice?: number;
    medianPrice?: number;
    listingCount?: number;
    currency?: string;
  };
}>();

const insight = ref<AIInsightResponse | null>(null);
const isLoading = ref(false);
const error = ref(false);
const errorMessage = ref("");

const config = computed(() => AppConfig());

const shouldShow = computed(() => {
  return (
    config.value.aiAssistant.enabled &&
    config.value.aiAssistant.features.priceInsights
  );
});

const isConfigError = computed(() => {
  return (
    insight.value?.error === "NO_API_KEY" ||
    insight.value?.error === "AI_DISABLED"
  );
});

async function fetchInsights() {
  if (!shouldShow.value) return;

  isLoading.value = true;
  error.value = false;
  errorMessage.value = "";

  try {
    const response = await AIService.getPriceInsight({
      item: props.item,
      priceData: props.priceData,
    });

    insight.value = response;

    if (response.error) {
      error.value = true;
      errorMessage.value = response.insight;
    }
  } catch (err) {
    error.value = true;
    errorMessage.value =
      err instanceof Error ? err.message : "Unknown error occurred";
  } finally {
    isLoading.value = false;
  }
}

function refresh() {
  AIService.clearCache();
  fetchInsights();
}

function openSettings() {
  // Trigger settings widget to open
  // This will be handled by the parent component or widget system
  console.log("Open AI settings");
}

// Watch for item or price changes
watch(
  () => [props.item, props.priceData],
  () => {
    if (shouldShow.value) {
      fetchInsights();
    }
  },
  { immediate: true, deep: true },
);

// Watch for config changes
watch(
  () => config.value.aiAssistant.enabled,
  (enabled) => {
    if (enabled) {
      fetchInsights();
    }
  },
);
</script>

<style scoped>
.ai-insights-container {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.375rem;
}

.ai-insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #e9d5ff;
  font-size: 0.875rem;
}

.refresh-btn {
  padding: 0.25rem 0.5rem;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 0.25rem;
  color: #e9d5ff;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.6);
}

.ai-insights-content {
  color: #f3e8ff;
  font-size: 0.875rem;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 1rem;
  color: #c4b5fd;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: #c4b5fd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #fca5a5;
  text-align: center;
}

.config-btn {
  margin-top: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 0.25rem;
  color: #e9d5ff;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.config-btn:hover {
  background: rgba(139, 92, 246, 0.4);
}

.insight-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-text {
  margin: 0;
  color: #f3e8ff;
  line-height: 1.6;
}

.confidence-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.confidence-label {
  color: #c4b5fd;
  white-space: nowrap;
}

.confidence-track {
  flex: 1;
  height: 0.5rem;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 0.25rem;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  transition: width 0.3s ease;
}

.confidence-value {
  color: #e9d5ff;
  font-weight: 600;
  white-space: nowrap;
}
</style>
