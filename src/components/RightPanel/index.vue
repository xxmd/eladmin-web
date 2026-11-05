<template>
  <teleport to="body">
  <div ref="rightPanel" :class="{show:show}" class="rightPanel-container">
    <div class="rightPanel-background" />
    <div class="rightPanel">
      <div class="rightPanel-items">
        <slot />
      </div>
    </div>
  </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
const props = withDefaults(defineProps<{ clickNotClose?: boolean; buttonTop?: number }>(), { clickNotClose: false, buttonTop: 250 })
const store = useStore()
const show = computed({ get: (): boolean => store.state.settings.showSettings, set: value => { void store.dispatch('settings/changeSetting', { key: 'showSettings', value }) } })
function closeSidebar(event: MouseEvent) {
  if (!props.clickNotClose && event.target instanceof Element && !event.target.closest('.rightPanel')) show.value = false
}
watch(show, value => document.body.classList.toggle('showRightPanel', value), { immediate: true })
onMounted(() => window.addEventListener('click', closeSidebar))
onBeforeUnmount(() => { window.removeEventListener('click', closeSidebar); document.body.classList.remove('showRightPanel') })
</script>

<style>
  .showRightPanel {
    overflow: hidden;
    position: relative;
    width: calc(100% - 15px);
  }
</style>

<style lang="scss" scoped>
  .rightPanel-background {
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
    background: rgba(0, 0, 0, .2);
    z-index: -1;
  }

  .rightPanel {
    width: 100%;
    max-width: 260px;
    height: 100vh;
    position: fixed;
    top: 0;
    right: 0;
    box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .05);
    transition: all .25s cubic-bezier(.7, .3, .1, 1);
    transform: translate(100%);
    background: #fff;
    z-index: 40000;
  }

  .show {
    transition: all .3s cubic-bezier(.7, .3, .1, 1);

    .rightPanel-background {
      z-index: 20000;
      opacity: 1;
      width: 100%;
      height: 100%;
    }

    .rightPanel {
      transform: translate(0);
    }
  }

  .handle-button {
    width: 48px;
    height: 48px;
    position: absolute;
    left: -48px;
    text-align: center;
    font-size: 24px;
    border-radius: 6px 0 0 6px !important;
    z-index: 0;
    pointer-events: auto;
    cursor: pointer;
    color: #fff;
    line-height: 48px;
    i {
      font-size: 24px;
      line-height: 48px;
    }
  }
</style>
