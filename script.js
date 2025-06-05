document.addEventListener('DOMContentLoaded', () => {

    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const dueDateInput = document.getElementById('dueDate');
    const prioritySelect = document.getElementById('priority');

    const allTasksCount = document.getElementById('allTasksCount');
    const pendingTasksCount = document.getElementById('pendingTasksCount');
    const completedTasksCount = document.getElementById('completedTasksCount');
    const missingTasksCount = document.getElementById('missingTasksCount');

    const taskSummaryItems = document.querySelectorAll('.task-summary-item');
    const currentFilterText = document.getElementById('currentFilterText');
    const filterPrioritySelect = document.getElementById('filterPriority');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    const taskListContainer = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const emptyAll = document.getElementById('emptyAll');
    const emptyPending = document.getElementById('emptyPending');
    const emptyCompleted = document.getElementById('emptyCompleted');
    const emptyMissing = document.getElementById('emptyMissing');
    const emptyStateTextSmall = document.querySelector('.empty-state-text-small');

    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskIdInput = document.getElementById('editTaskId');
    const editTaskTitleInput = document.getElementById('editTaskTitle');
    const editTaskDescriptionInput = document.getElementById('editTaskDescription');
    const editDueDateInput = document.getElementById('editDueDate');
    const editPrioritySelect = document.getElementById('editPriority');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // Delete Confirmation 
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const deleteConfirmYes = document.getElementById('deleteConfirmYes');
    const deleteConfirmNo = document.getElementById('deleteConfirmNo');
    let taskIdToDelete = null; 


    // --- Global State ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentPriorityFilter = 'all';

    // For Add Task Form
    flatpickr(dueDateInput, {
        dateFormat: "m/d/Y",
        altInput: true,
        altFormat: "m/d/Y",
        appendTo: document.body,
        onClose: function(selectedDates, dateStr, instance) {
            dueDateInput.value = dateStr;
        }
    });

    // For Edit Task Modal
    const editFlatpickr = flatpickr(editDueDateInput, {
        dateFormat: "m/d/Y",
        altInput: true,
        altFormat: "m/d/Y",
        appendTo: document.body, 
        onClose: function(selectedDates, dateStr, instance) {
            editDueDateInput.value = dateStr;
        }
    });

    // Save tasks to Local Storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Helper function to check if a date is near the deadline
    function isNearDeadline(dueDateStr) {
        if (!dueDateStr) return false;

        const dueDate = new Date(dueDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0); 

        const timeDiff = dueDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        const deadlineThresholdDays = 3;
        return daysDiff >= 0 && daysDiff <= deadlineThresholdDays;
    }

    function isMissing(task) {
        if (!task.dueDate || task.isCompleted) return false;

        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate.getTime() < today.getTime();
    }

    function formatDueDateForDisplay(dueDateStr) {
    if (!dueDateStr) return ''; 

    const dueDate = new Date(dueDateStr);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
        return 'Today';
    } else {
        return dueDateStr; 
    }
}

    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = task.id;
        taskItem.dataset.priority = task.priority;

        const priorityClass = `task-priority-${task.priority}`;

        let statusNotice = '';
        if (isMissing(task)) {
            taskItem.classList.add('status-missing');
            taskItem.dataset.status = 'missing';
            statusNotice = `<span class="deadline-notice missing-notice"><i class="fas fa-exclamation-circle"></i>Missing!</span>`;
        } else if (!task.isCompleted && isNearDeadline(task.dueDate)) {
            taskItem.classList.add('near-deadline');
            statusNotice = `<span class="deadline-notice due-soon-notice"><i class="fas fa-exclamation-triangle"></i>Due Soon!</span>`;
            taskItem.dataset.status = 'pending'; 
        } else if (task.isCompleted) {
            taskItem.classList.add('status-completed');
            taskItem.dataset.status = 'completed';
        } else {
            taskItem.classList.add('status-pending');
            taskItem.dataset.status = 'pending';
        }

        const formattedDueDate = formatDueDateForDisplay(task.dueDate);
        const dueDateDisplay = task.dueDate 
            ? `<span class="task-due-date"><i class="far fa-calendar-alt"></i> ${formattedDueDate}</span>` 
            : `<span class="task-due-date no-due-date">No due date</span>`;

        let nearDeadlineNotice = '';
        if (!task.isCompleted && isNearDeadline(task.dueDate)) {
            taskItem.classList.add('near-deadline');
            nearDeadlineNotice = `<span class="deadline-notice"><i class="fas fa-exclamation-triangle"></i>Due Soon!</span>`;
        }

        if (isMissing(task)) {
            taskItem.classList.add('status-missing');
            taskItem.dataset.status = 'missing';
        } else if (task.isCompleted) {
            taskItem.classList.add('status-completed');
            taskItem.dataset.status = 'completed';
        } else {
            taskItem.classList.add('status-pending');
            taskItem.dataset.status = 'pending';
        }

        taskItem.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-actions">
                    <input type="checkbox" class="task-checkbox" ${task.isCompleted ? 'checked' : ''}>
                    <button class="task-edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                    <button class="task-delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <p class="task-description">${task.description || 'No description provided.'}</p>
            <div class="task-meta">
                ${dueDateDisplay}
                <span class="task-priority ${priorityClass}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                ${statusNotice}
            </div>
        `;

        // Event Listeners for actions within the task item
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        const editBtn = taskItem.querySelector('.task-edit-btn');
        editBtn.addEventListener('click', () => openEditModal(task.id)); 

        const deleteBtn = taskItem.querySelector('.task-delete-btn');
            deleteBtn.addEventListener('click', () => {
                taskIdToDelete = task.id; // store the task ID for deletion
                deleteConfirmModal.classList.add('active'); // show confirmation modal
            });

        return taskItem;
    }
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function renderTasks() {
        taskListContainer.innerHTML = '';
        let filteredTasks = tasks;

        if (currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.isCompleted && !isMissing(task));
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.isCompleted);
        } else if (currentFilter === 'missing') {
            filteredTasks = filteredTasks.filter(task => isMissing(task));
        }

        if (currentPriorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === currentPriorityFilter);
        }

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';

            emptyAll.style.display = 'none';
            emptyPending.style.display = 'none';
            emptyCompleted.style.display = 'none';
            emptyMissing.style.display = 'none';
            emptyStateTextSmall.style.display = 'none';

            if (currentFilter === 'all' && currentPriorityFilter === 'all') {
                emptyAll.style.display = 'block';
                emptyStateTextSmall.style.display = 'block';
            } else if (currentFilter === 'pending') {
                emptyPending.style.display = 'block';
            } else if (currentFilter === 'completed') {
                emptyCompleted.style.display = 'block';
            } else if (currentFilter === 'missing') {
                emptyMissing.style.display = 'block';
            } else {
                emptyAll.style.display = 'block';
            }
        } else {
            emptyState.style.display = 'none';
            filteredTasks.forEach(task => {
                taskListContainer.appendChild(createTaskElement(task));
            });
        }
        updateTaskCounts();
    }

    // Update the counts in the summary cards
    function updateTaskCounts() {
        allTasksCount.textContent = tasks.length;
        pendingTasksCount.textContent = tasks.filter(task => !task.isCompleted && !isMissing(task)).length;
        completedTasksCount.textContent = tasks.filter(task => task.isCompleted).length;
        missingTasksCount.textContent = tasks.filter(task => isMissing(task)).length;

        taskSummaryItems.forEach(item => {
            if (item.dataset.filter === currentFilter) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const filterTextMap = {
            'all': 'All Tasks',
            'pending': 'Pending',
            'completed': 'Completed',
            'missing': 'Missing'
        };
        currentFilterText.textContent = filterTextMap[currentFilter];
    }

    // Add a new task
    function addTask(title, description, dueDate, priority) {
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            dueDate,
            priority,
            isCompleted: false
        };
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
    }

    // Toggle task completion status
    function toggleTaskCompletion(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            const wasCompleted = tasks[taskIndex].isCompleted;
            tasks[taskIndex].isCompleted = !wasCompleted;

            saveTasks();
            renderTasks();

            if (!wasCompleted && tasks[taskIndex].isCompleted) {
                confetti({
                    particleCount: 500,
                    spread: 150,
                    origin: { y: 0.8 }
                });
            }
        }
    }

    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        // Populate the form fields with current task data
        editTaskIdInput.value = task.id;
        editTaskTitleInput.value = task.title;
        editTaskDescriptionInput.value = task.description;
        editDueDateInput.value = task.dueDate;
        editFlatpickr.setDate(task.dueDate); 
        editPrioritySelect.value = task.priority;

        editTaskModal.classList.add('active'); 
    }

    function closeEditModal() {
        editTaskModal.classList.remove('active'); 
        editTaskForm.reset(); 
        editFlatpickr.clear(); 
    }

    // Replaced the old editTask function with this new logic
    function saveEditedTask() {
        const id = editTaskIdInput.value;
        const taskIndex = tasks.findIndex(t => t.id === id);

        if (taskIndex > -1) {
            tasks[taskIndex].title = editTaskTitleInput.value.trim();
            tasks[taskIndex].description = editTaskDescriptionInput.value.trim();
            tasks[taskIndex].dueDate = editDueDateInput.value.trim();
            tasks[taskIndex].priority = editPrioritySelect.value;

            saveTasks();
            renderTasks();
            closeEditModal(); // Close the modal after saving
        }
    }
    function showDeleteConfirm(id) {
        taskIdToDelete = id;
        deleteConfirmModal.classList.add('active');
    }
    
    function hideDeleteConfirm() {
        deleteConfirmModal.classList.remove('active'); 
        taskIdToDelete = null;
    }
    
    deleteConfirmYes.addEventListener('click', () => {
        if (taskIdToDelete) {
            deleteTask(taskIdToDelete);
        }
        hideDeleteConfirm(); 
    });

    deleteConfirmNo.addEventListener('click', () => {
        hideDeleteConfirm(); 
    });

    editTaskModal.addEventListener('click', (event) => {
        if (event.target === editTaskModal) {
            closeEditModal();
        }
    });

    deleteConfirmModal.addEventListener('click', (event) => {
        if (event.target === deleteConfirmModal) {
            hideDeleteConfirm();
        }
    });

    // Form Submission
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = dueDateInput.value.trim();
        const priority = prioritySelect.value;

        if (!title) {
            alert('Task title cannot be empty!');
            return;
        }

        addTask(title, description, dueDate, priority);

        taskForm.reset();
        taskTitleInput.focus();
        flatpickr.clear();
    });

    editTaskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveEditedTask();
    });

    cancelEditBtn.addEventListener('click', closeEditModal);

    editTaskModal.addEventListener('click', (event) => {
        if (event.target === editTaskModal) {
            closeEditModal();
        }
    });

    taskSummaryItems.forEach(item => {
        item.addEventListener('click', () => {
            currentFilter = item.dataset.filter;
            renderTasks();
        });
    });

    filterPrioritySelect.addEventListener('change', (event) => {
        currentPriorityFilter = event.target.value;
        renderTasks();
    });

    clearFiltersBtn.addEventListener('click', () => {
        currentFilter = 'all';
        currentPriorityFilter = 'all';
        filterPrioritySelect.value = 'all';
        renderTasks();
    });

    renderTasks();
});