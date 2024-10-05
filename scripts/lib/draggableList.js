export function setDraggable(dragList, onDrop) {
  let draggedItem = null;

  // Drag start event handler
  const handleDragStart = (event) => {
    draggedItem = event.target.classList.contains('drag-item')
      ? event.target
      : event.target.closest('.drag-item');

    if (!draggedItem) return false;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', draggedItem.innerHTML);
    draggedItem.classList.add('dragging');
  };

  // Drag over event handler
  const handleDragOver = (event) => {
    event.preventDefault();

    const targetItem = event.target.classList.contains('drag-item')
      ? event.target
      : event.target.closest('.drag-item');

    if (
      targetItem &&
      draggedItem &&
      targetItem !== draggedItem &&
      targetItem.classList.contains('drag-item')
    ) {
      event.dataTransfer.dropEffect = 'move';

      const boundingRect = targetItem.getBoundingClientRect();
      const offset = boundingRect.y + boundingRect.height / 2;

      dragList
        .querySelectorAll('.dragged-over-top')
        .forEach((el) => el.classList.remove('dragged-over-top'));
      dragList
        .querySelectorAll('.dragged-over-bottom')
        .forEach((el) => el.classList.remove('dragged-over-bottom'));

      if (event.clientY - offset > 0) {
        targetItem.classList.add('dragged-over-bottom');
      } else {
        targetItem.classList.add('dragged-over-top');
      }
    }
  };

  // Drop event handler
  const handleDrop = (event) => {
    event.preventDefault();
    const targetItem = event.target.classList.contains('drag-item')
      ? event.target
      : event.target.closest('.drag-item')
      ? event.target.closest('.drag-item')
      : Array.from(dragList.querySelectorAll('.drag-item')).pop();

    if (
      targetItem &&
      draggedItem &&
      targetItem !== draggedItem &&
      targetItem.classList.contains('drag-item')
    ) {
      if (
        event.clientY >
        targetItem.getBoundingClientRect().top + targetItem.offsetHeight / 2
      ) {
        targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
      } else {
        targetItem.parentNode.insertBefore(draggedItem, targetItem);
      }
    }

    resetUI();
    draggedItem = null;

    if (onDrop) onDrop(dragList);
  };

  const resetUI = () => {
    dragList
      .querySelectorAll('.dragged-over-top')
      .forEach((el) => el.classList.remove('dragged-over-top'));
    dragList
      .querySelectorAll('.dragged-over-bottom')
      .forEach((el) => el.classList.remove('dragged-over-bottom'));
    dragList
      .querySelectorAll('.dragging')
      .forEach((el) => el.classList.remove('dragging'));
  };

  dragList.addEventListener('dragstart', handleDragStart);
  dragList.addEventListener('dragover', handleDragOver);
  dragList.addEventListener('drop', handleDrop);
  dragList.addEventListener('mouseout', resetUI);

  dragList.classList.add('draggable-list');
}
