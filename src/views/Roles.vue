<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-gray-700 text-2xl font-bold">Roles</h1>
    <div class="flex items-center space-x-4">
      <input type="search" v-model="filter_text" placeholder="Search keyword..." class="text-sm px-2 py-1 border rounded">
      <button type="button" @click="showModal('role-form')" class="w-40 text-white bg-green-600 hover:bg-green-500 px-2 py-1 rounded">New Role</button>
    </div>
  </div>

  <ag-grid-vue v-if="roles.length > 0"
  @grid-ready="gridReady"
  @cell-clicked="cellClicked"
  :columnDefs="column_defs"
  :rowData="roles"
  :rowSelection="'single'"
  :getRowNodeId="getRowNodeId"
  :pagination="true"
  :paginationPageSize="25"
  class="ag-theme-alpine w-full h-5/6"
  >
  </ag-grid-vue>

  <modal :show="modal.show" @close="closeModal">
    <component @created-role="createdRole" @updated-role="updatedRole" @updated-permissions="updatedPermissions" @close="closeModal" @cancel="closeModal" :data="modal.data" :is="modal.component"></component>
  </modal>
</template>
<script>
  import "ag-grid-community/dist/styles/ag-grid.css";
  import "ag-grid-community/dist/styles/ag-theme-alpine.css";
  import { AgGridVue } from "ag-grid-vue3";
  import Modal from "../components/overlays/Modal.vue";
  import RoleForm from "../components/forms/RoleForm.vue";
  import RolePermissionForm from "../components/forms/RolePermissionForm.vue";
  import SuccessMessage from "../components/messages/SuccessMessage.vue";

  export default {
    name: 'Roles',
    components: {
      AgGridVue,
      Modal,
      RoleForm,
      RolePermissionForm,
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
        roles: [],
        column_defs: [
          {
            headerName: '',
            width: 110,
            lockPosition: true,
            cellRenderer: () => '<div class="flex items-center space-x-4">'
              + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="edit-role"><i class="fas fa-edit" title="Edit Role" data-action="edit-role"></i></button>'
              + '<button type="button" class="text-gray-600 hover:text-green-600 outline-none ring-0" data-action="manage-permissions"><i class="fas fa-user-lock" title="Manage Permissions" data-action="manage-permissions"></i></button>'
              + '<button type="button" class="text-gray-600 hover:text-red-600 outline-none ring-0" data-action="delete-role"><i class="fas fa-trash" title="Delete Role" data-action="delete-role"></i></button>'
              + '</div>',
          },
          {
            headerName: 'Name',
            field: 'name',
            sortable: true,
            resizable: true,
            flex: 1,
          },
          {
            headerName: 'Permissions',
            sortable: true,
            resizable: true,
            flex: 2,
            autoHeight: true,
            cellRenderer: params => {
              if (!params.data.role_permissions) {
                return '';
              }

              let permissions = '<div class="flex flex-wrap">';

              params.data.role_permissions.forEach(role_permission => {
                permissions += `<span class="text-white bg-gray-600 leading-relaxed m-1 px-4 py-1 rounded-full">${role_permission.permission.name}`;

                if (role_permission.offices) {
                  permissions += ' (';

                  role_permission.offices.forEach(office => {
                    permissions += office.short_name + ', ';
                  });

                  permissions = permissions.substr(0, permissions.length - 2) + ')';
                }

                permissions += '</span>';
              });

              permissions += '</div>';

              return permissions;
            },
            getQuickFilterText: params => {
              if (!params.data.role_permissions) {
                return '';
              }

              let permissions = '';

              params.data.role_permissions.forEach(role_permission => {
                permissions += `${role_permission.permission.name}.`;

                if (role_permission.offices) {
                  permissions += '';

                  role_permission.offices.forEach(office => {
                    permissions += office.short_name + ', ';
                  });

                  permissions = permissions.substr(0, permissions.length - 2) + ' ';
                }
              });

              return permissions;
            },
          },
        ],
      }
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/roles`)
      .then(response => this.roles = response.data)
      .catch(() => this.roles = []);
    },
    methods: {
      gridReady(params) {
        this.grid_api = params.api;
      },
      cellClicked(params) {
        if (params.event.target.dataset.action) {
          switch (params.event.target.dataset.action) {
            case 'edit-role':
              this.modal.show = true;
              this.modal.component = 'role-form';
              this.modal.data = params.data;
              break;

            case 'manage-permissions':
              this.modal.show = true;
              this.modal.component = 'role-permission-form';
              this.modal.data = params.data;
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
        this.modal.data = data ?? { name: '' };
      },
      closeModal() {
        this.modal.show = false;
        this.modal.component = '';
        this.modal.data = {};
      },
      createdRole(role) {
        this.grid_api.applyTransaction({
          add: [role],
          addIndex: 0,
        });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${role.name} has been created.` };
      },
      updatedRole(role) {
        this.grid_api.applyTransaction({ update: [role] });
        this.modal.component = 'success-message';
        this.modal.data = { message: `${role.name} has been updated.` };
      },
      updatedPermissions(role) {
        this.grid_api.applyTransaction({ update: [role] })
        this.modal.component = 'success-message';
        this.modal.data = { message: `${role.name} permissions have been updated.`}
      },
    },
    watch: {
      filter_text(val) {
        this.grid_api.setQuickFilter(val);
      },
    },
  }
</script>