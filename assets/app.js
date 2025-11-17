import './stimulus_bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';

import 'bootstrap';
import {Tab, Modal} from 'bootstrap';

import $ from 'jquery';

window.$ = window.jQuery = $;

import 'datatables.net';
import 'datatables.net-bs5';

import 'chart.js';


$(function () {
    console.log('jQuery and Bootstrap are ready!');

    // Initialize DataTables only when the Tasks tab is clicked/visible
    let dataTableInitialized = false;
    let employeeTableInitialized = false;

    // Listen for the Bootstrap 'shown.bs.tab' event on the content panels
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        const targetContentId = $(e.target).attr('href').substring(1); // e.g., 'tasks-content'

        // 1. Manage Sidebar 'active' Class
        // Find the LI element whose data-content-id matches the target content ID
        $('.sidebar .nav-item').removeClass('active');
        $(`.sidebar .nav-item[data-content-id="${targetContentId}"]`).addClass('active');

        // 2. Initialize DataTables on the first view of the 'Tasks' tab
        if (targetContentId === 'tasks-content' && !dataTableInitialized) {
            $('#task_list_table').DataTable({
                "ajax": {
                    // Points to the new Symfony Controller endpoint
                    "url": "/task/data",
                    "type": "GET",
                    "dataSrc": function (json) {
                        return json;
                    },
                    "error": function (xhr, error, thrown) {
                        console.log("AJAX Error Details:", xhr.status, thrown);
                    }
                },
                "columns": [
                    {"data": "ID"},
                    {"data": "Task Name"},
                    {"data": "Assignee"},
                    {"data": "Status"},
                    {"data": "Due Date"},
                    {"data": "Notes"},
                    {
                        "data": "Actions",
                        "orderable": false, // Disable sorting on the Actions column
                        "searchable": false // Disable searching on the Actions column
                    }
                ],
                // ------------------------------------------------
                "paging": true,
                "searching": true,
                "ordering": true,
                "info": true,
            });

            dataTableInitialized = true;

        } else if (targetContentId === 'dashboard-content') {

            // dashboard page status chart
            $.ajax({
                url: '/task/status',
                method: 'GET',
                success: function (response) {

                    const xValues = ['in progress', 'closed', 'cancelled', 'on hold'];
                    const yValues = [
                        response['in progress'],
                        response['closed'],
                        response['cancelled'],
                        response['on hold'],
                    ];

                    const barColors = [
                        "#b91d47",
                        "#00aba9",
                        "#2b5797",
                        "#e8c3b9",
                        // "#1e7145"
                    ];

                    new Chart('statusChart', {
                        type: 'doughnut',
                        data: {
                            labels: xValues,
                            datasets: [{
                                backgroundColor: barColors,
                                data: yValues
                            }]
                        },
                        options: {
                            responsive: false,
                            legend: {
                                display: true,
                                position: 'right',
                            },
                        },
                    });
                },
                error: function () {
                    alert('An error occurred while fetching task status graph.');
                }
            });

            // employee status table
            if (employeeTableInitialized === false) {

                $('#employee_task_table').DataTable({
                    "ajax": {
                        // Points to the new Symfony Controller endpoint
                        "url": "/task/employees",
                        "type": "GET",
                        "dataSrc": function (json) {
                            return json;
                        },
                        "error": function (xhr, error, thrown) {
                            console.log("AJAX Error Details:", xhr.status, thrown);
                        }
                    },
                    "columns": [
                        {"data": "Assignee"},
                        {
                            "data": "Tasks",
                        },
                    ],
                    // ------------------------------------------------
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                });

                employeeTableInitialized = true;
            }
        }
    });

    // Manually trigger the 'Tasks' tab to show initially and initialize DataTables
    const taskLink = document.querySelector('a[href="#tasks-content"]');
    if (taskLink) {
        // 1. Get the Tab instance associated with the element
        const taskTab = Tab.getOrCreateInstance(taskLink);
        // 2. Call the show method on the instance
        taskTab.show();
    }

    const taskModal = $('#taskModal');
    const modalBody = $('#taskModalBody');

    taskModal.on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const taskId = button.data('task-id');

        const url = taskId
            ? `/task/form/${taskId}`
            : '/task/form/';

        modalBody.html('<p>Loading...</p>');
        document.getElementById('taskModalLabel').textContent = 'Loading...';

        $.ajax({
            url: url,
            method: 'GET',
            success: function (html) {
                modalBody.html(html);
            },
            error: function () {
                modalBody.html('<div class="alert alert-danger">Error loading form.</div>');
            }
        })
    });

    modalBody.on('submit', 'form', function (e) {
        e.preventDefault();

        const form = $(this);
        const url = form.attr('action');

        $.ajax({
            url: url,
            method: 'POST',
            data: form.serialize(),
            success: function (response) {

                // Remove focus from the currently active element (the Submit button).
                // This resolves the aria-hidden focus conflict/warning.
                if (document.activeElement) {
                    document.activeElement.blur();
                }

                const modalInstance = Modal.getInstance(taskModal);

                if (modalInstance) {
                    modalInstance.hide();
                }
                const dataTable = $('#task_list_table').DataTable();
                dataTable.ajax.reload(null, false);
            },
            error: function (xhr) {
                if (xhr.status === 400 && xhr.responseJSON && xhr.responseJSON.html) {
                    // Inject the returned HTML (which contains the form and validation errors)
                    modalBody.html(xhr.responseJSON.html);
                } else {
                    alert('An unexpected error occurred during submission.');
                }
            }
        });
    });

    $('#tasks-content').on('click', '.delete-btn', function (e) {
        e.preventDefault();

        if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) {
            return;
        }

        const button = $(this);
        const taskId = button.data('task-id');

        $.ajax({
            url: `/task/delete/${taskId}`,
            method: 'POST',
            success: function (response) {
                console.log(response.message);

                // Remove focus from the currently active element (the Delete button).
                // This resolves the aria-hidden focus conflict/warning.
                if (document.activeElement) {
                    document.activeElement.blur();
                }

                // IMPORTANT: Reload DataTables content to show deletion instantly
                const dataTable = $('#task_list_table').DataTable();
                dataTable.ajax.reload(null, false);
            },
            error: function () {
                alert('An error occurred while deleting the task.');
            }
        });
    });
});

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

