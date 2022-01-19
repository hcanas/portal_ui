<template>
  <div class="w-1/3 bg-white rounded">
    <div class="flex justify-between items-center bg-green-600 p-4 rounded-t">
      <h3 class="text-white">{{ data.id ? 'Update Item' : 'Create Item' }}</h3>
      <button type="button" @click="$emit('close')"><i class="fas fa-times text-white hover:text-gray-200" title="Close"></i></button>
    </div>
    <form>
      <div class="flex flex-col space-y-4 p-8">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Year</label>
          <input type="text" v-model="data.year" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('year')" class="text-sm text-red-600">{{ errors.year[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Title</label>
          <input type="text" v-model="data.title" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('title')" class="text-sm text-red-600">{{ errors.title[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Item Category</label>
          <select v-model="data.category_id" class="px-2 py-1 rounded border">
            <option v-for="item_category in item_categories" :value="item_category.id" :key="item_category.id">{{ item_category.name }}</option>
          </select>
          <div v-if="errors.hasOwnProperty('category_id')" class="text-sm text-red-600">{{ errors.category_id[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Commodity Type</label>
          <select v-model="data.commodity_type" class="px-2 py-1 rounded border">
            <option value="expendables">Expendables</option>
            <option value="semi-expendables">Semi-expendables</option>
            <option value="ppe">PPE</option>
          </select>
          <div v-if="errors.hasOwnProperty('commodity_type')" class="text-sm text-red-600">{{ errors.commodity_type[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Details</label>
          <input type="text" v-model="data.details" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('details')" class="text-sm text-red-600">{{ errors.details[0] }}</div>
        </div>

        <div v-if="saving" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p class="text-gray-600 animate-pulse">Saving Item Information</p>
        </div>
        <div v-else class="flex justify-end items-center space-x-4">
          <button type="button" @click="$emit('cancel')" class="w-40 bg-gray-200 hover:bg-gray-100 px-4 py-1 rounded">Cancel</button>
          <button type="button" @click="saveItem" class="w-40 text-white bg-green-600 hover:bg-green-500 px-4 py-1 rounded">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
  export default {
    name: 'ItemForm',
    props: {
      data: Object,
    },
    data() {
      return {
        item_categories: [],
        errors: {},
        saving: false,
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/item_categories?year=2021`)
      .then(response => {
        this.item_categories = response.data;
        this.data.category_id = response.data[0].id;
      })
      .catch(() => this.item_categories = []);
    },
    methods: {
      saveItem() {
        this.saving = true;
        this.errors = {};

        if (this.data.id) {
          this.updateItem();
        } else {
          this.createItem();
        }
      },
      async createItem() {
        await this.axios.post(`${import.meta.env.VITE_API_URL}/api/items`, this.data)
        .then(response => this.$emit('createdItem', response.data))
        .catch(error => {
          const errors = error.response.data;

          if (typeof errors === 'object') {
            this.errors = errors;
          }
        });

        this.saving = false;
      },
      async updateItem() {
        await this.axios.put(`${import.meta.env.VITE_API_URL}/api/items/${this.data.id}`, this.data)
        .then(response => this.$emit('updatedItem', response.data))
        .catch(error => {
          const errors = error.response.data;

          if (typeof errors === 'object' && error.response.status === 400) {
            this.errors = errors;
          }
        });

        this.saving = false;
      },
    },
  }
</script>