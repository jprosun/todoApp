class TodoApp {
    constructor() {
        this.taskList = document.querySelector('.todo-app__list-container');
        this.addForm = document.querySelector('.todo-app__search-bar');
        this.taskInput = document.querySelector('.todo-app__task');
        this.deleteForms = document.querySelectorAll('.delete-form');
        this.editForm = document.getElementById('editForm');
        this.editInput = document.getElementById('editInput');
        this.modal = document.getElementById('editModal');
        this.btnCancel = document.getElementById('cancelEdit');

        this.Add();
        this.delete();
        this._bindEdit();
        this._bindLongPress();
    }

    Existing(excludeId = null) {
        return Array.from(this.taskList.children)
            .filter(li => excludeId === null || li.dataset.id !== excludeId)
            .map(li => li.textContent.replace('×', '').trim());
    }

    Add() {
        if (!this.addForm) return;
        this.addForm.addEventListener('submit', e => {
            const txt = this.taskInput.value.trim();
            if (!txt) { e.preventDefault(); alert('Vui lòng nhập task!'); return; }
            if (this.Existing().includes(txt)) {
                e.preventDefault(); alert('Task đã tồn tại!');
            }
        });
    }

    delete() {
        this.deleteForms.forEach(form => {
            const btn = form.querySelector('button');
            if (btn) {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                });
            }
            form.addEventListener('submit', e => {
                if (!confirm('Bạn có chắc muốn xóa?')) e.preventDefault();
            });
        });
    }

    _bindEdit() {
        if (!this.editForm) return;
        this.editForm.addEventListener('submit', e => {
            const txt = this.editInput.value.trim();
            const id = this.editForm.dataset.id;
            if (!txt) { e.preventDefault(); alert('Vui lòng nhập task!'); return; }
            if (this.Existing(id).includes(txt)) {
                e.preventDefault(); alert('Task đã tồn tại!');
            }
        });
        this.btnCancel.addEventListener('click', e => {
            e.preventDefault();
            this.closeModal();
        });
    }

    _bindLongPress() {
        let timer = null;
        let triggered = false;

        this.taskList.addEventListener('mousedown', e => {
            const li = e.target.closest('li');
            if (!li) return;
            timer = setTimeout(() => {
                triggered = true;
                this.openEditModal(li);
            }, 600);
        });

        this.taskList.addEventListener('mouseup', () => {
            clearTimeout(timer);
        });
        this.taskList.addEventListener('mouseleave', () => {
            clearTimeout(timer);
        });

        this.taskList.addEventListener('click', e => {
            if (triggered) {
                triggered = false;
                return;
            }
            const li = e.target.closest('li');
            if (!li) return;
            const toggleForm = document.getElementById(`toggle-${li.dataset.id}`);
            if (toggleForm) toggleForm.submit();
        });
    }

    openEditModal(li) {
        const id = li.dataset.id;
        this.editForm.dataset.id = id;
        this.editForm.action = `/todos/${id}/edit`;
        this.editInput.value = li.textContent.replace('×', '').trim();
        this.modal.classList.add('todo-app__modal--show');
        document.body.classList.add('modal-open');
    }

    closeModal() {
        this.modal.classList.remove('todo-app__modal--show');
        document.body.classList.remove('modal-open');
    }
}

window.addEventListener('DOMContentLoaded', () => new TodoApp());