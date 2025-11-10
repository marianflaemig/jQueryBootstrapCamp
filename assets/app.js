/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';

import 'bootstrap';
import $ from 'jquery';
import 'datatables';

window.$ = window.jQuery = $;

$(function() {
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
                // Your DataTables configuration here
            });
            dataTableInitialized = true;
        }
    });

    // Manually trigger the 'Tasks' tab to show initially and initialize DataTables
    $('a[href="#tasks-content"]').tab('show');


});

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

