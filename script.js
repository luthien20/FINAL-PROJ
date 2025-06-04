document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const dueDateInput = document.getElementById('dueDate');
    const prioritySelect = document.getElementById('priority');

    const allTasksCount = document.getElementById('allTasksCount');
    const pendingTasksCount = document.getElementById('pendingTasksCount');
    const completedTasksCount = document.getElementById('completedTasksCount');

    const taskSummaryItems = document.querySelectorAll('.task-summary-item');
    const currentFilterText = document.getElementById('currentFilterText');
    const filterPrioritySelect = document.getElementById('filterPriority');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    const taskListContainer = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');

    // --- Global State ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []; 
    let currentFilter = 'all'; 
    let currentPriorityFilter = 'all'; 


    // --- Flatpickr Initialization ---
    flatpickr(dueDateInput, {
        dateFormat: "m/d/Y", 
        altInput: true, 
        altFormat: "m/d/Y",
        appendTo: document.body, 
        onClose: function(selectedDates, dateStr, instance) {
            // This ensures the input value is updated correctly by Flatpickr
            dueDateInput.value = dateStr;
        }
    });

    // --- Functions ---

    // Save tasks to Local Storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item', `status-${task.isCompleted ? 'completed' : 'pending'}`);
        taskItem.dataset.id = task.id;
        taskItem.dataset.status = task.isCompleted ? 'completed' : 'pending';
        taskItem.dataset.priority = task.priority;

        const priorityClass = `task-priority-${task.priority}`;

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
                ${task.dueDate ? `<span class="task-due-date"><i class="far fa-calendar-alt"></i> ${task.dueDate}</span>` : ''}
                <span class="task-priority ${priorityClass}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
            </div>
        `;

        // Event Listeners for actions within the task item
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        const editBtn = taskItem.querySelector('.task-edit-btn');
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = taskItem.querySelector('.task-delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        return taskItem;
    }

    // Render all tasks based on current filters
    function renderTasks() {
        taskListContainer.innerHTML = ''; // Clear existing tasks
        let filteredTasks = tasks;

        // Apply main filter (All, Pending, Completed)
        if (currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.isCompleted);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.isCompleted);
        }

        // Apply priority filter
        if (currentPriorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === currentPriorityFilter);
        }

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
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
        pendingTasksCount.textContent = tasks.filter(task => !task.isCompleted).length;
        completedTasksCount.textContent = tasks.filter(task => task.isCompleted).length;

        // Update active class for summary items
        taskSummaryItems.forEach(item => {
            if (item.dataset.filter === currentFilter) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update filter text
        const filterTextMap = {
            'all': 'All Tasks',
            'pending': 'Pending',
            'completed': 'Completed'
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

            // Trigger confetti if task was just completed
            if (!wasCompleted && tasks[taskIndex].isCompleted) {
                // Confetti animation
                confetti({
                    particleCount: 350, // Number of confetti particles
                    spread: 150,         // How wide the confetti spreads
                    origin: { y: 0.6 }  // Origin of the confetti (bottom-center)
                });
            }
        }
    }

    // Edit a task 
    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newTitle = prompt('Edit Task Title:', task.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            task.title = newTitle.trim();
        }

        const newDescription = prompt('Edit Task Description:', task.description);
        if (newDescription !== null) { // Allow empty description
            task.description = newDescription.trim();
        }

        const newDueDate = prompt('Edit Due Date (mm/dd/yyyy):', task.dueDate);
        if (newDueDate !== null) {
            // Basic date format validation could be added here
            task.dueDate = newDueDate.trim();
        }

        const newPriority = prompt('Edit Priority (minor, moderate, top):', task.priority);
        if (newPriority !== null && ['minor', 'moderate', 'top'].includes(newPriority.toLowerCase())) {
            task.priority = newPriority.toLowerCase();
        }
        
        saveTasks();
        renderTasks();
    }

    // Delete a task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    }

    // --- Event Listeners ---

    // Form Submission
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = dueDateInput.value.trim(); // Flatpickr handles formatting
        const priority = prioritySelect.value;

        if (!title) {
            alert('Task title cannot be empty!');
            return;
        }

        addTask(title, description, dueDate, priority);

        // Clear form
        taskForm.reset();
        taskTitleInput.focus();
        // Flatpickr might not reset its internal value, so explicitly clear if needed
        flatpickr.clear();
    });

    // Summary Card Filter Clicks
    taskSummaryItems.forEach(item => {
        item.addEventListener('click', () => {
            currentFilter = item.dataset.filter;
            renderTasks();
        });
    });

    // Priority Filter Dropdown
    filterPrioritySelect.addEventListener('change', (event) => {
        currentPriorityFilter = event.target.value;
        renderTasks();
    });

    // Clear Filters Button
    clearFiltersBtn.addEventListener('click', () => {
        currentFilter = 'all';
        currentPriorityFilter = 'all';
        filterPrioritySelect.value = 'all'; // Reset dropdown
        renderTasks();
    });

    // --- Initial Load ---
    renderTasks(); 
});