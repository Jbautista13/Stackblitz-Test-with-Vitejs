var removeButtons;
var editButton;
var animating = {};

var numItems = localStorage.getItem('numOfItems');

if (numItems == null) numItems = 0;

document
  .querySelector(':root')
  .style.setProperty('--num-of-items', Number(numItems));

function incrementCounter(button) {
  let item = button.previousElementSibling;
  item.stepUp();
  item.dispatchEvent(new Event('input'));
}

function decrementCounter(button) {
  let item = button.nextElementSibling;
  item.stepDown();
  item.dispatchEvent(new Event('input'));
}

window.onload = function () {
  editButton = document.querySelector('.edit');
  let done = document.querySelector('.finished');
  let add = document.querySelector('.add');
  let list = document.querySelector('.order');
  let finishButton = document.querySelector('.complete');

  done.addEventListener('click', finished);
  add.addEventListener('click', addHandler);

  //add previously saved items
  for (var i = 0; i < numItems; i++) {
    let item = document.createElement('li');
    item.tabIndex = 0;
    item.dataset.order = Number(i) + 1;
    item.innerHTML = createListItem(
      localStorage.getItem('itemName' + i),
      localStorage.getItem('itemPrice' + i),
      i
    );
    list.appendChild(item);
    list.lastChild.querySelector('input').addEventListener('input', (event) => {
      let totalDisp = document.querySelector('#total');
      let item = event.target;
      let newQuantity = item.value;
      let { price, quantity } = item.dataset;
      let { total } = totalDisp.dataset;

      let orderTotal = Number(total) + newQuantity * price - quantity * price;

      totalDisp.value = formatter.format(orderTotal);
      totalDisp.dataset.total = orderTotal;
      item.dataset.quantity = newQuantity;
    });
  }

  removeButtons = document.querySelectorAll('.remove');

  editButton.dataset.order = Number(numItems) + 1;
  editButton.nextElementSibling.dataset.order = Number(numItems) + 2;

  editButton.addEventListener('click', (event) => {
    let editButton = event.target;
    let controls = document.querySelector('.controls');

    const currentlyEditing = editButton.dataset.inEdit;
    const finishingOrder =
      document.querySelector('.total').dataset.inTransition;

    if (finishingOrder == 'true') {
      continueOrder(editButton);
    } else if (currentlyEditing == 'true') {
      hideElement(controls, 'any');
      removeButtons.forEach((button) => {
        hideElement(button, 'any');
        button.disabled = true;
      });
      enableMenuItems();
      finishButton.disabled = false;
      editButton.dataset.inEdit = false;
    } else {
      showElement(controls);
      removeButtons.forEach((button) => {
        showElement(button);
        button.disabled = false;
      });

      disableMenuItems();
      finishButton.disabled = true;
      editButton.dataset.inEdit = true;
    }
  });
};

var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function finishOrder(completeButton) {
  let items = document.querySelectorAll('li');
  let total = document.querySelector('.total');
  let totalValue = document.querySelector('#total').dataset.total;
  let container = document.querySelector('.container');
  let backButton = completeButton.previousElementSibling;
  const inTransition = total.dataset.inTransition;

  if (totalValue == '0') {
  } else if (inTransition == 'true') {
    clearOrder();
    showElement(document.querySelector('.order'));
    items.forEach((item) => (item.tabIndex = '0'));
    total.dataset.inTransition = 'false';
    backButton.firstElementChild.innerText = 'Edit';
    completeButton.firstElementChild.innerText = 'Complete';
  } else {
    items.forEach((item) => (item.tabIndex = '-1'));
    total.dataset.inTransition = 'true';
    hideElement(document.querySelector('.order'), 'margin-top');
    backButton.firstElementChild.innerText = 'Back';
    completeButton.firstElementChild.innerText = 'Finish';
  }
}

function continueOrder(backButton) {
  let items = document.querySelectorAll('li');
  let total = document.querySelector('.total');
  let container = document.querySelector('.container');
  let completeButton = backButton.nextElementSibling;
  showElement(document.querySelector('.order'));
  items.forEach((item) => (item.tabIndex = '0'));
  total.dataset.inTransition = 'false';
  backButton.firstElementChild.innerText = 'Edit';
  completeButton.firstElementChild.innerText = 'Complete';
}

function clearOrder() {
  let total = document.querySelector('#total');
  document.querySelectorAll('[name="Quantity"]').forEach((input) => {
    input.classList.add('fadeout');
    total.classList.add('fadeout');
    setTimeout(function () {
      input.value = 0;
      input.classList.remove('fadeout');
      total.classList.remove('fadeout');
      input.dispatchEvent(new Event('input'));
    }, 125);
  });
}

