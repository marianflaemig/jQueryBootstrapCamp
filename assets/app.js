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


$(function () {
    console.log('jQuery and Bootstrap are ready!');

    // Initialize DataTables only when the Tasks tab is clicked/visible
    let dataTableInitialized = false;

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
                        // You can add logic here to display a more user-friendly error message
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

    $(document).on('click', 'delete-btn', function (e) {
        e.preventDefault();

        if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) {
            return;
        }
    });

});

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

