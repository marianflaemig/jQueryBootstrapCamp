<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }


    public function numberOfTasks(string $status): int
    {

        $statuses = ['closed', 'cancelled', 'on hold', 'in progress'];

        if (!in_array($status, $statuses)) {
            return -1;
        }

        return (int) $this->createQueryBuilder('task')
            ->select('COUNT(task.id)')
            ->where('task.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getEmployees(): array
    {
        return $this->createQueryBuilder('task')
            ->select('task.assignee')
            ->distinct()
            ->getQuery()
            ->getResult();
    }

    public function taskPerEmployee($employee): int
    {
        return $this->createQueryBuilder('task')
            ->select('COUNT(task.id)')
            ->where('task.assignee = :employee')
            ->setParameter('employee', $employee)
            ->getQuery()
            ->getSingleScalarResult();
    }

    //    /**
    //     * @return Task[] Returns an array of Task objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('t.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Task
    //    {
    //        return $this->createQueryBuilder('t')
    //            ->andWhere('t.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
