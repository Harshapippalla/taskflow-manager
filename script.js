document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const inputError = document.getElementById('inputError');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize
    updateStats();
    renderTasks();
    
    // Add Task Event
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Filter Events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Set current filter and re-render
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
    
    // Clear Completed Tasks
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        
        // Validation
        if (!taskText) {
            showError('Please enter a task!');
            return;
        }
        
        if (taskText.length > 100) {
            showError('Task is too long (max 100 characters)');
            return;
        }
        
        // Clear error
        hideError();
        
        // Create new task object
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to tasks array
        tasks.push(newTask);
        
        // Update UI and storage
        updateLocalStorage();
        renderTasks();
        updateStats();
        
        // Clear input
        taskInput.value = '';
        taskInput.focus();
        
        // Add visual feedback
        addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
        addBtn.style.background = 'linear-gradient(to right, #4CAF50, #8BC34A)';
        
        setTimeout(() => {
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
            addBtn.style.background = 'linear-gradient(to right, #4facfe, #00f2fe)';
        }, 1000);
    }
    
    function renderTasks() {
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Clear task list
        taskList.innerHTML = '';
        
        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            
            let message = '';
            if (currentFilter === 'all') message = 'Add your first task using the input above!';
            else if (currentFilter === 'active') message = 'No active tasks!';
            else message = 'No completed tasks yet!';
            
            emptyState.innerHTML = `
                <i class="fas fa-clipboard-list fa-2x"></i>
                <h3>No tasks found</h3>
                <p>${message}</p>
            `;
            
            taskList.appendChild(emptyState);
            return;
        }
        
        // Render filtered tasks
        filteredTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }
    
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">${task.text}</div>
            <div class="task-actions">
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for this task
        const checkbox = li.querySelector('.task-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return li;
    }
    
    function toggleTask(taskId) {
        // Find task and toggle completed status
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            updateLocalStorage();
            renderTasks();
            updateStats();
        }
    }
    
    function deleteTask(taskId) {
        // Remove task from array
        tasks = tasks.filter(task => task.id !== taskId);
        updateLocalStorage();
        renderTasks();
        updateStats();
    }
    
    function clearCompletedTasks() {
        // Keep only active tasks
        tasks = tasks.filter(task => !task.completed);
        updateLocalStorage();
        renderTasks();
        updateStats();
    }
    
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
    }
    
    function updateLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function showError(message) {
        inputError.textContent = message;
        inputError.style.opacity = '1';
        taskInput.style.borderColor = '#ff4757';
        
        // Shake animation for input
        taskInput.classList.add('shake');
        setTimeout(() => taskInput.classList.remove('shake'), 500);
    }
    
    function hideError() {
        inputError.style.opacity = '0';
        taskInput.style.borderColor = '#e0e0e0';
    }
    
    // Add CSS for shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
});