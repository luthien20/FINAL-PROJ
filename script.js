
document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const dueDateInput = document.getElementById('dueDate');
    const prioritySelect = document.getElementById('priority');

    dueDateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue += value.substring(0, 2);
            if (value.length > 2) {
                formattedValue += '/' + value.substring(2, 4);
            }
            if (value.length > 4) {
                formattedValue += '/' + value.substring(4, 8);
            }
        }
        e.target.value = formattedValue;
    });

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const taskTitle = taskTitleInput.value.trim();
        const taskDescription = taskDescriptionInput.value.trim();
        const dueDate = dueDateInput.value.trim();
        const priority = prioritySelect.value;

    });

});