//Dom settings//
//number of items in cart
const cartItems = document.getElementById('cartNum');
//cart button
const cartBtn = document.getElementById('cartBtn');
//cart exit button
const closeCartBtn = document.getElementById('closeBtn');
//menu button
const menuBtn = document.getElementById('menuBtn');

const menuOverlay = document.querySelector('.menuOverlay')

const closeMenuBtn = document.getElementById('closeMenuBtn');
//body area for books to appear
const bookArea = document.querySelector('.bookArea');
//search bar 
const searchBar = document.getElementById('searchBar');
//text to show results of search bar
const resultTxt = document.getElementById('results');
//overlay when cart is open
const cartOverlay = document.querySelector('.cartOverlay')
//items in cart
const cartContent = document.querySelector('.cartContent');
//total amount of money for cart
const cartTotal = document.querySelector('.cart-total');
//button to remove all items in cart
const clearCartBtn = document.querySelector('.clear-btn');
//--------------------------------------------------------//
//book containers
let books = [];
let cart = [];
/*-------------------------------------------------------------*/
//Function Calls
getBooks().then(products => saveProducts(products));
cart = getCart();
cart.forEach(item =>{addCartItem(item);});
displayBooks();
setCartValues(cart);
cartTools();
/*-------------------------------------------------------------*/
//Initial fetch for products//
async function getBooks()
{
  try{
    let result = await fetch('products.json');
    let data   = await result.json();
    books = data.items;
    books = books.map(item =>{
        const {title, price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, price, id, image}
    })
  }
  catch(error){
    console.log(error);
  }
  return books;
}
/*-------------------------------------------------------------*/
//Main function to display books//
function displayBooks(books)
{ 
  let products = JSON.parse(localStorage.getItem('products'));
  var bookString;
  if(books)
  {
    bookString = books.map(items =>{
    return `
      <div class="item">
        <div class="product">
          <img class = "book" src = ${items.image} alt="" class = "product-img" 
          width = "200" height = "300"> 
          <button type="button" class = "bagBtn" data-id=${items.id}>
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
        </div>
        <div class="desc">
          <h3 class="caption">${items.title}</h3>
          <h4 class="caption">$${items.price}</h4>
        </div>
      </div>`;
    }).join(' ');
  }
  else
  {
    bookString = products.map(items =>{
    return `
      <div class="item">
        <div class="product">
          <img class = "book" src = ${items.image} alt="" class = "product-img" 
          width = "200" height = "300"> 
          <button type="button" class = "bagBtn" data-id=${items.id}>
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
        </div>
        <div class="desc">
          <h3 class="caption">${items.title}</h3>
          <h4 class="caption">$${items.price}</h4>
        </div>
      </div>`;
    }).join(' ');  
  }
   bookArea.innerHTML = bookString;
   const btns = document.querySelectorAll('.bagBtn');
   addToCart(btns);
}
/*-------------------------------------------------------------*/
//Event Listeners//
searchBar.addEventListener('keyup', (event)=> {
  if(event.code == 'Enter')
  {
    let products = JSON.parse(localStorage.getItem('products'));
    const searchString = event.target.value.toLowerCase();
    //filter returns a new array thet satisfies the bool expression
    
    const filteredBooks = products.filter(item =>{
      return item.title.toLowerCase().includes(searchString) ||
      item.price <= searchString
    });
    
    if(searchString === "" || searchString === " "){
       resultTxt.innerHTML = "";
    }else if(filteredBooks.length > 1){
      resultTxt.innerHTML = `Showing ${filteredBooks.length} results for "${searchString}":`;
    }else{
      resultTxt.innerHTML = `Showing ${filteredBooks.length} result for "${searchString}":`;
    }
   
    displayBooks(filteredBooks);
  }
});
cartBtn.addEventListener('click', this.showCart);
closeCartBtn.addEventListener('click', this.hideCart);
menuBtn.addEventListener('click', this.showMenu);
closeMenuBtn.addEventListener('click', this.hideMenu);
/*-------------------------------------------------------------*/
//Menu Functions
function showMenu(){
    menuOverlay.classList.add('viewMenu');
}

