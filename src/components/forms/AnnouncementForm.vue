<template>
  <div class="w-1/3 bg-white rounded">
    <div class="flex justify-between items-center bg-green-600 p-4 rounded-t">
      <h3 class="text-white">{{ data.id ? 'Update Announcement' : 'Create Announcement' }}</h3>
      <button type="button" @click="$emit('close')"><i class="fas fa-times text-white hover:text-gray-200" title="Close"></i></button>
    </div>
    <form>
      <div class="flex flex-col space-y-4 p-8">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Title</label>
          <input type="text" v-model="data.title" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('title')" class="text-sm text-red-600">{{ errors.title[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Details</label>
          <textarea v-model="data.details" class="px-2 py-1 rounded border"></textarea>
          <div v-if="errors.hasOwnProperty('details')" class="text-sm text-red-600">{{ errors.details[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Attachment</label>
          <input type="file" @change="fileSelected" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('attachment')" class="text-sm text-red-600">{{ errors.attachment[0] }}</div>
        </div>

        <div v-if="saving" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p class="text-gray-600 animate-pulse">Saving Permission Information</p>
        </div>
        <div v-else class="flex justify-end items-center space-x-4">
          <button type="button" @click="$emit('close')" class="w-40 bg-gray-200 hover:bg-gray-100 px-4 py-1 rounded">Cancel</button>
          <button type="button" @click="saveAnnouncement" class="w-40 text-white bg-green-600 hover:bg-green-500 px-4 py-1 rounded">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: "AnnouncementForm",
    props: {
      data: Object,
    },
    data() {
      return {
        errors: {},
        saving: false,
      }
    },
    methods: {
      saveAnnouncement() {
        if (this.data.id) {
          this.updateAnnouncement();
        } else {
          this.createAnnouncement();
        }
      },
      createAnnouncement() {
        const form_data = new FormData();
        form_data.append('title', this.data.title);
        form_data.append('details', this.data.details);
        form_data.append('attachment', this.data.attachment);

        this.axios.post(`${import.meta.env.VITE_API_URL}/api/announcements`, form_data)
        .then(response => console.log(response.data))
        .catch(error => console.log(error.response.data));
      },
      updateAnnouncement() {

      },
      fileSelected(event) {
        this.data.attachment = event.target.files[0];
      },
    },
  }
</script>

<style scoped>

</style>