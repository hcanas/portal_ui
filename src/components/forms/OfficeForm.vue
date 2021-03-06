<template>
  <div class="w-1/3 bg-white rounded">
    <div class="flex justify-between items-center px-12 py-6 border-b rounded-t">
      <h3 class="text-2xl text-gray-600 uppercase font-bold">{{ data.id ? 'Update Office' : 'Create Office' }}</h3>
      <button type="button" @click="$emit('close')"><i class="fas fa-times text-gray-300 hover:text-gray-600" title="Close"></i></button>
    </div>
    <form @submit.prevent>
      <div class="flex flex-col space-y-4 px-12 py-8">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Name</label>
          <input type="text" v-model="data.name" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('name')" class="text-sm text-red-600">{{ errors.name[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Short Name</label>
          <input type="text" v-model="data.short_name" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('short_name')" class="text-sm text-red-600">{{ errors.short_name[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Parent Office</label>
          <select v-model="data.office_id" class="px-2 py-1 rounded border">
            <option :value="''">N/A</option>
            <option v-for="office in offices" :value="office.id" :key="office.id">{{ office.name }}</option>
          </select>
          <div v-if="errors.hasOwnProperty('office_id')" class="text-sm text-red-600">{{ errors.office_id[0] }}</div>
        </div>

        <div v-if="saving" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p class="text-gray-600 animate-pulse">Saving Office Information</p>
        </div>
        <div v-else class="flex justify-between items-center">
          <button type="button" @click="$emit('close')" class="w-40 bg-gray-200 hover:bg-gray-100 px-4 py-1 rounded">Cancel</button>
          <button type="button" @click="saveOffice" class="w-40 text-white bg-green-600 hover:bg-green-500 px-4 py-1 rounded">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
  export default {
    name: 'OfficeForm',
    props: {
      data: Object,
    },
    data() {
      return {
        offices: [],
        errors: {},
        saving: false,
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/offices`)
      .then(response => {
        this.offices = response.data.filter(row => row.id !== this.data.id);
      })
      .catch(() => this.offices = []);
    },
    methods: {
      saveOffice() {
        this.saving = true;
        this.errors = {};

        if (this.data.id) {
          this.updateOffice();
        } else {
          this.createOffice();
        }
      },
      async createOffice() {
        await this.axios.post(`${import.meta.env.VITE_API_URL}/api/offices`, this.data)
        .then(response => this.$emit('createdOffice', response.data))
        .catch(error => {
          const errors = error.response.data;

          if (typeof errors === 'object') {
            this.errors = errors;
          }
        });

        this.saving = false;
      },
      async updateOffice() {
        await this.axios.put(`${import.meta.env.VITE_API_URL}/api/offices/${this.data.id}`, this.data)
        .then(response => this.$emit('updatedOffice', response.data))
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