function hideMenu(){
    menuOverlay.classList.remove('viewMenu');
}
/*-------------------------------------------------------------*/
//Cart Functions//
function showCart(){
     cartOverlay.classList.add('viewCart');
}

function hideCart(){
     cartOverlay.classList.remove('viewCart');
}

function addToCart(buttons){
  buttons.forEach(element =>{  //element is a variable for EACH BUTTON
        let id = element.dataset.id;
        let inCart = cart.find(item => item.id === id);
        if(inCart){
          element.innerText ="In Cart";
          element.disabled = true;
        }
        element.addEventListener('click', (event)=>{
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          let cartItem = {...getProduct(id), amount: 1};   
          cart = [...cart, cartItem]; //...cart means everything we had in cart
          saveCart(cart);
          setCartValues(cart);
          addCartItem(cartItem);
        })
  })
}

function addCartItem(item){
  const div = document.createElement('div');
     div.classList.add('cart-item');
     div.innerHTML = `
                    <img class = "book" src = ${item.image} alt="" class = "product-img" width = "125" height = "180">
                    <div>
                      <h4>${item.title}</h4>
                      <h5>$${item.price}</h5> 
                      <span class="remove-item" data-id =${item.id}>Remove</span>
                    </div>
                    <div>
                      <i class="fas fa-chevron-up" data-id =${item.id}></i>
                      <p class="item-amount">${item.amount}</p>
                      <i class="fas fa-chevron-down" data-id =${item.id}></i>
                    </div>`;
  cartContent.appendChild(div);
}

function setCartValues(cart){
  let tempTotal = 0;
  let itemsTotal = 0;
      cart.forEach(item =>{
        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
      })
      cartTotal.innerText = "Cart Total: " + parseFloat(tempTotal.toFixed(2));
      cartItems.innerText = itemsTotal;
}
/*-------------------------------------------------------------*/
//Cart Operations
function cartTools(){
  const btns = document.querySelectorAll('.bagBtn');
  clearCartBtn.addEventListener('click', ()=>{
    cart = [];
    saveCart(cart);
    setCartValues(cart);
    btns.forEach(element =>{
          element.innerHTML = `<i class="fas fa-shopping-cart"></i>
            Add to Cart`;
          element.disabled = false;
        });
        while(cartContent.firstChild){
          cartContent.removeChild(cartContent.firstChild);
        }
  });
  cartContent.addEventListener('click', (event) =>{
        if(event.target.classList.contains('remove-item')){
          let removeItem = event.target;
          let id = removeItem.dataset.id;
          this.removeItem(id);
          cartContent.removeChild(removeItem.parentElement.parentElement);
        }
        if(event.target.classList.contains('fa-chevron-up')){
          let addAmount = event.target;
          let id = addAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount++;
          saveCart(cart);
          setCartValues(cart);
          addAmount.nextElementSibling.innerHTML = tempItem.amount;
        }
        if(event.target.classList.contains('fa-chevron-down')){
          let subAmount = event.target;
          let id = subAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount--;
          if(tempItem.amount > 0)
          {
            saveCart(cart);
            setCartValues(cart);
            subAmount.previousElementSibling.innerHTML = tempItem.amount;
          }
          else{
            cartContent.removeChild(subAmount.parentElement.parentElement);
            removeItem(id);
          }
        }
  });
}

function removeItem(id){
      cart = cart.filter(item => item.id !== id);
      setCartValues(cart);
      saveCart(cart);
      let button = getSingleBtn(id);
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>
            Add to Cart`;
    }
function getSingleBtn(id){
      const btns = document.querySelectorAll('.bagBtn');
      let button;
      btns.forEach(element =>{
        if(element.dataset.id == id){
          button = element;
        }
      });
      return button;
    }
/*-------------------------------------------------------------*/
//Storage Functions
function saveProducts(products){
      //JSON.stringify() method converts a JavaScript object or value to a JSON string
      //the key is "products"
    localStorage.setItem("products", JSON.stringify(products));
}

function getProduct(id){ 
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find( product=> product.id === id);
}

function saveCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getCart(){
    return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')) : [];
}
/*-------------------------------------------------------------*/
