<template>
  <div class="w-5/6 h-full flex flex-col bg-white rounded">
    <div class="flex justify-between items-center px-12 py-6 border-b rounded-t">
      <h3 class="text-2xl text-gray-600 uppercase font-bold">Manage Permissions - {{ data.name }}</h3>
      <button type="button" @click="$emit('close')"><i class="fas fa-times text-gray-300 hover:text-gray-600" title="Close"></i></button>
    </div>
    <div class="flex-grow flex">
      <div class="flex-grow w-2/3 px-12 pt-8">
        <ag-grid-vue
        @grid-ready="permissionGridReady"
        @first-data-rendered="permissionDataRendered"
        @cell-clicked="permissionCellClicked"
        :columnDefs="permissions.column_defs"
        :rowData="permissions.row_data"
        :rowSelection="'multiple'"
        :suppressRowClickSelection="true"
        :getRowNodeId="getRowNodeId"
        :pagination="true"
        :paginationPageSize="25"
        class="ag-theme-alpine w-full h-full"
        />
      </div>
      <div class="flex-shrink-0 w-1/3 pr-8 pt-8">
        <ag-grid-vue
        @grid-ready="officeGridReady"
        @selection-changed="officeSelectionChanged"
        :columnDefs="offices.column_defs"
        :rowData="offices.row_data"
        :rowSelection="'multiple'"
        :suppressRowClickSelection="true"
        :getRowNodeId="getRowNodeId"
        class="ag-theme-alpine w-full h-full"
        />
      </div>
    </div>
    <form @submit.prevent>
      <div class="flex flex-col space-y-4 px-12 py-8">
        <div v-if="saving" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p class="text-gray-600 animate-pulse">Saving Permissions</p>
        </div>
        <div v-else class="flex justify-between items-center">
          <button type="button" @click="$emit('close')" class="w-40 bg-gray-200 hover:bg-gray-100 px-4 py-1 rounded">Cancel</button>
          <button type="button" @click="savePermissions" class="w-40 text-white bg-green-600 hover:bg-green-500 px-4 py-1 rounded">Save</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
  import "ag-grid-community/dist/styles/ag-grid.css";
  import "ag-grid-community/dist/styles/ag-theme-alpine.css";
  import { AgGridVue } from "ag-grid-vue3";

  export default {
    name: 'RolePermissionForm',
    props: {
      data: Object,
    },
    components: {
      AgGridVue,
    },
    data() {
      return {
        role_permissions: JSON.parse(JSON.stringify(this.data.role_permissions)),
        permissions: {
          grid_api: null,
          column_defs: [
            {
              headerName: '',
              checkboxSelection: true,
              width: 80,
              suppressSizeToFit: true,
              lockPosition: true,
              cellRenderer: () => '<div class="flex items-center space-x-4">'
                + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="manage-offices"><i class="fas fa-building" title="Manage Offices" data-action="manage-offices"></i></button>'
                + '</div>',
            },
            {
              headerName: 'Permissions',
              sortable: true,
              filter: true,
              width: 300,
              valueGetter: params => params.data.name,
            },
            {
              headerName: 'Offices',
              sortable: true,
              filter: true,
              width: 560,
              wrapText: true,
              autoHeight: true,
              cellRenderer: params => {
                if (!params.data.offices) {
                  return '';
                }

                let col = '<div class="w-full flex flex-wrap">';

                params.data.offices.forEach(office => {
                  col += `<span class="text-white bg-gray-600 leading-relaxed m-1 px-4 py-1 rounded-full">${office.name} (${office.short_name})</span>`
                });

                return col += '</div>';
              },
              valueGetter: params => {
                if (!params.data.offices) {
                  return '';
                }
  
                let col = '';
  
                params.data.offices.forEach(office => {
                  col += `${office.name} (${office.short_name}), `
                });
  
                return col.substr(0, col.length - 2);
              },
            },
          ],
          row_data: [],
        },
        offices: {
          permission_id: null,
          grid_api: null,
          column_defs: [
            {
              headerName: '',
              checkboxSelection: true,
              width: 40,
              suppressSizeToFit: true,
            },
            {
              headerName: 'Offices',
              sortable: true,
              filter: true,
              width: 439,
              valueGetter: params => `${params.data.name} (${params.data.short_name})`,
              valueFormatter: params => `${params.data.name} (${params.data.short_name})`,
            },
          ],
          row_data: [],
        },
        errors: {},
        saving: false,
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/offices`)
      .then(response => {
        this.offices.row_data = response.data;
      })
      .catch(() => this.offices = []);

      this.axios.get(`${import.meta.env.VITE_API_URL}/api/permissions`)
      .then(response => {
        const permissions = response.data;

        permissions.forEach(permission => {
          this.role_permissions.forEach(role_permission => {
            if (role_permission.permission.id === permission.id) {
              permission.offices = role_permission.offices;
            }
          });
        });

        this.permissions.row_data = permissions;
      })
      .catch(() => this.offices = []);
    },
    methods: {
      permissionGridReady(params) {
        this.permissions.grid_api = params.api;
      },
      officeGridReady(params) {
        this.offices.grid_api = params.api;
      },
      getRowNodeId(data) {
        return data.id;
      },
      permissionDataRendered() {
        this.role_permissions.forEach(role_permission => {
          this.permissions.grid_api.getRowNode(role_permission.permission.id).setSelected(true);
        });
      },
      permissionCellClicked(params) {
        if (params.event.target.dataset.action) {
          switch (params.event.target.dataset.action) {
            case 'manage-offices':
              this.offices.permission_id = params.data.id;
              this.offices.column_defs[1].headerName = `Offices - ${params.data.name}`;
              this.offices.grid_api.deselectAll();
              params.data.offices?.forEach(office => {
                this.offices.grid_api.getRowNode(office.id).setSelected(true);
              });
              break;
          }
        }
      },
      officeSelectionChanged() {
        const row_node = this.permissions.grid_api.getRowNode(this.offices.permission_id);
        const data = row_node.data;
        data.offices = this.offices.grid_api.getSelectedRows();

        this.permissions.grid_api.applyTransaction({ update: [data] });
      },
      savePermissions() {
        this.axios.put(`${import.meta.env.VITE_API_URL}/api/role_permissions/${this.data.id}`, {
          permissions: this.permissions.grid_api.getSelectedRows(),
        })
        .then(() => {
          this.role_permissions = [];

          this.permissions.grid_api.getSelectedRows().forEach(permission => {
            this.role_permissions.push({
              permission: (({ id, name }) => ({ id, name }))(permission),
              offices: permission.offices,
            })
          });

          this.$emit('updatedPermissions', {
            ...this.data,
            role_permissions: this.role_permissions,
          });
        });
      },
    },
  }
</script>