<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-gray-700 text-2xl font-bold">Items</h1>
    <div class="flex items-center space-x-4">
      <select v-model="year" class="px-2 py-1 border rounded">
        <option value="2021">2021</option>
        <option value="2022">2022</option>
      </select>
      <input type="search" v-model="filter_text" placeholder="Search keyword..." class="text-sm px-2 py-1 border rounded">
      <button type="button" @click="showModal('item-form')" class="w-40 text-white bg-green-600 hover:bg-green-500 px-2 py-1 rounded">New Item</button>
    </div>
  </div>

  <ag-grid-vue v-if="items.length > 0"
  @grid-ready="gridReady"
  @cell-clicked="cellClicked"
  :columnDefs="column_defs"
  :rowData="items"
  :rowSelection="'single'"
  :getRowNodeId="getRowNodeId"
  :pagination="true"
  :paginationPageSize="25"
  class="ag-theme-alpine w-full h-5/6"
  >
  </ag-grid-vue>

  <modal :show="modal.show" @close="closeModal">
    <component @created-item="createdItem" @updated-item="updatedItem" @close="closeModal" @cancel="closeModal" :data="modal.data" :is="modal.component"></component>
  </modal>
</template>
<script>
  import "ag-grid-community/dist/styles/ag-grid.css";
  import "ag-grid-community/dist/styles/ag-theme-alpine.css";
  import { AgGridVue } from "ag-grid-vue3";
  import Modal from "../components/overlays/Modal.vue";
  import ItemForm from "../components/forms/ItemForm.vue";
  import SuccessMessage from "../components/messages/SuccessMessage.vue";

  export default {
    name: 'Items',
    components: {
      AgGridVue,
      Modal,
      ItemForm,
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
        year: new Date().getFullYear(),
        filter_text: '',
        items: [],
        column_defs: [
          {
            headerName: '',
            width: 70,
            lockPosition: true,
            cellRenderer: () => '<div class="flex items-center space-x-4">'
              + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="edit-item"><i class="fas fa-edit" title="Edit Item" data-action="edit-item"></i></button>'
              + '<button type="button" class="text-gray-600 hover:text-red-600 outline-none ring-0" data-action="delete-item"><i class="fas fa-trash" title="Delete Item" data-action="delete-item"></i></button>'
              + '</div>',
          },
          {
            headerName: 'Year',
            field: 'year',
            width: 70,
          },
          {
            headerName: 'Title',
            field: 'title',
            sortable: true,
            resizable: true,
            flex: 2,
          },
          {
            headerName: 'Category',
            field: 'item_category.name',
            sortable: true,
            resizable: true,
            flex: 2,
          },
          {
            headerName: 'Commodity Type',
            field: 'commodity_type',
            sortable: true,
            resizable: true,
            flex: 2,
          },
          {
            headerName: 'Details',
            field: 'details',
            sortable: true,
            resizable: true,
            flex: 4,
          },
        ],
      }
    },
    created() {
      this.loadItems();
    },
    methods: {
      gridReady(params) {
        this.grid_api = params.api;
      },
      cellClicked(params) {
        if (params.event.target.dataset.action) {
          switch (params.event.target.dataset.action) {
            case 'edit-item':
              this.modal.show = true;
              this.modal.component = 'item-form';
              this.modal.data = params.data;
              break;
          }
        }
      },
      getRowNodeId(data) {
        return data.id;
      },
      loadItems() {
        this.axios.get(`${import.meta.env.VITE_API_URL}/api/items?year=${this.year}`)
        .then(response => this.items = response.data)
        .catch(() => this.items = []);
      },
      showModal(component, data) {
        this.modal.show = true;
        this.modal.component = component;
        this.modal.data = data ?? {
          year: null,
          title: null,
          category_id: null,
          commodity_type: 'expendables',
          details: null,
        };
      },
      closeModal() {
        this.modal.show = false;
        this.modal.component = '';
        this.modal.data = {};
      },
      createdItem(item) {
        this.grid_api.applyTransaction({
          add: [item],
          addIndex: 0,
        });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${item.title} has been created.` };
      },
      updatedItem(item) {
        this.grid_api.applyTransaction({ update: [item] });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${item.title} has been updated.` };
      },
    },
    watch: {
      year() {
        this.loadItems();
      },
      filter_text(val) {
        this.grid_api.setQuickFilter(val);
      },
    },
  }
</script>