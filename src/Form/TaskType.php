<?php

namespace App\Form;

use App\Entity\Task;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TaskType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class,[
                'label' => 'Task Name',
                'attr' => [
                    'class' => 'form-control',
                ]
            ])
            ->add('assignee', TextType::class,[
                'attr' => [
                    'class' => 'form-control',
                ]
            ])
            ->add('status', ChoiceType::class, [
                'choices' => [
                    'In Progress' => 'in progress',
                    'Closed' => 'closed',
                    'Cancelled' => 'cancelled',
                    'On Hold' => 'on hold',
                ],
                'label' => 'Status',
                'attr' => [
                    'class' => 'form-select',
                ]
            ])
            ->add('dueDate', DateType::class,[
                'label' => 'Due Date',
                'attr' => [
                    'class' => 'form-control',
                ]
            ])
            ->add('notes', TextareaType::class,[
                'label' => 'Notes',
                'required' => false,
                'attr' => [
                    'class' => 'form-control',
                    'rows' => 3,
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Task::class,
            'attr' => ['id' => 'task_form_ajax'], // IMPORTANT for jQuery/AJAX targeting
        ]);
    }
}
