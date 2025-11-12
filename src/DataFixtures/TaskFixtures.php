<?php

namespace App\DataFixtures;

use App\Entity\Task;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TaskFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $assignees = [
            'Robert',
            'Jessica',
            'Paul',
            'Robin',
            'Angela',
            'Joey'
            ];

        $statuses = [
            'in progress',
            'cancelled',
            'closed',
            'on hold'
        ];

        for ($i = 1; $i <= 1000; $i++) {

            $task = new Task();

            $task -> setAssignee($assignees[array_rand($assignees)]);
            $task -> setName('Task ' . $i);
            $task -> setDueDate(new \DateTime(date('d.m.Y', mt_rand(strtotime('2025-01-01'), strtotime('2025-12-31')))));
            $task -> setStatus($statuses[array_rand($statuses)]);
            $task -> setNotes(($task -> getStatus() === 'closed'
                ? 'Completed successfully.'
                : 'Priority: ' . $task->getAssignee()));

            $manager -> persist($task);
        }
        $manager -> flush();
    }
}
