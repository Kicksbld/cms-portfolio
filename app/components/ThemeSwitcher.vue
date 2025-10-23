<template>
  <div class="flex items-center gap-3">
    <div class="flex items-center gap-2">
      <Sun
        :class="[
          'h-4 w-4 transition-colors cursor-pointer',
          currentTheme === 'light' ? 'text-primary' : 'text-muted-foreground',
        ]"
        @click="handleSetLight"
      />
      <Switch
        :checked="currentTheme === 'dark'"
        @click="handleClick"
        aria-label="Toggle theme"
      />
      <Moon
        :class="[
          'h-4 w-4 transition-colors cursor-pointer',
          currentTheme === 'dark' ? 'text-primary' : 'text-muted-foreground',
        ]"
        @click="handleSetDark"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import { Switch } from "@/components/ui/switch";

const { theme, setTheme } = useTheme();

const currentTheme = ref(theme.value);

// Watch for theme changes
watch(theme, (newTheme) => {
  currentTheme.value = newTheme;
});

const handleClick = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  currentTheme.value = newTheme;
};

const handleSetLight = () => {
  setTheme('light');
  currentTheme.value = 'light';
};

const handleSetDark = () => {
  setTheme('dark');
  currentTheme.value = 'dark';
};

// Initialize on mount
onMounted(() => {
  currentTheme.value = theme.value;
});
</script>
