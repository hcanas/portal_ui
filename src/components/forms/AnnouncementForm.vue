<template>
  <div class="w-1/3 bg-white rounded">
    <div class="flex justify-between items-center px-12 py-6 border-b rounded-t">
      <h3 class="text-2xl text-gray-600 uppercase font-bold">{{ data.id ? 'Update Announcement' : 'Create Announcement' }}</h3>
      <button type="button" @click="$emit('close')"><i class="fas fa-times text-gray-300 hover:text-gray-600" title="Close"></i></button>
    </div>
    <form @submit.prevent>
      <div class="flex flex-col space-y-4 px-12 py-8">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Title</label>
          <input type="text" v-model="data.title" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('title')" class="text-sm text-red-600">{{ errors.title[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Details</label>
          <textarea v-model="data.details" class="h-96 px-2 py-1 rounded border"></textarea>
          <div v-if="errors.hasOwnProperty('details')" class="text-sm text-red-600">{{ errors.details[0] }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 font-bold uppercase">Attachment</label>

          <div v-if="data.attachment_action" class="flex flex-col">
            <div class="flex items-center space-x-2">
              <input type="radio" name="attachment_action" id="keep_attachment" value="keep" v-model="data.attachment_action">
              <label for="keep_attachment">Keep</label>
              <a v-if="data.attachment" :href="`${apiURL}/announcements/${data.attachment}`" target="_blank" class="text-green-600 hover:text-green-500 focus:text-green-500">{{ data.attachment }}</a>
              <span v-else>No attachment</span>
            </div>
            <div v-if="data.attachment" class="flex items-center space-x-2">
              <input type="radio" name="attachment_action" id="delete_attachment" value="delete" v-model="data.attachment_action">
              <label for="delete_attachment">Delete</label>
            </div>
            <div class="flex items-center space-x-2">
              <input type="radio" name="attachment_action" id="replace_attachment" value="replace" v-model="data.attachment_action">
              <label for="replace_attachment">Replace</label>
            </div>
          </div>

          <input v-if="!data.id || data.attachment_action === 'replace'" type="file" @change="fileSelected" class="px-2 py-1 rounded border">
          <div v-if="errors.hasOwnProperty('attachment')" class="text-sm text-red-600">{{ errors.attachment[0] }}</div>
        </div>

        <div v-if="saving" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p class="text-gray-600 animate-pulse">Saving Announcement Information</p>
        </div>
        <div v-else class="flex justify-between items-center">
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
        this.saving = true;
        this.errors = {};

        const form_data = new FormData();
        form_data.append('title', this.data.title);
        form_data.append('details', this.data.details);
        form_data.append('attachment', this.data.attachment);

        this.axios.post(`${import.meta.env.VITE_API_URL}/api/announcements`, form_data)
        .then(response => this.$emit('createdAnnouncement', response.data))
        .catch(error => {
          this.saving = false;
          this.errors = error.response.data;
        });
      },
      updateAnnouncement() {
        this.saving = true;
        this.errors = {};

        const form_data = new FormData();
        form_data.append('title', this.data.title);
        form_data.append('details', this.data.details);
        form_data.append('attachment_action', this.data.attachment_action);
        form_data.append('_method', 'put');

        if (this.data.attachment_action === 'replace') {
          form_data.append('attachment', this.data.new_attachment);
        }

        this.axios.post(`${import.meta.env.VITE_API_URL}/api/announcements/${this.data.id}`, form_data)
        .then(response => this.$emit('updatedAnnouncement', response.data))
        .catch(error => {
          this.saving = false;
          this.errors = error.response.data;
        });
      },
      fileSelected(event) {
        if (this.data.id) {
          this.data.new_attachment = event.target.files[0];
        } else {
          this.data.attachment = event.target.files[0];
        }
      },
    },
    computed: {
      apiURL() {
        return import.meta.env.VITE_API_URL;
      },
    },
  }
</script>

<style scoped>
  textarea {
    resize: none;
  }
</style>