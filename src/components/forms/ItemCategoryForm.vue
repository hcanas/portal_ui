<template>
  <div class="w-1/3 bg-white rounded">
    <div class="flex justify-between items-center px-12 py-6 border-b rounded-t">
      <h3 class="text-2xl text-gray-600 uppercase font-bold">{{ item_category.id ? 'Update Item Category' : 'Create Item Category' }}</h3>
      <button type="button" @click="$emit('close')"><i class="fas fa-times text-gray-300 hover:text-gray-600" title="Close"></i></button>
    </div>
    <form @submit.prevent>
      <div class="flex flex-col space-y-4 px-12 py-8">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Name</label>
          <input type="text" v-model="item_category.name" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('name')" class="text-sm text-red-600">{{ errors.name[0] }}</div>
        </div>

        <div v-if="saving" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p class="text-gray-600 animate-pulse">Saving Item Category Information</p>
        </div>
        <div v-else class="flex justify-between items-center">
          <button type="button" @click="$emit('close')" class="w-40 bg-gray-200 hover:bg-gray-100 px-4 py-1 rounded">Cancel</button>
          <button type="button" @click="saveItemCategory" class="w-40 text-white bg-green-600 hover:bg-green-500 px-4 py-1 rounded">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
  export default {
    name: 'ItemCategoryForm',
    props: {
      data: Object,
    },
    data() {
      return {
        item_category: JSON.parse(JSON.stringify(this.data)),
        errors: {},
        saving: false,
      }
    },
    methods: {
      saveItemCategory() {
        this.saving = true;
        this.errors = {};

        if (this.item_category.id) {
          this.updateItemCategory();
        } else {
          this.createItemCategory();
        }
      },
      async createItemCategory() {
        await this.axios.post(`${import.meta.env.VITE_API_URL}/api/item_categories`, this.item_category)
            .then(response => this.$emit('createdItemCategory', response.data))
            .catch(error => {
              const errors = error.response.data;

              if (typeof errors === 'object') {
                this.errors = errors;
              }
            });

        this.saving = false;
      },
      async updateItemCategory() {
        await this.axios.put(`${import.meta.env.VITE_API_URL}/api/item_categories/${this.item_category.id}`, this.item_category)
            .then(response => this.$emit('updatedItemCategory', response.data))
            .catch(error => {
              const errors = error.response.data;

              if (typeof errors === 'object') {
                this.errors = errors;
              }
            });

        this.saving = false;
      },
    },
  }
</script>