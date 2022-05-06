<template>
  <div class="w-96 flex flex-col space-y-4 bg-white rounded p-8 relative">
    <button type="button" @click="$emit('close')" class="text-gray-300 hover:text-gray-600 absolute top-4 right-4" title="Close">
      <i class="fas fa-times"></i>
    </button>
    <div class="flex justify-center items-center space-x-4">
      <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
      <span class="text-xl text-red-600">Delete Confirmation</span>
    </div>
    <div class="text-gray-500 text-center">
      {{ data.message }}
    </div>
    <div class="flex justify-between">
      <button @click="$emit('close')" class="bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 px-4 py-1 border rounded">Cancel</button>
      <button @click="$emit('confirm')" class="text-white bg-red-600 hover:bg-red-500 focus:bg-red-500 px-4 py-1 border rounded">Confirm</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "DeleteDialog",
    props: {
      data: Object,
    },
  }
</script>

<style scoped>

</style>