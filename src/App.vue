<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style lang="less">
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute; //锁定宽高百分100前置需求
}

* {
  margin: 0;
  padding: 0;
}
</style>
