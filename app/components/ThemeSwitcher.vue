<template>
  <div class="flex items-center gap-3">
    <div class="flex items-center gap-2">
      <Sun
        :class="[
          'h-4 w-4 transition-colors cursor-pointer',
          theme === 'light' ? 'text-primary' : 'text-muted-foreground',
        ]"
        @click="handleSetLight"
      />

      <!-- Custom Switch -->
      <button
        type="button"
        role="switch"
        :aria-checked="theme === 'dark'"
        :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          theme === 'dark' ? 'bg-primary' : 'bg-input'
        ]"
        @click="toggleTheme"
      >
        <span
          :class="[
            'inline-block h-5 w-5 transform rounded-full bg-background shadow-lg transition-transform',
            theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
          ]"
        />
      </button>

      <Moon
        :class="[
          'h-4 w-4 transition-colors cursor-pointer',
          theme === 'dark' ? 'text-primary' : 'text-muted-foreground',
        ]"
        @click="handleSetDark"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";

const { theme, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
};

const handleSetLight = () => {
  setTheme('light');
};

const handleSetDark = () => {
  setTheme('dark');
};
</script>
