<template>
  <div class="flex-shrink-0 flex justify-between items-center mb-4">
    <h1 class="text-gray-700 text-2xl font-bold">Dashboard</h1>
  </div>

  <div class="flex-grow flex space-x-8">
    <div class="w-3/4 flex-grow flex flex-col border rounded shadow-lg">
      <div class="flex-shrink-0 flex justify-between items-center h-14 bg-gray-100 px-4">
        <h3 class="text-lg font-medium">Announcements</h3>
        <div class="flex items-center space-x-4">
          <input type="search" v-model="filter_text" placeholder="Search keyword..." class="text-sm px-2 py-1 border rounded">
          <button type="button" @click="showModal()" class="text-white bg-green-600 hover:bg-green-500 focus:bg-green-500 px-4 py-1.5 rounded">
            New Announcement
          </button>
        </div>
      </div>
      <div class="flex-grow">
        <ag-grid-vue v-if="announcements.length > 0"
        @grid-ready="gridReady"
        @cell-clicked="cellClicked"
        :columnDefs="column_defs"
        :rowData="announcements"
        :rowSelection="'single'"
        :getRowNodeId="getRowNodeId"
        :pagination="true"
        :paginationPageSize="25"
        class="ag-theme-alpine w-full h-full"
        >
        </ag-grid-vue>
      </div>
    </div>
    <div class="w-1/4 flex-grow flex flex-col border rounded shadow-lg">
      <div class="flex-shrink-0 flex items-center h-14 bg-gray-100">
        <h3 class="text-lg font-medium px-4">Systems</h3>
      </div>
      <div class="flex-grow flex items-start flex-wrap">
        <a href="#" class="text-white font-medium bg-green-600 hover:bg-green-500 focus:bg-green-500 p-4 m-4 rounded">FMTIS</a>
      </div>
    </div>
  </div>

  <modal :show="modal.show">
    <component :is="modal.component" @close="closeModal" @created-announcement="createdAnnouncement" @updated-announcement="updatedAnnouncement" :data="modal.data"></component>
  </modal>
</template>
<script>
  import "ag-grid-community/dist/styles/ag-grid.css";
  import "ag-grid-community/dist/styles/ag-theme-alpine.css";
  import { AgGridVue } from "ag-grid-vue3";

  import Modal from "../components/overlays/Modal.vue";
  import AnnouncementForm from "../components/forms/AnnouncementForm.vue";
  import SuccessMessage from "../components/messages/SuccessMessage.vue";

  export default {
    name: 'Home',
    components: {
      SuccessMessage,
      AgGridVue,
      AnnouncementForm,
      Modal,
    },
    data() {
      return {
        modal: {
          show: false,
          title: '',
          component: '',
          data: {},
        },
        grid_api: null,
        filter_text: '',
        announcements: [],
        column_defs: [
          {
            headerName: '',
            width: 70,
            lockPosition: true,
            cellRenderer: () => '<div class="flex items-center space-x-4">'
              + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="edit-announcement"><i class="fas fa-edit" title="Edit Announcement" data-action="edit-announcement"></i></button>'
              + '<button type="button" class="text-gray-600 hover:text-red-600 outline-none ring-0" data-action="delete-announcement"><i class="fas fa-trash" title="Delete Announcement" data-action="delete-announcement"></i></button>'
              + '</div>',
          },
          {
            headerName: 'Date',
            sortable: true,
            searchable: true,
            flex: 1,
            valueFormatter: params => new Intl.DateTimeFormat('en-PH', {
              year: 'numeric', month: 'numeric', day: 'numeric',
              hour: 'numeric', minute: 'numeric',
              timeZone: 'Asia/Manila',
            }).format(new Date(params.data.created_at)),
            getQuickFilterText: params => new Intl.DateTimeFormat('en-PH', {
              year: 'numeric', month: 'numeric', day: 'numeric',
              hour: 'numeric', minute: 'numeric',
              timeZone: 'Asia/Manila',
            }).format(new Date(params.data.created_at)),
          },
          {
            headerName: 'Title',
            field: 'title',
            sortable: true,
            searchable: true,
            flex: 2,
          },
          {
            headerName: 'Details',
            sortable: true,
            searchable: true,
            autoHeight: true,
            flex: 3,
            cellRenderer: params => {
              let data = params.data.details;

              if (params.data.attachment) {
                data += `<a href="${import.meta.env.VITE_API_URL}/storage/announcements/${params.data.attachment}" class="text-small text-green-600 hover:text-green-500 focus:text-green-500 mx-2" title="View Attachment" target="_blank"><span class="fas fa-file-alt"></span></a>`;
              }

              return data;
            },
            getQuickFilterText: params => params.data.details,
          },
        ],
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`)
      .then(response => this.announcements = response.data)
      .catch(errors => console.log(errors.response.data));
    },
    methods: {
      gridReady(params) {
        this.grid_api = params.api;
      },
      cellClicked(params) {
        if (params.event.target.dataset.action) {
          switch (params.event.target.dataset.action) {
            case 'edit-announcement':
              this.modal.show = true;
              this.modal.component = 'announcement-form';
              this.modal.data = {
                ...params.data,
                attachment_action: 'keep',
                new_attachment: null,
              };
              break;
          }
        }
      },
      getRowNodeId(data) {
        return data.id;
      },
      showModal() {
          this.modal.show = true;
          this.modal.title = 'New Announcement';
          this.modal.component = 'announcement-form';
          this.modal.data = {
            title: '',
            details: '',
            attachment: '',
          };
      },
      closeModal() {
        this.modal.show = false;
        this.modal.title = '';
        this.modal.data = {};
      },
      createdAnnouncement(announcement) {
        this.grid_api.applyTransaction({
          add: [announcement],
          addIndex: 0,
        });
        this.modal.component = 'success-message';
        this.modal.data = { message: 'Announcement has been created.' };
      },
      updatedAnnouncement(announcement) {
        this.grid_api.applyTransaction({ update: [announcement] });
        this.modal.component = 'success-message';
        this.modal.data = { message: 'Announcement has been updated.' };
      },
    },
    watch: {
      filter_text(val) {
        this.grid_api.setQuickFilter(val);
      },
    },
  }
</script>