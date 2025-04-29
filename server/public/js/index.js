class Todo {
    constructor(username) {
        this.username = username;
        this.currentLi = null;
        this.input = document.querySelector('.todo-app__task');
        this.list = document.querySelector('.todo-app__list-container');
        this.addButton = document.querySelector('.todo-app__add-button');
        this.modal = document.getElementById('editModal');
        this.editInput = document.getElementById('editInput');
        this.btnSave = document.querySelector('.todo-app__save-edit');
        this.btnCancel = document.querySelector('.todo-app__cancel-edit');
        this.logoutBtn = document.querySelector('.todo-app__logout');
        const userLabel = document.querySelector('.todo-app__username');
        if (userLabel) userLabel.textContent = this.username;

        this.addButton.addEventListener('click', e => { e.preventDefault(); this.add(); });
        this.list.addEventListener('mousedown', e => {
            const li = e.target.closest('li');
            if (li) this.startLongPress(li);
        });
        this.list.addEventListener('mouseup', () => this.cancelLongPress());
        this.list.addEventListener('mouseleave', () => this.cancelLongPress());

        this.btnSave.addEventListener('click', () => this.saveEdit());
        this.btnCancel.addEventListener('click', () => this.closeModal());
        this.list.addEventListener('click', e => this.toggle(e));
        this.logoutBtn.addEventListener('click', () => this.logout());

        this.fetchTasks();
    }

    async logout() {
        await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' });
        window.location.href = '/auth/login';
    }

    async fetchTasks() {
        try {
            const res = await fetch('/api/todos', { credentials: 'same-origin' });
            if (!res.ok) {
                return window.location.href = '/auth/login';
            }
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            this.list.innerHTML = '';
            data.todos.forEach(t => this.createElement(t.text, t.checked, t.id));
        } catch (err) {
            console.error(err);
            alert('Không thể tải danh sách tasks.');
        }
    }

    createElement(text, checked = false, id) {
        const li = document.createElement('li');
        li.dataset.id = id;
        li.textContent = text;
        if (checked) li.classList.add('todo-app__list-item--checked');

        const del = document.createElement('span');
        del.textContent = '\u00d7';
        del.classList.add('todo-app__list-item-delete');
        del.addEventListener('click', e => {
            e.stopPropagation();
            this.deleteTask(id, li);
        });
        li.appendChild(del);
        this.list.appendChild(li);
    }

    async add() {
        const text = this.input.value.trim();
        if (!text) return alert('Please fill the task');
        const existing = Array.from(this.list.children)
            .map(li => li.textContent.replace('×', '').trim());
        if (existing.includes(text)) {
            return alert('Task đã tồn tại!');
        }
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ text })
            });
            if (!res.ok) throw new Error('Add failed');
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            const task = data.todo;
            this.createElement(task.text, task.checked, task.id);
            this.input.value = '';
        } catch (err) {
            console.error(err);
            alert('Thêm task thất bại.');
        }
    }

    async toggle(e) {
        if (e.target.tagName !== 'LI') return;
        const li = e.target;
        const id = li.dataset.id;
        const newChecked = !li.classList.contains('todo-app__list-item--checked');
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ checked: newChecked })
            });
            if (!res.ok) throw new Error('Update failed');
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            li.classList.toggle('todo-app__list-item--checked');
        } catch (err) {
            console.error(err);
            alert('Cập nhật thất bại.');
        }
    }

    async deleteTask(id, li) {
        if (!confirm('Delete this task?')) return;
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });
            if (!res.ok) throw new Error('Delete failed');
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            li.remove();
        } catch (err) {
            console.error(err);
            alert('Xóa thất bại.');
        }
    }

    // Bắt đầu hẹn giờ long-press
    startLongPress(li) {
        this.longPressTimer = setTimeout(() => this.openEditModal(li), 600);
    }

    cancelLongPress() {
        clearTimeout(this.longPressTimer);
    }

    openEditModal(li) {
        this.currentLi = li;
        this.editInput.value = li.firstChild.textContent.trim();
        this.modal.classList.add('todo-app__modal--show');
        document.body.classList.add('modal-open');
        this.editInput.focus();
    }

    async saveEdit() {
        const newText = this.editInput.value.trim();
        if (!newText) return alert('Please enter a task');
        const existing = Array.from(this.list.children)
            .filter(li => li !== this.currentLi)
            .map(li => li.textContent.replace('×', '').trim());
        if (existing.includes(newText)) {
            return alert('Task đã tồn tại!');
        }
        const id = this.currentLi.dataset.id;
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ text: newText })
            });
            if (!res.ok) throw new Error('Edit failed');
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            this.currentLi.firstChild.textContent = newText;
            this.closeModal();
        } catch (err) {
            console.error(err);
            alert('Lưu chỉnh sửa thất bại.');
        }
    }

    closeModal() {
        this.modal.classList.remove('todo-app__modal--show');
        document.body.classList.remove('modal-open');
    }

    static init() {
        const userLabel = document.querySelector('.todo-app__username');
        if (!userLabel) return window.location.href = '/auth/login';
        new Todo(userLabel.textContent);
    }
}

window.addEventListener('DOMContentLoaded', () => Todo.init());