function reOrder() {
  let items = document.querySelectorAll('li');
  let editButton = document.querySelector('.edit');
  let confirmButton = document.querySelector('.complete');

  for (var i = 1; i <= numItems; i++) {
    let item = items[i - 1];
    let removeButton = item.firstElementChild;

    item.dataset.order = i;
    removeButton.dataset.order = i - 0.5;
  }

  editButton.dataset.order = Number(numItems) + 1;
  confirmButton.dataset.order = Number(numItems) + 2;
}

function remove(removeButton) {
  let listItem = removeButton.parentElement;
  let item = removeButton.parentElement.querySelector('input');
  let totalDisp = document.querySelector('#total');
  let { price, quantity } = item.dataset;
  let { total } = totalDisp.dataset;
  let orderTotal = Number(total) - quantity * price;
  let itemOrder = listItem.dataset.order;

  for (var i = itemOrder; i < numItems; i++) {
    //Next item and price
    let nextItem = localStorage.getItem('itemName' + i);
    let nextPrice = localStorage.getItem('itemPrice' + i);

    localStorage.setItem('itemName' + (Number(i) - 1), nextItem);
    localStorage.setItem('itemPrice' + (Number(i) - 1), nextPrice);
  }

  totalDisp.value = formatter.format(orderTotal);
  totalDisp.dataset.total = orderTotal;
  numItems = Number(numItems) - 1;
  document.documentElement.style.setProperty(
    '--num-of-items',
    Number(numItems)
  );

  localStorage.removeItem('itemName' + numItems);
  localStorage.removeItem('itemPrice' + numItems);

  listItem.outerHTML = '';
  localStorage.setItem('numOfItems', numItems);
  reOrder();
  removeButtons = document.querySelectorAll('.remove');
}

function finished() {
  document.querySelector('.edit').dispatchEvent(new Event('click'));
}

function addHandler() {
  let form = document.querySelector('.addItem');
  let list = document.querySelector('.order');
  let controls = document.querySelector('.controls').children;
  let items = document.querySelectorAll('li');
  let body = document.querySelector('body');

  removeButtons.forEach((button) => {
    hideElement(button, 'any');
    button.disabled = true;
  });

  body.classList.add('no-scroll');

  items.forEach((item) => (item.tabIndex = '-1'));

  controls[0].disabled = true;
  controls[1].disabled = true;

  form.dataset.adding = 'true';
  editButton.disabled = true;

  showElement(form);
  let cancel = document.querySelector('.cancel');
  let confirm = document.querySelector('.confirm');
  let name = document.querySelector('#item');
  let price = document.querySelector('#price');
  name.focus();
  cancel.addEventListener('click', function cancel(event) {
    hideElement(form, 'any');
    confirm.removeEventListener('click', confirm);

    name.value = '';
    price.value = '';

    removeButtons.forEach((button) => {
      showElement(button);
      button.disabled = false;
    });
    body.classList.remove('no-scroll');
    items.forEach((item) => (item.tabIndex = '0'));
    controls[0].disabled = false;
    controls[1].disabled = false;
    form.dataset.adding = 'false';
    editButton.disabled = false;
  });
  confirm.addEventListener('click', function confirm(event) {
    if (!name.value.trim().length && !price.value.length) {
      cancel.dispatchEvent(new Event('click'));
    } else if (!name.value.trim().length || !price.value.length) {
    } else {
      let fPrice = formatter.formatToParts(price.value);
      if (fPrice[1].value == 0) fPrice[1].value = '';
      let item = document.createElement('li');
      item.tabIndex = '-1';
      item.dataset.order = Number(numItems) + 1;
      item.innerHTML = createListItem(
        name.value,
        fPrice[1].value + fPrice[2].value + fPrice[3].value,
        numItems
      );
      list.appendChild(item);
      localStorage.setItem('itemName' + numItems, name.value);
      localStorage.setItem(
        'itemPrice' + numItems,
        fPrice[1].value + fPrice[2].value + fPrice[3].value
      );
      name.value = '';
      price.value = '';
      numItems = Number(numItems) + 1;
      document.documentElement.style.setProperty(
        '--num-of-items',
        Number(numItems)
      );
      localStorage.setItem('numOfItems', numItems);
      editButton.dataset.order = Number(numItems) + 1;
      editButton.nextElementSibling.dataset.order = Number(numItems) + 2;

      Array.from(list.lastChild.lastChild.children).forEach((input) => {
        input.disabled = true;
      });

      list.lastChild
        .querySelector('input')
        .addEventListener('input', (event) => {
          let totalDisp = document.querySelector('#total');
          let item = event.target;
          let newQuantity = item.value;
          let { price, quantity } = item.dataset;
          let { total } = totalDisp.dataset;

          let orderTotal =
            Number(total) + newQuantity * price - quantity * price;

          totalDisp.value = formatter.format(orderTotal);
          totalDisp.dataset.total = orderTotal;
          item.dataset.quantity = newQuantity;
        });
      removeButtons = document.querySelectorAll('.remove');
      items = document.querySelectorAll('li');
    }
  });
}

