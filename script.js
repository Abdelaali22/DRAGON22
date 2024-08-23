document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    checkForUpcomingTasks();
    generateCalendar();

    document.getElementById('task-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('task-name').value;
        const time = document.getElementById('task-time').value;
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;

        if (!name || !time) {
            alert('Please enter the task name and time.');
            return;
        }

        addTask(name, time, category, priority);
        saveTasks();
        document.getElementById('task-form').reset();
    });

    document.getElementById('search-bar').addEventListener('input', filterTasks);
    document.getElementById('filter-category').addEventListener('change', filterTasks);

    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});

function addTask(name, time, category, priority) {
    const taskList = document.getElementById('task-list');
    const taskItem = document.createElement('li');
    taskItem.setAttribute('data-category', category);
    taskItem.innerHTML = `
        <span>${name}</span>
        <div class="task-details">
            <span>Due: ${new Date(time).toLocaleString()}</span> | 
            <span>Category: ${category.charAt(0).toUpperCase() + category.slice(1)}</span> | 
            <span>Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
        </div>
        <button onclick="removeTask(this)">Delete</button>
    `;
    taskList.appendChild(taskItem);
}

function removeTask(button) {
    button.parentElement.remove();
    saveTasks();
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(task => {
        const name = task.querySelector('span').textContent;
        const [dueTimeText, categoryText, priorityText] = task.querySelector('.task-details').textContent.split('|').map(t => t.split(':')[1].trim());
        const time = new Date(dueTimeText).toISOString();
        const category = categoryText.toLowerCase();
        const priority = priorityText.toLowerCase();
        tasks.push({ name, time, category, priority });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.forEach(task => {
        addTask(task.name, task.time, task.category, task.priority);
    });
}

function filterTasks() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const selectedCategory = document.getElementById('filter-category').value;

    document.querySelectorAll('#task-list li').forEach(task => {
        const taskName = task.querySelector('span').textContent.toLowerCase();
        const taskCategory = task.getAttribute('data-category');

        if (taskName.includes(searchTerm) && (selectedCategory === 'all' || taskCategory === selectedCategory)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
}

function checkForUpcomingTasks() {
    setInterval(() => {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const now = new Date().getTime();
        tasks.forEach(task => {
            const taskTime = new Date(task.time).getTime();
            if (taskTime - now <= 60000 && taskTime - now >= 0) { // 1 minute before task time
                triggerNotification(task.name);
            }
        });
    }, 10000); // Check every 10 seconds
}

function triggerNotification(taskName) {
    if (Notification.permission === 'granted') {
        new Notification('Task Reminder', {
            body: `It's time to start your task: ${taskName}`,
            icon: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png'
        });
    } else {
        alert(`It's time to start your task: ${taskName}`);
    }
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;

        if (i === now.getDate()) {
            dayDiv.classList.add('active');
        }

        calendar.appendChild(dayDiv);
    }
}
