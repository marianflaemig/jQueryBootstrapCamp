<?php

namespace App\Controller;

use App\Entity\Task;
use App\Form\TaskType;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TaskApiController extends AbstractController
{
    private TaskRepository $taskRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager, TaskRepository $taskRepository)
    {
        $this->taskRepository = $taskRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/task/data', name: 'app_task_data', methods: ['GET'])]
    public function dataTablesData(): Response
    {
        $data = [];
        $tasks = $this->taskRepository->findAll();

        foreach ($tasks as $task) {
            $data[] = [
                "ID" => $task->getId(),
                "Task Name" => $task->getName(),
                "Assignee" => $task->getAssignee(),
                "Status" => $task->getStatus(),
                "Due Date" => $task->getDueDate()->format('d.m.Y'),
                "Notes" => $task->getNotes(),
                "Actions" =>
                    "<button class=\"btn btn-sm btn-success edit-btn me-2\"
                            data-bs-toggle=\"modal\" data-bs-target=\"#taskModal\"
                            data-task-id=\"" . $task->getId() . "\">Edit</button>
                     <button class=\"btn btn-sm btn-danger delete-btn\"
                            data-task-id=\"" . $task->getId() . "\">Delete</button>"
            ];
        }

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * Renders the form fragment (for New or Edit) to be loaded via AJAX into the modal body.
     */
    #[Route('/task/form/{id?}', name: 'app_task_form_fragment', methods: ['GET'])]
    public function formFragment(Task $task = null): Response
    {
        if (!$task) {
            $task = new Task();
        }

        $form = $this->createForm(TaskType::class, $task, [
            'action' => $this->generateUrl('app_task_save', ['id' => $task->getId()]),
            'method' => 'POST'
        ]);

        return $this->render('task/_form.html.twig', [
            'form' => $form->createView(),
            'isNew' => $task->getId() === null,
        ]);
    }

    /**
     * Handles the AJAX submission (New or Edit).
     */
    #[Route('/task/save/{id?}', name: 'app_task_save', methods: ['POST'])]
    public function save(Task $task = null, Request $request, EntityManagerInterface $entityManager): Response
    {
        $isNew = false;

        if (!$task) {
            $task = new Task();
            $isNew = true;
        }

        $form = $this->createForm(TaskType::class, $task, []);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($task);
            $entityManager->flush();

            return new JsonResponse([
                'status' => 'success',
                'message' => 'Task successfully ' . $isNew ? 'created!' : 'updated!',
                'taskId' => $task->getId(),
            ]);
        }

        $html = $this->renderView('task/_form.html.twig', [
            'form' => $form->createView(),
            'isNew' => $isNew,
        ]);

        return new JsonResponse([
            'status' => 'error',
            'html' => $html
        ], Response::HTTP_BAD_REQUEST);
    }

    #[Route('/task/delete/{id}', name: 'app_task_delete', methods: ['POST'])]
    public function delete(Task $task): Response
    {
        $taskId = $task->getId();

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return new JsonResponse([
            'status' => 'success',
            'message' => 'Task #' . $taskId . ' successfully deleted!',
        ]);
    }

    #[Route('/task/status', name: 'app_task_status', methods: ['GET'])]
    public function taskStatuses(): Response
    {
        $statuses = ['closed', 'cancelled', 'on hold', 'in progress'];

        $result = [
            'closed' => $this->taskRepository->numberOfTasks('closed'),
            'cancelled' => $this->taskRepository->numberOfTasks('cancelled'),
            'on hold' => $this->taskRepository->numberOfTasks('on hold'),
            'in progress' => $this->taskRepository->numberOfTasks('in progress'),
        ];

        return new JsonResponse($result, Response::HTTP_OK);
    }

    #[Route('/task/employees', name: 'app_task_status_employees', methods: ['GET'])]
    public function employeesTaskStatus(): Response
    {
        $data = [];

        $employees = $this->taskRepository->getEmployees();
        foreach ($employees as $employee) {
            $data[] = [
                'Assignee' => $employee['assignee'],
                'Tasks' => $this->taskRepository->taskPerEmployee($employee['assignee']),
            ];
        }

        return new JsonResponse($data, Response::HTTP_OK);
    }
}
