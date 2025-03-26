<template>
  <div id="app">
    <Suspense>
      <router-view />
    </Suspense>
    <Toast
      position="top-left"
      class="max-w-[80%] lg:max-w-2xl mx-auto"
      group="tr"
    />
    <ConfirmDialog class="p-3"></ConfirmDialog>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>