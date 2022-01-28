<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-gray-700 text-2xl font-bold">Offices</h1>
    <div class="flex items-center space-x-4">
      <input type="search" v-model="filter_text" placeholder="Search keyword..." class="text-sm px-2 py-1 border rounded">
      <button type="button" @click="showModal('office-form')" class="w-40 text-white bg-green-600 hover:bg-green-500 px-2 py-1 rounded">New Office</button>
    </div>
  </div>

  <ag-grid-vue v-if="offices.length > 0"
  @grid-ready="gridReady"
  @cell-clicked="cellClicked"
  :columnDefs="column_defs"
  :rowData="offices"
  :rowSelection="'single'"
  :getRowNodeId="getRowNodeId"
  :pagination="true"
  :paginationPageSize="25"
  class="ag-theme-alpine w-full h-full"
  >
  </ag-grid-vue>

  <modal :show="modal.show" @close="closeModal">
    <component
    @created-office="createdOffice"
    @updated-office="updatedOffice"
    @confirm="deleteOffice"
    @close="closeModal"
    :data="modal.data"
    :is="modal.component">
    </component>
  </modal>
</template>
<script>
  import "ag-grid-community/dist/styles/ag-grid.css";
  import "ag-grid-community/dist/styles/ag-theme-alpine.css";
  import { AgGridVue } from "ag-grid-vue3";
  import Modal from "../components/overlays/Modal.vue";
  import OfficeForm from "../components/forms/OfficeForm.vue";
  import SuccessMessage from "../components/messages/SuccessMessage.vue";
  import DeleteDialog from "../components/messages/DeleteDialog.vue";

  export default {
    name: 'Offices',
    components: {
      DeleteDialog,
      AgGridVue,
      Modal,
      OfficeForm,
      SuccessMessage,
    },
    data() {
      return {
        modal: {
          show: false,
          component: '',
          data: {},
        },
        grid_api: null,
        filter_text: '',
        offices: [],
        column_defs: [
          {
            headerName: '',
            width: 70,
            lockPosition: true,
            cellRenderer: () => '<div class="flex items-center space-x-4">'
              + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="edit-office"><i class="fas fa-edit" title="Edit Office" data-action="edit-office"></i></button>'
              + '<button type="button" class="text-gray-600 hover:text-red-600 outline-none ring-0" data-action="delete-office"><i class="fas fa-trash" title="Delete Office" data-action="delete-office"></i></button>'
              + '</div>',
          },
          { 
            headerName: 'Name', 
            field: 'name',
            sortable: true,
            resizable: true, 
            flex: 2, 
          },
          { 
            headerName: 'Short Name', 
            field: 'short_name', 
            sortable: true,
            resizable: true, 
            flex: 1,
          },
          {
            headerName: 'Parent Office',
            field: 'parent_office.name',
            sortable: true,
            resizable: true, 
            flex: 2,
          },
        ],
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/offices`)
      .then(response => this.offices = response.data)
      .catch(() => this.offices = []);
    },
    methods: {
      gridReady(params) {
        this.grid_api = params.api;
      },
      cellClicked(params) {
        if (params.event.target.dataset.action) {
          switch (params.event.target.dataset.action) {
            case 'edit-office':
              this.modal.show = true;
              this.modal.component = 'office-form';
              this.modal.data = params.data;
              break;

            case 'delete-office':
              this.modal.show = true;
              this.modal.component = 'delete-dialog';
              this.modal.data = { message: `You are about to delete the office "${params.data.name} (${params.data.short_name})"` };
              break;
          }
        }
      },
      getRowNodeId(data) {
        return data.id;
      },
      showModal(component, data) {
        this.modal.show = true;
        this.modal.component = component;
        this.modal.data = data ?? {
          name: '',
          short_name: '',
          office_id: '',
        };
      },
      closeModal() {
        this.modal.show = false;
        this.modal.component = '';
        this.modal.data = {};
      },
      createdOffice(office) {
        this.grid_api.applyTransaction({
          add: [office],
          addIndex: 0,
        });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${office.name} has been created.` };
      },
      updatedOffice(office) {
        this.grid_api.applyTransaction({ update: [office] });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${office.name} has been updated.` };
      },
      deleteOffice() {
        const data = this.grid_api.getSelectedRows()[0];

        this.axios.delete(`${import.meta.env.VITE_API_URL}/api/offices/${data.id}`)
        .then(() => {
          this.grid_api.applyTransaction({ remove: [{ id: data.id }] });
          this.modal.component = 'success-message';
          this.modal.data = { message: `${data.name} (${data.short_name}) has been deleted.` };
        });
      },
    },
    watch: {
      filter_text(val) {
        this.grid_api.setQuickFilter(val);
      },
    },
  }
</script>