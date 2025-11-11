<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TaskApiController extends AbstractController
{
    #[Route('/task/data', name: 'app_task_data', methods: ['GET'])]
    public function dataTablesData(): Response
    {
        $tasks = [
            [
                "ID" => 1,
                "Task Name" => "Implement Frontend Tab Logic",
                "Assignee" => "Robert",
                "Status" => "open",
                "Due Date" => "10.03.2025",
                "Notes" => "Must use Bootstrap 5 Tab component.",
            ],
            [
                "ID" => 2,
                "Task Name" => "Setup Symfony Backend Routes",
                "Assignee" => "Alice",
                "Status" => "in progress",
                "Due Date" => "15.03.2025",
                "Notes" => "Need endpoints for CRUD operations.",
            ],
            [
                "ID" => 3,
                "Task Name" => "Configure DataTables (jQuery Fix)",
                "Assignee" => "Robert",
                "Status" => "closed",
                "Due Date" => "05.03.2025",
                "Notes" => "Fixed the '.DataTable is not a function' error.",
            ],
            // ... more tasks ...
        ];

        return new JsonResponse($tasks);
    }
}
