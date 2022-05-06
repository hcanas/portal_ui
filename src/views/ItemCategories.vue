<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-gray-700 text-2xl font-bold">Item Categories</h1>
    <div class="flex items-center space-x-4">
      <input type="search" v-model="filter_text" placeholder="Search keyword..." class="text-sm px-2 py-1 border rounded">
      <button type="button" @click="showModal('item-category-form')" class="w-40 text-white bg-green-600 hover:bg-green-500 px-2 py-1 rounded">New Category</button>
    </div>
  </div>
  <ag-grid-vue v-if="item_categories.length > 0"
    @grid-ready="gridReady"
    @cell-clicked="cellClicked"
    :columnDefs="column_defs"
    :rowData="item_categories"
    :rowSelection="'single'"
    :getRowNodeId="getRowNodeId"
    :pagination="true"
    :paginationPageSize="25"
    class="ag-theme-alpine w-full h-full"
  />

  <modal :show="modal.show" @close="closeModal">
    <component
    @created-item-category="createdItemCategory"
    @updated-item-category="updatedItemCategory"
    @confirm="deleteItemCategory"
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
  import ItemCategoryForm from "../components/forms/ItemCategoryForm.vue";
  import SuccessMessage from "../components/messages/SuccessMessage.vue";
  import DeleteDialog from "../components/messages/DeleteDialog.vue";

  export default {
    name: 'ItemCategories',
    components: {
      DeleteDialog,
      AgGridVue,
      Modal,
      ItemCategoryForm,
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
        item_categories: [],
        column_defs: [
          {
            headerName: '',
            width: 70,
            lockPosition: true,
            cellRenderer: () => '<div class="flex items-center space-x-4">'
              + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="edit-item-category"><i class="fas fa-edit" title="Edit Item Category" data-action="edit-item-category"></i></button>'
              + '<button type="button" class="text-gray-600 hover:text-red-600 outline-none ring-0" data-action="delete-item-category"><i class="fas fa-trash" title="Delete Item Category" data-action="delete-item-category"></i></button>'
              + '</div>',
          },
          {
            headerName: 'Name',
            field: 'name',
            sortable: true,
            width: 1453,
            wrapText: true,
            autoHeight: true,
          },
        ],
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/item_categories`)
      .then(response => this.item_categories = response.data)
      .catch(() => this.item_categories = []);
    },
    methods: {
      gridReady(params) {
        this.grid_api = params.api;
      },
      cellClicked(params) {
        if (params.event.target.dataset.action) {
          switch (params.event.target.dataset.action) {
            case 'edit-item-category':
              this.modal.show = true;
              this.modal.component = 'item-category-form';
              this.modal.data = params.data;
              break;

            case 'delete-item-category':
              this.modal.show = true;
              this.modal.component = 'delete-dialog';
              this.modal.data = { message: `You are about to delete the item category "${params.data.name}"`};
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
        this.modal.data = data ?? { name: null };
      },
      closeModal() {
        this.modal.show = false;
        this.modal.component = '';
        this.modal.data = {};
      },
      createdItemCategory(item_category) {
        this.grid_api.applyTransaction({
          add: [item_category],
          addIndex: 0,
        });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${item_category.name} has been created.` };
      },
      updatedItemCategory(item_category) {
        this.grid_api.applyTransaction({ update: [item_category] });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${item_category.name} has been updated.` };
      },
      deleteItemCategory() {
        const data = this.grid_api.getSelectedRows()[0];

        this.axios.delete(`${import.meta.env.VITE_API_URL}/api/item_categories/${data.id}`)
        .then(() => {
          this.grid_api.applyTransaction({ remove: [{ id: data.id }] });
          this.modal.component = 'success-message';
          this.modal.data = { message: `${data.name} has been deleted.` };
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