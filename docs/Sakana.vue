<template>
  <div ref="chisatoContainer" class="widget-container chisato-widget"></div>
  <div ref="takinaContainer" class="widget-container takina-widget"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import SakanaWidget from "../src/index";
import { chisato, takina } from '../src/characters';

const chisatoContainer = ref<HTMLDivElement | null>(null);
const takinaContainer = ref<HTMLDivElement | null>(null);

const registry = { chisato, takina }

onMounted(() => {
  if (chisatoContainer.value) {
    new SakanaWidget({
      registry
    }, "chisato").mount(chisatoContainer.value);
  }
  if (takinaContainer.value) {
    new SakanaWidget({
      registry
    }, "takina").mount(takinaContainer.value);
  }
});
</script>

<style scoped>
.chisato-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
}

.takina-widget {
  position: fixed;
  left: 24px;
  bottom: 24px;
}
</style>