/* ---------------- */
/* ---------------- */
/* Helper Functions */
/* ---------------- */
/* ---------------- */

function createListItem(name, price, order) {
  let listItem =
    `        <button onclick="remove(this)" class="remove hidden" data-order="` +
    (Number(order) + 0.5) +
    `" tabindex="0" disabled></button>
        <h2 data-price="` +
    price +
    `">` +
    name +
    `</h2>
        <div class="quantity">
            <button onclick="decrementCounter(this)" class="decrement" tabindex="-1"></button>
            <input type="number" pattern="[0-9]*" inputmode="numeric" data-price="` +
    price +
    `" data-quantity="0" min="0" max="99" value="0" name="Quantity" id="` +
    name.toLowerCase() +
    `" tabindex="-1">
            <button onclick="incrementCounter(this)" class="increment" tabindex="-1"></button>
        </div>`;
  return listItem;
}

function showElement(element) {
  console.log(animating[element.classList[0]]);
  while (animating[element.classList[0]] == true) {}
  element.classList.remove('hidden');
  element.offsetWidth;
  element.classList.add('show');
}

function hideElement(element, transition) {
  if (animating[element.classList[0]] == true) return;
  animating[element.classList[0]] == true;
  console.log(animating[element.classList[0]]);
  element.classList.remove('show');
  element.addEventListener('transitionend', function hide(event) {
    if (transition == 'any' || event.propertyName == transition) {
      element.classList.add('hidden');
      element.removeEventListener('transitionend', hide);
      animating[element.classList[0]] == false;
    }
  });
}

function disableMenuItems() {
  Array.from(document.querySelectorAll('.quantity')).forEach((item) => {
    Array.from(item.children).forEach((input) => {
      input.disabled = true;
    });
  });
}

function enableMenuItems() {
  Array.from(document.querySelectorAll('.quantity')).forEach((item) => {
    Array.from(item.children).forEach((input) => {
      input.disabled = false;
    });
  });
}

/* -------------- */
/* -------------- */
/* Keyboard Input */
/* -------------- */
/* -------------- */

