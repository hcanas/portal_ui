<template>
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-gray-700 text-2xl font-bold">Employees</h1>
    <div class="flex items-center space-x-4">
      <input type="search" v-model="filter_text" placeholder="Search keyword..." class="text-sm px-2 py-1 border rounded">
    </div>
  </div>

  <ag-grid-vue v-if="employees.length > 0"
    @grid-ready="gridReady"
    @selection-changed="selectionChanged"
    :columnDefs="column_defs"
    :rowData="employees"
    :rowSelection="'single'"
    :getRowNodeId="getRowNodeId"
    :pagination="true"
    :paginationPageSize="25"
    class="flex-shrink-0 ag-theme-alpine w-full h-96 mb-12"
  />

  <h1 class="text-gray-700 text-xl font-medium mb-4">Time Attendance {{ employee ? `- ${employee.name}` : '' }}</h1>

  <v-calendar
  @update:from-page="updateDates"
  class="custom-calendar w-full"
  :masks="masks"
  :attributes="time_attendance"
  trim-weeks
  >
    <template v-slot:day-content="{ day, attributes }">
      <div class="flex flex-col h-full z-10 overflow-hidden p-1">
        <span class="day-label text-sm text-gray-900">{{ day.day }}</span>
        <div class="flex-grow overflow-y-auto overflow-x-auto h-28">
          <p
          v-for="attr in attributes"
          :key="attr.key"
          class="text-xs leading-tight rounded-sm p-1 mt-0 mb-1"
          :class="attr.customData.class"
          >
            {{ attr.customData.title }}
          </p>
        </div>
      </div>
    </template>
  </v-calendar>
</template>
<script>
  import "ag-grid-community/dist/styles/ag-grid.css";
  import "ag-grid-community/dist/styles/ag-theme-alpine.css";
  import { AgGridVue } from "ag-grid-vue3";
  import Modal from "../components/overlays/Modal.vue";

  export default {
    name: 'Home',
    components: {
      AgGridVue,
      Modal,
    },
    data() {
      return {
        grid_api: null,
        column_defs: [
          {
            headerName: 'Name',
            field: 'name',
            sortable: true,
            width: 1113,
          },
          {
            headerName: 'Position',
            field: 'title',
            sortable: true,
            width: 200,
          },
          {
            headerName: 'Department',
            field: 'deptname',
            sortable: true,
            width: 200,
          },
        ],
        filter_text: '',
        masks: {
          weekdays: 'WWW',
        },
        employee: null,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employees: [],
        time_attendance: [],
      };
    },
    created() {
      this.axios.get(`${import.meta.env.VITE_API_URL}/api/employees`,)
      .then(response => this.employees = response.data)
      .catch(() => this.employees = []);
    },
    methods: {
      gridReady(params) {
        this.grid_api = params.api;
      },
      getRowNodeId(data) {
        return data.userid;
      },
      selectionChanged(event) {
        this.employee = event.api.getSelectedRows()[0];
        this.loadRecords();
      },
      updateDates(event) {
        this.month = event.month;
        this.year = event.year;
        this.loadRecords();
      },
      loadRecords() {
        this.axios.get(`${import.meta.env.VITE_API_URL}/api/time_attendance?id=${this.employee?.userid}&month=${this.month}&year=${this.year}`)
        .then(response => {
          const data = response.data;
          this.time_attendance = [];

          data.forEach(item => {
            const date = new Date(item.checktime);

            this.time_attendance.push({
              customData: {
                title: date.toTimeString().substring(0, date.toTimeString().indexOf('G')),
                class: item.checktype === 'I' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
              },
              dates: date,
            });
          });
        })
        .catch(() => this.time_attendance = []);
      }
    },
    watch: {
      filter_text(val) {
        this.grid_api.setQuickFilter(val);
      },
    },
  }
</script>