document.addEventListener('keydown', (press) => {
  const UP = 'ArrowUp';
  const LEFT = 'ArrowLeft';
  const DOWN = 'ArrowDown';
  const RIGHT = 'ArrowRight';
  const W = 'KeyW';
  const A = 'KeyA';
  const S = 'KeyS';
  const D = 'KeyD';
  const SPACE = 'Space';
  const ENTER = 'Enter';
  const BACK = 'Backspace';
  const EXIT = 'Escape';
  const currentElement = document.activeElement;
  const currentlyEditing = editButton.dataset.inEdit;
  const finishingOrder = document.querySelector('.total').dataset.inTransition;
  const addingItem = document.querySelector('.addItem').dataset.adding;

  let keyPressed = press.code;

  if (
    !keyPressed ||
    keyPressed.indexOf('Numpad') != -1 ||
    keyPressed.indexOf('Digit') != -1
  ) {
    keyPressed = press.key;
    switch (press.key) {
      case 'w':
      case 'W':
        keyPressed = W;
        break;
      case 'a':
      case 'A':
        keyPressed = A;
        break;
      case 's':
      case 'S':
        keyPressed = S;
        break;
      case 'd':
      case 'D':
        keyPressed = D;
        break;
    }
  }

  if (finishingOrder == 'true') {
    if (currentElement.parentElement.matches('.footer')) {
      const position = currentElement.dataset.order;

      switch (keyPressed) {
        case LEFT:
        case A:
          if (position != Number(numItems) + 1)
            document
              .querySelector('[data-order="' + (Number(position) - 1) + '"]')
              .focus();
          break;
        case RIGHT:
        case D:
          if (position != Number(numItems) + 2)
            document
              .querySelector('[data-order="' + (Number(position) + 1) + '"]')
              .focus();
          break;
        case BACK:
          document.querySelector('.edit').click();
      }
    } else {
      switch (keyPressed) {
        case LEFT:
        case A:
        case RIGHT:
        case D:
          document
            .querySelector('[data-order="' + (Number(numItems) + 1) + '"]')
            .focus();
          break;
        case BACK:
          document.querySelector('.edit').click();
          break;
        case ENTER:
          document.querySelector('.complete').click();
      }
    }
  } else if (currentlyEditing != 'true') {
    if (currentElement.matches('li')) {
      const position = currentElement.dataset.order;

      if (isFinite(keyPressed)) {
        let numOfItems = currentElement.querySelector('input');
        numOfItems.value =
          numOfItems.value == '0'
            ? keyPressed
            : numOfItems.value.slice(0, -1) + keyPressed;
        numOfItems.dispatchEvent(new Event('input'));
      } else {
        switch (keyPressed) {
          case UP:
          case W:
            if (position != 1)
              document
                .querySelector('[data-order="' + (Number(position) - 1) + '"]')
                .focus();
            break;
          case DOWN:
          case S:
            document
              .querySelector('[data-order="' + (Number(position) + 1) + '"]')
              .focus();
            break;
          case LEFT:
          case A:
            decrementCounter(currentElement.querySelector('.decrement'));
            break;
          case RIGHT:
          case D:
            incrementCounter(currentElement.querySelector('.increment'));
            break;
          case ENTER:
            document.querySelector('.complete').click();
            break;
          case BACK:
            let numOfItems = currentElement.querySelector('input');
            numOfItems.value =
              numOfItems.value.length == 1 ? 0 : numOfItems.value.slice(0, -1);
            numOfItems.dispatchEvent(new Event('input'));
            break;
        }
      }
    } else if (currentElement.parentElement.matches('.footer')) {
      const position = currentElement.dataset.order;

      switch (keyPressed) {
        case UP:
        case W:
          document.querySelector('[data-order="' + numItems + '"]').focus();
          break;
        case LEFT:
        case A:
          if (position != Number(numItems) + 1)
            document
              .querySelector('[data-order="' + (Number(position) - 1) + '"]')
              .focus();
          break;
        case RIGHT:
        case D:
          if (position != Number(numItems) + 2)
            document
              .querySelector('[data-order="' + (Number(position) + 1) + '"]')
              .focus();
          break;
      }
    } else {
      if (
        keyPressed == UP ||
        keyPressed == DOWN ||
        keyPressed == LEFT ||
        keyPressed == RIGHT ||
        keyPressed == W ||
        keyPressed == S ||
        keyPressed == A ||
        keyPressed == D
      )
        document.querySelector('[data-order="1"]').focus();
      else if (keyPressed == ENTER) document.querySelector('.complete').click();
    }
  } else if (addingItem == 'true') {
    if (keyPressed == ENTER) {
      if (currentElement.matches('#item'))
        document.querySelector('#price').focus();
      else if (currentElement.matches('#price'))
        document.querySelector('.confirm').click();
    } else if (keyPressed == EXIT) document.querySelector('.cancel').click();
  } else {
    if (currentElement.matches('li') || currentElement.matches('.remove')) {
      const position = currentElement.dataset.order;

      switch (keyPressed) {
        case UP:
        case W:
          document
            .querySelector('[data-order="' + (Number(position) - 0.5) + '"]')
            .focus();
          break;
        case DOWN:
        case S:
          if (position != numItems)
            document
              .querySelector('[data-order="' + (Number(position) + 0.5) + '"]')
              .focus();
          else document.querySelector('.edit').focus();
          break;
        case LEFT:
        case A:
          decrementCounter(currentElement.querySelector('.decrement'));
          break;
        case RIGHT:
        case D:
          incrementCounter(currentElement.querySelector('.increment'));
          break;
        case EXIT:
          finished();
          break;
      }
    } else if (currentElement.parentElement.matches('.controls')) {
      const position = currentElement.dataset.order;
      switch (keyPressed) {
        case DOWN:
        case S:
          document.querySelector('[data-order="0.5"]').focus();
          break;
        case LEFT:
        case A:
          if (position != -0.5)
            document
              .querySelector('[data-order="' + (Number(position) - 0.5) + '"]')
              .focus();
          break;
        case RIGHT:
        case D:
          if (position != 0)
            document
              .querySelector('[data-order="' + (Number(position) + 0.5) + '"]')
              .focus();
          break;
        case EXIT:
          finished();
          break;
      }
    } else if (currentElement.matches('.edit')) {
      if (keyPressed == UP)
        document.querySelector('[data-order="' + numItems + '"]').focus();
      else if (keyPressed == EXIT) finished();
    } else {
      if (
        keyPressed == UP ||
        keyPressed == DOWN ||
        keyPressed == LEFT ||
        keyPressed == RIGHT ||
        keyPressed == W ||
        keyPressed == S ||
        keyPressed == A ||
        keyPressed == D
      )
        document.querySelector('[data-order="1"]').focus();
      else if (keyPressed == EXIT) finished();
    }
  }
});
